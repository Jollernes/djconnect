import type { BookingRequestStatus } from "@/lib/bookingRequestStore";

/** Customer-facing status label. */
export function bookingStatusLabel(status: BookingRequestStatus): string {
  switch (status) {
    case "pending_dj":
      return "Afventer DJ-svar";
    case "pending_customer":
      return "Bekræft & betal depositum";
    case "confirmed":
      return "Bekræftet";
    case "declined":
      return "Afslået";
    case "expired":
      return "Udløbet";
  }
}

/** DJ-facing status label (the same states, seen from the DJ's side). */
export function djBookingStatusLabel(status: BookingRequestStatus): string {
  switch (status) {
    case "pending_dj":
      return "Ny — bekræft pris";
    case "pending_customer":
      return "Afventer kundens bekræftelse";
    case "confirmed":
      return "Bekræftet";
    case "declined":
      return "Afslået";
    case "expired":
      return "Udløbet";
  }
}

export function bookingStatusToneClass(status: BookingRequestStatus): string {
  switch (status) {
    case "pending_dj":
      return "text-muted-foreground";
    case "pending_customer":
      return "text-amber-700";
    case "confirmed":
      return "text-emerald-700";
    case "declined":
    case "expired":
      return "text-muted-foreground";
  }
}

/** Tailwind classes for a small pill badge per status. */
export function bookingStatusBadgeClass(status: BookingRequestStatus): string {
  switch (status) {
    case "pending_dj":
      return "bg-muted text-muted-foreground";
    case "pending_customer":
      return "bg-amber-100 text-amber-800";
    case "confirmed":
      return "bg-emerald-100 text-emerald-800";
    case "declined":
    case "expired":
      return "bg-muted text-muted-foreground";
  }
}
