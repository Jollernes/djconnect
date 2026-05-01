import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  advanceRecord,
  realHoursElapsed,
  realHoursRemaining,
} from "@/lib/offerRequestOrchestrator";
import {
  readRecord,
  writeRecord,
  type OfferRequestRecord,
} from "@/lib/offerRequestStore";
import { mockDJs } from "@/data/mock";
import { useDJs } from "@/hooks/useDJs";

/**
 * Live-updating view of an OfferRequestRecord.
 *
 * Polls every second, advances the simulation, persists changes, and surfaces
 * any new email/SMS/push notifications as toast events. Returns derived
 * helpers (real hours elapsed/remaining) so the page can render an ETA without
 * recomputing on every render.
 */
export function useOfferRequestRecord(id: string | undefined) {
  const { djs: liveDJs } = useDJs();
  const [record, setRecord] = useState<OfferRequestRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [now, setNow] = useState(() => Date.now());
  const seenNotificationIds = useRef<Set<string>>(new Set());

  // Initial load
  useEffect(() => {
    if (!id) {
      setRecord(null);
      setLoading(false);
      return;
    }
    const r = readRecord(id);
    setRecord(r);
    setLoading(false);
    if (r) {
      // Don't toast historical notifications on first load
      r.notifications.forEach((n) => seenNotificationIds.current.add(n.id));
    }
  }, [id]);

  // Tick + advance
  useEffect(() => {
    if (!id) return;
    const i = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(i);
  }, [id]);

  useEffect(() => {
    if (!id || !record) return;
    const catalog = liveDJs.length > 0 ? liveDJs : mockDJs;
    const result = advanceRecord(record, catalog, now);
    if (result.changed) {
      writeRecord(result.record);
      setRecord(result.record);
      for (const n of result.newNotifications) {
        if (seenNotificationIds.current.has(n.id)) continue;
        seenNotificationIds.current.add(n.id);
        if (n.audience === "customer") {
          toast(n.subject, { description: truncate(n.body, 140) });
        }
      }
    }
  }, [id, now, record, liveDJs]);

  // External updates (other tabs / other components writing to the record)
  useEffect(() => {
    if (!id) return;
    const handler = (e: Event) => {
      const ce = e as CustomEvent<{ id: string }>;
      if (ce.detail?.id !== id) return;
      const fresh = readRecord(id);
      if (fresh) setRecord(fresh);
    };
    window.addEventListener("offerRequest:update", handler);
    return () => window.removeEventListener("offerRequest:update", handler);
  }, [id]);

  return {
    record,
    loading,
    now,
    elapsedHours: record ? realHoursElapsed(record, now) : 0,
    remainingHours: record ? realHoursRemaining(record, now) : 0,
  };
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return s.slice(0, n - 1) + "…";
}
