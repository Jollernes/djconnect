import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Bell,
  CalendarRange,
  Eye,
  Mail,
  MapPin,
  PartyPopper,
  Sparkles,
  Users,
} from "lucide-react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { OfferProgressTracker } from "@/components/offer-request/OfferProgressTracker";
import { QuoteComparisonGrid } from "@/components/offer-request/QuoteComparisonGrid";
import {
  OnPlatformChatDialog,
  RequestCallbackDialog,
  EscrowBookingDialog,
} from "@/components/offer-request/QuoteActionsDialogs";
import { useDJs } from "@/hooks/useDJs";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useOfferRequestRecord } from "@/hooks/useOfferRequestRecord";
import { mockDJs } from "@/data/mock";
import type { DJSlot } from "@/lib/offerRequestStore";
import { CITY_OPTIONS, GUEST_BUCKETS } from "@/lib/offerRequestContent";
import { EVENT_TYPE_OPTIONS } from "@/lib/eventTypeOptions";

/**
 * Persistent live-progress page for an offer request. Customers reach this
 * page right after submitting the wizard, and can return at any time via
 * the URL (eventually a magic link). Polls the orchestrator simulation
 * every second so the page updates in real time.
 */
export function MyRequestPage() {
  const { requestId } = useParams<{ requestId: string }>();
  const { djs: liveDJs } = useDJs();
  const djCatalog = liveDJs.length > 0 ? liveDJs : mockDJs;
  const { record, loading, elapsedHours, remainingHours } = useOfferRequestRecord(requestId);

  const [activeSlot, setActiveSlot] = useState<DJSlot | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [bookOpen, setBookOpen] = useState(false);

  // Keep the open dialog's slot in sync as the record updates underneath
  useEffect(() => {
    if (!record || !activeSlot) return;
    const fresh = record.slots.find((s) => s.djId === activeSlot.djId);
    if (fresh && fresh !== activeSlot) setActiveSlot(fresh);
  }, [record, activeSlot]);

  useDocumentHead({
    title: "Your DJ offers · Live progress · DJConnect",
    description:
      "Watch your DJ matches respond in real time. We're contacting matched DJs across Denmark — quotes will appear here as they arrive.",
  });

  if (loading) {
    return <PageShell><Loading /></PageShell>;
  }
  if (!record) {
    return (
      <PageShell>
        <NotFound />
      </PageShell>
    );
  }

  const brief = record.brief;
  const eventType = EVENT_TYPE_OPTIONS.find((e) => e.id === brief.eventType);
  const cityLabel = brief.city ?? brief.customCity ?? "—";
  const guestBucket = GUEST_BUCKETS.find((g) => g.id === brief.guestBucket);
  const dateLabel = formatDate(brief.date);
  const offerDJ = activeSlot ? djCatalog.find((d) => d.id === activeSlot.djId) ?? null : null;

  function openMessage(slot: DJSlot) {
    setActiveSlot(slot);
    setChatOpen(true);
  }
  function openCallback(slot: DJSlot) {
    setActiveSlot(slot);
    setCallbackOpen(true);
  }
  function openBook(slot: DJSlot) {
    setActiveSlot(slot);
    setBookOpen(true);
  }

  return (
    <PageShell>
      <div className="container py-6 md:py-8">
        {/* Top hero: confirmation copy + brief recap */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="overflow-hidden rounded-3xl border bg-gradient-to-br from-rose-50 via-background to-amber-50/40 p-5 md:p-7"
        >
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-500/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-rose-700">
                <Sparkles className="h-3 w-3" /> Brief sent · Live tracking
              </span>
              <h1 className="mt-2 text-2xl font-semibold leading-tight md:text-3xl">
                You'll receive up to 3 personalised quotes within 24 hours
              </h1>
              <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
                We're contacting DJs who match your event right now. Quotes will appear
                here automatically — no need to refresh. We'll also email you when each
                one arrives.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5">
                  <Bell className="h-3 w-3" /> Notify on new quotes
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5">
                  <Mail className="h-3 w-3" /> Sent to {brief.contact.email || "your email"}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-amber-800">
                  Demo mode · time compressed
                </span>
              </div>
            </div>
            <Button asChild variant="outline" size="sm">
              <Link to="/get-offers">
                <ArrowLeft className="mr-1 h-4 w-4" /> Edit brief
              </Link>
            </Button>
          </div>

          {/* Brief recap chips */}
          <div className="mt-5 grid gap-2 text-xs sm:grid-cols-2 lg:grid-cols-4">
            <BriefChip
              icon={<PartyPopper className="h-3.5 w-3.5" />}
              label="Event"
              value={eventType?.label ?? brief.eventType ?? "—"}
            />
            <BriefChip
              icon={<CalendarRange className="h-3.5 w-3.5" />}
              label="Date"
              value={dateLabel}
            />
            <BriefChip
              icon={<MapPin className="h-3.5 w-3.5" />}
              label="City"
              value={cityForLabel(cityLabel)}
            />
            <BriefChip
              icon={<Users className="h-3.5 w-3.5" />}
              label="Guests"
              value={guestBucket?.range ?? "—"}
            />
          </div>
        </motion.div>

        {/* Two-column layout: progress on the left / quotes on the right */}
        <div className="mt-6 grid gap-5 lg:grid-cols-[minmax(0,420px)_minmax(0,1fr)] xl:gap-7">
          <aside className="space-y-4">
            <OfferProgressTracker
              record={record}
              djCatalog={djCatalog}
              elapsedHours={elapsedHours}
              remainingHours={remainingHours}
            />
            <RequestSummary />
          </aside>
          <main className="space-y-5">
            <QuoteComparisonGrid
              record={record}
              djCatalog={djCatalog}
              onMessage={openMessage}
              onCallback={openCallback}
              onBook={openBook}
            />
            <NextSteps />
          </main>
        </div>
      </div>

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
    </PageShell>
  );
}

function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1 bg-muted/20">{children}</main>
      <Footer />
    </div>
  );
}

function Loading() {
  return (
    <div className="container py-16 text-center text-sm text-muted-foreground">
      Loading your request…
    </div>
  );
}

function NotFound() {
  return (
    <div className="container py-16 text-center">
      <h1 className="text-xl font-semibold">We couldn't find that request</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        The link may have expired, or you opened it on a different device. Start a new
        brief — it only takes 2 minutes.
      </p>
      <Button asChild className="mt-4 bg-gradient-to-r from-rose-500 to-rose-600 text-white">
        <Link to="/get-offers">Get 3 offers</Link>
      </Button>
    </div>
  );
}

function BriefChip({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 rounded-xl border bg-card px-3 py-2 shadow-sm">
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-600">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="truncate text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}

function RequestSummary() {
  return (
    <div className="rounded-2xl border bg-card p-4 text-xs text-muted-foreground">
      <p className="font-semibold uppercase tracking-wider text-foreground">
        How this works
      </p>
      <ol className="mt-2 space-y-1.5">
        <li>
          1. Matched DJs see your brief in their app + email + SMS.
        </li>
        <li>
          2. Each DJ checks calendar and either sends a tailored quote, declines, or
          times out at 24h.
        </li>
        <li>
          3. The first 3 valid quotes appear here. Compare side-by-side, message any DJ
          on-platform, request a phone call, or book directly.
        </li>
        <li>
          4. Booking holds the deposit in escrow — released only after the event runs.
          Other DJs are auto-notified you've chosen.
        </li>
      </ol>
      <p className="mt-3 inline-flex items-center gap-1 rounded-full border bg-background px-2 py-0.5 text-[10px]">
        <Eye className="h-2.5 w-2.5" /> Page updates live · no refresh needed
      </p>
    </div>
  );
}

function NextSteps() {
  return (
    <div className="rounded-2xl border border-dashed bg-card/40 p-4 text-xs text-muted-foreground">
      <p className="font-semibold uppercase tracking-wider text-foreground">
        While you wait
      </p>
      <ul className="mt-2 space-y-1.5">
        <li>
          • <Link className="text-rose-700 hover:underline" to="/wedding-djs">
            Browse all wedding DJs
          </Link> if you want to compare against the open marketplace.
        </li>
        <li>
          • <Link className="text-rose-700 hover:underline" to="/how-it-works">
            How DJConnect works
          </Link> — escrow, communication, cancellation policy.
        </li>
        <li>• Bookmark this page — your link works on any device.</li>
      </ul>
    </div>
  );
}

function formatDate(d?: string | null): string {
  if (!d) return "—";
  try {
    return new Date(d).toLocaleDateString("da-DK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return d;
  }
}

function cityForLabel(s: string): string {
  if (!s) return "—";
  const known = CITY_OPTIONS.find((c) => c.id === s);
  return known?.label ?? s;
}
