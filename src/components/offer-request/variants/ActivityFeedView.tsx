import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  Inbox,
  CheckCircle2,
  PencilLine,
  XCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { aggregateOf } from "@/lib/offerRequestOrchestrator";
import type { OfferRequestRecord } from "@/lib/offerRequestStore";
import type { DJProfileWithRelations } from "@/types/domain";
import {
  deriveActivityEvents,
  formatClock,
  formatExpectedFromRemaining,
  type ActivityEvent,
} from "@/components/offer-request/shared";
import { cn } from "@/lib/utils";

/**
 * Variant C — Conversational live activity feed.
 *
 * Slack/iMessage-style thread of timestamped updates from "DJConnect". High
 * momentum, very human — the customer feels like something is constantly
 * unfolding in front of them. New events animate in with a gentle slide-up.
 */
export function ActivityFeedView({
  record,
  djCatalog,
  remainingHours,
  quotesSection,
}: {
  record: OfferRequestRecord;
  djCatalog: DJProfileWithRelations[];
  remainingHours: number;
  quotesSection?: React.ReactNode;
}) {
  const agg = useMemo(() => aggregateOf(record), [record]);
  const events = useMemo(
    () => deriveActivityEvents(record, djCatalog),
    [record, djCatalog],
  );
  const eta = formatExpectedFromRemaining(record, remainingHours);

  // Group events into the same minute so closely-clustered activity reads
  // as a single "burst", like a chat conversation.
  const grouped = useMemo(() => groupByMinute(events), [events]);

  const headlineCopy =
    agg.quotesReady >= 3
      ? "All 3 quotes are in"
      : eta
        ? `${agg.quotesReady} of 3 quotes in · expected by ${eta}`
        : `${agg.quotesReady} of 3 quotes in`;

  return (
    <div className="space-y-8">
      {/* Pinned status header */}
      <section className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-start gap-3">
          <span className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground text-background">
            <Sparkles className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
              DJConnect · live
            </p>
            <h1 className="mt-0.5 truncate text-lg font-semibold text-foreground">
              {headlineCopy}
            </h1>
            {agg.quotesReady < 3 && (
              <p className="mt-1 text-xs text-muted-foreground">
                We'll keep posting updates here. You can close this page; we'll
                also email you each time something changes.
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Conversational thread */}
      <ol className="relative space-y-4">
        {grouped.map((group, gIdx) => (
          <motion.li
            key={`${group.ts}-${gIdx}`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
          >
            <div className="mb-1.5 px-3 text-[11px] text-muted-foreground">
              {formatClock(group.ts)}
            </div>
            <ul className="space-y-2">
              {group.events.map((e) => (
                <FeedBubble key={e.id} event={e} />
              ))}
            </ul>
          </motion.li>
        ))}
      </ol>

      {/* Quotes interleave at the bottom of the feed */}
      {agg.quotesReady > 0 && quotesSection ? (
        <section className="border-t border-border/50 pt-8">
          {quotesSection}
        </section>
      ) : null}
    </div>
  );
}

function FeedBubble({ event }: { event: ActivityEvent }) {
  const { icon: Icon, tone } = iconFor(event.kind);
  return (
    <li className="flex items-start gap-3">
      {event.djAvatar !== undefined && event.djName ? (
        <Avatar className="h-8 w-8 shrink-0">
          <AvatarImage src={event.djAvatar ?? undefined} alt={event.djName} />
          <AvatarFallback className="bg-muted text-foreground text-[11px]">
            {event.djName.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      ) : (
        <span
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            tone,
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
      )}
      <div
        className={cn(
          "min-w-0 flex-1 rounded-2xl rounded-tl-sm border border-border/60 bg-card px-3.5 py-2.5 text-sm text-foreground",
          event.kind === "quote_arrived" && "border-emerald-300/70 bg-emerald-50/40",
          event.kind === "dj_declined" && "text-muted-foreground",
        )}
      >
        {event.text}
      </div>
    </li>
  );
}

function iconFor(kind: ActivityEvent["kind"]): {
  icon: typeof Inbox;
  tone: string;
} {
  switch (kind) {
    case "brief_sent":
      return { icon: Inbox, tone: "bg-foreground text-background" };
    case "dj_notified":
      return { icon: Inbox, tone: "bg-muted text-foreground" };
    case "dj_preparing":
      return { icon: PencilLine, tone: "bg-amber-100 text-amber-900" };
    case "quote_arrived":
      return { icon: CheckCircle2, tone: "bg-emerald-100 text-emerald-900" };
    case "dj_declined":
      return { icon: XCircle, tone: "bg-muted text-muted-foreground" };
    case "expansion":
      return { icon: Sparkles, tone: "bg-foreground text-background" };
    case "alert_36h":
      return { icon: AlertCircle, tone: "bg-amber-100 text-amber-900" };
  }
}

function groupByMinute(events: ActivityEvent[]): {
  ts: number;
  events: ActivityEvent[];
}[] {
  const groups: { ts: number; events: ActivityEvent[] }[] = [];
  for (const e of events) {
    const minuteTs = Math.floor(e.ts / 60_000) * 60_000;
    const last = groups[groups.length - 1];
    if (last && last.ts === minuteTs) {
      last.events.push(e);
    } else {
      groups.push({ ts: minuteTs, events: [e] });
    }
  }
  return groups;
}
