import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MapPin, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import type { DJProfileWithRelations } from "@/types/domain";

/**
 * Hero social-proof element: a small rotating stack of overlapping DJ cards.
 * The front card autoplays a short muted clip; when it ends the next card
 * animates to the front and starts its own clip, cycling through all the
 * cards and looping — for dynamic social proof of verified DJs.
 */

// Royalty-free clips (Mixkit free license), served from public/. Each clip
// carries the event-type caption shown on its card.
const MEDIA = [
  { src: "/hero-dj.mp4", poster: "/hero-dj-poster.jpg", caption: "DJ til ethvert event" },
  { src: "/hero-dj-42422.mp4", poster: "/hero-dj-42422-poster.jpg", caption: "DJ til bryllupsfesten" },
  { src: "/hero-dj-45437.mp4", poster: "/hero-dj-45437-poster.jpg", caption: "DJ til firmafesten" },
  { src: "/hero-dj-830.mp4", poster: "/hero-dj-830-poster.jpg", caption: "DJ til din fødselsdagsfest" },
];

// Transform per visual slot (slot 0 = front). Cards share a base box and
// translate by a fraction of their own size, so this stays responsive.
const SLOTS = [
  { x: "0%", y: "18%", scale: 1, rotate: -3, zIndex: 40 },
  { x: "56%", y: "0%", scale: 0.78, rotate: 6, zIndex: 30 },
  { x: "64%", y: "28%", scale: 0.74, rotate: -5, zIndex: 20 },
  { x: "26%", y: "36%", scale: 0.7, rotate: 8, zIndex: 10 },
];

// Safety net: advance even if a clip's `ended` event never fires.
const MAX_CLIP_MS = 16000;

function StackCard({
  dj,
  media,
  active,
  onAdvance,
}: {
  dj: DJProfileWithRelations;
  media: { src: string; poster: string; caption: string };
  active: boolean;
  onAdvance: () => void;
}) {
  const image = dj.equipment_photos[0]?.url ?? dj.profile.avatar_url ?? undefined;
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!active) return;
    const el = videoRef.current;
    if (el) {
      el.currentTime = 0;
      void el.play().catch(() => {});
    }
    const timer = window.setTimeout(onAdvance, MAX_CLIP_MS);
    return () => window.clearTimeout(timer);
  }, [active, onAdvance]);

  return (
    <Link
      to={`/djs/${dj.username}`}
      className="group block overflow-hidden rounded-2xl border border-black/5 bg-background text-foreground shadow-2xl ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {active ? (
          <video
            ref={videoRef}
            className="h-full w-full object-cover"
            src={media.src}
            poster={media.poster}
            autoPlay
            muted
            playsInline
            preload="metadata"
            onEnded={onAdvance}
            onError={onAdvance}
            aria-label={`${dj.stage_name} spiller live`}
          />
        ) : image ? (
          <img
            src={image}
            alt={dj.stage_name}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-muted-foreground">Intet foto</div>
        )}
        {active && (
          <span className="absolute left-2 top-2 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white backdrop-blur">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-rose-500" />
            </span>
            Live
          </span>
        )}
        <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full bg-emerald-500/95 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow">
          <Shield className="h-3 w-3" />
          Verificeret
        </span>
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/75 via-black/30 to-transparent px-3 pb-2 pt-8">
          <span className="block text-sm font-bold leading-tight text-white drop-shadow">{media.caption}</span>
        </div>
      </div>
      <div className="space-y-1.5 p-4">
        <h3 className="truncate text-base font-semibold leading-tight">{dj.stage_name}</h3>
        <StarRating value={dj.rating_average} size="sm" showValue reviewCount={dj.rating_count} />
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{dj.base_location}</span>
        </span>
      </div>
    </Link>
  );
}

export function HeroDJCluster({ djs, className }: { djs: DJProfileWithRelations[]; className?: string }) {
  const cards = djs.slice(0, 4);
  const n = cards.length;
  const [active, setActive] = useState(0);
  const advance = useCallback(() => {
    if (n > 1) setActive((i) => (i + 1) % n);
  }, [n]);

  if (n === 0) return null;

  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-md", className)}>
      {/* Floating social-proof chip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="pointer-events-none absolute left-2 top-0 z-40 flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xl ring-1 ring-black/5 backdrop-blur"
      >
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        Verificerede DJs · elsket af kunderne
      </motion.div>

      {cards.map((dj, i) => {
        const slot = (i - active + n) % n;
        const pos = SLOTS[slot] ?? SLOTS[SLOTS.length - 1];
        return (
          <motion.div
            key={dj.id}
            className="absolute left-0 top-0 w-[60%]"
            style={{ zIndex: pos.zIndex }}
            initial={false}
            animate={{ x: pos.x, y: pos.y, scale: pos.scale, rotate: pos.rotate }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <StackCard dj={dj} media={MEDIA[i % MEDIA.length]} active={i === active} onAdvance={advance} />
          </motion.div>
        );
      })}
    </div>
  );
}
