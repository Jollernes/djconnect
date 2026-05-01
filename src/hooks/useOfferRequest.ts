import { useCallback, useEffect, useState } from "react";
import type {
  OfferBudgetId,
  OfferEventTypeId,
  OfferSetupId,
  GuestBucketId,
} from "@/lib/offerRequestContent";

export type OfferRequest = {
  eventType?: OfferEventTypeId;
  date?: string;
  city?: string;
  customCity?: string;
  guestBucket?: GuestBucketId;
  setupSize?: OfferSetupId;
  genres: string[];
  extras: string[];
  budget?: OfferBudgetId;
  contact: {
    name: string;
    email: string;
    phone: string;
  };
};

const STORAGE_KEY = "djconnect.offerRequest.v1";

const EMPTY: OfferRequest = {
  genres: [],
  extras: [],
  contact: { name: "", email: "", phone: "" },
};

function readStored(): OfferRequest {
  if (typeof window === "undefined") return EMPTY;
  try {
    const raw = window.sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY;
    const parsed = JSON.parse(raw) as Partial<OfferRequest>;
    return {
      ...EMPTY,
      ...parsed,
      genres: Array.isArray(parsed.genres) ? parsed.genres : [],
      extras: Array.isArray(parsed.extras) ? parsed.extras : [],
      contact: { ...EMPTY.contact, ...(parsed.contact ?? {}) },
    };
  } catch {
    return EMPTY;
  }
}

/**
 * Wizard state for the "Get 3 offers" flow.
 * Persists answers to sessionStorage so the customer can refresh / go back
 * without losing what they've entered.
 */
export function useOfferRequest() {
  const [request, setRequest] = useState<OfferRequest>(() => readStored());

  useEffect(() => {
    try {
      window.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(request));
    } catch {
      // ignore quota / privacy-mode failures
    }
  }, [request]);

  const update = useCallback((patch: Partial<OfferRequest>) => {
    setRequest((prev) => ({ ...prev, ...patch }));
  }, []);

  const updateContact = useCallback((patch: Partial<OfferRequest["contact"]>) => {
    setRequest((prev) => ({ ...prev, contact: { ...prev.contact, ...patch } }));
  }, []);

  const toggleArrayValue = useCallback(
    (key: "genres" | "extras", value: string) => {
      setRequest((prev) => {
        const current = prev[key];
        const next = current.includes(value)
          ? current.filter((v) => v !== value)
          : [...current, value];
        return { ...prev, [key]: next };
      });
    },
    [],
  );

  const reset = useCallback(() => {
    setRequest(EMPTY);
    try {
      window.sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return { request, update, updateContact, toggleArrayValue, reset };
}
