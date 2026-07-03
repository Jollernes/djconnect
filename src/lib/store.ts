import { useSyncExternalStore } from "react";
import { SEED_DJS, SEED_PACKAGES, SEED_REVIEWS, DEFAULT_AVAILABILITY_DAYS, getAvailability, listSeedAvailability } from "@/data/seed";
import { availabilityFreshness, recommendPackage, shortlistDJs } from "@/lib/matching";
import type {
  AdminNote,
  Booking,
  BookingStatus,
  CallbackRequest,
  ClientQuestionnaire,
  ContactRequest,
  DJ,
  DJApplication,
  DJAvailability,
  EventBrief,
  InvoiceStatus,
  Message,
  Package,
  PaymentStatus,
  Proposal,
  Review,
  ContractStatus,
} from "@/types/domain";

const STORAGE_KEY = "djconnect.v2.state";
const FALLBACK_EXPIRY_DAYS = 7;

type CollectionName =
  | "eventBriefs"
  | "proposals"
  | "bookings"
  | "questionnaires"
  | "messages"
  | "djApplications"
  | "contactRequests"
  | "callbackRequests"
  | "adminNotes"
  | "packages"
  | "djs"
  | "reviews"
  | "djAvailabilityOverrides";

interface StoreState {
  eventBriefs: EventBrief[];
  proposals: Proposal[];
  bookings: Booking[];
  questionnaires: ClientQuestionnaire[];
  messages: Message[];
  djApplications: DJApplication[];
  contactRequests: ContactRequest[];
  callbackRequests: CallbackRequest[];
  adminNotes: AdminNote[];
  packages: Package[];
  djs: DJ[];
  reviews: Review[];
  djAvailabilityOverrides: DJAvailability[];
}

type EntityMap = {
  eventBriefs: EventBrief;
  proposals: Proposal;
  bookings: Booking;
  questionnaires: ClientQuestionnaire;
  messages: Message;
  djApplications: DJApplication;
  contactRequests: ContactRequest;
  callbackRequests: CallbackRequest;
  adminNotes: AdminNote;
  packages: Package;
  djs: DJ;
  reviews: Review;
  djAvailabilityOverrides: DJAvailability;
};

type CollectionPatchMap = {
  eventBriefs: Partial<EventBrief>;
  proposals: Partial<Proposal>;
  bookings: Partial<Booking>;
  questionnaires: Partial<ClientQuestionnaire>;
  messages: Partial<Message>;
  djApplications: Partial<DJApplication>;
  contactRequests: Partial<ContactRequest>;
  callbackRequests: Partial<CallbackRequest>;
  adminNotes: Partial<AdminNote>;
  packages: Partial<Package>;
  djs: Partial<DJ>;
  reviews: Partial<Review>;
  djAvailabilityOverrides: Partial<DJAvailability>;
};

export type StoreSnapshot = StoreState;

const listeners = new Set<() => void>();

function nowIso() {
  return new Date().toISOString();
}

export function genId(prefix: string) {
  const value = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID().slice(0, 8) : Math.random().toString(36).slice(2, 10);
  return `${prefix}_${value}`;
}

function isBrowser() {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function getDefaultState(): StoreState {
  return {
    eventBriefs: [],
    proposals: [],
    bookings: [],
    questionnaires: [],
    messages: [],
    djApplications: [],
    contactRequests: [],
    callbackRequests: [],
    adminNotes: [],
    packages: clone(SEED_PACKAGES),
    djs: clone(SEED_DJS),
    reviews: clone(SEED_REVIEWS),
    djAvailabilityOverrides: [],
  };
}

function loadState(): StoreState {
  if (!isBrowser()) {
    return getDefaultState();
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const initial = getDefaultState();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as Partial<StoreState>;
    const defaults = getDefaultState();
    return {
      eventBriefs: parsed.eventBriefs ?? defaults.eventBriefs,
      proposals: parsed.proposals ?? defaults.proposals,
      bookings: parsed.bookings ?? defaults.bookings,
      questionnaires: parsed.questionnaires ?? defaults.questionnaires,
      messages: parsed.messages ?? defaults.messages,
      djApplications: parsed.djApplications ?? defaults.djApplications,
      contactRequests: parsed.contactRequests ?? defaults.contactRequests,
      callbackRequests: parsed.callbackRequests ?? defaults.callbackRequests,
      adminNotes: parsed.adminNotes ?? defaults.adminNotes,
      packages: parsed.packages ?? defaults.packages,
      djs: parsed.djs ?? defaults.djs,
      reviews: parsed.reviews ?? defaults.reviews,
      djAvailabilityOverrides: parsed.djAvailabilityOverrides ?? defaults.djAvailabilityOverrides,
    };
  } catch {
    return getDefaultState();
  }
}

let state = loadState();

function persistState(next: StoreState) {
  state = next;
  if (isBrowser()) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Ignore persistence failures in demo mode.
    }
  }
  listeners.forEach((listener) => listener());
}

export function getStoreSnapshot() {
  return state;
}

export function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useStore<T>(selector: (snapshot: StoreSnapshot) => T) {
  return useSyncExternalStore(subscribe, () => selector(getStoreSnapshot()), () => selector(getDefaultState()));
}

export function useCollection<K extends CollectionName>(key: K) {
  return useStore((snapshot) => snapshot[key]);
}

function updateCollection<K extends CollectionName>(key: K, value: StoreState[K]) {
  persistState({ ...state, [key]: value });
}

function updateById<K extends keyof EntityMap>(collection: K, id: string, patch: CollectionPatchMap[K]) {
  const items = [...state[collection]] as EntityMap[K][];
  const index = items.findIndex((item) => item.id === id);
  if (index === -1) {
    return null;
  }
  const current = items[index];
  const next = { ...current, ...patch, updated_at: "updated_at" in current ? nowIso() : undefined } as EntityMap[K];
  if (collection === "djs") {
    const nextDj = next as DJ;
    nextDj.availability_freshness_score = availabilityFreshness(nextDj).score;
  }
  items[index] = next;
  updateCollection(collection, items as StoreState[K]);
  return next;
}

function appendToCollection<K extends CollectionName>(key: K, value: EntityMap[K]) {
  const items = [...state[key], value] as StoreState[K];
  updateCollection(key, items);
  return value;
}

export function resetDemoData() {
  persistState(getDefaultState());
}

export function listLeads() {
  return [...state.eventBriefs].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getEventBrief(id: string) {
  return state.eventBriefs.find((brief) => brief.id === id) ?? null;
}

export function createEventBrief(input: Omit<EventBrief, "id" | "created_at" | "updated_at" | "status"> & Partial<Pick<EventBrief, "status">>) {
  const now = nowIso();
  const brief: EventBrief = {
    ...input,
    id: genId("brief"),
    status: input.status ?? "new_lead",
    created_at: now,
    updated_at: now,
  };
  appendToCollection("eventBriefs", brief);
  return brief;
}

export function updateEventBrief(id: string, patch: Partial<EventBrief>) {
  return updateById("eventBriefs", id, patch);
}

export function listPackages() {
  return [...state.packages].sort((a, b) => a.display_order - b.display_order);
}

export function getPackage(id: string) {
  return state.packages.find((pkg) => pkg.id === id) ?? null;
}

export function updatePackage(id: string, patch: Partial<Package>) {
  return updateById("packages", id, patch);
}

export function listDJs() {
  return [...state.djs].sort((a, b) => b.profile_quality_score - a.profile_quality_score || b.reliability_score - a.reliability_score);
}

export function getDJ(id: string) {
  return state.djs.find((dj) => dj.id === id) ?? null;
}

export function updateDJ(id: string, patch: Partial<DJ>) {
  return updateById("djs", id, patch);
}

export function getDJAvailability(djId: string, date: string) {
  const override = state.djAvailabilityOverrides.find((row) => row.dj_id === djId && row.date === date);
  if (override) {
    return override;
  }
  return {
    id: `${djId}_${date}`,
    dj_id: djId,
    date,
    status: getAvailability(djId, date),
    notes: null,
    updated_at: nowIso(),
  } satisfies DJAvailability;
}

export function listDJAvailability(djId: string, from = new Date(), days = DEFAULT_AVAILABILITY_DAYS) {
  const items: DJAvailability[] = [];
  for (let offset = 0; offset < days; offset += 1) {
    const date = new Date(from.getTime() + offset * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    items.push(getDJAvailability(djId, date));
  }
  return items;
}

export function setDJAvailabilityOverride(input: DJAvailability) {
  const existingIndex = state.djAvailabilityOverrides.findIndex((row) => row.dj_id === input.dj_id && row.date === input.date);
  const next = [...state.djAvailabilityOverrides];
  const now = nowIso();
  const existingDj = getDJ(input.dj_id);
  if (existingIndex >= 0) {
    next[existingIndex] = { ...input, updated_at: now };
  } else {
    next.push({ ...input, updated_at: now });
  }
  updateCollection("djAvailabilityOverrides", next);
  if (existingDj) {
    const refreshedScore = availabilityFreshness({ ...existingDj, last_availability_update: now }).score;
    updateDJ(input.dj_id, { last_availability_update: now, availability_freshness_score: refreshedScore });
  }
  return input;
}

export function createProposalForBrief(briefId: string) {
  const brief = getEventBrief(briefId);
  if (!brief) {
    throw new Error(`Unknown event brief: ${briefId}`);
  }

  const recommendedPackage = recommendPackage(brief, state.packages.filter((pkg) => pkg.active));
  const shortlisted = shortlistDJs(brief, state.djs);
  const now = nowIso();
  const proposal: Proposal = {
    id: genId("proposal"),
    event_brief_id: brief.id,
    recommended_package_id: recommendedPackage.id,
    status: "draft",
    price_estimate_from: recommendedPackage.price_from,
    price_estimate_to: recommendedPackage.price_to,
    travel_fee_estimate: brief.region === "Hele Danmark / andet" ? 1200 : 0,
    technical_surcharge_estimate: brief.needs_venue_coordination === "Ja" || brief.needs_microphone === "Ja" ? 1500 : 0,
    vat_note: recommendedPackage.vat_note,
    recommendation_reason: `Baseret på ${brief.guest_count_range.toLowerCase()}, ${brief.event_type.toLowerCase()} og jeres tekniske behov.`,
    proposal_djs: shortlisted,
    created_at: now,
    expires_at: new Date(Date.now() + FALLBACK_EXPIRY_DAYS * 24 * 60 * 60 * 1000).toISOString(),
  };
  appendToCollection("proposals", proposal);
  updateEventBrief(brief.id, { status: "proposal_created" });
  return proposal;
}

export function listProposals() {
  return [...state.proposals].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function getProposal(id: string) {
  return state.proposals.find((proposal) => proposal.id === id) ?? null;
}

export function updateProposal(id: string, patch: Partial<Proposal>) {
  return updateById("proposals", id, patch);
}

export function createBooking(
  input: Omit<Booking, "id" | "created_at" | "updated_at" | "status" | "contract_status" | "invoice_status" | "payment_status"> &
    Partial<Pick<Booking, "status" | "contract_status" | "invoice_status" | "payment_status">>,
) {
  const now = nowIso();
  const booking: Booking = {
    ...input,
    id: genId("booking"),
    status: input.status ?? "provisional_hold",
    contract_status: input.contract_status ?? "not_sent",
    invoice_status: input.invoice_status ?? "not_sent",
    payment_status: input.payment_status ?? "unpaid",
    created_at: now,
    updated_at: now,
  };
  appendToCollection("bookings", booking);
  updateEventBrief(booking.event_brief_id, { status: booking.status });
  return booking;
}

export function getBooking(id: string) {
  return state.bookings.find((booking) => booking.id === id) ?? null;
}

export function listBookings() {
  return [...state.bookings].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function updateBooking(id: string, patch: Partial<Booking>) {
  return updateById("bookings", id, patch);
}

export function submitQuestionnaire(
  bookingId: string,
  input: Omit<ClientQuestionnaire, "id" | "booking_id" | "completed_at"> & Partial<Pick<ClientQuestionnaire, "completed_at">>,
) {
  const existing = state.questionnaires.find((item) => item.booking_id === bookingId);
  const now = nowIso();
  const questionnaire: ClientQuestionnaire = {
    ...input,
    id: existing?.id ?? genId("questionnaire"),
    booking_id: bookingId,
    completed_at: input.completed_at ?? now,
  };
  const next = state.questionnaires.filter((item) => item.booking_id !== bookingId).concat(questionnaire);
  updateCollection("questionnaires", next);
  updateBooking(bookingId, { status: "questionnaire_completed" });
  return questionnaire;
}

export function getQuestionnaire(bookingId: string) {
  return state.questionnaires.find((item) => item.booking_id === bookingId) ?? null;
}

export function addMessage(input: Omit<Message, "id" | "created_at">) {
  const message: Message = {
    ...input,
    id: genId("msg"),
    created_at: nowIso(),
  };
  appendToCollection("messages", message);
  return message;
}

export function listMessages(bookingId?: string) {
  return bookingId ? state.messages.filter((message) => message.booking_id === bookingId) : [...state.messages];
}

export function createDJApplication(input: Omit<DJApplication, "id" | "status" | "created_at" | "updated_at"> & Partial<Pick<DJApplication, "status">>) {
  const now = nowIso();
  const application: DJApplication = {
    ...input,
    id: genId("djapp"),
    status: input.status ?? "pending_review",
    created_at: now,
    updated_at: now,
  };
  appendToCollection("djApplications", application);
  return application;
}

export function listDJApplications() {
  return [...state.djApplications].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function approveDJApplication(applicationId: string) {
  const application = state.djApplications.find((item) => item.id === applicationId);
  if (!application) {
    return null;
  }

  const existingDj = state.djs.find((dj) => dj.email === application.email || dj.stage_name === application.stage_name);
  const now = nowIso();
  const nextDj: DJ = existingDj
    ? {
        ...existingDj,
        stage_name: application.stage_name,
        public_display_name: application.stage_name,
        legal_name: application.legal_name,
        email: application.email,
        phone: application.phone,
        city: application.city,
        regions: application.regions,
        bio_short: application.short_bio,
        bio_long: application.short_bio,
        corporate_experience_years: application.corporate_experience_years,
        languages: application.languages,
        vibe_tags: application.vibe_tags,
        specialties: [
          application.equipment_sound ? "Lyd medbringes" : null,
          application.equipment_lighting ? "Lys medbringes" : null,
          application.can_handle_speeches ? "Mikrofon og taler" : null,
          application.can_provide_mc ? "Kan også være MC" : null,
        ].filter((item): item is string => Boolean(item)),
        sample_mix_url: application.sample_mix_url,
        photo_url: existingDj.photo_url,
        equipment_sound: application.equipment_sound,
        equipment_lighting: application.equipment_lighting,
        can_handle_speeches: application.can_handle_speeches,
        can_provide_mc: application.can_provide_mc,
        roster_layer: existingDj.roster_layer,
        status: "approved",
        profile_quality_score: Math.max(existingDj.profile_quality_score, 88),
        reliability_score: Math.max(existingDj.reliability_score, 86),
        availability_freshness_score: existingDj.availability_freshness_score,
        last_availability_update: existingDj.last_availability_update,
        approved_for_shortlist: true,
        updated_at: now,
      }
    : {
        id: genId("dj"),
        user_id: null,
        stage_name: application.stage_name,
        public_display_name: application.stage_name,
        legal_name: application.legal_name,
        email: application.email,
        phone: application.phone,
        city: application.city,
        regions: application.regions,
        bio_short: application.short_bio,
        bio_long: application.short_bio,
        corporate_experience_years: application.corporate_experience_years,
        languages: application.languages,
        vibe_tags: application.vibe_tags,
        specialties: [
          application.equipment_sound ? "Lyd medbringes" : null,
          application.equipment_lighting ? "Lys medbringes" : null,
          application.can_handle_speeches ? "Mikrofon og taler" : null,
          application.can_provide_mc ? "Kan også være MC" : null,
        ].filter((item): item is string => Boolean(item)),
        sample_mix_url: application.sample_mix_url,
        photo_url: null,
        equipment_sound: application.equipment_sound,
        equipment_lighting: application.equipment_lighting,
        can_handle_speeches: application.can_handle_speeches,
        can_provide_mc: application.can_provide_mc,
        roster_layer: "extended",
        status: "approved",
        profile_quality_score: 88,
        reliability_score: 86,
        availability_freshness_score: 100,
        last_availability_update: now,
        approved_for_shortlist: true,
        event_type_focuses: [],
        created_at: now,
        updated_at: now,
      };

  if (existingDj) {
    updateDJ(existingDj.id, nextDj);
  } else {
    appendToCollection("djs", nextDj);
  }

  updateById("djApplications", applicationId, { status: "approved" });
  return nextDj;
}

export function rejectDJApplication(applicationId: string) {
  return updateById("djApplications", applicationId, { status: "rejected" });
}

export function createContactRequest(input: Omit<ContactRequest, "id" | "created_at">) {
  const request: ContactRequest = {
    ...input,
    id: genId("contact"),
    created_at: nowIso(),
  };
  appendToCollection("contactRequests", request);
  return request;
}

export function listContactRequests() {
  return [...state.contactRequests].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function createCallbackRequest(input: Omit<CallbackRequest, "id" | "created_at" | "status"> & Partial<Pick<CallbackRequest, "status">>) {
  const request: CallbackRequest = {
    ...input,
    id: genId("callback"),
    status: input.status ?? "new",
    created_at: nowIso(),
  };
  appendToCollection("callbackRequests", request);
  return request;
}

export function listCallbackRequests() {
  return [...state.callbackRequests].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function addReview(input: Omit<Review, "id" | "created_at" | "approved"> & Partial<Pick<Review, "approved">>) {
  const review: Review = {
    ...input,
    id: genId("review"),
    approved: input.approved ?? false,
    created_at: nowIso(),
  };
  appendToCollection("reviews", review);
  return review;
}

export function approveReview(id: string) {
  return updateById("reviews", id, { approved: true });
}

export function listReviews() {
  return [...state.reviews].sort((a, b) => b.created_at.localeCompare(a.created_at));
}

export function addAdminNote(input: Omit<AdminNote, "id" | "created_at">) {
  const note: AdminNote = {
    ...input,
    id: genId("note"),
    created_at: nowIso(),
  };
  appendToCollection("adminNotes", note);
  return note;
}

export function listAdminNotes(relatedType?: AdminNote["related_type"], relatedId?: string) {
  return state.adminNotes.filter((note) => {
    if (relatedType && note.related_type !== relatedType) return false;
    if (relatedId && note.related_id !== relatedId) return false;
    return true;
  });
}

export function updateBookingStatus(id: string, status: BookingStatus) {
  return updateBooking(id, { status });
}

export function setBookingFinancials(
  id: string,
  patch: {
    final_price?: number;
    vat_amount?: number;
    travel_fee?: number;
    technical_surcharge?: number;
    discount?: number;
    contract_status?: ContractStatus;
    invoice_status?: InvoiceStatus;
    payment_status?: PaymentStatus;
  },
) {
  return updateBooking(id, patch);
}

export function getActivePackageForBrief(briefId: string) {
  const brief = getEventBrief(briefId);
  if (!brief) return null;
  return recommendPackage(brief, state.packages);
}

export function getAvailabilityWindow(djId: string, days = DEFAULT_AVAILABILITY_DAYS) {
  return listSeedAvailability(djId, new Date(), days).map((row) => {
    const override = state.djAvailabilityOverrides.find((item) => item.dj_id === djId && item.date === row.date);
    return override ?? row;
  });
}
