import { useEffect, useState } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { mockDJs } from "@/data/mock";
import type { DJProfileWithRelations, SearchFilters, Review } from "@/types/domain";

export function useDJs(filters: SearchFilters = {}) {
  const [djs, setDJs] = useState<DJProfileWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      if (!isSupabaseConfigured || !supabase) {
        const filtered = applyFilters(mockDJs, filters);
        if (!cancelled) {
          setDJs(filtered);
          setLoading(false);
        }
        return;
      }
      // Basic Supabase query — for more complex filtering use an RPC/view.
      const { data, error } = await supabase
        .from("dj_profiles")
        .select(
          "*, profile:profiles!dj_profiles_user_id_fkey(*), equipment_photos:dj_equipment_photos(*), event_types:dj_event_types(event_type:event_types(*))",
        )
        .eq("verification_status", "approved");
      if (cancelled) return;
      if (error) {
        console.error(error);
        setDJs([]);
      } else {
        const mapped = (data as unknown as any[]).map((row) => ({
          ...row,
          event_types: (row.event_types ?? []).map((et: any) => et.event_type),
        })) as DJProfileWithRelations[];
        setDJs(applyFilters(mapped, filters));
      }
      setLoading(false);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [JSON.stringify(filters)]);

  return { djs, loading };
}

export function useDJ(username: string) {
  const [dj, setDJ] = useState<DJProfileWithRelations | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      if (!isSupabaseConfigured || !supabase) {
        const found = mockDJs.find((d) => d.username === username) ?? null;
        if (!cancelled) {
          setDJ(found);
          setLoading(false);
        }
        return;
      }
      const { data } = await supabase
        .from("dj_profiles")
        .select(
          "*, profile:profiles!dj_profiles_user_id_fkey(*), equipment_photos:dj_equipment_photos(*), event_types:dj_event_types(event_type:event_types(*))",
        )
        .eq("username", username)
        .eq("verification_status", "approved")
        .maybeSingle();
      if (cancelled) return;
      if (data) {
        const row = data as unknown as any;
        setDJ({
          ...row,
          event_types: (row.event_types ?? []).map((et: any) => et.event_type),
        });
        const { data: reviewRows } = await supabase
          .from("reviews")
          .select("*")
          .eq("dj_profile_id", row.id)
          .eq("is_hidden", false)
          .order("created_at", { ascending: false });
        if (!cancelled) setReviews((reviewRows as Review[]) ?? []);
      }
      setLoading(false);
    }
    void run();
    return () => {
      cancelled = true;
    };
  }, [username]);

  return { dj, reviews, loading };
}

function applyFilters(djs: DJProfileWithRelations[], filters: SearchFilters): DJProfileWithRelations[] {
  let result = djs.filter((d) => d.verification_status === "approved");
  if (filters.query) {
    const q = filters.query.toLowerCase();
    result = result.filter(
      (d) =>
        d.stage_name.toLowerCase().includes(q) ||
        d.bio.toLowerCase().includes(q) ||
        d.base_location.toLowerCase().includes(q),
    );
  }
  if (filters.city) {
    const c = filters.city.toLowerCase();
    result = result.filter((d) => d.base_location.toLowerCase().includes(c));
  }
  if (filters.eventTypes && filters.eventTypes.length > 0) {
    result = result.filter((d) => d.event_types.some((et) => filters.eventTypes!.includes(et.id)));
  }
  if (filters.setupSize) {
    result = result.filter((d) => d.setup_size === filters.setupSize);
  }
  if (filters.minRating) {
    result = result.filter((d) => d.rating_average >= filters.minRating!);
  }
  if (filters.maxPriceMinor) {
    result = result.filter((d) => !d.price_from_minor || d.price_from_minor <= filters.maxPriceMinor!);
  }
  switch (filters.sortBy) {
    case "price_asc":
      result.sort((a, b) => (a.price_from_minor ?? 0) - (b.price_from_minor ?? 0));
      break;
    case "rating":
      result.sort((a, b) => b.rating_average - a.rating_average);
      break;
    case "most_reviewed":
      result.sort((a, b) => b.rating_count - a.rating_count);
      break;
    default:
      result.sort((a, b) => Number(b.is_featured) - Number(a.is_featured));
  }
  return result;
}
