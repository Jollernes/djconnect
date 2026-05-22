import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Pencil } from "lucide-react";
import { QuoteComparisonGrid } from "@/components/offer-request/QuoteComparisonGrid";
import { CalmFocalView } from "@/components/offer-request/variants/CalmFocalView";
import {
  OnPlatformChatDialog,
  RequestCallbackDialog,
  EscrowBookingDialog,
} from "@/components/offer-request/QuoteActionsDialogs";
import { useDJs } from "@/hooks/useDJs";
import { mockDJs } from "@/data/mock";
import type { DJSlot, OfferRequestRecord } from "@/lib/offerRequestStore";
import {
  CITY_OPTIONS,
  GUEST_BUCKETS,
} from "@/lib/offerRequestContent";
import { EVENT_TYPE_OPTIONS } from "@/lib/eventTypeOptions";
import { cn } from "@/lib/utils";

/**
 * Cohesive status view for an offer request. Used both by the standalone
 * public page and by the dashboard-embedded page so the layout stays
 * identical regardless of how the customer arrived.
 *
 * Visual style: "calm focal point" — a single pulsing focal animation,
 * a clear deadline, a quiet activity ticker, and a collapsible
 * "What happens now?" disclosure. Quotes appear quietly below as they
 * arrive.
 */
export function OfferRequestStatusView({
  record,
  remainingHours,
  showEditBriefLink = true,
  className,
}: {
  record: OfferRequestRecord;
  requestId: string;
  remainingHours: number;
  elapsedHours: number;
  showEditBriefLink?: boolean;
  /** Retained for call-site compatibility; the focal layout has its own header. */
  showHeading?: boolean;
  className?: string;
}) {
  const { djs: liveDJs } = useDJs();
  const djCatalog = liveDJs.length > 0 ? liveDJs : mockDJs;

  const [activeSlot, setActiveSlot] = useState<DJSlot | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);
  const [briefOpen, setBriefOpen] = useState(false);

  // Keep dialog's slot snapshot fresh as the record updates
  useEffect(() => {
    if (!activeSlot) return;
    const fresh = record.slots.find((s) => s.djId === activeSlot.djId);
    if (fresh && fresh !== activeSlot) setActiveSlot(fresh);
  }, [record, activeSlot]);

  const offerDJ = activeSlot
    ? djCatalog.find((d) => d.id === activeSlot.djId) ?? null
    : null;

  const quotes = (
    <QuoteComparisonGrid
      record={record}
      djCatalog={djCatalog}
      onMessage={(slot) => {
        setActiveSlot(slot);
        setChatOpen(true);
      }}
      onCallback={(slot) => {
        setActiveSlot(slot);
        setCallbackOpen(true);
      }}
      onBook={(slot) => {
        setActiveSlot(slot);
        setBookOpen(true);
      }}
    />
  );

  const briefRecap = useMemo(
    () => (
      <BriefRecap
        record={record}
        open={briefOpen}
        onToggle={() => setBriefOpen((o) => !o)}
        showEditLink={showEditBriefLink}
      />
    ),
    [record, briefOpen, showEditBriefLink],
  );

  return (
    <div className={cn("space-y-8", className)}>
      <CalmFocalView
        record={record}
        djCatalog={djCatalog}
        remainingHours={remainingHours}
        quotesSection={quotes}
      />

      {briefRecap}

      <FootNote record={record} />

      <OnPlatformChatDialog
        open={chatOpen}
        onOpenChange={setChatOpen}
        record={record}
        slot={activeSlot}
        dj={offerDJ}
      />
      <RequestCallbackDialog
        open={callbackOpen}
        onOpenChange={setCallbackOpen}
        record={record}
        slot={activeSlot}
        dj={offerDJ}
      />
      <EscrowBookingDialog
        open={bookOpen}
        onOpenChange={setBookOpen}
        record={record}
        slot={activeSlot}
        dj={offerDJ}
      />
    </div>
  );
}

function BriefRecap({
  record,
  open,
  onToggle,
  showEditLink,
}: {
  record: OfferRequestRecord;
  open: boolean;
  onToggle: () => void;
  showEditLink: boolean;
}) {
  const brief = record.brief;
  const eventType = EVENT_TYPE_OPTIONS.find((e) => e.id === brief.eventType);
  const cityLabel = brief.city
    ? CITY_OPTIONS.find((c) => c.id === brief.city)?.label ?? brief.city
    : brief.customCity ?? "—";
  const guestBucket = GUEST_BUCKETS.find((g) => g.id === brief.guestBucket);
  const dateLabel = formatDate(brief.date);

  const summary = [
    eventType?.label,
    dateLabel,
    cityLabel,
    guestBucket?.range && `${guestBucket.range} guests`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <section className="rounded-2xl border border-border/60 bg-card/40">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-3 px-5 py-4 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">
            Your brief
          </p>
          <p className="mt-0.5 truncate text-sm text-foreground">{summary || "—"}</p>
        </div>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
            open && "rotate-180",
          )}
        />
      </button>

      {open && (
        <div className="border-t border-border/60 px-5 py-4">
          <dl className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <BriefRow label="Event">{eventType?.label ?? "—"}</BriefRow>
            <BriefRow label="Date">{dateLabel}</BriefRow>
            <BriefRow label="City">{cityLabel}</BriefRow>
            <BriefRow label="Guests">{guestBucket?.range ?? "—"}</BriefRow>
            {brief.genres && brief.genres.length > 0 && (
              <BriefRow label="Vibe" full>
                {brief.genres.join(", ")}
              </BriefRow>
            )}
            {brief.extras && brief.extras.length > 0 && (
              <BriefRow label="Extras" full>
                {brief.extras.join(", ")}
              </BriefRow>
            )}
            {brief.budget && (
              <BriefRow label="Budget">
                {budgetLabel(brief.budget)}
              </BriefRow>
            )}
            {brief.contact?.email && (
              <BriefRow label="Contact">{brief.contact.email}</BriefRow>
            )}
          </dl>

          {showEditLink && (
            <div className="mt-4 text-right">
              <Link
                to="/get-offers"
                className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground"
              >
                <Pencil className="h-3 w-3" /> Edit brief
              </Link>
            </div>
          )}
        </div>
      )}
    </section>
  );
}

function BriefRow({
  label,
  children,
  full,
}: {
  label: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={cn(full && "sm:col-span-2")}>
      <dt className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
        {label}
      </dt>
      <dd className="mt-0.5 text-foreground">{children}</dd>
    </div>
  );
}

function FootNote({ record }: { record: OfferRequestRecord }) {
  return (
    <p className="text-xs text-muted-foreground">
      All chat and payment stay on platform. DJ contact details are shared after
      a confirmed booking.
      <span className="ml-2 text-muted-foreground/70">
        · Demo: simulated timeline, factor {record.compressionFactor}×
      </span>
    </p>
  );
}

function budgetLabel(id: string): string {
  if (id === "tight") return "Tight (≤ 6.500 kr)";
  if (id === "comfortable") return "Comfortable (6.500–12.000 kr)";
  if (id === "premium") return "Premium (12.000+ kr)";
  return id;
}

function formatDate(date?: string | null): string {
  if (!date) return "—";
  try {
    const d = new Date(date);
    return d.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return date;
  }
}
