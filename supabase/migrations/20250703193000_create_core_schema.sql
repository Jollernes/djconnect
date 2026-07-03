create extension if not exists pgcrypto;

create type user_role as enum ('client', 'dj', 'admin');
create type event_type as enum ('Firmafest', 'Julefrokost', 'Sommerfest', 'Middag og efterfest', 'Kick-off', 'Jubilæum', 'Reception', 'Andet firmaarrangement');
create type region as enum ('København / Sjælland', 'Fyn', 'Aarhus / Østjylland', 'Aalborg / Nordjylland', 'Sydjylland', 'Hele Danmark / andet');
create type guest_count_range as enum ('Under 50', '50-80', '80-150', '150-250', '250-350', '350+');
create type vibe_tag as enum (
  'Elegant middag først, fest senere',
  'Bred firmafest for alle aldre',
  'Julefrokost med singalong og klassikere',
  'Moderne dance/pop',
  'Disco, funk og 80’er/90’er',
  'Internationalt publikum',
  'Rolig lounge og baggrund',
  'High-energy dansegulv'
);
create type budget_band as enum ('8.000-12.000 DKK', '12.000-18.000 DKK', '18.000-25.000 DKK', '25.000+ DKK', 'Ikke sikker');
create type language_preference as enum ('Dansk', 'Engelsk', 'Begge');
create type dj_language as enum ('Dansk', 'Engelsk');
create type yes_no_unsure as enum ('Ja', 'Nej', 'Ikke sikker');
create type brief_venue_status as enum ('Vi har booket venue', 'Vi er tæt på at booke venue', 'Vi mangler stadig venue');
create type brief_date_flexibility as enum ('Fast dato', 'Muligvis fleksibel', 'Ikke besluttet endnu');
create type brief_contact_role as enum ('HR', 'Office manager', 'Assistant', 'Event committee', 'Founder/management', 'Other');
create type package_backup_level as enum ('none', 'light', 'standard', 'premium');
create type dj_status as enum ('pending', 'approved', 'inactive');
create type roster_layer as enum ('core', 'extended');
create type dj_availability_status as enum ('available', 'tentative', 'booked', 'unavailable');
create type proposal_hold_status as enum ('none', 'provisional', 'locked', 'unavailable');
create type proposal_status as enum ('draft', 'sent', 'accepted', 'expired');
create type booking_client_choice_mode as enum ('platform_selects', 'client_selected_dj');
create type booking_status as enum (
  'new_lead',
  'proposal_created',
  'provisional_hold',
  'awaiting_final_confirmation',
  'awaiting_deposit_or_invoice',
  'confirmed',
  'questionnaire_sent',
  'questionnaire_completed',
  'technical_confirmed',
  'run_sheet_ready',
  'completed',
  'cancelled'
);
create type contract_status as enum ('not_sent', 'sent', 'signed', 'void');
create type invoice_status as enum ('not_sent', 'draft', 'sent', 'paid', 'overdue');
create type payment_status as enum ('unpaid', 'deposit_due', 'deposit_paid', 'paid', 'refunded');
create type questionnaire_status as enum ('not_sent', 'sent', 'completed');
create type lead_status as enum (
  'new_lead',
  'proposal_created',
  'provisional_hold',
  'awaiting_final_confirmation',
  'awaiting_deposit_or_invoice',
  'confirmed',
  'questionnaire_sent',
  'questionnaire_completed',
  'technical_confirmed',
  'run_sheet_ready',
  'completed',
  'cancelled',
  'archived'
);
create type dj_application_status as enum ('pending_review', 'approved', 'rejected');
create type callback_request_status as enum ('new', 'contacted', 'resolved');
create type admin_note_related_type as enum ('lead', 'booking', 'dj', 'package', 'review');

create table profiles (
  id text primary key,
  role user_role not null,
  email text not null unique,
  full_name text not null,
  phone text,
  company_name text,
  city text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table packages (
  id text primary key,
  name text not null,
  slug text not null unique,
  description text not null,
  best_for text not null,
  price_from integer not null,
  price_to integer,
  vat_note text not null,
  guest_min integer not null,
  guest_max integer not null,
  hours_included integer not null,
  sound_included boolean not null default false,
  lighting_included boolean not null default false,
  microphone_included boolean not null default false,
  technical_coordination_included boolean not null default false,
  backup_level package_backup_level not null,
  active boolean not null default true,
  display_order integer not null default 0,
  setup_included boolean not null default false,
  setup_teardown_included boolean not null default false,
  transport_note text,
  technical_notes text
);

create table djs (
  id text primary key,
  user_id text unique,
  stage_name text not null,
  public_display_name text not null,
  legal_name text not null,
  email text not null unique,
  phone text,
  city text not null,
  regions region[] not null default '{}',
  bio_short text not null,
  bio_long text not null,
  corporate_experience_years integer not null,
  languages dj_language[] not null default '{}',
  vibe_tags vibe_tag[] not null default '{}',
  specialties text[] not null default '{}',
  sample_mix_url text,
  photo_url text,
  equipment_sound boolean not null default false,
  equipment_lighting boolean not null default false,
  can_handle_speeches boolean not null default false,
  can_provide_mc boolean not null default false,
  roster_layer roster_layer not null,
  status dj_status not null default 'pending',
  profile_quality_score integer not null default 0,
  reliability_score integer not null default 0,
  availability_freshness_score integer not null default 0,
  last_availability_update timestamptz not null default now(),
  approved_for_shortlist boolean not null default false,
  event_type_focuses event_type[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table dj_availability (
  id text primary key,
  dj_id text not null references djs(id) on delete cascade,
  date date not null,
  status dj_availability_status not null,
  notes text,
  updated_at timestamptz not null default now(),
  unique (dj_id, date)
);

create table event_briefs (
  id text primary key,
  company_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  contact_role brief_contact_role not null,
  event_type event_type not null,
  event_date date not null,
  date_flexibility brief_date_flexibility not null,
  start_time time not null,
  end_time time not null,
  city text not null,
  region region not null,
  venue_name text,
  venue_status brief_venue_status not null,
  guest_count_range guest_count_range not null,
  needs_sound yes_no_unsure not null,
  needs_lighting yes_no_unsure not null,
  needs_microphone yes_no_unsure not null,
  needs_dinner_music yes_no_unsure not null,
  needs_venue_coordination yes_no_unsure not null,
  music_vibe_tags vibe_tag[] not null default '{}',
  must_play text,
  do_not_play text,
  language_preference language_preference not null,
  budget_band budget_band not null,
  music_vibe_other text,
  success_description text,
  status lead_status not null default 'new_lead',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table proposals (
  id text primary key,
  event_brief_id text not null references event_briefs(id) on delete cascade,
  recommended_package_id text not null references packages(id),
  status proposal_status not null default 'draft',
  price_estimate_from integer not null,
  price_estimate_to integer,
  travel_fee_estimate integer not null default 0,
  technical_surcharge_estimate integer not null default 0,
  vat_note text not null,
  recommendation_reason text not null,
  created_at timestamptz not null default now(),
  expires_at timestamptz
);

create table proposal_djs (
  proposal_id text not null references proposals(id) on delete cascade,
  dj_id text not null references djs(id),
  match_score integer not null,
  match_reasons text[] not null default '{}',
  is_platform_recommended boolean not null default false,
  display_order integer not null default 0,
  hold_status proposal_hold_status not null default 'none',
  primary key (proposal_id, dj_id)
);

create table bookings (
  id text primary key,
  proposal_id text not null references proposals(id) on delete cascade,
  event_brief_id text not null references event_briefs(id) on delete cascade,
  selected_dj_id text references djs(id),
  recommended_package_id text not null references packages(id),
  client_choice_mode booking_client_choice_mode not null,
  company_name text not null,
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  invoice_email text,
  cvr_number text,
  extra_notes text,
  status booking_status not null default 'provisional_hold',
  final_price integer not null,
  vat_amount integer not null,
  travel_fee integer not null default 0,
  technical_surcharge integer not null default 0,
  discount integer not null default 0,
  contract_status contract_status not null default 'not_sent',
  invoice_status invoice_status not null default 'not_sent',
  payment_status payment_status not null default 'unpaid',
  backup_dj_id text references djs(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table client_questionnaires (
  id text primary key,
  booking_id text not null unique references bookings(id) on delete cascade,
  venue_contact_name text,
  venue_contact_phone text,
  load_in_time text,
  parking_info text,
  access_notes text,
  final_start_time text,
  final_end_time text,
  speech_times text,
  microphone_notes text,
  must_play_final text,
  do_not_play_final text,
  dress_code text,
  onsite_contact_name text,
  onsite_contact_phone text,
  special_notes text,
  submitted_by_name text not null,
  submitted_by_email text not null,
  status questionnaire_status not null default 'completed',
  submitted_at timestamptz not null default now(),
  completed_at timestamptz
);

create table messages (
  id text primary key,
  booking_id text not null references bookings(id) on delete cascade,
  sender_role user_role not null,
  sender_name text not null,
  body text not null,
  created_at timestamptz not null default now()
);

create table dj_applications (
  id text primary key,
  stage_name text not null,
  legal_name text not null,
  email text not null,
  phone text not null,
  city text not null,
  regions region[] not null default '{}',
  languages dj_language[] not null default '{}',
  vibe_tags vibe_tag[] not null default '{}',
  years_of_experience integer not null,
  corporate_experience_years integer not null,
  equipment_sound boolean not null default false,
  equipment_lighting boolean not null default false,
  can_handle_speeches boolean not null default false,
  can_provide_mc boolean not null default false,
  sample_mix_url text,
  references text,
  short_bio text not null,
  links text,
  cvr_number text,
  availability_commitment boolean not null default false,
  status dj_application_status not null default 'pending_review',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table contact_requests (
  id text primary key,
  full_name text not null,
  email text not null,
  phone text,
  company_name text,
  role user_role not null,
  message text not null,
  created_at timestamptz not null default now()
);

create table callback_requests (
  id text primary key,
  proposal_id text references proposals(id) on delete set null,
  full_name text not null,
  phone text not null,
  preferred_time text,
  message text not null,
  status callback_request_status not null default 'new',
  created_at timestamptz not null default now()
);

create table admin_notes (
  id text primary key,
  related_type admin_note_related_type not null,
  related_id text not null,
  note text not null,
  created_at timestamptz not null default now()
);

create table reviews (
  id text primary key,
  booking_id text references bookings(id) on delete set null,
  dj_id text references djs(id) on delete set null,
  event_type event_type,
  reviewer_label text not null,
  rating integer not null check (rating between 1 and 5),
  quote text not null,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create index event_briefs_status_idx on event_briefs (status);
create index bookings_status_idx on bookings (status);
create index bookings_selected_dj_idx on bookings (selected_dj_id);
create index reviews_approved_idx on reviews (approved);
create index dj_availability_dj_date_idx on dj_availability (dj_id, date);

create or replace function public.current_email()
returns text
language sql
stable
as $$
  select coalesce(auth.jwt() ->> 'email', '')
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
as $$
  select exists (
    select 1
    from profiles
    where id = auth.uid()::text
      and role = 'admin'
  )
$$;

alter table profiles enable row level security;
alter table packages enable row level security;
alter table djs enable row level security;
alter table dj_availability enable row level security;
alter table event_briefs enable row level security;
alter table proposals enable row level security;
alter table proposal_djs enable row level security;
alter table bookings enable row level security;
alter table client_questionnaires enable row level security;
alter table messages enable row level security;
alter table dj_applications enable row level security;
alter table contact_requests enable row level security;
alter table callback_requests enable row level security;
alter table admin_notes enable row level security;
alter table reviews enable row level security;

create policy "profiles_select_own_or_admin" on profiles
  for select
  using (id = auth.uid()::text or public.is_admin());

create policy "profiles_insert_own_or_admin" on profiles
  for insert
  with check (id = auth.uid()::text or public.is_admin());

create policy "profiles_update_own_or_admin" on profiles
  for update
  using (id = auth.uid()::text or public.is_admin())
  with check (id = auth.uid()::text or public.is_admin());

create policy "packages_public_read" on packages
  for select
  using (active or public.is_admin());

create policy "packages_admin_manage" on packages
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "djs_select_own_or_admin" on djs
  for select
  using (public.is_admin() or email = public.current_email() or user_id = auth.uid()::text);

create policy "djs_manage_own_or_admin" on djs
  for all
  using (public.is_admin() or email = public.current_email() or user_id = auth.uid()::text)
  with check (public.is_admin() or email = public.current_email() or user_id = auth.uid()::text);

create policy "dj_availability_select_own_or_admin" on dj_availability
  for select
  using (
    public.is_admin()
    or exists (
      select 1
      from djs
      where djs.id = dj_availability.dj_id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
  );

create policy "dj_availability_manage_own_or_admin" on dj_availability
  for all
  using (
    public.is_admin()
    or exists (
      select 1
      from djs
      where djs.id = dj_availability.dj_id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from djs
      where djs.id = dj_availability.dj_id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
  );

create policy "event_briefs_select_owner_or_admin" on event_briefs
  for select
  using (public.is_admin() or contact_email = public.current_email());

create policy "event_briefs_manage_owner_or_admin" on event_briefs
  for all
  using (public.is_admin() or contact_email = public.current_email())
  with check (public.is_admin() or contact_email = public.current_email());

create policy "proposals_select_owner_or_admin" on proposals
  for select
  using (
    public.is_admin()
    or exists (
      select 1
      from event_briefs
      where event_briefs.id = proposals.event_brief_id
        and event_briefs.contact_email = public.current_email()
    )
    or exists (
      select 1
      from proposal_djs
      join djs on djs.id = proposal_djs.dj_id
      where proposal_djs.proposal_id = proposals.id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
  );

create policy "proposals_manage_owner_or_admin" on proposals
  for all
  using (
    public.is_admin()
    or exists (
      select 1
      from event_briefs
      where event_briefs.id = proposals.event_brief_id
        and event_briefs.contact_email = public.current_email()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from event_briefs
      where event_briefs.id = proposals.event_brief_id
        and event_briefs.contact_email = public.current_email()
    )
  );

create policy "proposal_djs_select_owner_or_admin" on proposal_djs
  for select
  using (
    public.is_admin()
    or exists (
      select 1
      from proposals
      join event_briefs on event_briefs.id = proposals.event_brief_id
      where proposals.id = proposal_djs.proposal_id
        and event_briefs.contact_email = public.current_email()
    )
    or exists (
      select 1
      from djs
      where djs.id = proposal_djs.dj_id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
  );

create policy "proposal_djs_manage_admin_only" on proposal_djs
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "bookings_select_owner_or_assigned_or_admin" on bookings
  for select
  using (
    public.is_admin()
    or exists (
      select 1
      from event_briefs
      where event_briefs.id = bookings.event_brief_id
        and event_briefs.contact_email = public.current_email()
    )
    or exists (
      select 1
      from djs
      where djs.id = bookings.selected_dj_id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
    or exists (
      select 1
      from djs
      where djs.id = bookings.backup_dj_id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
  );

create policy "bookings_manage_owner_or_admin" on bookings
  for all
  using (
    public.is_admin()
    or exists (
      select 1
      from event_briefs
      where event_briefs.id = bookings.event_brief_id
        and event_briefs.contact_email = public.current_email()
    )
    or exists (
      select 1
      from djs
      where djs.id = bookings.selected_dj_id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from event_briefs
      where event_briefs.id = bookings.event_brief_id
        and event_briefs.contact_email = public.current_email()
    )
    or exists (
      select 1
      from djs
      where djs.id = bookings.selected_dj_id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
  );

create policy "questionnaires_select_owner_assigned_or_admin" on client_questionnaires
  for select
  using (
    public.is_admin()
    or exists (
      select 1
      from bookings
      join event_briefs on event_briefs.id = bookings.event_brief_id
      where bookings.id = client_questionnaires.booking_id
        and event_briefs.contact_email = public.current_email()
    )
    or exists (
      select 1
      from bookings
      join djs on djs.id = bookings.selected_dj_id
      where bookings.id = client_questionnaires.booking_id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
  );

create policy "questionnaires_manage_owner_or_admin" on client_questionnaires
  for all
  using (
    public.is_admin()
    or exists (
      select 1
      from bookings
      join event_briefs on event_briefs.id = bookings.event_brief_id
      where bookings.id = client_questionnaires.booking_id
        and event_briefs.contact_email = public.current_email()
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from bookings
      join event_briefs on event_briefs.id = bookings.event_brief_id
      where bookings.id = client_questionnaires.booking_id
        and event_briefs.contact_email = public.current_email()
    )
  );

create policy "messages_select_owner_or_assigned_or_admin" on messages
  for select
  using (
    public.is_admin()
    or exists (
      select 1
      from bookings
      join event_briefs on event_briefs.id = bookings.event_brief_id
      where bookings.id = messages.booking_id
        and event_briefs.contact_email = public.current_email()
    )
    or exists (
      select 1
      from bookings
      join djs on djs.id = bookings.selected_dj_id
      where bookings.id = messages.booking_id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
  );

create policy "messages_manage_owner_or_admin" on messages
  for all
  using (
    public.is_admin()
    or exists (
      select 1
      from bookings
      join event_briefs on event_briefs.id = bookings.event_brief_id
      where bookings.id = messages.booking_id
        and event_briefs.contact_email = public.current_email()
    )
    or exists (
      select 1
      from bookings
      join djs on djs.id = bookings.selected_dj_id
      where bookings.id = messages.booking_id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
  )
  with check (
    public.is_admin()
    or exists (
      select 1
      from bookings
      join event_briefs on event_briefs.id = bookings.event_brief_id
      where bookings.id = messages.booking_id
        and event_briefs.contact_email = public.current_email()
    )
    or exists (
      select 1
      from bookings
      join djs on djs.id = bookings.selected_dj_id
      where bookings.id = messages.booking_id
        and (djs.email = public.current_email() or djs.user_id = auth.uid()::text)
    )
  );

create policy "dj_applications_select_own_or_admin" on dj_applications
  for select
  using (public.is_admin() or email = public.current_email());

create policy "dj_applications_insert_own_or_admin" on dj_applications
  for insert
  with check (public.is_admin() or email = public.current_email());

create policy "dj_applications_update_admin_only" on dj_applications
  for update
  using (public.is_admin())
  with check (public.is_admin());

create policy "contact_requests_admin_only" on contact_requests
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "callback_requests_admin_only" on callback_requests
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "admin_notes_admin_only" on admin_notes
  for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "reviews_public_read" on reviews
  for select
  using (approved or public.is_admin());

create policy "reviews_admin_manage" on reviews
  for all
  using (public.is_admin())
  with check (public.is_admin());
