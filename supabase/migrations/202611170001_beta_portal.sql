-- Smoke Less beta portal: apply manually in the intended Supabase project.
-- No administrator is provisioned automatically. Bootstrap using the Supabase SQL editor.
begin;
create extension if not exists pgcrypto;

create type public.beta_application_status as enum ('pending','approved','rejected','revoked');
create type public.beta_site_mode as enum ('closed','beta','release');
create type public.beta_artifact_status as enum ('draft','verified','retired');

create table public.beta_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.beta_applications (
  user_id uuid primary key references auth.users(id) on delete cascade,
  status public.beta_application_status not null default 'pending',
  message text not null default '' check (char_length(message) <= 1000),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references auth.users(id) on delete set null
);
create table public.beta_artifacts (
  id uuid primary key default gen_random_uuid(),
  storage_path text not null unique check (length(storage_path) between 1 and 500),
  version text not null check (length(version) between 1 and 100),
  version_code integer not null check (version_code > 0),
  package_name text not null check (package_name ~ '^com\.smokeless\.app(\.preview)?$'),
  sha256 text not null check (sha256 ~ '^[a-f0-9]{64}$'),
  signing_certificate_sha256 text not null check (signing_certificate_sha256 ~ '^[a-f0-9]{64}$'),
  release_notes text not null default '',
  status public.beta_artifact_status not null default 'draft',
  verified_at timestamptz,
  created_at timestamptz not null default now(),
  constraint verified_requires_timestamp check (status <> 'verified' or verified_at is not null)
);
create table public.beta_settings (
  singleton boolean primary key default true check (singleton),
  mode public.beta_site_mode not null default 'closed',
  active_artifact_id uuid references public.beta_artifacts(id) on delete set null,
  public_release_approved boolean not null default false,
  updated_at timestamptz not null default now(),
  constraint release_requires_approval check (mode <> 'release' or public_release_approved)
);
insert into public.beta_settings(singleton) values (true);

-- No client is allowed to grant itself admin status.
create function public.is_beta_admin()
returns boolean language sql stable security definer
set search_path = ''
as $$ select exists (select 1 from public.beta_admins a where a.user_id = (select auth.uid())) $$;
revoke all on function public.is_beta_admin() from public;
grant execute on function public.is_beta_admin() to authenticated;

alter table public.beta_admins enable row level security;
alter table public.beta_applications enable row level security;
alter table public.beta_artifacts enable row level security;
alter table public.beta_settings enable row level security;

create policy beta_admin_self_read on public.beta_admins
for select to authenticated using (user_id = (select auth.uid()));

create policy beta_application_read on public.beta_applications
for select to authenticated using (user_id = (select auth.uid()) or (select public.is_beta_admin()));
create policy beta_application_apply on public.beta_applications
for insert to authenticated with check (
 user_id = (select auth.uid()) and status = 'pending'
 and reviewed_at is null and reviewed_by is null
);
create policy beta_application_admin_update on public.beta_applications
for update to authenticated
using ((select public.is_beta_admin()))
with check ((select public.is_beta_admin()));

create policy beta_artifact_admin_read on public.beta_artifacts
for select to authenticated using ((select public.is_beta_admin()));
create policy beta_artifact_admin_insert on public.beta_artifacts
for insert to authenticated with check ((select public.is_beta_admin()));
create policy beta_artifact_admin_update on public.beta_artifacts
for update to authenticated using ((select public.is_beta_admin()))
with check ((select public.is_beta_admin()));

create policy beta_settings_admin_read on public.beta_settings
for select to authenticated using ((select public.is_beta_admin()));
create policy beta_settings_admin_update on public.beta_settings
for update to authenticated using ((select public.is_beta_admin()))
with check ((select public.is_beta_admin()));

-- Safe public projection: does not expose private APK paths or admin metadata.
create view public.beta_public_mode with (security_invoker = false) as
select case when mode = 'release' and not public_release_approved
  then 'closed' else mode::text end as mode
from public.beta_settings where singleton = true;
revoke all on public.beta_public_mode from public;
grant select on public.beta_public_mode to anon, authenticated;

-- Private bucket is deliberately NOT created by this migration.
-- W4 must create a private bucket with a verified file-size limit and
-- enforce authorization in a server-side download function.
-- Do not add public storage policies or publish permanent download URLs.

-- Explicitly restrict base-table privileges; RLS remains the second boundary.
revoke all on public.beta_admins, public.beta_applications, public.beta_artifacts, public.beta_settings from anon;
grant select on public.beta_admins to authenticated;
grant select, insert, update on public.beta_applications to authenticated;
grant select, insert, update on public.beta_artifacts to authenticated;
grant select, update on public.beta_settings to authenticated;
commit;
