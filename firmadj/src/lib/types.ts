export type Role = 'client' | 'dj' | 'admin';

export type User = {
  id: string;
  email: string;
  role: Role;
  name: string;
  phone?: string;
  created_at: string;
};

export type Company = {
  id: string;
  name: string;
  cvr?: string;
  invoice_email?: string;
  created_by?: string;
  created_at: string;
};

export type EventBriefStatus =
  | 'new_lead'
  | 'proposal_created'
  | 'provisional_hold'
  | 'awaiting_final_confirmation'
  | 'awaiting_deposit_or_invoice'
  | 'confirmed'
  | 'questionnaire_sent'
  | 'questionnaire_completed'
  | 'technical_confirmed'
  | 'run_sheet_ready'
  | 'completed'
  | 'cancelled';

export type EventBrief = {
  id: string;
  company_id?: string;
  contact_name: string;
  contact_email: string;
  contact_phone?: string;
  company_name?: string;
  role?: string;
  event_type: string;
  event_date?: string;
  date_flexibility?: string;
  start_time?: string;
  end_time?: string;
  city?: string;
  region?: string;
  venue_name?: string;
  venue_status?: string;
  guest_count_range?: string;
  needs_sound?: string;
  needs_lighting?: string;
  needs_microphone?: string;
  needs_dinner_music?: string;
  needs_venue_coordination?: string;
  music_vibe_tags?: string[];
  must_play?: string;
  do_not_play?: string;
  language_preference?: string;
  budget_band?: string;
  success_description?: string;
  status: EventBriefStatus;
  created_at: string;
};

export type Package = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  best_for?: string;
  price_from: number;
  price_to?: number;
  vat_note?: string;
  guest_min?: number;
  guest_max?: number;
  hours_included?: string;
  sound_included?: boolean;
  lighting_included?: boolean;
  microphone_included?: boolean;
  setup_teardown_included?: boolean;
  technical_coordination_included?: boolean;
  backup_level?: string;
  recommended_guest_range?: string;
  technical_notes?: string;
  active?: boolean;
  display_order?: number;
  created_at: string;
};

export type DJ = {
  id: string;
  user_id?: string;
  stage_name: string;
  public_display_name: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  regions?: string[];
  bio_short?: string;
  bio_long?: string;
  corporate_experience_years?: number;
  languages?: string[];
  vibe_tags?: string[];
  specialties?: string[];
  sample_mix_url?: string;
  photo_url?: string;
  equipment_sound?: string;
  equipment_lighting?: string;
  can_handle_speeches?: boolean;
  can_provide_mc?: boolean;
  can_deliver_80?: boolean;
  can_deliver_150?: boolean;
  can_deliver_200?: boolean;
  transport_radius_km?: number;
  setup_time_minutes?: number;
  setup_area_description?: string;
  roster_layer?: 'core' | 'extended';
  status?: 'pending' | 'approved' | 'inactive';
  profile_quality_score?: number;
  profile_completeness_score?: number;
  reliability_score?: number;
  availability_freshness_score?: number;
  last_availability_update?: string;
  approved_for_shortlist?: boolean;
  created_at: string;
};

export type DJPayout = {
  id: string;
  dj_id: string;
  package_id: string;
  payout_amount?: number;
  extra_hour_payout?: number;
  early_setup_payout?: number;
  dinner_music_addon_payout?: number;
  travel_fee_note?: string;
  admin_approved?: boolean;
  updated_at: string;
};

export type DJAvailability = {
  id: string;
  dj_id: string;
  date: string;
  weekday: string;
  status: 'available' | 'tentative' | 'booked' | 'unavailable';
  notes?: string;
  is_override?: boolean;
  updated_at: string;
};

export type DJDefaultAvailability = {
  id: string;
  dj_id: string;
  weekday: 'thursday' | 'friday' | 'saturday';
  default_status: 'available' | 'unavailable';
  updated_at: string;
};

export type DJApplication = {
  id: string;
  stage_name?: string;
  legal_name?: string;
  email?: string;
  phone?: string;
  city?: string;
  regions?: string[];
  cvr?: string;
  years_experience?: number;
  corporate_event_experience?: string;
  equipment_owned?: string;
  can_provide_sound?: boolean;
  can_provide_lighting?: boolean;
  can_handle_microphone?: boolean;
  languages?: string[];
  music_strengths?: string[];
  sample_mix_url?: string;
  references_text?: string;
  short_bio?: string;
  status: 'pending_review' | 'approved' | 'rejected';
  created_at: string;
};

export type Proposal = {
  id: string;
  event_brief_id: string;
  recommended_package_id?: string;
  status?: string;
  price_estimate_from?: number;
  price_estimate_to?: number;
  travel_fee_estimate?: number;
  technical_surcharge_estimate?: number;
  vat_note?: string;
  recommendation_reason?: string;
  created_at: string;
  expires_at?: string;
};

export type ProposalDJ = {
  id: string;
  proposal_id: string;
  dj_id: string;
  match_score?: number;
  match_reasons?: string[];
  is_platform_recommended?: boolean;
  display_order?: number;
  hold_status?: 'none' | 'provisional' | 'locked' | 'unavailable';
};

export type Booking = {
  id: string;
  proposal_id?: string;
  event_brief_id: string;
  company_id?: string;
  selected_dj_id?: string;
  recommended_package_id?: string;
  client_choice_mode?: 'platform_selects' | 'client_selected_dj';
  status: EventBriefStatus;
  final_price?: number;
  vat_amount?: number;
  travel_fee?: number;
  technical_surcharge?: number;
  discount?: number;
  contract_status?: string;
  invoice_status?: string;
  payment_status?: string;
  backup_dj_id?: string;
  created_at: string;
  updated_at: string;
};

export type ClientQuestionnaire = {
  id: string;
  booking_id: string;
  venue_contact_name?: string;
  venue_contact_phone?: string;
  load_in_time?: string;
  parking_info?: string;
  access_notes?: string;
  final_start_time?: string;
  final_end_time?: string;
  speech_times?: string;
  microphone_notes?: string;
  must_play_final?: string;
  do_not_play_final?: string;
  dress_code?: string;
  onsite_contact_name?: string;
  onsite_contact_phone?: string;
  special_notes?: string;
  completed_at?: string;
};

export type EventOffer = {
  id: string;
  booking_id?: string;
  proposal_id?: string;
  dj_id: string;
  status: 'offered' | 'accepted' | 'declined' | 'expired';
  payout_estimate?: number;
  admin_note?: string;
  dj_note?: string;
  created_at: string;
  responded_at?: string;
};

export type Message = {
  id: string;
  booking_id: string;
  sender_role: string;
  sender_id?: string;
  message: string;
  created_at: string;
};

export type Review = {
  id: string;
  booking_id?: string;
  dj_id?: string;
  event_type?: string;
  reviewer_label?: string;
  rating?: number;
  quote?: string;
  approved?: boolean;
  created_at: string;
};

export type AdminNote = {
  id: string;
  related_type: string;
  related_id: string;
  note: string;
  created_by?: string;
  created_at: string;
};

export type Document = {
  id: string;
  booking_id: string;
  type: 'contract' | 'invoice' | 'run_sheet' | 'other';
  title?: string;
  url?: string;
  status?: string;
  created_at: string;
};

export type RunSheet = {
  id: string;
  booking_id: string;
  venue?: string;
  load_in_time?: string;
  soundcheck_time?: string;
  dinner_start?: string;
  speeches?: string;
  dj_start?: string;
  event_end?: string;
  onsite_contact?: string;
  dress_code?: string;
  technical_notes?: string;
  emergency_plan?: string;
  backup_dj_id?: string;
  created_at: string;
  updated_at: string;
};

export type CallbackRequest = {
  id: string;
  event_brief_id?: string;
  proposal_id?: string;
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
  status?: string;
  created_at: string;
};

export type AuditLog = {
  id: string;
  actor_user_id?: string;
  actor_role?: string;
  action: string;
  entity_type: string;
  entity_id: string;
  metadata?: any;
  created_at: string;
};
