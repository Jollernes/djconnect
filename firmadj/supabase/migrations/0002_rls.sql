-- Basic RLS policies for FirmaDJ
-- Note: Admin users have full access; app roles use custom claims.

create or replace function public.is_admin() returns boolean as $$
  select coalesce((select role = 'admin' from public.users where id = auth.uid()), false);
$$ language sql security definer;

create or replace function public.is_dj() returns boolean as $$
  select coalesce((select role = 'dj' from public.users where id = auth.uid()), false);
$$ language sql security definer;

create or replace function public.is_client() returns boolean as $$
  select coalesce((select role = 'client' from public.users where id = auth.uid()), false);
$$ language sql security definer;

-- Users: read own, admin all
create policy "users read own" on public.users for select using (auth.uid() = id or public.is_admin());

-- Companies: read own, admin all
create policy "companies read own" on public.companies for select using (created_by = auth.uid() or public.is_admin());

-- Event briefs: read own by email match, admin all
create policy "briefs read own" on public.event_briefs for select
  using (contact_email = auth.email() or public.is_admin());

create policy "briefs insert public" on public.event_briefs for insert with check (true);

create policy "briefs update admin" on public.event_briefs for update using (public.is_admin());

-- Packages: read public, admin write
create policy "packages read public" on public.packages for select using (true);
create policy "packages write admin" on public.packages for all using (public.is_admin());

-- DJs: read own, admin all; public cannot list all DJs
create policy "djs read own" on public.djs for select using (user_id = auth.uid() or public.is_admin());

create policy "djs insert own" on public.djs for insert with check (user_id = auth.uid() or public.is_admin());

create policy "djs update own" on public.djs for update using (user_id = auth.uid() or public.is_admin());

-- DJ payouts: read own, admin write
create policy "dj_payouts read own" on public.dj_payouts for select using ((select user_id from public.djs where id = dj_id) = auth.uid() or public.is_admin());
create policy "dj_payouts write admin" on public.dj_payouts for all using (public.is_admin());

-- Availability: read own, admin all; public cannot read
create policy "dj_availability read own" on public.dj_availability for select using ((select user_id from public.djs where id = dj_id) = auth.uid() or public.is_admin());
create policy "dj_availability write own" on public.dj_availability for all using ((select user_id from public.djs where id = dj_id) = auth.uid() or public.is_admin());

create policy "dj_default_availability read own" on public.dj_default_availability for select using ((select user_id from public.djs where id = dj_id) = auth.uid() or public.is_admin());
create policy "dj_default_availability write own" on public.dj_default_availability for all using ((select user_id from public.djs where id = dj_id) = auth.uid() or public.is_admin());

-- Proposals: read own by brief email, admin all
create policy "proposals read own" on public.proposals for select using (
  public.is_admin() or
  public.is_dj() or
  event_brief_id in (select id from public.event_briefs where contact_email = auth.email())
);

create policy "proposals write admin" on public.proposals for all using (public.is_admin());

-- Proposal DJs: admin and selected DJs can read; public proposal page reads via admin/proxy
create policy "proposal_djs read admin" on public.proposal_djs for select using (public.is_admin());

-- Bookings: read own (by client email) or admin; DJs assigned can read after confirmation
create policy "bookings read own" on public.bookings for select using (
  public.is_admin() or
  event_brief_id in (select id from public.event_briefs where contact_email = auth.email()) or
  selected_dj_id in (select id from public.djs where user_id = auth.uid())
);

create policy "bookings write admin" on public.bookings for all using (public.is_admin());

-- Messages: read if participant or admin
create policy "messages read participant" on public.messages for select using (
  public.is_admin() or
  sender_id = auth.uid() or
  booking_id in (select id from public.bookings where event_brief_id in (select id from public.event_briefs where contact_email = auth.email()))
);
create policy "messages insert participant" on public.messages for insert with check (public.is_admin() or public.is_client() or public.is_dj());

-- Questionnaires: read own booking, admin all
create policy "questionnaires read own" on public.client_questionnaires for select using (
  public.is_admin() or
  booking_id in (select id from public.bookings where event_brief_id in (select id from public.event_briefs where contact_email = auth.email()))
);
create policy "questionnaires write own" on public.client_questionnaires for all using (public.is_admin() or public.is_client());

-- DJ applications: insert public, read own by email, admin all
create policy "dj_applications insert public" on public.dj_applications for insert with check (true);
create policy "dj_applications read admin" on public.dj_applications for select using (public.is_admin() or email = auth.email());
create policy "dj_applications update admin" on public.dj_applications for update using (public.is_admin());

-- Reviews: read approved, admin all
create policy "reviews read public" on public.reviews for select using (approved = true or public.is_admin());
create policy "reviews write admin" on public.reviews for all using (public.is_admin());

-- Admin notes: admin all
create policy "admin_notes admin" on public.admin_notes for all using (public.is_admin());

-- Documents: read own booking, admin all
create policy "documents read own" on public.documents for select using (
  public.is_admin() or
  booking_id in (select id from public.bookings where event_brief_id in (select id from public.event_briefs where contact_email = auth.email()))
);
create policy "documents write admin" on public.documents for all using (public.is_admin());

-- Run sheets: read own booking, admin all
create policy "run_sheets read own" on public.run_sheets for select using (
  public.is_admin() or
  booking_id in (select id from public.bookings where event_brief_id in (select id from public.event_briefs where contact_email = auth.email()))
);
create policy "run_sheets write admin" on public.run_sheets for all using (public.is_admin());

-- Callback requests: read admin, insert public
create policy "callback_requests insert public" on public.callback_requests for insert with check (true);
create policy "callback_requests read admin" on public.callback_requests for select using (public.is_admin());

-- Audit logs: admin read only
create policy "audit_logs read admin" on public.audit_logs for select using (public.is_admin());
