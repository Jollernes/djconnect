import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Size = "small" | "medium" | "large";

const PALETTE = {
  floor: "#E2E8F0", // slate-200
  speaker: "#1E293B", // slate-800
  speakerHighlight: "#0F172A", // slate-900
  tweeter: "#FBBF24", // amber-400
  woofer: "#F43F5E", // rose-500
  woofer2: "#FB7185", // rose-400
  booth: "#0F172A", // slate-900
  boothFace: "#FECDD3", // rose-200
  mixer: "#FBBF24", // amber-400
  truss: "#475569", // slate-600
  lightFixture: "#0F172A", // slate-900
  lightCone: "#FCD34D", // amber-300
  lightCoreCone: "#FDE68A", // amber-200
  wave: "#F43F5E", // rose-500
  mic: "#475569", // slate-600
} as const;

/**
 * Stylised colour SVG illustration of a DJ setup, sized small / medium / large.
 * Designed to read clearly at 160-200px wide on desktop. Speakers, decks, lights,
 * plus animated soundwaves + light cones so the icons feel alive.
 */
export function SetupSizeIcon({
  size,
  active,
  className,
}: {
  size: Size;
  active?: boolean;
  className?: string;
}) {
  const wave = (delay: number) => ({
    initial: { scale: 0.5, opacity: 0 },
    animate: active
      ? {
          scale: [0.5, 1.4, 1.9],
          opacity: [0, 0.6, 0],
          transition: { duration: 1.6, repeat: Infinity, delay },
        }
      : { scale: 0.5, opacity: 0 },
  });
  const lightFlicker = (delay: number) => ({
    initial: { opacity: 0.55 },
    animate: active
      ? {
          opacity: [0.4, 1, 0.55, 1, 0.5],
          transition: { duration: 1.8, repeat: Infinity, delay },
        }
      : { opacity: 0.55 },
  });
  const coneFlicker = (delay: number) => ({
    initial: { opacity: 0.25 },
    animate: active
      ? {
          opacity: [0.2, 0.7, 0.35, 0.65, 0.25],
          transition: { duration: 1.8, repeat: Infinity, delay },
        }
      : { opacity: 0.25 },
  });

  return (
    <svg
      viewBox="0 0 160 100"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-full w-full", className)}
      role="img"
      aria-hidden
    >
      <defs>
        <linearGradient id={`stage-${size}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#FFF1F2" />
          <stop offset="100%" stopColor="#FFFBEB" />
        </linearGradient>
        <radialGradient id={`cone-${size}`} cx="50%" cy="0%" r="65%">
          <stop offset="0%" stopColor={PALETTE.lightCoreCone} stopOpacity="0.95" />
          <stop offset="100%" stopColor={PALETTE.lightCone} stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* stage backdrop */}
      <rect x="0" y="0" width="160" height="100" rx="6" fill={`url(#stage-${size})`} />
      {/* floor line */}
      <line x1="6" y1="92" x2="154" y2="92" stroke={PALETTE.floor} strokeWidth="1.5" />

      {size === "small" && (
        <g>
          {/* one speaker on a stand */}
          <SpeakerOnStand x={50} y={48} h={36} w={14} active={active} />
          {/* one LED par on a tripod */}
          <LedPar x={108} y={42} active={active} />
          {/* controller */}
          <Controller x={80} y={78} w={32} />
          {/* soundwaves */}
          <motion.circle cx={62} cy={56} r={5} fill="none" stroke={PALETTE.wave} strokeWidth="1.4" {...wave(0)} />
          <motion.circle cx={62} cy={56} r={5} fill="none" stroke={PALETTE.wave} strokeWidth="1.4" {...wave(0.6)} />
        </g>
      )}

      {size === "medium" && (
        <g>
          {/* truss with 3 moving heads */}
          <Truss x1={28} x2={132} y={18} />
          {[44, 80, 116].map((cx, i) => (
            <g key={cx}>
              {/* light cones */}
              <motion.path
                d={`M ${cx} 24 L ${cx - 12} 56 L ${cx + 12} 56 Z`}
                fill={`url(#cone-${size})`}
                {...coneFlicker(i * 0.25)}
              />
              {/* fixture body */}
              <rect x={cx - 4} y={20} width="8" height="6" rx="1.5" fill={PALETTE.lightFixture} />
              {/* hot spot */}
              <motion.circle cx={cx} cy={24} r={1.6} fill={PALETTE.tweeter} {...lightFlicker(i * 0.25)} />
            </g>
          ))}
          {/* 2 speakers */}
          <SpeakerOnStand x={26} y={42} h={42} w={16} active={active} />
          <SpeakerOnStand x={134} y={42} h={42} w={16} active={active} />
          {/* booth */}
          <Booth x={58} y={62} w={44} h={22} face={PALETTE.boothFace} />
          {/* soundwaves */}
          <motion.circle cx={36} cy={52} r={5} fill="none" stroke={PALETTE.wave} strokeWidth="1.4" {...wave(0)} />
          <motion.circle cx={124} cy={52} r={5} fill="none" stroke={PALETTE.wave} strokeWidth="1.4" {...wave(0.45)} />
          <motion.circle cx={36} cy={52} r={5} fill="none" stroke={PALETTE.wave} strokeWidth="1.4" {...wave(0.9)} />
          <motion.circle cx={124} cy={52} r={5} fill="none" stroke={PALETTE.wave} strokeWidth="1.4" {...wave(1.3)} />
        </g>
      )}

      {size === "large" && (
        <g>
          {/* truss with 5 moving heads */}
          <Truss x1={12} x2={148} y={14} thick />
          {[24, 56, 80, 104, 136].map((cx, i) => (
            <g key={cx}>
              {/* light cone */}
              <motion.path
                d={`M ${cx} 22 L ${cx - 16} 60 L ${cx + 16} 60 Z`}
                fill={`url(#cone-${size})`}
                {...coneFlicker(i * 0.18)}
              />
              {/* fixture */}
              <rect x={cx - 4} y={18} width="8" height="6" rx="1.5" fill={PALETTE.lightFixture} />
              <motion.circle cx={cx} cy={22} r={2} fill={PALETTE.tweeter} {...lightFlicker(i * 0.18)} />
            </g>
          ))}
          {/* 2 tall speakers */}
          <SpeakerOnStand x={14} y={36} h={50} w={18} active={active} tall />
          <SpeakerOnStand x={146} y={36} h={50} w={18} active={active} tall />
          {/* sub */}
          <Sub x={56} y={80} w={48} />
          {/* booth on top of sub */}
          <Booth x={48} y={56} w={64} h={24} face={PALETTE.boothFace} large />
          {/* mic stand right of booth */}
          <line x1={120} y1={62} x2={120} y2={88} stroke={PALETTE.mic} strokeWidth="1.4" />
          <circle cx={120} cy={60} r={2.2} fill={PALETTE.mic} />
          {/* haze swirl on each side */}
          <motion.ellipse cx={28} cy={78} rx={10} ry={2} fill="white" opacity="0.5" {...coneFlicker(0.4)} />
          <motion.ellipse cx={132} cy={78} rx={10} ry={2} fill="white" opacity="0.5" {...coneFlicker(0.7)} />
          {/* soundwaves */}
          <motion.circle cx={26} cy={50} r={5} fill="none" stroke={PALETTE.wave} strokeWidth="1.6" {...wave(0)} />
          <motion.circle cx={26} cy={50} r={5} fill="none" stroke={PALETTE.wave} strokeWidth="1.6" {...wave(0.4)} />
          <motion.circle cx={26} cy={50} r={5} fill="none" stroke={PALETTE.wave} strokeWidth="1.6" {...wave(0.8)} />
          <motion.circle cx={134} cy={50} r={5} fill="none" stroke={PALETTE.wave} strokeWidth="1.6" {...wave(0.2)} />
          <motion.circle cx={134} cy={50} r={5} fill="none" stroke={PALETTE.wave} strokeWidth="1.6" {...wave(0.6)} />
          <motion.circle cx={134} cy={50} r={5} fill="none" stroke={PALETTE.wave} strokeWidth="1.6" {...wave(1)} />
        </g>
      )}
    </svg>
  );
}

function Truss({ x1, x2, y, thick }: { x1: number; x2: number; y: number; thick?: boolean }) {
  const h = thick ? 5 : 3;
  return (
    <g>
      <rect x={x1} y={y} width={x2 - x1} height={h} rx="1.5" fill={PALETTE.truss} />
      {Array.from({ length: Math.floor((x2 - x1) / 8) }).map((_, i) => (
        <line
          key={i}
          x1={x1 + i * 8 + 4}
          y1={y}
          x2={x1 + i * 8 + 8}
          y2={y + h}
          stroke="#94A3B8"
          strokeWidth="0.6"
        />
      ))}
    </g>
  );
}

function SpeakerOnStand({
  x,
  y,
  h,
  w,
  active,
  tall,
}: {
  x: number;
  y: number;
  h: number;
  w: number;
  active?: boolean;
  tall?: boolean;
}) {
  return (
    <g>
      {/* stand pole */}
      <line x1={x} y1={y + h} x2={x} y2={92} stroke={PALETTE.truss} strokeWidth="1.5" />
      {/* tripod base */}
      <line x1={x - 6} y1={92} x2={x + 6} y2={92} stroke={PALETTE.truss} strokeWidth="1.6" />
      <line x1={x - 4} y1={92} x2={x - 2} y2={88} stroke={PALETTE.truss} strokeWidth="1" />
      <line x1={x + 4} y1={92} x2={x + 2} y2={88} stroke={PALETTE.truss} strokeWidth="1" />

      {/* speaker body */}
      <rect
        x={x - w / 2}
        y={y}
        width={w}
        height={h}
        rx="2.4"
        fill={active ? PALETTE.speaker : PALETTE.speakerHighlight}
      />
      {/* faceplate gradient */}
      <rect
        x={x - w / 2 + 1}
        y={y + 1}
        width={w - 2}
        height={h - 2}
        rx="2"
        fill="url(#stage-medium)"
        opacity="0.04"
      />
      {/* tweeter */}
      <circle cx={x} cy={y + 5} r={2} fill={PALETTE.tweeter} />
      <circle cx={x} cy={y + 5} r={1} fill="white" opacity="0.85" />
      {/* woofer (large outer) */}
      <circle cx={x} cy={y + h - (tall ? 11 : 9)} r={tall ? 4.5 : 4} fill={PALETTE.woofer} opacity="0.95" />
      <circle cx={x} cy={y + h - (tall ? 11 : 9)} r={tall ? 3 : 2.6} fill={PALETTE.woofer2} />
      <circle cx={x} cy={y + h - (tall ? 11 : 9)} r={tall ? 1 : 0.9} fill="white" opacity="0.85" />
      {/* port */}
      <rect
        x={x - 2}
        y={y + h - 4}
        width="4"
        height="1.6"
        rx="0.6"
        fill="white"
        opacity="0.25"
      />
    </g>
  );
}

function Controller({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x - w / 2} y={y} width={w} height="10" rx="1.5" fill={PALETTE.booth} />
      {/* jogs */}
      <circle cx={x - w / 4} cy={y + 5} r="2.4" fill={PALETTE.boothFace} />
      <circle cx={x - w / 4} cy={y + 5} r="1.2" fill={PALETTE.booth} />
      <circle cx={x + w / 4} cy={y + 5} r="2.4" fill={PALETTE.boothFace} />
      <circle cx={x + w / 4} cy={y + 5} r="1.2" fill={PALETTE.booth} />
      {/* center fader */}
      <rect x={x - 1.5} y={y + 2} width="3" height="6" rx="0.6" fill={PALETTE.mixer} />
    </g>
  );
}

function Booth({
  x,
  y,
  w,
  h,
  face,
  large,
}: {
  x: number;
  y: number;
  w: number;
  h: number;
  face: string;
  large?: boolean;
}) {
  return (
    <g>
      {/* booth panel */}
      <rect x={x} y={y} width={w} height={h} rx="2" fill={PALETTE.booth} />
      {/* glowing face */}
      <rect x={x + 2} y={y + 2} width={w - 4} height={h - 4} rx="1.5" fill={face} opacity="0.85" />
      {/* decks */}
      <rect x={x + 4} y={y + 4} width={(w - 12) / 2} height={h - 8} rx="1" fill={PALETTE.booth} opacity="0.85" />
      <rect
        x={x + 4 + (w - 12) / 2 + 4}
        y={y + 4}
        width={(w - 12) / 2}
        height={h - 8}
        rx="1"
        fill={PALETTE.booth}
        opacity="0.85"
      />
      {/* mixer */}
      {large && (
        <rect
          x={x + w / 2 - 3}
          y={y + 5}
          width="6"
          height={h - 10}
          rx="0.8"
          fill={PALETTE.mixer}
          opacity="0.95"
        />
      )}
      {/* jog wheels */}
      <circle cx={x + 4 + (w - 12) / 4} cy={y + h / 2} r={Math.max(1.6, (h - 12) / 3)} fill={PALETTE.boothFace} />
      <circle
        cx={x + 4 + (w - 12) / 2 + 4 + (w - 12) / 4}
        cy={y + h / 2}
        r={Math.max(1.6, (h - 12) / 3)}
        fill={PALETTE.boothFace}
      />
    </g>
  );
}

function Sub({ x, y, w }: { x: number; y: number; w: number }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height="10" rx="1.5" fill={PALETTE.speakerHighlight} />
      <circle cx={x + 10} cy={y + 5} r="3" fill={PALETTE.woofer} />
      <circle cx={x + 10} cy={y + 5} r="1.5" fill={PALETTE.woofer2} />
      <circle cx={x + w - 10} cy={y + 5} r="3" fill={PALETTE.woofer} />
      <circle cx={x + w - 10} cy={y + 5} r="1.5" fill={PALETTE.woofer2} />
    </g>
  );
}

function LedPar({ x, y, active }: { x: number; y: number; active?: boolean }) {
  return (
    <g>
      {/* tripod */}
      <line x1={x} y1={y + 8} x2={x} y2={92} stroke={PALETTE.truss} strokeWidth="1.5" />
      <line x1={x - 5} y1={92} x2={x + 5} y2={92} stroke={PALETTE.truss} strokeWidth="1.5" />
      {/* fixture */}
      <rect x={x - 5} y={y} width="10" height="6" rx="1.2" fill={PALETTE.lightFixture} />
      <circle cx={x} cy={y + 3} r="2" fill={active ? PALETTE.tweeter : "#FCD34D"} opacity="0.9" />
      {/* cone */}
      <path d={`M ${x} ${y + 6} L ${x - 8} 78 L ${x + 8} 78 Z`} fill="#FCD34D" opacity={active ? 0.55 : 0.3} />
    </g>
  );
}
