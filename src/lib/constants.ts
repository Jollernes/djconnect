export const PLATFORM_NAME = "DJConnect";
export const PLATFORM_TAGLINE = "Book verified DJs with full mobile disco setups";
export const PLATFORM_SUPPORT_EMAIL = "support@djconnect.example";

export const PLATFORM_FEE_PERCENT = 10;

export const EVENT_TYPES = [
  { id: "wedding", label: "Wedding" },
  { id: "birthday", label: "Birthday Party" },
  { id: "corporate_event", label: "Corporate Event" },
  { id: "corporate_party", label: "Corporate Party" },
  { id: "private_party", label: "Private Party" },
  { id: "other", label: "Other" },
] as const;

export type EventTypeId = (typeof EVENT_TYPES)[number]["id"];

export const SETUP_SIZES = [
  { id: "small", label: "Small", description: "Apartment / small room" },
  { id: "medium", label: "Medium", description: "100–200 guests" },
  { id: "large", label: "Large", description: "200+ guests / outdoor" },
] as const;

export type SetupSizeId = (typeof SETUP_SIZES)[number]["id"];

export const EXPERIENCE_YEARS = [
  { id: "1-2", label: "1–2 years" },
  { id: "3-5", label: "3–5 years" },
  { id: "5-10", label: "5–10 years" },
  { id: "10+", label: "10+ years" },
] as const;

export const EVENTS_PERFORMED = [
  { id: "1-10", label: "1–10" },
  { id: "11-50", label: "11–50" },
  { id: "51-100", label: "51–100" },
  { id: "100+", label: "100+" },
] as const;

export const BOOKING_STATUSES = {
  pending: { label: "Pending", color: "warning" },
  quoted: { label: "Quote sent", color: "warning" },
  awaiting_payment: { label: "Awaiting payment", color: "warning" },
  confirmed: { label: "Confirmed", color: "success" },
  completed: { label: "Completed", color: "muted" },
  cancelled: { label: "Cancelled", color: "destructive" },
  declined: { label: "Declined", color: "destructive" },
  refunded: { label: "Refunded", color: "muted" },
} as const;

export type BookingStatus = keyof typeof BOOKING_STATUSES;

export const VERIFICATION_STATUSES = {
  draft: { label: "Draft" },
  pending: { label: "Pending review" },
  approved: { label: "Approved" },
  rejected: { label: "Rejected" },
} as const;

export type VerificationStatus = keyof typeof VERIFICATION_STATUSES;

export const CANCELLATION_POLICY = [
  { windowDays: 14, refundPercent: 100, label: "More than 14 days before event: 100% refund" },
  { windowDays: 7, refundPercent: 50, label: "7–14 days before event: 50% refund" },
  { windowDays: 0, refundPercent: 0, label: "Less than 7 days before event: no refund" },
];

export function computeRefundPercent(eventDate: Date, now = new Date()): number {
  const days = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days >= 14) return 100;
  if (days >= 7) return 50;
  return 0;
}
