-- Storage buckets and policies.

insert into storage.buckets (id, name, public)
values
  ('avatars', 'avatars', true),
  ('equipment', 'equipment', true),
  ('credentials', 'credentials', false)
on conflict (id) do nothing;

-- Avatars: public read, owner write keyed by `<user_id>/…`.
create policy "avatars public read" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "avatars owner write" on storage.objects
  for insert with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "avatars owner update" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Equipment photos: public read, owner write keyed by `<dj_profile_id>/…`.
-- (Client writes its own dj_profile_id as the top folder.)
create policy "equipment public read" on storage.objects
  for select using (bucket_id = 'equipment');

create policy "equipment dj write" on storage.objects
  for insert with check (
    bucket_id = 'equipment'
    and exists (
      select 1 from public.dj_profiles d
      where d.user_id = auth.uid()
        and d.id::text = (storage.foldername(name))[1]
    )
  );

-- Credentials: private; owner + admin only.
create policy "credentials owner read" on storage.objects
  for select using (
    bucket_id = 'credentials'
    and (
      public.is_admin()
      or exists (
        select 1 from public.dj_profiles d
        where d.user_id = auth.uid()
          and d.id::text = (storage.foldername(name))[1]
      )
    )
  );

create policy "credentials dj write" on storage.objects
  for insert with check (
    bucket_id = 'credentials'
    and exists (
      select 1 from public.dj_profiles d
      where d.user_id = auth.uid()
        and d.id::text = (storage.foldername(name))[1]
    )
  );
