import type { Database, UserRole } from "./database";

export type { UserRole };

type Tables = Database["public"]["Tables"];

export type Profile = Tables["profiles"]["Row"];
export type DJProfile = Tables["dj_profiles"]["Row"];
export type DJEquipmentPhoto = Tables["dj_equipment_photos"]["Row"];
export type Booking = Tables["bookings"]["Row"];
export type Message = Tables["messages"]["Row"];
export type Review = Tables["reviews"]["Row"];
export type Payout = Tables["payouts"]["Row"];
export type Availability = Tables["availability"]["Row"];
export type EventType = Tables["event_types"]["Row"];

export interface DJProfileWithRelations extends DJProfile {
  profile: Profile;
  equipment_photos: DJEquipmentPhoto[];
  event_types: EventType[];
  reviews?: Review[];
}

export interface BookingWithRelations extends Booking {
  customer: Profile;
  dj_profile: DJProfileWithRelations;
  event_type: EventType;
  latest_message?: Message | null;
}

export interface SearchFilters {
  query?: string;
  eventTypes?: string[];
  city?: string;
  date?: string;
  setupSize?: string;
  minRating?: number;
  maxPriceMinor?: number;
  sortBy?: "relevance" | "price_asc" | "rating" | "most_reviewed";
}
