import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  XCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { aggregateOf } from "@/lib/offerRequestOrchestrator";
import type { DJSlot, OfferRequestRecord } from "@/lib/offerRequestStore";
import type { DJProfileWithRelations } from "@/types/domain";
import { cn } from "@/lib/utils";

const STATUS_LABEL: Record<DJSlot["status"], string> = {
  awaiting_response: "Awaiting response",
  confirmed_preparing: "Confirmed available — preparing quote",
  quote_received: "Quote received",
  declined: "Not available",
};

const DECLINE_LABEL: Record<NonNullable<DJSlot["declineReason"]>, string> = {
  fully_booked: "Fully booked that night",
  not_available: "Not available this date",
  out_of_coverage: "Out of coverage",
};

export function OfferProgressTracker({
  record,
  djCatalog,
  remainingHours,
  elapsedHours,
}: {
  record: OfferRequestRecord;
  djCatalog: DJProfileWithRelations[];
  remainingHours: number;
  elapsedHours: number;
}) {
  const agg = useMemo(() => aggregateOf(record), [record]);
  const sortedSlots = useMemo(() => {
    const order = (s: DJSlot) =>
      s.status === "quote_received"
        ? 0
        : s.status === "confirmed_preparing"
          ? 1
          : s.status === "awaiting_response"
            ? 2
            : 3;
    return [...record.slots].sort((a, b) => {
      const o = order(a) - order(b);
      if (o !== 0) return o;
      return (a.respondedAtMs ?? Infinity) - (b.respondedAtMs ?? Infinity);
    });
  }, [record.slots]);

  const eta = formatETA(remainingHours);
  const elapsedLabel = formatElapsed(elapsedHours);
  const ready = agg.quotesReady >= 3;

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border bg-card p-4 shadow-sm sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-wider text-rose-600">
              <Sparkles className="h-3 w-3" />
              {ready ? "Your offers are ready" : "Live progress"}
            </div>
            <h2 className="mt-1 text-lg font-semibold sm:text-xl">
              Your request was sent to {record.slots.length} DJs matching your criteria
            </h2>
            <p className="mt-1 text-xs text-muted-foreground">
              Sent {elapsedLabel} ago · Expected delivery: {eta}
            </p>
          </div>
          <div className="flex items-center gap-2 rounded-full border bg-emerald-50/70 px-3 py-1.5 text-xs font-medium text-emerald-700">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live · auto-updates
          </div>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          <Counter
            label="Quotes ready"
            value={agg.quotesReady}
            tone="rose"
            icon={<CheckCircle2 className="h-4 w-4" />}
          />
          <Counter
            label="In progress"
            value={agg.inProgress}
            tone="amber"
            icon={<Clock className="h-4 w-4" />}
          />
          <Counter
            label="Awaiting"
            value={agg.awaiting}
            tone="slate"
            icon={<Send className="h-4 w-4" />}
          />
          <Counter
            label="Not available"
            value={agg.declined}
            tone="muted"
            icon={<XCircle className="h-4 w-4" />}
          />
        </div>

        {/* Aggregated progress bar */}
        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="flex h-full">
            {[
              { key: "ready", count: agg.quotesReady, cls: "bg-rose-500" },
              { key: "prep", count: agg.inProgress, cls: "bg-amber-400" },
              { key: "wait", count: agg.awaiting, cls: "bg-slate-300" },
              { key: "decline", count: agg.declined, cls: "bg-muted-foreground/40" },
            ].map((seg) => (
              <motion.div
                key={seg.key}
                animate={{ width: `${(seg.count / agg.total) * 100}%` }}
                transition={{ duration: 0.4 }}
                className={cn("h-full", seg.cls)}
              />
            ))}
          </div>
        </div>

        {record.expansionTriggered && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-2.5 py-1 text-xs text-amber-800">
            <Sparkles className="h-3 w-3" /> Shortlist expanded — we contacted
            additional matched DJs.
          </p>
        )}
        {record.alertedAt36h && agg.quotesReady < 3 && (
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs text-rose-800">
            <AlertCircle className="h-3 w-3" /> {agg.quotesReady} quote
            {agg.quotesReady === 1 ? "" : "s"} ready — review now or wait for
            more.
          </p>
        )}
      </div>

      <ol className="space-y-2">
        {sortedSlots.map((slot, idx) => (
          <SlotRow key={slot.djId} slot={slot} djCatalog={djCatalog} index={idx} />
        ))}
      </ol>
    </div>
  );
}

function Counter({
  label,
  value,
  tone,
  icon,
}: {
  label: string;
  value: number;
  tone: "rose" | "amber" | "slate" | "muted";
  icon: React.ReactNode;
}) {
  const toneCls =
    tone === "rose"
      ? "border-rose-200 bg-rose-50 text-rose-900"
      : tone === "amber"
        ? "border-amber-200 bg-amber-50 text-amber-900"
        : tone === "slate"
          ? "border-slate-200 bg-slate-50 text-slate-800"
          : "border-muted bg-muted/40 text-muted-foreground";
  return (
    <div className={cn("rounded-xl border px-3 py-2", toneCls)}>
      <div className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider opacity-80">
        {icon}
        {label}
      </div>
      <div className="mt-0.5 text-2xl font-bold tabular-nums">{value}</div>
    </div>
  );
}

function SlotRow({
  slot,
  djCatalog,
  index,
}: {
  slot: DJSlot;
  djCatalog: DJProfileWithRelations[];
  index: number;
}) {
  const dj = djCatalog.find((d) => d.id === slot.djId);
  const stageName = dj?.stage_name ?? slot.username;
  const city = dj?.base_location ?? dj?.profile.city ?? "";
  const accent = statusAccent(slot.status);

  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className={cn(
        "flex items-center justify-between gap-3 rounded-xl border bg-card p-3 shadow-sm transition-colors sm:gap-4 sm:p-4",
        accent.row,
      )}
    >
      <div className="flex min-w-0 items-center gap-3">
        <div className="relative">
          <Avatar className="h-10 w-10 sm:h-11 sm:w-11">
            <AvatarImage src={dj?.profile.avatar_url ?? undefined} alt={stageName} />
            <AvatarFallback>{stageName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          {slot.status === "confirmed_preparing" && (
            <span className="absolute -bottom-0.5 -right-0.5 inline-flex h-3 w-3 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
            </span>
          )}
          {slot.isOffer && (
            <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              ✓
            </span>
          )}
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-tight">{stageName}</p>
          <p className="text-[11px] text-muted-foreground">
            {city}
            {slot.cohort === "expansion" ? " · added later" : ""}
            {dj?.rating_average ? ` · ⭐ ${dj.rating_average.toFixed(1)}` : ""}
          </p>
        </div>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-right">
        <span className={cn("text-xs font-medium", accent.label)}>
          {slot.status === "declined" && slot.declineReason
            ? DECLINE_LABEL[slot.declineReason]
            : STATUS_LABEL[slot.status]}
        </span>
        {accent.icon}
      </div>
    </motion.li>
  );
}

function statusAccent(status: DJSlot["status"]) {
  switch (status) {
    case "quote_received":
      return {
        row: "border-rose-200 bg-rose-50/40",
        label: "text-rose-700",
        icon: <CheckCircle2 className="h-4 w-4 text-rose-600" />,
      };
    case "confirmed_preparing":
      return {
        row: "border-amber-200 bg-amber-50/40",
        label: "text-amber-800",
        icon: <Clock className="h-4 w-4 text-amber-600" />,
      };
    case "declined":
      return {
        row: "border-muted bg-muted/30 opacity-70",
        label: "text-muted-foreground",
        icon: <XCircle className="h-4 w-4 text-muted-foreground" />,
      };
    case "awaiting_response":
    default:
      return {
        row: "border bg-card",
        label: "text-muted-foreground",
        icon: <Send className="h-4 w-4 text-muted-foreground" />,
      };
  }
}

function formatETA(remainingHours: number): string {
  if (remainingHours <= 0) return "any moment";
  if (remainingHours < 1) return `${Math.round(remainingHours * 60)} min`;
  if (remainingHours < 24) return `${Math.round(remainingHours)}h`;
  return `${Math.round(remainingHours)}h (${(remainingHours / 24).toFixed(1)}d)`;
}

function formatElapsed(elapsedHours: number): string {
  if (elapsedHours < 1) {
    const minutes = Math.max(1, Math.round(elapsedHours * 60));
    return `${minutes} min`;
  }
  if (elapsedHours < 24) return `${Math.round(elapsedHours)}h`;
  return `${Math.round(elapsedHours)}h (${(elapsedHours / 24).toFixed(1)}d)`;
}
