import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import type { DJProfileWithRelations } from "@/types/domain";
import { cn } from "@/lib/utils";
import { DK_REGION_PATHS } from "./dkMapPaths";

/**
 * Discrete map of Denmark with wedding DJs pinned at their base city.
 *
 * Uses a real simplified Denmark outline (CC-BY simplemaps.com), so the
 * country is unmistakably recognisable rather than stylised. Animation is
 * intentionally minimal: pins appear instantly, a single soft pulse plays
 * only on the actively-hovered or highlighted pin, and there is no radar
 * sweep / connecting-line choreography. Hover surfaces a small tooltip;
 * click bubbles up via {@link onPinClick} so the parent can scroll the
 * matching DJ card into view.
 */

// SVG viewBox matches the source simplemaps SVG so the path data renders
// at its native scale. Pins map lat/lng -> SVG using a calibration tuned
// against three known cities (Copenhagen, Aarhus, Aalborg).
const VIEW_W = 1000;
const VIEW_H = 810;

// Calibrated bounds — derived empirically from the simplemaps geometry.
// Bornholm sits at the eastern edge (~14.92°E), western Jylland at ~8.0°E;
// Skagen near 57.75°N, Gedser near 54.55°N. The projection is close enough
// to equirectangular at this latitude that a linear mapping is accurate
// to within a few pixels for every Danish city we render.
const LNG_W = 8.0;
const LNG_E = 14.92;
const LAT_N = 57.75;
const LAT_S = 54.55;
const SVG_X_W = 45.5;
const SVG_X_E = 954.5;
const SVG_Y_N = 36.8;
const SVG_Y_S = 773.5;

type CityCoord = { lat: number; lng: number };

const CITY_COORDS: Record<string, CityCoord> = {
  Copenhagen: { lat: 55.68, lng: 12.57 },
  København: { lat: 55.68, lng: 12.57 },
  Aarhus: { lat: 56.16, lng: 10.2 },
  Odense: { lat: 55.4, lng: 10.4 },
  Aalborg: { lat: 57.05, lng: 9.93 },
  Roskilde: { lat: 55.64, lng: 12.08 },
  Esbjerg: { lat: 55.47, lng: 8.45 },
  Helsingør: { lat: 56.04, lng: 12.61 },
  Vejle: { lat: 55.71, lng: 9.54 },
  Kolding: { lat: 55.49, lng: 9.47 },
  Randers: { lat: 56.46, lng: 10.04 },
  Horsens: { lat: 55.86, lng: 9.85 },
  Frederiksberg: { lat: 55.68, lng: 12.53 },
};

function projectCity(city: string | null | undefined): { x: number; y: number } | null {
  if (!city) return null;
  const coord = CITY_COORDS[city] ?? CITY_COORDS[city.split(",")[0]?.trim() ?? ""];
  if (!coord) return null;
  const x = SVG_X_W + ((coord.lng - LNG_W) / (LNG_E - LNG_W)) * (SVG_X_E - SVG_X_W);
  const y = SVG_Y_N + ((LAT_N - coord.lat) / (LAT_N - LAT_S)) * (SVG_Y_S - SVG_Y_N);
  return { x, y };
}

const LABEL_CITIES: { city: string; label: string; dx: number; dy: number }[] = [
  { city: "Copenhagen", label: "København", dx: 14, dy: 4 },
  { city: "Aarhus", label: "Aarhus", dx: 14, dy: 4 },
  { city: "Odense", label: "Odense", dx: 14, dy: 4 },
  { city: "Aalborg", label: "Aalborg", dx: 14, dy: -8 },
];

export function DenmarkDJMap({
  djs,
  onPinClick,
  highlightId,
  className,
}: {
  djs: DJProfileWithRelations[];
  onPinClick?: (id: string) => void;
  highlightId?: string | null;
  className?: string;
}) {
  const [hoverId, setHoverId] = useState<string | null>(null);

  const pins = useMemo(() => {
    const cityCounts = new Map<string, number>();
    return djs
      .map((dj) => {
        const city = dj.base_location ?? dj.profile.city;
        const coord = projectCity(city);
        if (!coord) return null;
        const seen = cityCounts.get(city ?? "") ?? 0;
        cityCounts.set(city ?? "", seen + 1);
        // Spread DJs sharing the same city around it in a small ring so the
        // dots don't stack. Offset is in SVG units, comparable to the pin radius.
        const angle = seen * (Math.PI * 2 / 5);
        const offset = seen === 0 ? 0 : 16;
        return {
          dj,
          x: coord.x + Math.cos(angle) * offset,
          y: coord.y + Math.sin(angle) * offset,
        };
      })
      .filter((p): p is { dj: DJProfileWithRelations; x: number; y: number } => p !== null);
  }, [djs]);

  const activePin =
    pins.find((p) => p.dj.id === hoverId) ?? pins.find((p) => p.dj.id === highlightId) ?? null;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border bg-gradient-to-br from-slate-50 via-white to-rose-50/40",
        className,
      )}
    >
      <svg
        viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
        preserveAspectRatio="xMidYMid meet"
        className="h-full w-full"
        aria-label="Map of Denmark showing wedding DJs by city"
        role="img"
      >
        <defs>
          <pattern id="dk-sea-dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="1" cy="1" r="0.9" fill="#CBD5E1" opacity="0.45" />
          </pattern>
          <radialGradient id="dk-warm-glow" cx="50%" cy="55%" r="58%">
            <stop offset="0%" stopColor="#FBBF24" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#FBBF24" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Sea backdrop — quiet dotted pattern, no animation */}
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#dk-sea-dots)" />
        <rect x="0" y="0" width={VIEW_W} height={VIEW_H} fill="url(#dk-warm-glow)" />

        {/* Country regions — render as one cohesive landmass (ivory fill,
            slate stroke). No animations, no per-region accent. */}
        <g>
          {DK_REGION_PATHS.map((r) => (
            <path
              key={r.name}
              d={r.d}
              fill="#FFFBF6"
              stroke="#94A3B8"
              strokeWidth={1.6}
              strokeLinejoin="round"
            />
          ))}
        </g>

        {/* City labels — small, subdued */}
        <g className="pointer-events-none" fontSize={14} fill="#64748B" fontWeight={500}>
          {LABEL_CITIES.map((c) => {
            const coord = projectCity(c.city);
            if (!coord) return null;
            return (
              <text key={c.city} x={coord.x + c.dx} y={coord.y + c.dy} opacity={0.75}>
                {c.label}
              </text>
            );
          })}
        </g>

        {/* Pins — static unless hovered/highlighted */}
        {pins.map((p) => {
          const active = hoverId === p.dj.id || highlightId === p.dj.id;
          return (
            <g
              key={p.dj.id}
              transform={`translate(${p.x}, ${p.y})`}
              onMouseEnter={() => setHoverId(p.dj.id)}
              onMouseLeave={() => setHoverId(null)}
              onClick={() => onPinClick?.(p.dj.id)}
              className="cursor-pointer"
            >
              {/* Single soft pulse only when active (hover/highlight). */}
              {active && (
                <motion.circle
                  cx={0}
                  cy={0}
                  r={10}
                  fill="none"
                  stroke="#F43F5E"
                  strokeWidth={2}
                  initial={{ scale: 0.6, opacity: 0.7 }}
                  animate={{ scale: [0.6, 2.2], opacity: [0.7, 0] }}
                  transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                />
              )}
              {/* Halo behind pin on active */}
              {active && (
                <circle cx={0} cy={0} r={18} fill="#F43F5E" fillOpacity={0.14} />
              )}
              {/* Pin dot */}
              <circle
                cx={0}
                cy={0}
                r={active ? 9 : 7}
                fill={active ? "#E11D48" : "#F43F5E"}
                stroke="#FFFFFF"
                strokeWidth={2}
              />
              <circle cx={-2} cy={-2} r={1.8} fill="#FFFFFF" opacity={0.75} />
            </g>
          );
        })}
      </svg>

      {/* HTML tooltip overlay so type stays sharp */}
      {activePin && (
        <Tooltip dj={activePin.dj} x={activePin.x} y={activePin.y} />
      )}

      {/* Header chip */}
      <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full border bg-white/90 px-2.5 py-1 text-[10px] font-semibold text-slate-700 shadow-sm backdrop-blur">
        <MapPin className="h-3 w-3 text-rose-500" />
        {pins.length} DJs across Denmark
      </div>
    </div>
  );
}

function Tooltip({
  dj,
  x,
  y,
}: {
  dj: DJProfileWithRelations;
  x: number;
  y: number;
}) {
  const leftPct = (x / VIEW_W) * 100;
  const topPct = (y / VIEW_H) * 100;
  const flipBelow = topPct < 22;
  const city = dj.base_location ?? dj.profile.city ?? "Denmark";
  const price = dj.price_from_minor
    ? Math.round(dj.price_from_minor / 100).toLocaleString("da-DK")
    : null;
  return (
    <motion.div
      initial={{ opacity: 0, y: flipBelow ? -4 : 4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.16 }}
      className={cn(
        "pointer-events-none absolute z-10 -translate-x-1/2 rounded-xl border bg-white px-2.5 py-1.5 shadow-md",
        flipBelow ? "translate-y-3" : "-translate-y-[calc(100%+10px)]",
      )}
      style={{ left: `${leftPct}%`, top: `${topPct}%` }}
    >
      <div className="flex items-center gap-2">
        {dj.profile.avatar_url ? (
          <img
            src={dj.profile.avatar_url}
            alt={dj.stage_name}
            className="h-7 w-7 rounded-full object-cover ring-1 ring-rose-200"
          />
        ) : (
          <div className="grid h-7 w-7 place-items-center rounded-full bg-rose-100 text-[10px] font-bold text-rose-700">
            {dj.stage_name.slice(0, 2).toUpperCase()}
          </div>
        )}
        <div className="text-left">
          <p className="text-[11px] font-semibold leading-tight text-foreground">{dj.stage_name}</p>
          <p className="text-[10px] text-muted-foreground">
            {city}
            {dj.rating_average ? ` · ⭐ ${dj.rating_average.toFixed(1)}` : ""}
            {price ? ` · fra ${price} kr` : ""}
          </p>
        </div>
      </div>
      <div
        className={cn(
          "absolute left-1/2 h-2 w-2 -translate-x-1/2 rotate-45 border bg-white",
          flipBelow ? "-top-1 border-l border-t" : "-bottom-1 border-b border-r",
        )}
      />
    </motion.div>
  );
}
