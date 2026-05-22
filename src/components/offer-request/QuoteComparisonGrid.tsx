import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Check, MessageSquare, PhoneCall, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { DJSlot, OfferRequestRecord } from "@/lib/offerRequestStore";
import type { DJProfileWithRelations, Review } from "@/types/domain";
import { cn } from "@/lib/utils";

/**
 * Side-by-side quote comparison.
 *
 * Design intent (Danish-minimalist):
 * - White card, hairline border, no gradient fills, no rose/amber blocks.
 * - Single primary action ("Book"), one secondary ("Message"), one tertiary
 *   text link ("Request a call") — not three competing buttons.
 * - Price is the largest typographic element and sits in the regular flow.
 * - Personal message reads as quiet body copy, not a coloured callout.
 * - Reviews are two compact lines of italic text, no avatars or star pills.
 * - Animation is a single subtle fade-in on first paint, then still.
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
    <section className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold text-foreground">
          {offers.length === 1
            ? "Your first quote"
            : offers.length >= 3
              ? "Your 3 personal quotes"
              : `Your ${offers.length} quotes so far`}
        </h2>
        {offers.length < 3 && (
          <p className="mt-0.5 text-sm text-muted-foreground">
            We'll add the next one here as soon as it arrives. No need to refresh.
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        {offers.map((slot, idx) => {
          const dj = djCatalog.find((d) => d.id === slot.djId);
          if (!dj || !slot.quote) return null;
          return (
            <motion.div
              key={slot.djId}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.05 }}
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

        {Array.from({ length: Math.max(0, 3 - offers.length) }).map((_, i) => (
          <PendingPlaceholder key={`pending-${i}`} index={offers.length + i} />
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
  const booked = Boolean(slot.bookedAtMs);

  const initials = dj.stage_name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <article
      className={cn(
        "flex h-full flex-col overflow-hidden rounded-2xl border border-border/70 bg-card transition-colors",
        booked && "border-emerald-300 bg-emerald-50/30",
      )}
    >
      {/* Hero image — DJ photo as the dominant visual of the card */}
      <Link
        to={`/djs/${dj.username}`}
        aria-label={dj.stage_name}
        className="relative block aspect-[4/3] w-full overflow-hidden bg-muted"
      >
        {dj.profile.avatar_url ? (
          <img
            src={dj.profile.avatar_url}
            alt={dj.stage_name}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.02]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-3xl font-medium tracking-wide text-muted-foreground">
            {initials}
          </div>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        {/* DJ identity */}
        <header>
          <Link
            to={`/djs/${dj.username}`}
            className="block truncate text-[15px] font-semibold text-foreground hover:underline"
          >
            {dj.stage_name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {[
              eventLabel,
              dj.events_performed ? `${dj.events_performed} events` : null,
              dj.profile.city,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </header>

        {/* Price — typography is the hierarchy, no coloured box */}
        <div className="mt-5">
          <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground">
            Quoted price
          </p>
          <p className="mt-0.5 text-[28px] font-semibold tabular-nums leading-none text-foreground">
            {formatPrice(quote.priceMinor)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {packageDescription(quote.packageId)}
          </p>
        </div>

        {/* Personal message */}
        <p className="mt-5 text-[13px] leading-relaxed text-foreground/85">
          &ldquo;{quote.message}&rdquo;
        </p>

        {/* Reviews — two quiet lines */}
        {reviews.length > 0 && (
          <ul className="mt-5 space-y-2 border-t border-border/60 pt-4">
            {reviews.map((r) => (
              <ReviewLine key={r.id} review={r} />
            ))}
          </ul>
        )}

        {/* Actions */}
        <footer className="mt-auto pt-5">
          <Button
            onClick={onBook}
            disabled={booked}
            className={cn(
              "h-10 w-full font-medium",
              booked
                ? "bg-emerald-600 text-white hover:bg-emerald-600"
                : "bg-foreground text-background hover:bg-foreground/90",
            )}
          >
            {booked ? (
              <>
                <Check className="mr-1.5 h-4 w-4" /> Booked
              </>
            ) : (
              "Book with escrow"
            )}
          </Button>
          <div className="mt-2 flex items-center justify-between gap-2 text-xs">
            <button
              type="button"
              onClick={onMessage}
              disabled={booked}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <MessageSquare className="h-3.5 w-3.5" /> Message
            </button>
            <button
              type="button"
              onClick={onCallback}
              disabled={booked || slot.callbackRequested}
              className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground disabled:opacity-50"
            >
              <PhoneCall className="h-3.5 w-3.5" />
              {slot.callbackRequested ? "Call requested" : "Request a call"}
            </button>
          </div>
        </footer>
      </div>
    </article>
  );
}

function ReviewLine({ review }: { review: Review }) {
  const rating = review.rating ?? 5;
  return (
    <li className="text-xs text-muted-foreground">
      <span className="mr-1 inline-flex items-center gap-0.5 text-amber-500">
        <Star className="h-3 w-3 fill-current" />
        {rating.toFixed(1)}
      </span>
      {review.body && (
        <span className="italic">&ldquo;{truncate(review.body, 90)}&rdquo;</span>
      )}
    </li>
  );
}

function PendingPlaceholder({ index }: { index: number }) {
  return (
    <div
      className="flex h-full min-h-[260px] flex-col items-start rounded-2xl border border-dashed border-border/60 bg-transparent p-5 text-sm text-muted-foreground"
      aria-label={`Quote slot ${index + 1} pending`}
    >
      <p className="text-[11px] uppercase tracking-[0.08em] text-muted-foreground/80">
        Slot {index + 1}
      </p>
      <p className="mt-1 text-foreground/70">Awaiting next quote</p>
      <p className="mt-1 text-xs text-muted-foreground">
        It will appear here automatically.
      </p>
    </div>
  );
}

function eventTypeLabel(ids: string[]): string {
  if (ids.includes("wedding")) return "Wedding";
  if (ids.includes("corporate_event") || ids.includes("corporate_party"))
    return "Corporate";
  if (ids.includes("birthday")) return "Birthday";
  if (ids.includes("private_party")) return "Private party";
  return "DJ";
}

function packageDescription(packageId: "small" | "medium" | "large"): string {
  if (packageId === "small") return "Small setup · sound + warm lights · ~5h";
  if (packageId === "medium") return "Medium setup · sound + lights · 5–6h";
  return "Large setup · full sound + lighting rig · 6h+";
}

function formatPrice(priceMinor: number): string {
  return `${(priceMinor / 100).toLocaleString("da-DK")} kr`;
}

function truncate(s: string, n: number): string {
  if (s.length <= n) return s;
  return `${s.slice(0, n - 1)}…`;
}
