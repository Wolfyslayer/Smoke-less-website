-- W2 security hardening: a website administrator must never be able to
-- activate public release before the independent app release gate is built.
-- Apply after 202611170001_beta_portal.sql.
begin;
create or replace function public.beta_block_unverified_public_release()
returns trigger language plpgsql
set search_path = ''
as $$
begin
  if new.mode = 'release' or new.public_release_approved is distinct from false then
    raise exception 'Public release is locked until independently verified release authorization is deployed';
  end if;
  return new;
end;
$$;
revoke all on function public.beta_block_unverified_public_release() from public, anon, authenticated;
drop trigger if exists beta_release_lock on public.beta_settings;
create trigger beta_release_lock
before insert or update on public.beta_settings
for each row execute function public.beta_block_unverified_public_release();

-- Prevent applicants from adding or modifying approval/review fields.
-- Existing RLS restricts updates to admins; this trigger adds a guardrail
-- against accidentally broadening those policies later.
create or replace function public.beta_application_guard()
returns trigger language plpgsql security definer
set search_path = ''
as $$
begin
  if tg_op = 'UPDATE' and not public.is_beta_admin() then
    raise exception 'Only beta administrators may review applications';
  end if;
  return new;
end;
$$;
revoke all on function public.beta_application_guard() from public, anon, authenticated;
drop trigger if exists beta_application_review_guard on public.beta_applications;
create trigger beta_application_review_guard
before update on public.beta_applications
for each row execute function public.beta_application_guard();

-- Keep private storage inaccessible until W4 introduces explicit policies.
commit;
