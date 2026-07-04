import type { GuestBand, FirmaPackageId } from "@/firmadj/types";
import { packages } from "@/firmadj/data/mock";

export function calcPrice(packageId: FirmaPackageId, guests: GuestBand, decibelLimiter: boolean) {
  const basePrice = packages.find((item) => item.id === packageId)?.basePrice ?? 0;
  const guestSurcharge = guests === "<80" ? 0 : guests === "80-150" ? 1500 : 3500;
  const limiterFee = decibelLimiter ? 750 : 0;

  return basePrice + guestSurcharge + limiterFee;
}

export function recommendPackage(eventType: string, guests: GuestBand): FirmaPackageId {
  const normalized = eventType.toLowerCase();
  if (normalized.includes("julefrokost") || normalized.includes("galla")) {
    return "full-corporate";
  }

  if (guests === "<80") {
    return "after-dinner";
  }

  if (guests === "150-300") {
    return "full-corporate";
  }

  return "dinner-party";
}

export function formatDkk(amount: number) {
  return `${amount.toLocaleString("da-DK")} kr.`;
}
