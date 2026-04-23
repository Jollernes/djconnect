-- Row Level Security policies.
-- All tables enable RLS. Public-safe data (approved DJs, public reviews) is readable by anon;
-- everything else is scoped to the owner or service role.

-- Helper: is the current session an admin?
create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- profiles
alter table public.profiles enable row level security;

create policy "profiles: self-read" on public.profiles
  for select using (id = auth.uid() or public.is_admin());
create policy "profiles: self-update" on public.profiles
  for update using (id = auth.uid()) with check (id = auth.uid());
create policy "profiles: admin-all" on public.profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- event_types (public read)
alter table public.event_types enable row level security;
create policy "event_types: public read" on public.event_types for select using (true);

-- dj_profiles
alter table public.dj_profiles enable row level security;

create policy "dj_profiles: public read approved" on public.dj_profiles
  for select using (verification_status = 'approved' or user_id = auth.uid() or public.is_admin());
create policy "dj_profiles: owner insert" on public.dj_profiles
  for insert with check (user_id = auth.uid());
create policy "dj_profiles: owner update" on public.dj_profiles
  for update using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "dj_profiles: admin all" on public.dj_profiles
  for all using (public.is_admin()) with check (public.is_admin());

-- dj_equipment_photos
alter table public.dj_equipment_photos enable row level security;

create policy "equipment_photos: public read approved" on public.dj_equipment_photos
  for select using (
    exists (select 1 from public.dj_profiles d
            where d.id = dj_profile_id
              and (d.verification_status = 'approved' or d.user_id = auth.uid() or public.is_admin()))
  );
create policy "equipment_photos: owner write" on public.dj_equipment_photos
  for all using (
    exists (select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid())
  );

-- dj_event_types
alter table public.dj_event_types enable row level security;

create policy "dj_event_types: read all" on public.dj_event_types for select using (true);
create policy "dj_event_types: owner write" on public.dj_event_types
  for all using (
    exists (select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid())
  );

-- dj_credentials
alter table public.dj_credentials enable row level security;

create policy "credentials: owner or admin" on public.dj_credentials
  for all using (
    public.is_admin() or exists (
      select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid()
    )
  ) with check (
    exists (select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid())
  );

-- availability
alter table public.availability enable row level security;

create policy "availability: public read" on public.availability for select using (true);
create policy "availability: owner write" on public.availability
  for all using (
    exists (select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid())
  );

alter table public.recurring_unavailability enable row level security;
create policy "recurring: public read" on public.recurring_unavailability for select using (true);
create policy "recurring: owner write" on public.recurring_unavailability
  for all using (
    exists (select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid())
  ) with check (
    exists (select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid())
  );

-- bookings
alter table public.bookings enable row level security;

create policy "bookings: customer read own" on public.bookings
  for select using (
    customer_id = auth.uid()
    or exists (select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid())
    or public.is_admin()
  );

create policy "bookings: customer create" on public.bookings
  for insert with check (customer_id = auth.uid());

create policy "bookings: dj update own" on public.bookings
  for update using (
    exists (select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid())
    or customer_id = auth.uid()
    or public.is_admin()
  ) with check (true);

create policy "bookings: admin all" on public.bookings
  for all using (public.is_admin()) with check (public.is_admin());

-- messages
alter table public.messages enable row level security;

create policy "messages: participants read" on public.messages
  for select using (
    exists (
      select 1 from public.bookings b
      left join public.dj_profiles d on d.id = b.dj_profile_id
      where b.id = booking_id
        and (b.customer_id = auth.uid() or d.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "messages: participants write" on public.messages
  for insert with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.bookings b
      left join public.dj_profiles d on d.id = b.dj_profile_id
      where b.id = booking_id
        and (b.customer_id = auth.uid() or d.user_id = auth.uid())
    )
  );

-- reviews
alter table public.reviews enable row level security;

create policy "reviews: public read visible" on public.reviews
  for select using (is_hidden = false or customer_id = auth.uid() or public.is_admin());

create policy "reviews: customer create" on public.reviews
  for insert with check (customer_id = auth.uid());

create policy "reviews: admin moderate" on public.reviews
  for update using (public.is_admin()) with check (public.is_admin());

-- payouts (read-only from client; updated by service role)
alter table public.payouts enable row level security;

create policy "payouts: dj read" on public.payouts
  for select using (
    public.is_admin()
    or exists (select 1 from public.dj_profiles d where d.id = dj_profile_id and d.user_id = auth.uid())
  );

-- favourites
alter table public.favourites enable row level security;

create policy "favourites: self-all" on public.favourites
  for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
