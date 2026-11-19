-- Apply in Supabase SQL Editor for the EXISTING Wolfyslayer website project.
-- Independent of the unfinished Smoke Less beta portal schema.
-- All files remain private; user-id folders are enforced server-side by RLS.
insert into storage.buckets (id,name,public,file_size_limit,allowed_mime_types)
values ('vape-recipes','vape-recipes',false,262144,array['application/json'])
on conflict (id) do update
set public=false, file_size_limit=262144, allowed_mime_types=array['application/json'];

drop policy if exists "vape_recipes_user_select" on storage.objects;
drop policy if exists "vape_recipes_user_insert" on storage.objects;
drop policy if exists "vape_recipes_user_update" on storage.objects;
drop policy if exists "vape_recipes_user_delete" on storage.objects;

create policy "vape_recipes_user_select" on storage.objects
  for select to authenticated
  using (bucket_id='vape-recipes'
    and (storage.foldername(name))[1]=(select auth.uid())::text
    and cardinality(storage.foldername(name))=1
    and storage.filename(name) ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\\.json$');
create policy "vape_recipes_user_insert" on storage.objects
  for insert to authenticated
  with check (bucket_id='vape-recipes'
    and (storage.foldername(name))[1]=(select auth.uid())::text
    and cardinality(storage.foldername(name))=1
    and storage.filename(name) ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\\.json$');
create policy "vape_recipes_user_update" on storage.objects
  for update to authenticated
  using (bucket_id='vape-recipes'
    and (storage.foldername(name))[1]=(select auth.uid())::text
    and cardinality(storage.foldername(name))=1
    and storage.filename(name) ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\\.json$')
  with check (bucket_id='vape-recipes'
    and (storage.foldername(name))[1]=(select auth.uid())::text
    and cardinality(storage.foldername(name))=1
    and storage.filename(name) ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\\.json$');
create policy "vape_recipes_user_delete" on storage.objects
  for delete to authenticated
  using (bucket_id='vape-recipes'
    and (storage.foldername(name))[1]=(select auth.uid())::text
    and cardinality(storage.foldername(name))=1
    and storage.filename(name) ~* '^[0-9a-f]{8}(-[0-9a-f]{4}){3}-[0-9a-f]{12}\\.json$');
