import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { CheckCircle2, MessageSquare, PhoneCall, ShieldCheck, Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { DJSlot, OfferRequestRecord } from "@/lib/offerRequestStore";
import type { DJProfileWithRelations, Review } from "@/types/domain";
import { cn } from "@/lib/utils";

/**
 * Side-by-side comparison of the customer's surfaced quotes.
 *
 * For each quote we show: photo, profile badge, quoted price, package
 * details, the DJ's personal message, response time, and the top 2
 * event-specific reviews. Action buttons trigger the customer-side flows
 * (on-platform message, request callback, escrow booking).
 */
export function QuoteComparisonGrid({
  record,
  djCatalog,
  onMessage,
  onCallback,
  onBook,
}: {
  record: OfferRequestRecord;
  djCatalog: DJProfileWithRelations[];
  onMessage: (slot: DJSlot) => void;
  onCallback: (slot: DJSlot) => void;
  onBook: (slot: DJSlot) => void;
}) {
  const offers = useMemo(
    () =>
      record.slots
        .filter((s) => s.isOffer && s.quote)
        .sort((a, b) => (a.respondedAtMs ?? 0) - (b.respondedAtMs ?? 0)),
    [record.slots],
  );

  if (offers.length === 0) return null;

  return (
    <section>
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <div>
          <h3 className="text-base font-semibold sm:text-lg">
            Your {offers.length} {offers.length === 1 ? "quote" : "quotes"} so far
          </h3>
          <p className="text-xs text-muted-foreground">
            Personalised offers from your matched DJs. Compare side-by-side, then message,
            request a call, or book directly with escrow payment.
          </p>
        </div>
        {offers.length < 3 && (
          <span className="hidden text-xs text-muted-foreground sm:inline">
            Still waiting on a few more — we'll add them here as they arrive.
          </span>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {offers.map((slot, idx) => {
          const dj = djCatalog.find((d) => d.id === slot.djId);
          if (!dj || !slot.quote) return null;
          return (
            <motion.div
              key={slot.djId}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.08 }}
            >
              <QuoteCard
                slot={slot}
                dj={dj}
                onMessage={() => onMessage(slot)}
                onCallback={() => onCallback(slot)}
                onBook={() => onBook(slot)}
              />
            </motion.div>
          );
        })}

        {/* Pending offer placeholders */}
        {Array.from({ length: Math.max(0, 3 - offers.length) }).map((_, i) => (
          <PendingPlaceholder key={`pending-${i}`} />
        ))}
      </div>
    </section>
  );
}

function QuoteCard({
  slot,
  dj,
  onMessage,
  onCallback,
  onBook,
}: {
  slot: DJSlot;
  dj: DJProfileWithRelations;
  onMessage: () => void;
  onCallback: () => void;
  onBook: () => void;
}) {
  const quote = slot.quote!;
  const reviews = (dj.reviews ?? []).slice(0, 2);
  const eventTypes = (dj.event_types ?? []).map((e) => e.id);
  const eventLabel = eventTypeLabel(eventTypes);
  const responseLabel = formatResponseTime(quote.responseTimeMinutes);
  const booked = Boolean(slot.bookedAtMs);

  return (
    <article
      className={cn(
        "flex h-full flex-col rounded-2xl border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
        booked && "ring-2 ring-emerald-300",
      )}
    >
      <header className="flex items-start gap-3">
        <Avatar className="h-12 w-12 ring-2 ring-rose-100">
          <AvatarImage src={dj.profile.avatar_url ?? undefined} alt={dj.stage_name} />
          <AvatarFallback>{dj.stage_name.slice(0, 2).toUpperCase()}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <Link
            to={`/djs/${dj.username}`}
            className="block truncate text-base font-semibold hover:underline"
          >
            {dj.stage_name}
          </Link>
          <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground">
            {dj.profile.city && <span>{dj.profile.city}</span>}
            {dj.rating_average && (
              <span className="inline-flex items-center gap-0.5">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {dj.rating_average.toFixed(1)} · {dj.rating_count}
              </span>
            )}
          </div>
        </div>
        {dj.is_featured && (
          <Badge className="bg-rose-100 text-rose-700">
            <ShieldCheck className="mr-1 h-3 w-3" /> Verified
          </Badge>
        )}
      </header>

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        {eventLabel && (
          <Badge variant="outline" className="text-[11px]">
            {eventLabel} · {dj.events_performed ?? "30+"} events
          </Badge>
        )}
        <Badge variant="outline" className="text-[11px] capitalize">
          {quote.packageId} setup
        </Badge>
        <Badge variant="outline" className="text-[11px]">
          Replied in {responseLabel}
        </Badge>
      </div>

      <div className="mt-4 rounded-xl bg-gradient-to-br from-rose-50 to-amber-50/60 p-3">
        <p className="text-[11px] uppercase tracking-wider text-rose-700">Quoted price</p>
        <p className="mt-0.5 text-2xl font-bold tabular-nums text-rose-900">
          {formatPrice(quote.priceMinor)}
        </p>
        <p className="text-[11px] text-rose-900/70">
          inkl. opsætning, lyd, lys og 5–6 timers spilletid
        </p>
      </div>

      <blockquote className="mt-3 rounded-xl border-l-2 border-rose-200 bg-muted/30 p-3 text-sm italic text-foreground">
        &ldquo;{quote.message}&rdquo;
      </blockquote>

      {reviews.length > 0 && (
        <div className="mt-3 space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Recent reviews
          </p>
          {reviews.map((r) => (
            <ReviewSnippet key={r.id} review={r} />
          ))}
        </div>
      )}

      <footer className="mt-auto flex flex-col gap-2 pt-4">
        <Button
          onClick={onBook}
          disabled={booked}
          className={cn(
            "w-full",
            booked
              ? "bg-emerald-500 hover:bg-emerald-500"
              : "bg-gradient-to-r from-rose-500 to-rose-600 text-white hover:from-rose-600 hover:to-rose-700",
          )}
        >
          {booked ? (
            <>
              <CheckCircle2 className="mr-1.5 h-4 w-4" /> Booked · escrow held
            </>
          ) : (
            <>Book with escrow</>
          )}
        </Button>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" size="sm" onClick={onMessage} disabled={booked}>
            <MessageSquare className="mr-1 h-4 w-4" /> Message
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCallback}
            disabled={booked || slot.callbackRequested}
          >
            <PhoneCall className="mr-1 h-4 w-4" />
            {slot.callbackRequested ? "Call requested" : "Request call"}
          </Button>
        </div>
        <p className="text-center text-[10px] text-muted-foreground">
          All chat & payment stay on platform. Contact info shared after booking.
        </p>
      </footer>
    </article>
  );
}

function ReviewSnippet({ review }: { review: Review }) {
  return (
    <div className="rounded-lg bg-background/60 px-2 py-1.5 text-xs">
      <div className="flex items-center gap-1 text-amber-500">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={cn(
              "h-2.5 w-2.5",
              i < (review.rating ?? 5) ? "fill-amber-400 text-amber-400" : "text-muted",
            )}
          />
        ))}
      </div>
      {review.body && (
        <p className="mt-1 line-clamp-2 text-muted-foreground">&ldquo;{review.body}&rdquo;</p>
      )}
    </div>
  );
}

function PendingPlaceholder() {
  return (
    <div className="flex h-full min-h-[280px] flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-muted-foreground/20 bg-muted/10 p-4 text-center text-xs text-muted-foreground">
      <span className="relative flex h-3 w-3">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
        <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
      </span>
      <p>Waiting for the next quote</p>
      <p className="text-[10px]">It'll appear here automatically</p>
    </div>
  );
}

function eventTypeLabel(ids: string[]): string {
  if (ids.includes("wedding")) return "Wedding profile";
  if (ids.includes("corporate_event") || ids.includes("corporate_party")) return "Corporate profile";
  if (ids.includes("birthday")) return "Birthday profile";
  if (ids.includes("private_party")) return "Private party profile";
  return "DJ profile";
}

function formatPrice(priceMinor: number): string {
  return `${(priceMinor / 100).toLocaleString("da-DK")} kr`;
}

function formatResponseTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  return `${Math.round(minutes / 60)}h`;
}
