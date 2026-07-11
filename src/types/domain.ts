export type UserRole = "client" | "dj" | "admin";

export type EventType =
  | "Firmafest"
  | "Julefrokost"
  | "Påskefrokost"
  | "Sommerfest"
  | "Middag og efterfest"
  | "Kick-off"
  | "Jubilæum"
  | "Reception"
  | "Andet firmaarrangement"
  | "Anden firmafest";

export type Region =
  | "København / Sjælland"
  | "Fyn"
  | "Aarhus / Østjylland"
  | "Aalborg / Nordjylland"
  | "Sydjylland"
  | "Hele Danmark / andet";

export type GuestCountRange = "Under 50" | "50-80" | "80-150" | "150-250" | "250-350" | "350+";
export type GuestTier = "compact" | "medium" | "large";

export type VibeTag =
  | "Elegant middag først, fest senere"
  | "Bred firmafest for alle aldre"
  | "Julefrokost med singalong og klassikere"
  | "Moderne dance/pop"
  | "Disco, funk og 80’er/90’er"
  | "Internationalt publikum"
  | "Rolig lounge og baggrund"
  | "High-energy dansegulv";

export type BudgetBand = "8.000-12.000 DKK" | "12.000-18.000 DKK" | "18.000-25.000 DKK" | "25.000+ DKK" | "Ikke sikker";
export type LanguagePreference = "Dansk" | "Engelsk" | "Begge";
export type DJLanguage = "Dansk" | "Engelsk";
export type YesNoUnsure = "Ja" | "Nej" | "Ikke sikker";
export type ServiceScope = "Kun fest" | "Middag og fest" | "Velkomst, middag og fest";
export type BriefVenueStatus =
  | "Vi har booket venue"
  | "Vi er tæt på at booke venue"
  | "Vi mangler stadig venue"
  | "Det holdes hos os selv (eget kontor eller lokale)";
export type BriefDateFlexibility = "Fast dato" | "Muligvis fleksibel" | "Ikke besluttet endnu";
export type BriefContactRole = "HR" | "Office manager" | "Assistant" | "Event committee" | "Founder/management" | "Other";
export type PackageBackupLevel = "none" | "light" | "standard" | "premium";
export type DJStatus = "pending" | "approved" | "inactive";
export type RosterLayer = "core" | "extended";
export type DJAvailabilityStatus = "available" | "tentative" | "booked" | "unavailable";
export type ProposalHoldStatus = "none" | "provisional" | "locked" | "unavailable";
export type ProposalStatus = "draft" | "sent" | "accepted" | "expired";
export type BookingClientChoiceMode = "platform_selects" | "client_selected_dj";
export type BookingStatus =
  | "new_lead"
  | "proposal_created"
  | "provisional_hold"
  | "awaiting_final_confirmation"
  | "awaiting_deposit_or_invoice"
  | "confirmed"
  | "questionnaire_sent"
  | "questionnaire_completed"
  | "technical_confirmed"
  | "run_sheet_ready"
  | "completed"
  | "cancelled";
export type ContractStatus = "not_sent" | "sent" | "signed" | "void";
export type InvoiceStatus = "not_sent" | "draft" | "sent" | "paid" | "overdue";
export type PaymentStatus = "unpaid" | "deposit_due" | "deposit_paid" | "paid" | "refunded";
export type QuestionnaireStatus = "not_sent" | "sent" | "completed";
export type LeadStatus = BookingStatus | "archived";
export type DJApplicationStatus = "pending_review" | "approved" | "rejected";
export type CallbackRequestStatus = "new" | "contacted" | "resolved";
export type ContactRequestRole = UserRole;
export type AdminNoteRelatedType = "lead" | "booking" | "dj" | "package" | "review";

export interface Profile {
  id: string;
  role: UserRole;
  email: string;
  full_name: string;
  phone: string | null;
  company_name: string | null;
  city: string | null;
  created_at: string;
  updated_at: string;
}

export interface Package {
  id: string;
  name: string;
  slug: string;
  description: string;
  best_for: string;
  price_from: number;
  price_to: number | null;
  vat_note: string;
  guest_min: number;
  guest_max: number;
  hours_included: number;
  sound_included: boolean;
  lighting_included: boolean;
  microphone_included: boolean;
  technical_coordination_included: boolean;
  backup_level: PackageBackupLevel;
  active: boolean;
  display_order: number;
  setup_included?: boolean;
  setup_teardown_included?: boolean;
  transport_note?: string | null;
  technical_notes?: string | null;
}

export interface DJ {
  id: string;
  user_id: string | null;
  stage_name: string;
  public_display_name: string;
  legal_name: string;
  email: string;
  phone: string | null;
  city: string;
  regions: Region[];
  bio_short: string;
  bio_long: string;
  corporate_experience_years: number;
  languages: DJLanguage[];
  vibe_tags: VibeTag[];
  specialties: string[];
  sample_mix_url: string | null;
  photo_url: string | null;
  equipment_sound: boolean;
  equipment_lighting: boolean;
  can_handle_speeches: boolean;
  can_provide_mc: boolean;
  roster_layer: RosterLayer;
  status: DJStatus;
  profile_quality_score: number;
  reliability_score: number;
  availability_freshness_score: number;
  last_availability_update: string;
  approved_for_shortlist: boolean;
  event_type_focuses: EventType[];
  created_at: string;
  updated_at: string;
}

export interface DJAvailability {
  id: string;
  dj_id: string;
  date: string;
  status: DJAvailabilityStatus;
  notes: string | null;
  updated_at: string;
}

export interface EventBrief {
  id: string;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  contact_role: BriefContactRole;
  event_type: EventType;
  event_date: string;
  date_flexibility: BriefDateFlexibility;
  start_time: string;
  end_time: string;
  city: string;
  region: Region;
  venue_name: string | null;
  venue_status: BriefVenueStatus;
  service_scope: ServiceScope;
  setup_size: GuestTier;
  guest_count_range: GuestCountRange;
  needs_sound: YesNoUnsure;
  needs_lighting: YesNoUnsure;
  needs_microphone: YesNoUnsure;
  needs_dinner_music: YesNoUnsure;
  early_setup_requested: boolean;
  dj_start_time: string | null;
  music_vibe_tags: VibeTag[];
  must_play: string | null;
  do_not_play: string | null;
  language_preference: LanguagePreference;
  budget_band: BudgetBand;
  music_vibe_other: string | null;
  success_description: string | null;
  status: LeadStatus;
  created_at: string;
  updated_at: string;
}

export interface ProposalDJ {
  dj_id: string;
  match_score: number;
  match_reasons: string[];
  is_platform_recommended: boolean;
  display_order: number;
  hold_status: ProposalHoldStatus;
}

export interface Proposal {
  id: string;
  event_brief_id: string;
  recommended_package_id: string;
  status: ProposalStatus;
  price_estimate_from: number;
  price_estimate_to: number | null;
  travel_fee_estimate: number;
  technical_surcharge_estimate: number;
  vat_note: string;
  recommendation_reason: string;
  proposal_djs: ProposalDJ[];
  created_at: string;
  expires_at: string | null;
}

export interface Booking {
  id: string;
  proposal_id: string;
  event_brief_id: string;
  selected_dj_id: string | null;
  recommended_package_id: string;
  client_choice_mode: BookingClientChoiceMode;
  company_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  invoice_email: string | null;
  cvr_number: string | null;
  extra_notes: string | null;
  status: BookingStatus;
  final_price: number;
  vat_amount: number;
  travel_fee: number;
  technical_surcharge: number;
  discount: number;
  contract_status: ContractStatus;
  invoice_status: InvoiceStatus;
  payment_status: PaymentStatus;
  backup_dj_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface ClientQuestionnaire {
  id: string;
  booking_id: string;
  venue_contact_name: string | null;
  venue_contact_phone: string | null;
  load_in_time: string | null;
  parking_info: string | null;
  access_notes: string | null;
  final_start_time: string | null;
  final_end_time: string | null;
  speech_times: string | null;
  microphone_notes: string | null;
  must_play_final: string | null;
  do_not_play_final: string | null;
  dress_code: string | null;
  onsite_contact_name: string | null;
  onsite_contact_phone: string | null;
  special_notes: string | null;
  submitted_by_name: string;
  submitted_by_email: string;
  status: QuestionnaireStatus;
  submitted_at: string;
  completed_at: string | null;
}

export interface Message {
  id: string;
  booking_id: string;
  sender_role: UserRole;
  sender_name: string;
  body: string;
  created_at: string;
}

export interface Review {
  id: string;
  booking_id: string | null;
  dj_id: string | null;
  event_type: EventType | null;
  reviewer_label: string;
  rating: number;
  quote: string;
  approved: boolean;
  created_at: string;
}

export interface DJApplication {
  id: string;
  stage_name: string;
  legal_name: string;
  email: string;
  phone: string;
  city: string;
  regions: Region[];
  languages: DJLanguage[];
  vibe_tags: VibeTag[];
  years_of_experience: number;
  corporate_experience_years: number;
  equipment_sound: boolean;
  equipment_lighting: boolean;
  can_handle_speeches: boolean;
  can_provide_mc: boolean;
  sample_mix_url: string | null;
  references: string | null;
  short_bio: string;
  links: string | null;
  cvr_number: string | null;
  availability_commitment: boolean;
  status: DJApplicationStatus;
  created_at: string;
  updated_at: string;
}

export interface ContactRequest {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  company_name: string | null;
  role: ContactRequestRole;
  message: string;
  created_at: string;
}

export interface CallbackRequest {
  id: string;
  proposal_id: string | null;
  full_name: string;
  phone: string;
  preferred_time: string | null;
  message: string;
  status: CallbackRequestStatus;
  created_at: string;
}

export interface AdminNote {
  id: string;
  related_type: AdminNoteRelatedType;
  related_id: string;
  note: string;
  created_at: string;
}

export const BOOKING_STATUS_META = {
  new_lead: { label: "Ny lead", color: "amber", displayOrder: 10 },
  proposal_created: { label: "Tilbud klar", color: "blue", displayOrder: 20 },
  provisional_hold: { label: "Midlertidigt hold", color: "violet", displayOrder: 30 },
  awaiting_final_confirmation: { label: "Afventer endelig bekræftelse", color: "blue", displayOrder: 40 },
  awaiting_deposit_or_invoice: { label: "Afventer depositum eller faktura", color: "amber", displayOrder: 50 },
  confirmed: { label: "Bekræftet", color: "green", displayOrder: 60 },
  questionnaire_sent: { label: "Spørgeskema sendt", color: "blue", displayOrder: 70 },
  questionnaire_completed: { label: "Spørgeskema udfyldt", color: "green", displayOrder: 80 },
  technical_confirmed: { label: "Teknik bekræftet", color: "green", displayOrder: 90 },
  run_sheet_ready: { label: "Run sheet klar", color: "green", displayOrder: 100 },
  completed: { label: "Afsluttet", color: "slate", displayOrder: 110 },
  cancelled: { label: "Annulleret", color: "rose", displayOrder: 120 },
} as const satisfies Record<BookingStatus, { label: string; color: string; displayOrder: number }>;
