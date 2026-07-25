export const PLATFORM_NAME = "DJConnect";
export const PLATFORM_TAGLINE = "Book verificerede DJs med komplet mobilt diskotek";
export const PLATFORM_SUPPORT_EMAIL = "support@djconnect.example";

export const PLATFORM_FEE_PERCENT = 10;

/**
 * Deposit taken up front when a customer gives their final booking
 * confirmation. It is 25% of the full price and doubles as the platform fee;
 * the remaining 75% is the DJ's payout, settled after the event.
 */
export const DEPOSIT_PERCENT = 25;

export const EVENT_TYPES = [
  { id: "wedding", label: "Bryllup" },
  { id: "birthday", label: "Fødselsdagsfest" },
  { id: "corporate_event", label: "Firmaarrangement" },
  { id: "corporate_party", label: "Firmafest" },
  { id: "private_party", label: "Privatfest" },
  { id: "other", label: "Andet" },
] as const;

export type EventTypeId = (typeof EVENT_TYPES)[number]["id"];

export const SETUP_SIZES = [
  { id: "small", label: "Lille", description: "Lejlighed / lille lokale" },
  { id: "medium", label: "Mellem", description: "100–200 gæster" },
  { id: "large", label: "Stor", description: "200+ gæster / udendørs" },
] as const;

export type SetupSizeId = (typeof SETUP_SIZES)[number]["id"];

export const EXPERIENCE_YEARS = [
  { id: "1-2", label: "1–2 år" },
  { id: "3-5", label: "3–5 år" },
  { id: "5-10", label: "5–10 år" },
  { id: "10+", label: "10+ år" },
] as const;

export const EVENTS_PERFORMED = [
  { id: "1-10", label: "1–10" },
  { id: "11-50", label: "11–50" },
  { id: "51-100", label: "51–100" },
  { id: "100+", label: "100+" },
] as const;

export const BOOKING_STATUSES = {
  pending: { label: "Afventer", color: "warning" },
  quoted: { label: "Tilbud sendt", color: "warning" },
  awaiting_payment: { label: "Afventer betaling", color: "warning" },
  confirmed: { label: "Bekræftet", color: "success" },
  completed: { label: "Gennemført", color: "muted" },
  cancelled: { label: "Annulleret", color: "destructive" },
  declined: { label: "Afvist", color: "destructive" },
  refunded: { label: "Refunderet", color: "muted" },
} as const;

export type BookingStatus = keyof typeof BOOKING_STATUSES;

export const VERIFICATION_STATUSES = {
  draft: { label: "Kladde" },
  pending: { label: "Afventer gennemgang" },
  approved: { label: "Godkendt" },
  rejected: { label: "Afvist" },
} as const;

export type VerificationStatus = keyof typeof VERIFICATION_STATUSES;

export const CANCELLATION_POLICY = [
  { windowDays: 14, refundPercent: 100, label: "Mere end 14 dage før begivenheden: 100% refundering" },
  { windowDays: 7, refundPercent: 50, label: "7–14 dage før begivenheden: 50% refundering" },
  { windowDays: 0, refundPercent: 0, label: "Mindre end 7 dage før begivenheden: ingen refundering" },
];

export function computeRefundPercent(eventDate: Date, now = new Date()): number {
  const days = Math.floor((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (days >= 14) return 100;
  if (days >= 7) return 50;
  return 0;
}
