import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import { eventCountValue } from "@/components/event-djs/stacked/eventCountLabel";

/**
 * Hero social-proof element: a smaller rotating video card with a stacked deck
 * of DJ cards fanned behind it, and one unified info bar docked underneath.
 * The main card autoplays a short muted clip and, when it ends, advances to the
 * next clip/event-type caption — cycling and looping. The deck and the info bar
 * follow the rotation so they always reflect the currently featured DJ.
 */

// Royalty-free clips (Mixkit free license), served from public/. Each clip
// carries the event-type caption shown on the card.
const MEDIA = [
  { src: "/hero-dj.mp4", poster: "/hero-dj-poster.jpg", caption: "DJ til ethvert event" },
  { src: "/hero-dj-42422.mp4", poster: "/hero-dj-42422-poster.jpg", caption: "DJ til bryllupsfesten" },
  { src: "/hero-dj-45437.mp4", poster: "/hero-dj-45437-poster.jpg", caption: "DJ til firmafesten" },
  { src: "/hero-dj-830.mp4", poster: "/hero-dj-830-poster.jpg", caption: "DJ til din fødselsdagsfest" },
];

// Safety net: advance even if a clip's `ended` event never fires.
const MAX_CLIP_MS = 16000;

// --- Small deterministic helpers for fields we don't store yet -------------

function hashStr(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

const RESPONSE_TIMES = ["~30 min", "~1 t", "~2 t", "~3 t"];

function responseTime(id: string): string {
  return RESPONSE_TIMES[hashStr(id) % RESPONSE_TIMES.length];
}

function availabilityDate(id: string): string {
  const offset = (hashStr(id) % 28) + 5;
  const d = new Date();
  d.setDate(d.getDate() + offset);
  return new Intl.DateTimeFormat("da-DK", { day: "numeric", month: "long" }).format(d);
}

function compactPrice(dj: DJProfileWithRelations): string {
  if (dj.price_on_request || dj.price_from_minor == null) return "Forespørg";
  const kr = Math.round(dj.price_from_minor / 100);
  if (kr >= 1000) {
    const k = kr / 1000;
    return `${Number.isInteger(k) ? k : k.toFixed(1)}k kr.`;
  }
  return `${kr} kr.`;
}

function avatarOf(dj: DJProfileWithRelations): string | undefined {
  return dj.profile.avatar_url ?? dj.equipment_photos[0]?.url ?? undefined;
}

function Avatar({ dj, className }: { dj: DJProfileWithRelations; className?: string }) {
  const src = avatarOf(dj);
  return src ? (
    <img
      src={src}
      alt={dj.stage_name}
      className={cn("rounded-full object-cover", className)}
      loading="lazy"
    />
  ) : (
    <span
      className={cn(
        "flex items-center justify-center rounded-full bg-muted text-xs font-semibold text-muted-foreground",
        className,
      )}
    >
      {dj.stage_name.charAt(0)}
    </span>
  );
}

// --- Unified info bar ------------------------------------------------------

function InfoBar({ dj }: { dj: DJProfileWithRelations }) {
  return (
    <Link
      to={`/djs/${dj.username}`}
      className="block rounded-2xl bg-background/95 p-3 shadow-xl ring-1 ring-black/5 backdrop-blur-md transition-transform duration-300 hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2.5">
        <Avatar dj={dj} className="h-10 w-10 shrink-0" />
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-foreground">{dj.stage_name}</span>
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500" />
          </span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
            {dj.rating_average.toFixed(1)}
            <span className="truncate">· {eventCountValue(dj.events_performed)} events · {dj.base_location}</span>
          </span>
        </div>
      </div>
      <div className="mt-2.5 grid grid-cols-3 gap-2">
        <div className="rounded-xl bg-muted/60 px-2.5 py-1.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Pris fra</span>
          <span className="block text-sm font-bold text-foreground">{compactPrice(dj)}</span>
        </div>
        <div className="rounded-xl bg-muted/60 px-2.5 py-1.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Svartid</span>
          <span className="block text-sm font-bold text-foreground">{responseTime(dj.id)}</span>
        </div>
        <div className="rounded-xl bg-emerald-500/15 px-2.5 py-1.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-emerald-700/80">Ledig</span>
          <span className="block truncate text-sm font-bold text-emerald-700">{availabilityDate(dj.id)}</span>
        </div>
      </div>
    </Link>
  );
}

// --- Main component --------------------------------------------------------

export function HeroDJCluster({ djs, className }: { djs: DJProfileWithRelations[]; className?: string }) {
  const cards = djs.slice(0, 4);
  const n = Math.min(cards.length, MEDIA.length);
  const [active, setActive] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);

  const advance = useCallback(() => {
    if (n > 1) setActive((i) => (i + 1) % n);
  }, [n]);

  useEffect(() => {
    if (n === 0) return;
    const el = videoRef.current;
    if (el) {
      el.currentTime = 0;
      void el.play().catch(() => {});
    }
    const timer = window.setTimeout(advance, MAX_CLIP_MS);
    return () => window.clearTimeout(timer);
  }, [active, advance, n]);

  if (n === 0) return null;

  const media = MEDIA[active];
  const featured = cards[active];

  return (
    <div className={cn("relative mx-auto w-full max-w-[300px]", className)}>
      {/* Video card + deck stage (sized by the video card) */}
      <div className="relative">
      {/* Stacked deck behind the main card — shifts as the video rotates */}
      {Array.from({ length: Math.max(0, n - 1) }).map((_, d) => {
        const depth = d + 1;
        const deckDj = cards[(active + depth) % n];
        const deckSrc = avatarOf(deckDj);
        return (
          <motion.div
            key={deckDj.id}
            aria-hidden
            className="absolute inset-0 overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/10"
            initial={false}
            animate={{
              x: depth * 15,
              y: depth * 7,
              rotate: 2 + depth * 3.5,
              scale: 1 - depth * 0.05,
              opacity: 1 - depth * 0.16,
            }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            style={{ zIndex: 5 - depth }}
          >
            {deckSrc ? (
              <img src={deckSrc} alt="" loading="lazy" className="h-full w-full object-cover" />
            ) : (
              <div className="h-full w-full bg-muted" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/45 to-black/10" />
          </motion.div>
        );
      })}

      {/* Main rotating video card (defines the cluster size) */}
      <motion.div
        className="relative z-10"
        initial={{ opacity: 0, y: 12, rotate: 3 }}
        animate={{ opacity: 1, y: 0, rotate: 2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          to={`/djs/${featured.username}`}
          className="group block overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/10"
        >
          <div className="relative aspect-[3/4] overflow-hidden bg-muted">
            <video
              key={active}
              ref={videoRef}
              className="h-full w-full object-cover"
              src={media.src}
              poster={media.poster}
              autoPlay
              muted
              playsInline
              preload="metadata"
              onEnded={advance}
              onError={advance}
              aria-label={`${featured.stage_name} spiller live`}
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-4 pt-14">
              <span className="block text-[10px] font-semibold uppercase tracking-[0.18em] text-white/70">
                DJConnect
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={active}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="mt-0.5 block max-w-[85%] text-base font-bold leading-snug text-white drop-shadow"
                >
                  {media.caption}
                </motion.span>
              </AnimatePresence>
              <div className="mt-3 flex items-center gap-1.5">
                {Array.from({ length: n }).map((_, i) => (
                  <span
                    key={i}
                    className={cn(
                      "h-1 rounded-full transition-all duration-500",
                      i === active ? "w-6 bg-white" : "w-2.5 bg-white/40",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
      </div>

      {/* Unified info bar docked under the video — updates with the rotation */}
      <div className="relative z-20 mt-3">
        <AnimatePresence mode="wait">
          <motion.div
            key={featured.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <InfoBar dj={featured} />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
