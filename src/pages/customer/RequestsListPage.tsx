import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/common/EmptyState";
import { aggregateOf } from "@/lib/offerRequestOrchestrator";
import {
  listRequestIds,
  readRecord,
  type OfferRequestRecord,
} from "@/lib/offerRequestStore";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { EVENT_TYPE_OPTIONS } from "@/lib/eventTypeOptions";
import { CITY_OPTIONS } from "@/lib/offerRequestContent";

/**
 * Customer-dashboard list of all offer requests this device has submitted.
 * Each row is a quiet line — no avatars, no big tiles. Drill into a row to
 * open the live progress view at /dashboard/requests/:id.
 */
export function CustomerRequestsListPage() {
  useDocumentHead({
    title: "My requests · DJConnect",
    description: "All your offer requests in one place.",
  });

  const [records, setRecords] = useState<OfferRequestRecord[]>([]);

  useEffect(() => {
    function load() {
      const ids = listRequestIds();
      const recs = ids
        .map((id) => readRecord(id))
        .filter((r): r is OfferRequestRecord => r !== null)
        .sort((a, b) => b.createdAtMs - a.createdAtMs);
      setRecords(recs);
    }
    load();
    const onUpdate = () => load();
    window.addEventListener("offerRequest:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    const t = setInterval(load, 2000);
    return () => {
      window.removeEventListener("offerRequest:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
      clearInterval(t);
    };
  }, []);

  if (records.length === 0) {
    return (
      <EmptyState
        title="No requests yet"
        description="Send a brief and we'll match you with up to 3 DJs in 24 hours."
        action={
          <Button asChild>
            <Link to="/get-offers">Get 3 offers</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-[26px] font-semibold leading-tight tracking-tight md:text-[30px]">
          My requests
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every offer request from this device. Open one to see live progress.
        </p>
      </header>

      <ul className="divide-y divide-border/60 rounded-2xl border border-border/60 bg-card/40">
        {records.map((r) => (
          <RequestRow key={r.id} record={r} />
        ))}
      </ul>

      <div className="flex justify-end">
        <Button asChild variant="outline">
          <Link to="/get-offers">New request</Link>
        </Button>
      </div>
    </div>
  );
}

function RequestRow({ record }: { record: OfferRequestRecord }) {
  const agg = useMemo(() => aggregateOf(record), [record]);
  const eventType = EVENT_TYPE_OPTIONS.find(
    (e) => e.id === record.brief.eventType,
  );
  const cityLabel = record.brief.city
    ? CITY_OPTIONS.find((c) => c.id === record.brief.city)?.label ?? record.brief.city
    : record.brief.customCity ?? "Denmark";
  const dateLabel = record.brief.date
    ? new Date(record.brief.date).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "Date TBD";

  const status =
    agg.quotesReady >= 3
      ? "All quotes ready"
      : agg.quotesReady > 0
        ? `${agg.quotesReady} of 3 quotes ready`
        : "Awaiting quotes";

  const statusTone =
    agg.quotesReady >= 3
      ? "text-emerald-700"
      : agg.quotesReady > 0
        ? "text-foreground"
        : "text-muted-foreground";

  return (
    <li>
      <Link
        to={`/dashboard/requests/${record.id}`}
        className="flex items-center justify-between gap-4 px-5 py-4 text-sm transition-colors hover:bg-muted/30"
      >
        <div className="min-w-0">
          <p className="truncate font-medium text-foreground">
            {eventType?.label ?? "Event"} · {cityLabel}
          </p>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {dateLabel} · sent {timeSince(record.createdAtMs)}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className={`shrink-0 text-xs ${statusTone}`}>{status}</span>
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>
      </Link>
    </li>
  );
}

function timeSince(ms: number): string {
  const sec = Math.max(0, Math.floor((Date.now() - ms) / 1000));
  if (sec < 60) return "just now";
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const d = Math.floor(hr / 24);
  return `${d}d ago`;
}
