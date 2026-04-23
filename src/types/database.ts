/**
 * Supabase Database types.
 *
 * This is a hand-maintained copy of the schema used by the app. When the
 * schema changes, keep this in sync (or regenerate with
 * `supabase gen types typescript --project-id <id> > src/types/database.ts`).
 */

export type UserRole = "customer" | "dj" | "admin";
export type VerificationStatus = "draft" | "pending" | "approved" | "rejected";
export type SetupSize = "small" | "medium" | "large";
export type BookingStatus =
  | "pending"
  | "quoted"
  | "awaiting_payment"
  | "confirmed"
  | "completed"
  | "cancelled"
  | "declined"
  | "refunded";
export type PayoutStatus = "pending" | "released" | "paid_out" | "failed";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
          phone: string | null;
          avatar_url: string | null;
          city: string | null;
          country: string | null;
          company_name: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
          role: UserRole;
          full_name: string;
          email: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      dj_profiles: {
        Row: {
          id: string;
          user_id: string;
          username: string;
          stage_name: string;
          tagline: string | null;
          bio: string;
          years_experience: string;
          events_performed: string;
          notable_clients: string | null;
          equipment_description: string;
          setup_size: SetupSize;
          travel_radius_km: number;
          base_location: string;
          price_from_minor: number | null;
          price_on_request: boolean;
          currency: string;
          verification_status: VerificationStatus;
          verification_notes: string | null;
          stripe_account_id: string | null;
          stripe_charges_enabled: boolean;
          stripe_payouts_enabled: boolean;
          is_featured: boolean;
          rating_average: number;
          rating_count: number;
          submitted_at: string | null;
          approved_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["dj_profiles"]["Row"]> & {
          user_id: string;
          username: string;
          stage_name: string;
        };
        Update: Partial<Database["public"]["Tables"]["dj_profiles"]["Row"]>;
      };
      dj_equipment_photos: {
        Row: {
          id: string;
          dj_profile_id: string;
          storage_path: string;
          url: string;
          sort_order: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["dj_equipment_photos"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["dj_equipment_photos"]["Row"]>;
      };
      dj_credentials: {
        Row: {
          id: string;
          dj_profile_id: string;
          storage_path: string;
          file_name: string;
          file_size: number;
          mime_type: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["dj_credentials"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["dj_credentials"]["Row"]>;
      };
      event_types: {
        Row: {
          id: string;
          label: string;
          sort_order: number;
        };
        Insert: Database["public"]["Tables"]["event_types"]["Row"];
        Update: Partial<Database["public"]["Tables"]["event_types"]["Row"]>;
      };
      dj_event_types: {
        Row: {
          dj_profile_id: string;
          event_type_id: string;
        };
        Insert: Database["public"]["Tables"]["dj_event_types"]["Row"];
        Update: Partial<Database["public"]["Tables"]["dj_event_types"]["Row"]>;
      };
      availability: {
        Row: {
          id: string;
          dj_profile_id: string;
          blocked_date: string;
          reason: string | null;
          is_recurring: boolean;
          recurring_weekday: number | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["availability"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["availability"]["Row"]>;
      };
      bookings: {
        Row: {
          id: string;
          reference: string;
          customer_id: string;
          dj_profile_id: string;
          status: BookingStatus;
          event_type_id: string;
          event_date: string;
          start_time: string;
          end_time: string | null;
          venue_name: string;
          venue_address: string;
          estimated_guests: number | null;
          notes: string | null;
          price_minor: number | null;
          platform_fee_minor: number;
          payout_minor: number;
          currency: string;
          quote_message: string | null;
          decline_reason: string | null;
          cancellation_reason: string | null;
          stripe_payment_intent_id: string | null;
          stripe_checkout_session_id: string | null;
          stripe_transfer_id: string | null;
          paid_at: string | null;
          accepted_at: string | null;
          completed_at: string | null;
          cancelled_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Partial<Database["public"]["Tables"]["bookings"]["Row"]> & {
          customer_id: string;
          dj_profile_id: string;
          event_type_id: string;
          event_date: string;
          start_time: string;
          venue_name: string;
          venue_address: string;
        };
        Update: Partial<Database["public"]["Tables"]["bookings"]["Row"]>;
      };
      messages: {
        Row: {
          id: string;
          booking_id: string;
          sender_id: string;
          body: string;
          read_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["messages"]["Row"], "id" | "created_at" | "read_at"> & {
          id?: string;
          read_at?: string | null;
        };
        Update: Partial<Database["public"]["Tables"]["messages"]["Row"]>;
      };
      reviews: {
        Row: {
          id: string;
          booking_id: string;
          customer_id: string;
          dj_profile_id: string;
          rating: number;
          body: string;
          would_recommend: boolean;
          is_hidden: boolean;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["reviews"]["Row"], "id" | "created_at" | "is_hidden"> & {
          id?: string;
          is_hidden?: boolean;
        };
        Update: Partial<Database["public"]["Tables"]["reviews"]["Row"]>;
      };
      payouts: {
        Row: {
          id: string;
          booking_id: string;
          dj_profile_id: string;
          amount_minor: number;
          currency: string;
          status: PayoutStatus;
          stripe_transfer_id: string | null;
          release_at: string;
          released_at: string | null;
          paid_out_at: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["payouts"]["Row"], "id" | "created_at"> & {
          id?: string;
        };
        Update: Partial<Database["public"]["Tables"]["payouts"]["Row"]>;
      };
      favourites: {
        Row: {
          customer_id: string;
          dj_profile_id: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["favourites"]["Row"], "created_at"> & {
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["favourites"]["Row"]>;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      user_role: UserRole;
      verification_status: VerificationStatus;
      setup_size: SetupSize;
      booking_status: BookingStatus;
      payout_status: PayoutStatus;
    };
  };
}
