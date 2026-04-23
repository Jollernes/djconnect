-- DJConnect base schema, enums, and tables.
-- Apply via `supabase db push` (or paste into the Supabase SQL editor).

create extension if not exists "pgcrypto";

-- Enums
create type user_role as enum ('customer', 'dj', 'admin');
create type verification_status as enum ('draft', 'pending', 'approved', 'rejected');
create type setup_size as enum ('small', 'medium', 'large');
create type booking_status as enum (
  'pending', 'quoted', 'awaiting_payment', 'confirmed',
  'declined', 'cancelled', 'completed', 'refunded'
);
create type message_sender_role as enum ('customer', 'dj');
create type payout_status as enum ('pending', 'released', 'paid', 'failed');

-- profiles: extends auth.users
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null default 'customer',
  email text not null,
  full_name text not null,
  phone text,
  avatar_url text,
  city text,
  country text,
  company_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Event type lookup
create table public.event_types (
  id text primary key,
  label text not null,
  sort_order int not null default 0
);

insert into public.event_types (id, label, sort_order) values
  ('wedding',          'Wedding',           1),
  ('birthday',         'Birthday Party',    2),
  ('corporate_event',  'Corporate Event',   3),
  ('corporate_party',  'Corporate Party',   4),
  ('private_party',    'Private Party',     5),
  ('other',            'Other',             6);

-- dj_profiles
create table public.dj_profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  username text unique,
  stage_name text not null,
  tagline text,
  bio text not null,
  years_experience text not null check (years_experience in ('1-2','3-5','5-10','10+')),
  events_performed text not null check (events_performed in ('1-10','11-50','51-100','100+')),
  notable_clients text,
  equipment_description text not null,
  setup_size setup_size not null,
  travel_radius_km int not null default 50,
  base_location text not null,
  price_from_minor int,
  price_on_request boolean not null default false,
  currency text not null default 'DKK',
  verification_status verification_status not null default 'draft',
  verification_notes text,
  stripe_account_id text,
  stripe_charges_enabled boolean not null default false,
  stripe_payouts_enabled boolean not null default false,
  is_featured boolean not null default false,
  rating_average numeric(3,2) not null default 0,
  rating_count int not null default 0,
  submitted_at timestamptz,
  approved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index dj_profiles_search_idx on public.dj_profiles (verification_status, is_featured, rating_average desc);

-- dj_equipment_photos
create table public.dj_equipment_photos (
  id uuid primary key default gen_random_uuid(),
  dj_profile_id uuid not null references public.dj_profiles(id) on delete cascade,
  storage_path text not null,
  url text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index dj_equipment_photos_dj_idx on public.dj_equipment_photos (dj_profile_id, sort_order);

-- dj_event_types (many-to-many)
create table public.dj_event_types (
  dj_profile_id uuid not null references public.dj_profiles(id) on delete cascade,
  event_type_id text not null references public.event_types(id),
  primary key (dj_profile_id, event_type_id)
);

-- dj_credentials (optional reference docs)
create table public.dj_credentials (
  id uuid primary key default gen_random_uuid(),
  dj_profile_id uuid not null references public.dj_profiles(id) on delete cascade,
  storage_path text not null,
  filename text not null,
  created_at timestamptz not null default now()
);

-- availability: blocked dates
create table public.availability (
  id uuid primary key default gen_random_uuid(),
  dj_profile_id uuid not null references public.dj_profiles(id) on delete cascade,
  blocked_date date not null,
  reason text,
  created_at timestamptz not null default now(),
  unique (dj_profile_id, blocked_date)
);

-- recurring_unavailability
create table public.recurring_unavailability (
  id uuid primary key default gen_random_uuid(),
  dj_profile_id uuid not null references public.dj_profiles(id) on delete cascade,
  day_of_week smallint not null check (day_of_week between 0 and 6),
  created_at timestamptz not null default now(),
  unique (dj_profile_id, day_of_week)
);

-- bookings
create table public.bookings (
  id uuid primary key default gen_random_uuid(),
  reference text not null unique default 'DJC-' || upper(substr(replace(gen_random_uuid()::text,'-',''),1,8)),
  customer_id uuid not null references public.profiles(id),
  dj_profile_id uuid not null references public.dj_profiles(id),
  status booking_status not null default 'pending',
  event_type_id text not null references public.event_types(id),
  event_date date not null,
  start_time time not null,
  end_time time,
  venue_name text not null,
  venue_address text not null,
  estimated_guests int,
  notes text,
  price_minor int,
  platform_fee_minor int not null default 0,
  payout_minor int not null default 0,
  currency text not null default 'DKK',
  quote_message text,
  decline_reason text,
  cancellation_reason text,
  stripe_payment_intent_id text,
  stripe_checkout_session_id text,
  stripe_transfer_id text,
  paid_at timestamptz,
  accepted_at timestamptz,
  completed_at timestamptz,
  cancelled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index bookings_customer_idx on public.bookings (customer_id, created_at desc);
create index bookings_dj_idx on public.bookings (dj_profile_id, status, event_date desc);

-- messages (per booking)
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null references public.bookings(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  sender_role message_sender_role not null,
  body text not null,
  created_at timestamptz not null default now()
);

create index messages_booking_idx on public.messages (booking_id, created_at);

-- reviews (1 per booking, from customer)
create table public.reviews (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  dj_profile_id uuid not null references public.dj_profiles(id) on delete cascade,
  rating smallint not null check (rating between 1 and 5),
  body text not null check (char_length(body) >= 20),
  would_recommend boolean not null,
  is_hidden boolean not null default false,
  created_at timestamptz not null default now()
);

create index reviews_dj_idx on public.reviews (dj_profile_id, created_at desc) where is_hidden = false;

-- payouts
create table public.payouts (
  id uuid primary key default gen_random_uuid(),
  booking_id uuid not null unique references public.bookings(id) on delete cascade,
  dj_profile_id uuid not null references public.dj_profiles(id) on delete cascade,
  amount_minor int not null,
  currency text not null default 'DKK',
  status payout_status not null default 'pending',
  stripe_transfer_id text,
  scheduled_for timestamptz not null,
  released_at timestamptz,
  created_at timestamptz not null default now()
);

-- favourites
create table public.favourites (
  customer_id uuid not null references public.profiles(id) on delete cascade,
  dj_profile_id uuid not null references public.dj_profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (customer_id, dj_profile_id)
);

-- update_at trigger
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end $$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger dj_profiles_touch before update on public.dj_profiles
  for each row execute function public.touch_updated_at();
create trigger bookings_touch before update on public.bookings
  for each row execute function public.touch_updated_at();

-- On auth.users insert, create a profiles row from user metadata.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, company_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer'),
    new.raw_user_meta_data->>'company_name'
  )
  on conflict (id) do nothing;
  return new;
end $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Recompute rating average on review insert/update/delete.
create or replace function public.recalc_dj_rating()
returns trigger language plpgsql as $$
declare target uuid;
begin
  target := coalesce(new.dj_profile_id, old.dj_profile_id);
  update public.dj_profiles d set
    rating_average = coalesce((select round(avg(rating)::numeric, 2)
                                 from public.reviews r
                                 where r.dj_profile_id = target and r.is_hidden = false), 0),
    rating_count   = (select count(*) from public.reviews r
                       where r.dj_profile_id = target and r.is_hidden = false)
  where d.id = target;
  return null;
end $$;

create trigger reviews_recalc after insert or update or delete on public.reviews
  for each row execute function public.recalc_dj_rating();
