import { Link } from "react-router-dom";
import { MapPin, Shield, Star } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { StarRating } from "./StarRating";
import type { DJProfileWithRelations } from "@/types/domain";

/**
 * Hero social-proof element: a small cluster of lightly overlapping DJ
 * cards (one larger / featured) shown in place of the hero illustration so
 * visitors immediately see real, verified DJs.
 */

const HERO_VIDEO_SRC = "/hero-dj.mp4";
const HERO_VIDEO_POSTER = "/hero-dj-poster.jpg";

function MiniCard({
  dj,
  size,
  video,
  className,
  style,
}: {
  dj: DJProfileWithRelations;
  size: "sm" | "lg";
  video?: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  const image = dj.equipment_photos[0]?.url ?? dj.profile.avatar_url ?? undefined;
  const large = size === "lg";
  return (
    <Link
      to={`/djs/${dj.username}`}
      style={style}
      className={cn(
        "group block overflow-hidden rounded-2xl border border-black/5 bg-background text-foreground shadow-2xl ring-1 ring-black/5 transition-transform duration-300 hover:-translate-y-1 hover:rotate-0",
        className,
      )}
    >
      <div className={cn("relative overflow-hidden bg-muted", large ? "aspect-[4/3]" : "aspect-[5/4]")}>
        {video ? (
          <video
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            src={HERO_VIDEO_SRC}
            poster={HERO_VIDEO_POSTER}
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
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
        {video && (
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
      </div>
      <div className={cn(large ? "space-y-1.5 p-4" : "space-y-1 p-3")}>
        <h3 className={cn("truncate font-semibold leading-tight", large ? "text-base" : "text-sm")}>{dj.stage_name}</h3>
        {large ? (
          <StarRating value={dj.rating_average} size="sm" showValue reviewCount={dj.rating_count} />
        ) : (
          <span className="flex items-center gap-1 text-xs font-medium text-foreground">
            <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
            {dj.rating_average.toFixed(1)}
            <span className="text-muted-foreground">({dj.rating_count})</span>
          </span>
        )}
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{dj.base_location}</span>
        </span>
      </div>
    </Link>
  );
}

export function HeroDJCluster({ djs, className }: { djs: DJProfileWithRelations[]; className?: string }) {
  if (djs.length === 0) return null;
  const [lead, second, third] = djs;

  return (
    <div className={cn("relative mx-auto aspect-square w-full max-w-md", className)}>
      {/* Back card — top right, tilted */}
      {second && (
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: 7 }}
          transition={{ delay: 0.35, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute right-0 top-2 z-10 w-[44%]"
        >
          <MiniCard dj={second} size="sm" className="rotate-[7deg]" />
        </motion.div>
      )}

      {/* Back card — bottom right, tilted other way */}
      {third && (
        <motion.div
          initial={{ opacity: 0, y: 24, rotate: 0 }}
          animate={{ opacity: 1, y: 0, rotate: -5 }}
          transition={{ delay: 0.45, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="absolute bottom-3 right-6 z-10 w-[40%]"
        >
          <MiniCard dj={third} size="sm" className="rotate-[-5deg]" />
        </motion.div>
      )}

      {/* Lead card — larger, front, slightly tilted left */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 0.25, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="absolute bottom-0 left-0 z-20 w-[58%]"
      >
        <MiniCard dj={lead} size="lg" video className="-rotate-[3deg]" />
      </motion.div>

      {/* Floating social-proof chip */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="absolute left-2 top-1 z-30 flex items-center gap-1.5 rounded-full bg-background/95 px-3 py-1.5 text-xs font-semibold text-foreground shadow-xl ring-1 ring-black/5 backdrop-blur"
      >
        <Star className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
        Verificerede DJs · elsket af kunderne
      </motion.div>
    </div>
  );
}
