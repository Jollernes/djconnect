-- FirmaDJ platform v1 schema
-- Managed agency B2B DJ booking platform

-- Users and roles (mirrors Supabase auth but keeps role local)
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  role text not null check (role in ('client','dj','admin')),
  name text,
  phone text,
  created_at timestamptz default now()
);

-- Companies for B2B buyers
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  cvr text,
  invoice_email text,
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- Event briefs submitted by clients
create table if not exists public.event_briefs (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.companies(id),
  contact_name text not null,
  contact_email text not null,
  contact_phone text,
  company_name text,
  role text,
  event_type text not null,
  event_date date,
  date_flexibility text,
  start_time text,
  end_time text,
  city text,
  region text,
  venue_name text,
  venue_status text,
  guest_count_range text,
  needs_sound text,
  needs_lighting text,
  needs_microphone text,
  needs_dinner_music text,
  needs_venue_coordination text,
  music_vibe_tags text[],
  must_play text,
  do_not_play text,
  language_preference text,
  budget_band text,
  success_description text,
  status text default 'new_lead',
  created_at timestamptz default now()
);

-- Standardized packages
create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  best_for text,
  price_from integer not null,
  price_to integer,
  vat_note text default 'Priser vises ekskl. moms. Transport beregnes tydeligt før bekræftelse.',
  guest_min integer,
  guest_max integer,
  hours_included text,
  sound_included boolean default false,
  lighting_included boolean default false,
  microphone_included boolean default false,
  setup_teardown_included boolean default true,
  technical_coordination_included boolean default false,
  backup_level text default 'standard',
  recommended_guest_range text,
  technical_notes text,
  active boolean default true,
  display_order integer default 0,
  created_at timestamptz default now()
);

-- DJ profiles
create table if not exists public.djs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id),
  stage_name text not null,
  public_display_name text not null,
  legal_name text,
  email text,
  phone text,
  city text,
  regions text[],
  bio_short text,
  bio_long text,
  corporate_experience_years integer default 0,
  languages text[],
  vibe_tags text[],
  specialties text[],
  sample_mix_url text,
  photo_url text,
  equipment_sound text,
  equipment_lighting text,
  can_handle_speeches boolean default false,
  can_provide_mc boolean default false,
  can_deliver_80 boolean default false,
  can_deliver_150 boolean default false,
  can_deliver_200 boolean default false,
  transport_radius_km integer,
  setup_time_minutes integer,
  setup_area_description text,
  roster_layer text default 'extended' check (roster_layer in ('core','extended')),
  status text default 'pending' check (status in ('pending','approved','inactive')),
  profile_quality_score integer default 0,
  profile_completeness_score integer default 0,
  reliability_score integer default 0,
  availability_freshness_score integer default 0,
  last_availability_update timestamptz,
  approved_for_shortlist boolean default false,
  created_at timestamptz default now()
);

-- DJ payout expectations per package
create table if not exists public.dj_payouts (
  id uuid primary key default gen_random_uuid(),
  dj_id uuid not null references public.djs(id),
  package_id uuid not null references public.packages(id),
  payout_amount integer,
  extra_hour_payout integer,
  early_setup_payout integer,
  dinner_music_addon_payout integer,
  travel_fee_note text,
  admin_approved boolean default false,
  updated_at timestamptz default now()
);

-- DJ default weekly availability (Th/Fri/Sat)
create table if not exists public.dj_default_availability (
  id uuid primary key default gen_random_uuid(),
  dj_id uuid not null references public.djs(id),
  weekday text not null check (weekday in ('thursday','friday','saturday')),
  default_status text not null check (default_status in ('available','unavailable')),
  updated_at timestamptz default now(),
  unique (dj_id, weekday)
);

-- DJ date-specific availability overrides
create table if not exists public.dj_availability (
  id uuid primary key default gen_random_uuid(),
  dj_id uuid not null references public.djs(id),
  date date not null,
  weekday text not null,
  status text not null check (status in ('available','tentative','booked','unavailable')),
  notes text,
  is_override boolean default true,
  updated_at timestamptz default now(),
  unique (dj_id, date)
);

-- DJ partner applications
create table if not exists public.dj_applications (
  id uuid primary key default gen_random_uuid(),
  stage_name text,
  legal_name text,
  email text,
  phone text,
  city text,
  regions text[],
  cvr text,
  years_experience integer,
  corporate_event_experience text,
  equipment_owned text,
  can_provide_sound boolean default false,
  can_provide_lighting boolean default false,
  can_handle_microphone boolean default false,
  languages text[],
  music_strengths text[],
  sample_mix_url text,
  references_text text,
  short_bio text,
  status text default 'pending_review' check (status in ('pending_review','approved','rejected')),
  created_at timestamptz default now()
);

-- Proposals generated for briefs
create table if not exists public.proposals (
  id uuid primary key default gen_random_uuid(),
  event_brief_id uuid not null references public.event_briefs(id),
  recommended_package_id uuid references public.packages(id),
  status text default 'draft',
  price_estimate_from integer,
  price_estimate_to integer,
  travel_fee_estimate integer,
  technical_surcharge_estimate integer,
  vat_note text,
  recommendation_reason text,
  created_at timestamptz default now(),
  expires_at timestamptz
);

-- Link between proposals and shortlisted DJs
create table if not exists public.proposal_djs (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid not null references public.proposals(id),
  dj_id uuid not null references public.djs(id),
  match_score integer,
  match_reasons text[],
  is_platform_recommended boolean default false,
  display_order integer default 0,
  hold_status text default 'none' check (hold_status in ('none','provisional','locked','unavailable')),
  unique (proposal_id, dj_id)
);

-- Bookings (converted from proposals)
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  proposal_id uuid references public.proposals(id),
  event_brief_id uuid not null references public.event_briefs(id),
  company_id uuid references public.companies(id),
  selected_dj_id uuid references public.djs(id),
  recommended_package_id uuid references public.packages(id),
  client_choice_mode text check (client_choice_mode in ('platform_selects','client_selected_dj')),
  status text default 'provisional_hold',
  final_price integer,
  vat_amount integer,
  travel_fee integer,
  technical_surcharge integer,
  discount integer,
  contract_status text default 'not_sent',
  invoice_status text default 'not_sent',
  payment_status text default 'not_paid',
  backup_dj_id uuid references public.djs(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Client questionnaire after booking
create table if not exists public.client_questionnaires (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id),
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
  completed_at timestamptz
);

-- Event offers sent to DJs
create table if not exists public.event_offers (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  proposal_id uuid references public.proposals(id),
  dj_id uuid not null references public.djs(id),
  status text default 'offered' check (status in ('offered','accepted','declined','expired')),
  payout_estimate integer,
  admin_note text,
  dj_note text,
  created_at timestamptz default now(),
  responded_at timestamptz
);

-- Messages inside booking context
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id),
  sender_role text not null,
  sender_id uuid references public.users(id),
  message text not null,
  created_at timestamptz default now()
);

-- Reviews
create table if not exists public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid references public.bookings(id),
  dj_id uuid references public.djs(id),
  event_type text,
  reviewer_label text,
  rating integer,
  quote text,
  approved boolean default false,
  created_at timestamptz default now()
);

-- Admin notes on any entity
create table if not exists public.admin_notes (
  id uuid primary key default gen_random_uuid(),
  related_type text not null,
  related_id uuid not null,
  note text not null,
  created_by uuid references public.users(id),
  created_at timestamptz default now()
);

-- Documents attached to bookings
create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id),
  type text default 'other' check (type in ('contract','invoice','run_sheet','other')),
  title text,
  url text,
  status text default 'draft',
  created_at timestamptz default now()
);

-- Final run sheet for confirmed events
create table if not exists public.run_sheets (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id),
  venue text,
  load_in_time text,
  soundcheck_time text,
  dinner_start text,
  speeches text,
  dj_start text,
  event_end text,
  onsite_contact text,
  dress_code text,
  technical_notes text,
  emergency_plan text,
  backup_dj_id uuid references public.djs(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Callback / consultation requests
create table if not exists public.callback_requests (
  id uuid primary key default gen_random_uuid(),
  event_brief_id uuid references public.event_briefs(id),
  proposal_id uuid references public.proposals(id),
  name text,
  email text,
  phone text,
  company text,
  message text,
  status text default 'open',
  created_at timestamptz default now()
);

-- Audit log for important actions
create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_user_id uuid references public.users(id),
  actor_role text,
  action text not null,
  entity_type text not null,
  entity_id uuid not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- Enable Row Level Security on all tables
alter table public.users enable row level security;
alter table public.companies enable row level security;
alter table public.event_briefs enable row level security;
alter table public.packages enable row level security;
alter table public.djs enable row level security;
alter table public.dj_payouts enable row level security;
alter table public.dj_default_availability enable row level security;
alter table public.dj_availability enable row level security;
alter table public.dj_applications enable row level security;
alter table public.proposals enable row level security;
alter table public.proposal_djs enable row level security;
alter table public.bookings enable row level security;
alter table public.client_questionnaires enable row level security;
alter table public.event_offers enable row level security;
alter table public.messages enable row level security;
alter table public.reviews enable row level security;
alter table public.admin_notes enable row level security;
alter table public.documents enable row level security;
alter table public.run_sheets enable row level security;
alter table public.callback_requests enable row level security;
alter table public.audit_logs enable row level security;
