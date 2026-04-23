import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { mockBookings } from "@/data/mock";
import type { BookingWithRelations } from "@/types/domain";

export function useBookings(userId?: string, asRole: "customer" | "dj" | "admin" = "customer") {
  const [bookings, setBookings] = useState<BookingWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      if (!isSupabaseConfigured || !supabase) {
        if (!cancelled) {
          setBookings(mockBookings);
          setLoading(false);
        }
        return;
      }
      let query = supabase
        .from("bookings")
        .select(
          "*, customer:profiles!bookings_customer_id_fkey(*), dj_profile:dj_profiles!bookings_dj_profile_id_fkey(*, profile:profiles!dj_profiles_user_id_fkey(*)), event_type:event_types(*)",
        )
        .order("event_date", { ascending: true });
      if (asRole === "customer" && userId) {
        query = query.eq("customer_id", userId);
      } else if (asRole === "dj" && userId) {
        query = query.eq("dj_profile.user_id", userId);
      }
      const { data, error } = await query;
      if (cancelled) return;
      if (error) {
        console.error(error);
        setBookings([]);
      } else {
        setBookings(data as unknown as BookingWithRelations[]);
      }
      setLoading(false);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [userId, asRole]);

  return { bookings, loading };
}
