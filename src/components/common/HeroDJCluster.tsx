import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { DJProfileWithRelations } from "@/types/domain";

/**
 * Hero social-proof element: a smaller rotating video card with a stacked deck
 * of DJ cards fanned behind it, and a translucent info strip rendered inside the
 * video card. The main card autoplays a short muted clip and, when it ends,
 * advances to the next clip/event-type caption — cycling and looping. The deck
 * and the info strip follow the rotation so they always reflect the featured DJ.
 */

// Royalty-free clips (Mixkit free license), served from public/. Each clip
// carries the event-type caption shown on the card.
const MEDIA = [
  { src: "/hero-dj.mp4", poster: "/hero-dj-poster.jpg", caption: "DJ til ethvert event", deskCaption: "ethvert event" },
  { src: "/hero-dj-42422.mp4", poster: "/hero-dj-42422-poster.jpg", caption: "DJ til bryllupsfesten", deskCaption: "bryllupsfest" },
  { src: "/hero-dj-45437.mp4", poster: "/hero-dj-45437-poster.jpg", caption: "DJ til firmafesten", deskCaption: "firmafest" },
  { src: "/hero-dj-830.mp4", poster: "/hero-dj-830-poster.jpg", caption: "DJ til din fødselsdagsfest", deskCaption: "fødselsdagsfest" },
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

// --- Translucent info strip (rendered inside the video card) ---------------

function InfoStrip({ dj }: { dj: DJProfileWithRelations }) {
  return (
    <div className="rounded-2xl bg-black/35 px-2.5 py-2 ring-1 ring-white/15 backdrop-blur-md">
      <div className="flex items-center gap-2">
        <Avatar dj={dj} className="h-8 w-8 shrink-0 ring-2 ring-white/30" />
        <div className="min-w-0 flex-1">
          <span className="flex items-center gap-1.5">
            <span className="truncate text-xs font-semibold text-white">{dj.stage_name}</span>
            <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" />
          </span>
          <span className="flex items-center gap-1 text-[10px] text-white/75">
            <Star className="h-2.5 w-2.5 shrink-0 fill-amber-300 text-amber-300" />
            {dj.rating_average.toFixed(1)}
            <span className="truncate">· {dj.base_location}</span>
          </span>
        </div>
        <div className="shrink-0 text-right">
          <span className="block text-[9px] font-medium uppercase tracking-wide text-white/60">Fra</span>
          <span className="block text-xs font-bold text-white">{compactPrice(dj)}</span>
        </div>
      </div>
      <div className="mt-1.5 flex items-center gap-1.5 text-[10px] font-medium">
        <span className="rounded-md bg-white/15 px-1.5 py-0.5 text-white/90">Svar {responseTime(dj.id)}</span>
        <span className="flex items-center gap-1 rounded-md bg-emerald-400/20 px-1.5 py-0.5 text-emerald-200">
          <span className="h-1 w-1 rounded-full bg-emerald-300" />
          Ledig {availabilityDate(dj.id)}
        </span>
      </div>
    </div>
  );
}



// --- Main component --------------------------------------------------------

export function HeroDJCluster({ djs, className, mobileHero }: { djs: DJProfileWithRelations[]; className?: string; mobileHero?: boolean }) {
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
    <div className={cn("relative mx-auto w-full max-w-[300px]", mobileHero && "max-w-none", className)}>
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
            className={cn(
              "absolute inset-0 overflow-hidden rounded-3xl shadow-lg ring-1 ring-black/10",
              mobileHero && "hidden",
            )}
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
        initial={{ opacity: 0, y: 12, rotate: mobileHero ? 0 : 3 }}
        animate={{ opacity: 1, y: 0, rotate: mobileHero ? 0 : 2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      >
        <Link
          to={`/djs/${featured.username}`}
          className={cn(
            "group block overflow-hidden rounded-3xl shadow-2xl ring-1 ring-black/10",
            mobileHero && "rounded-none shadow-none ring-0",
          )}
        >
          <div className={cn(
            "relative aspect-[3/4] overflow-hidden bg-muted",
            mobileHero && "aspect-[5/3] md:aspect-auto md:h-[55vh]",
          )}>
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
            {/* Centered event caption — the prominent headline on the clip */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-transparent to-black/55" />
            {/* Mobile overlay */}
            <div className={cn(
              "pointer-events-none absolute inset-x-0 top-0 bottom-24 flex flex-col items-center justify-center px-4 text-center",
              mobileHero && "md:hidden",
            )}>
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/80 drop-shadow">
                DJConnect
              </span>
              <AnimatePresence mode="wait">
                <motion.span
                  key={active}
                  initial={{ opacity: 0, y: 10, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                  className="block text-2xl font-extrabold leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.65)]"
                >
                  {media.caption}
                </motion.span>
              </AnimatePresence>
            </div>
            {/* Desktop overlay — mockup format */}
            {mobileHero && (
              <div className="pointer-events-none absolute inset-x-0 top-0 bottom-24 hidden flex-col items-center justify-center px-4 text-center md:flex">
                <span className="mb-3 text-sm font-semibold uppercase tracking-[0.22em] text-white/80 drop-shadow-lg">
                  Book en DJ til din
                </span>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={`desk-${active}`}
                    initial={{ opacity: 0, y: 10, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.96 }}
                    transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                    className="block text-5xl font-extrabold italic leading-tight text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.65)] lg:text-6xl"
                  >
                    {media.deskCaption}<span className="text-accent">.</span>
                  </motion.span>
                </AnimatePresence>
              </div>
            )}
            <div className={cn(
              "absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent px-4 pb-4",
              mobileHero ? "pt-8 md:pt-14" : "pt-14",
            )}>
              {/* "Find ledige DJs" CTA — desktop only when mobileHero */}
              {mobileHero && (
                <div className="hidden md:flex flex-col items-center gap-1 mb-4">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/90 drop-shadow">
                    Find ledige DJs til dit event
                  </span>
                  <ChevronDown className="h-4 w-4 text-white/70 animate-bounce" />
                </div>
              )}
              <div className="flex items-center justify-center gap-1.5">
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
              {/* Info strip: hidden on mobile when mobileHero, shown on desktop */}
              {mobileHero ? (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={featured.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-2 hidden"
                  >
                    <InfoStrip dj={featured} />
                  </motion.div>
                </AnimatePresence>
              ) : (
                <AnimatePresence mode="wait">
                  <motion.div
                    key={featured.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                    className="mt-2"
                  >
                    <InfoStrip dj={featured} />
                  </motion.div>
                </AnimatePresence>
              )}
            </div>
          </div>
        </Link>
      </motion.div>
      </div>
    </div>
  );
}
