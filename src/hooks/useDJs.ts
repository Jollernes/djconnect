import { useEffect, useState, useCallback } from "react";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { mockDJs } from "@/data/mock";
import { readDemoDJProfile } from "@/lib/demoDJProfile";
import type { DJProfileWithRelations, SearchFilters, Review, DJEquipmentPhoto } from "@/types/domain";
import type { SetupSize } from "@/types/database";

export function useDJs(filters: SearchFilters = {}) {
  const [djs, setDJs] = useState<DJProfileWithRelations[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDemoData = useCallback(() => {
    const base = mockDJs.map((dj) =>
      dj.id === mockDJs[0]!.id ? applyDemoEdits(dj) : dj,
    );
    return applyFilters(base, filters);
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      if (!isSupabaseConfigured || !supabase) {
        if (!cancelled) {
          setDJs(loadDemoData());
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
  }, [JSON.stringify(filters), loadDemoData]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    const onUpdate = () => setDJs(loadDemoData());
    window.addEventListener("demoDJProfile:update", onUpdate);
    return () => window.removeEventListener("demoDJProfile:update", onUpdate);
  }, [loadDemoData]);

  return { djs, loading };
}

export function useDJ(username: string) {
  const [dj, setDJ] = useState<DJProfileWithRelations | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDemoDJ = useCallback(() => {
    const found = mockDJs.find((d) => d.username === username) ?? null;
    if (found && found.id === mockDJs[0]!.id) return applyDemoEdits(found);
    return found;
  }, [username]);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      setLoading(true);
      if (!isSupabaseConfigured || !supabase) {
        if (!cancelled) {
          setDJ(loadDemoDJ());
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
  }, [username, loadDemoDJ]);

  useEffect(() => {
    if (isSupabaseConfigured) return;
    const onUpdate = () => setDJ(loadDemoDJ());
    window.addEventListener("demoDJProfile:update", onUpdate);
    return () => window.removeEventListener("demoDJProfile:update", onUpdate);
  }, [loadDemoDJ]);

  return { dj, reviews, loading };
}

function applyDemoEdits(base: DJProfileWithRelations): DJProfileWithRelations {
  const demo = readDemoDJProfile();
  if (!demo) return base;

  const activeKey = (typeof window !== "undefined"
    ? new URLSearchParams(window.location.search).get("eventType")
    : null) ?? "wedding";
  const sub = demo.subProfiles?.[activeKey as keyof typeof demo.subProfiles];

  const photos: DJEquipmentPhoto[] = [];
  if (sub?.featuredPhotoDataUrl) {
    photos.push(stubPhoto("featured", sub.featuredPhotoDataUrl));
  }
  sub?.gallery
    ?.filter((g) => g.type === "photo")
    .forEach((g) => photos.push(stubPhoto(g.id, g.dataUrl)));
  if (demo.equipmentPhotoDataUrls?.length) {
    demo.equipmentPhotoDataUrls.forEach((url, i) =>
      photos.push(stubPhoto(`demo-equip-${i}`, url)),
    );
  }
  // Append seed equipment photos as fallback grid content so the
  // gallery stays populated even when only a hero photo is uploaded.
  base.equipment_photos.forEach((p) => photos.push(p));

  return {
    ...base,
    stage_name: demo.stageName?.trim() || base.stage_name,
    tagline: sub?.tagline || base.tagline,
    bio: sub?.bio?.trim() || demo.bio?.trim() || base.bio,
    equipment_description: demo.equipmentDescription?.trim() || base.equipment_description,
    setup_size: (demo.setupSize?.trim() as SetupSize) || base.setup_size,
    price_from_minor: sub?.priceFromMajor
      ? Math.round(sub.priceFromMajor * 100)
      : base.price_from_minor,
    profile: {
      ...base.profile,
      full_name: demo.fullName?.trim() || base.profile.full_name,
      avatar_url: demo.profilePhotoDataUrl ?? base.profile.avatar_url,
      city: demo.city?.trim() || base.profile.city,
    },
    equipment_photos: photos,
  };
}

function stubPhoto(id: string, url: string): DJEquipmentPhoto {
  return {
    id,
    dj_profile_id: "demo",
    storage_path: "",
    url,
    sort_order: 0,
    created_at: new Date().toISOString(),
  } as DJEquipmentPhoto;
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
