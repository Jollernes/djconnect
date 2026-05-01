import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";

const STORAGE_KEY = "djconnect.eventType";

/**
 * Event context — the event type the customer is browsing for.
 *
 * Set once on the homepage (or via "Change event") and propagated through
 * Search → DJ profile → Booking. Persisted in URL (?eventType=...) and
 * sessionStorage so refresh / deep-links / back-button preserve it.
 *
 * This is an explicit *context*, not a normal filter.
 */
export function useEventContext() {
  const [params, setParams] = useSearchParams();
  const fromUrl = params.get("eventType") ?? "";

  // Initial read: prefer URL, then sessionStorage. Hydrate URL from
  // sessionStorage on first render if URL is missing.
  const [eventTypeId, setEventTypeId] = useState<string>(() => {
    if (fromUrl) return fromUrl;
    if (typeof window === "undefined") return "";
    return window.sessionStorage.getItem(STORAGE_KEY) ?? "";
  });

  // Keep state in sync with URL (so back-button / external nav updates it).
  useEffect(() => {
    setEventTypeId(fromUrl || (typeof window !== "undefined" ? window.sessionStorage.getItem(STORAGE_KEY) ?? "" : ""));
  }, [fromUrl]);

  // Mirror to sessionStorage whenever it changes.
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (eventTypeId) {
      window.sessionStorage.setItem(STORAGE_KEY, eventTypeId);
    } else {
      window.sessionStorage.removeItem(STORAGE_KEY);
    }
  }, [eventTypeId]);

  const set = useCallback(
    (id: string) => {
      setEventTypeId(id);
      const next = new URLSearchParams(params);
      if (id) next.set("eventType", id);
      else next.delete("eventType");
      setParams(next, { replace: true });
    },
    [params, setParams],
  );

  const clear = useCallback(() => set(""), [set]);

  return { eventTypeId, set, clear };
}

export function readPersistedEventType(): string {
  if (typeof window === "undefined") return "";
  return window.sessionStorage.getItem(STORAGE_KEY) ?? "";
}
