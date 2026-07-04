export type FirmaPackageId = "after-dinner" | "dinner-party" | "full-corporate";

export type GuestBand = "<80" | "80-150" | "150-300";

export type FirmaEventStatus = "Draft" | "Confirmed";

export interface FirmaPackage {
  id: FirmaPackageId;
  name: string;
  basePrice: number;
  tagline: string;
  description: string;
  inclusions: string[];
  featured?: boolean;
}

export interface FirmaDJ {
  id: string;
  stageName: string;
  genres: string[];
  references: string[];
  quote: string;
  photo: string;
  alt: string;
}

export interface FirmaPracticalInfo {
  timeline?: string;
  parking?: string;
  doNotPlay?: string;
  wishes?: string;
}

export interface FirmaCompany {
  cvr: string;
  companyName: string;
  ean: string;
}

export interface FirmaEvent {
  id: string;
  date: string;
  guests: GuestBand;
  postalCode: string;
  eventType: string;
  decibelLimiter: boolean;
  packageId: FirmaPackageId;
  email: string;
  status: FirmaEventStatus;
  selectedDJId: string | null;
  matchDJIds: [string, string];
  price: number;
  company?: FirmaCompany;
  practicalInfo?: FirmaPracticalInfo;
}

export interface CreateFirmaEventInput {
  date: string;
  guests: GuestBand;
  postalCode: string;
  eventType: string;
  decibelLimiter: boolean;
  packageId: FirmaPackageId;
  email: string;
  price: number;
  status?: FirmaEventStatus;
}
