import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";
import { eventCountValue } from "@/components/event-djs/stacked/eventCountLabel";

/**
 * Hero social-proof element: a large rotating video card flanked by two
 * floating DJ info cards. The main card autoplays a short muted clip and,
 * when it ends, advances to the next clip/event-type caption — cycling and
 * looping. The floating cards follow the rotation so the featured DJ and a
 * secondary "available" DJ update along with the video.
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

// --- Floating info cards ---------------------------------------------------

function FeaturedCard({ dj }: { dj: DJProfileWithRelations }) {
  return (
    <Link
      to={`/djs/${dj.username}`}
      className="block rounded-2xl bg-background/95 p-3 shadow-2xl ring-1 ring-black/5 backdrop-blur transition-transform duration-300 hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2.5">
        <Avatar dj={dj} className="h-9 w-9 shrink-0" />
        <div className="min-w-0">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-sm font-semibold text-foreground">{dj.stage_name}</span>
            <span className="h-2 w-2 shrink-0 rounded-full bg-emerald-500 ring-2 ring-emerald-500/20" />
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="truncate">{dj.base_location}</span>
            <span className="inline-flex items-center gap-0.5">
              <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
              {dj.rating_average.toFixed(1)}
            </span>
          </span>
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <div className="rounded-xl bg-muted/60 px-2.5 py-1.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Fra</span>
          <span className="block text-sm font-bold text-foreground">{compactPrice(dj)}</span>
        </div>
        <div className="rounded-xl bg-muted/60 px-2.5 py-1.5">
          <span className="block text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Svar</span>
          <span className="block text-sm font-bold text-foreground">{responseTime(dj.id)}</span>
        </div>
      </div>
    </Link>
  );
}

function AvailabilityCard({ dj }: { dj: DJProfileWithRelations }) {
  return (
    <Link
      to={`/djs/${dj.username}`}
      className="block rounded-2xl bg-background/95 p-3 shadow-2xl ring-1 ring-black/5 backdrop-blur transition-transform duration-300 hover:-translate-y-0.5"
    >
      <div className="flex items-center gap-2.5">
        <Avatar dj={dj} className="h-9 w-9 shrink-0" />
        <div className="min-w-0">
          <span className="truncate text-sm font-semibold text-foreground">{dj.stage_name}</span>
          <span className="block truncate text-xs text-muted-foreground">
            {dj.base_location} · {eventCountValue(dj.events_performed)} events
          </span>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between rounded-xl bg-muted/60 px-2.5 py-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Status</span>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-foreground">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Ledig {availabilityDate(dj.id)}
        </span>
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
  const secondary = cards[(active + 1) % n];

  return (
    <div className={cn("relative mx-auto w-full max-w-[360px]", className)}>
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
                  className="mt-0.5 block max-w-[48%] text-base font-bold leading-snug text-white drop-shadow"
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

      {/* Floating featured-DJ card — hugs the video's upper-left corner */}
      <motion.div
        className="absolute -left-[7%] top-[15%] z-30 w-[66%]"
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.25, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={featured.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <FeaturedCard dj={featured} />
          </motion.div>
        </AnimatePresence>
      </motion.div>

      {/* Floating availability card — hugs the video's lower-right corner */}
      <motion.div
        className="absolute -bottom-[6%] -right-[6%] z-30 w-[60%]"
        initial={{ opacity: 0, x: 16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={secondary.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          >
            <AvailabilityCard dj={secondary} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
