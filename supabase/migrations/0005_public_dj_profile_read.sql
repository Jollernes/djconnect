-- Allow anonymous/public read of profile rows that belong to an APPROVED DJ.
-- The public DJ catalogue (search + profile pages) joins profiles to show the
-- DJ's display name, avatar and city. Without this, the join returns null for
-- unauthenticated visitors and the UI cannot render DJ cards/profiles.
--
-- Only profiles linked to an approved dj_profile are exposed; customer and
-- non-approved DJ profiles remain private (self/admin read only).
create policy "profiles: public read approved dj" on public.profiles
  for select using (
    exists (
      select 1 from public.dj_profiles d
      where d.user_id = profiles.id
        and d.verification_status = 'approved'
    )
  );
