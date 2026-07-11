import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { getBriefEventTypeConfig } from "@/lib/eventTypes";
import type { BriefEventType } from "@/lib/eventTypes";
import type { GuestTier, ServiceScope } from "@/types/domain";

interface MobileDiscoBuilderProps {
  eventType: BriefEventType;
  sizeTier: GuestTier;
  extraSound: boolean;
  extraLighting: boolean;
  microphone: boolean;
  serviceScope: ServiceScope;
}

const SIZE_META: Record<
  GuestTier,
  {
    label: string;
    trussLeft: number;
    trussRight: number;
    trussTop: number;
    boothWidth: number;
    speakerScale: number;
    topSpeakerY: number;
    subwooferCount: number;
    movingHeadCount: number;
  }
> = {
  compact: {
    label: "Kompakt",
    trussLeft: 220,
    trussRight: 740,
    trussTop: 116,
    boothWidth: 270,
    speakerScale: 0.9,
    topSpeakerY: 190,
    subwooferCount: 1,
    movingHeadCount: 2,
  },
  medium: {
    label: "Mellem",
    trussLeft: 160,
    trussRight: 800,
    trussTop: 92,
    boothWidth: 310,
    speakerScale: 1,
    topSpeakerY: 170,
    subwooferCount: 1,
    movingHeadCount: 3,
  },
  large: {
    label: "Stor",
    trussLeft: 110,
    trussRight: 850,
    trussTop: 70,
    boothWidth: 350,
    speakerScale: 1.12,
    topSpeakerY: 148,
    subwooferCount: 2,
    movingHeadCount: 4,
  },
};

const SERVICE_GLOW_OPACITY: Record<ServiceScope, number> = {
  "Kun fest": 0.34,
  "Middag og fest": 0.24,
  "Velkomst, middag og fest": 0.18,
};

const VU_HEIGHTS = [0.28, 0.6, 0.42, 0.82, 0.52, 0.72, 0.34, 0.9, 0.48, 0.76, 0.38, 0.67, 0.46, 0.58];

function usePrefersReducedMotion() {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(() =>
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );

  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setPrefersReducedMotion(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);

  return prefersReducedMotion;
}

function Speaker({ x, y, scale, motionEnabled }: { x: number; y: number; scale: number; motionEnabled: boolean }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`}>
      <path d="M-38 18 L-30 -80 Q0 -98 30 -80 L38 18 Z" fill="url(#speakerShell)" stroke="#64748b" strokeWidth="3" />
      <path d="M-28 5 L-22 -65 Q0 -78 22 -65 L28 5 Z" fill="#0f172a" stroke="#475569" strokeWidth="2" />
      <circle cx="0" cy="-32" r="17" fill="#1e293b" stroke="#94a3b8" strokeWidth="2" />
      <circle cx="0" cy="-32" r="9" fill="#020617" stroke="#64748b" strokeWidth="2" />
      <path d="M-15 -56 Q0 -69 15 -56" fill="none" stroke="#cbd5e1" strokeOpacity="0.32" strokeWidth="2" />
      <motion.circle
        cx="23"
        cy="-70"
        r="3"
        fill="#fbbf24"
        animate={motionEnabled ? { opacity: [0.25, 1, 0.25] } : undefined}
        transition={motionEnabled ? { duration: 1.8, repeat: Infinity, ease: "easeInOut" } : undefined}
      />
      <path d="M0 18 L0 150 M0 70 L-28 150 M0 70 L28 150" fill="none" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <path d="M-34 150 H34" stroke="#64748b" strokeWidth="4" strokeLinecap="round" />
    </g>
  );
}

function Subwoofer({ x, y, motionEnabled, color }: { x: number; y: number; motionEnabled: boolean; color: string }) {
  return (
    <motion.g
      initial={motionEnabled ? { opacity: 0, scale: 0.78, y: 16 } : false}
      animate={motionEnabled ? { opacity: 1, scale: [1, 1.035, 1], y: [0, -2, 0] } : { opacity: 1, scale: 1, y: 0 }}
      transition={motionEnabled ? { opacity: { duration: 0.35 }, scale: { duration: 1.25, repeat: Infinity, ease: "easeInOut" }, y: { duration: 1.25, repeat: Infinity, ease: "easeInOut" } } : undefined}
      exit={motionEnabled ? { opacity: 0, scale: 0.78, y: 16 } : undefined}
      style={{ transformOrigin: `${x + 32}px ${y + 54}px` }}
    >
      <g transform={`translate(${x} ${y})`}>
        <rect width="64" height="108" rx="8" fill="url(#speakerShell)" stroke="#64748b" strokeWidth="3" />
        <rect x="9" y="11" width="46" height="82" rx="5" fill="#0b1220" stroke="#334155" strokeWidth="2" />
        <circle cx="32" cy="52" r="24" fill="#111827" stroke="#475569" strokeWidth="3" />
        <circle cx="32" cy="52" r="16" fill="#020617" stroke={color} strokeOpacity="0.65" strokeWidth="2" />
        <circle cx="32" cy="52" r="6" fill={color} opacity="0.35" />
        <path d="M17 100 H47" stroke="#cbd5e1" strokeOpacity="0.28" strokeWidth="2" />
      </g>
    </motion.g>
  );
}

export function MobileDiscoBuilder({
  eventType,
  sizeTier,
  extraSound,
  extraLighting,
  microphone,
  serviceScope,
}: MobileDiscoBuilderProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const motionEnabled = !prefersReducedMotion;
  const config = getBriefEventTypeConfig(eventType);
  const size = SIZE_META[sizeTier];
  const soundPresence = extraSound ? 0.26 : 0.12;
  const serviceGlow = SERVICE_GLOW_OPACITY[serviceScope];
  const movingHeads = useMemo(() => Array.from({ length: size.movingHeadCount }, (_, index) => index), [size.movingHeadCount]);
  const subwoofers = useMemo(() => Array.from({ length: size.subwooferCount }, (_, index) => index), [size.subwooferCount]);
  const topSpeakerCount = 2;

  return (
    <div className="overflow-hidden rounded-[1.75rem] border border-slate-700/80 bg-slate-950 p-2 shadow-2xl">
      <div className="overflow-hidden rounded-[1.35rem] border border-white/10 bg-slate-950">
        <svg viewBox="0 0 960 540" role="img" aria-label={`Animeret visualisering af ${size.label.toLowerCase()}t mobildiskotek`} className="block h-auto w-full">
          <defs>
            <linearGradient id="stageBackdrop" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#111827" />
              <stop offset="55%" stopColor="#080d18" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="metalFrame" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#f8fafc" stopOpacity="0.86" />
              <stop offset="30%" stopColor="#64748b" />
              <stop offset="65%" stopColor="#cbd5e1" stopOpacity="0.46" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
            <linearGradient id="speakerShell" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor="#475569" />
              <stop offset="26%" stopColor="#1e293b" />
              <stop offset="72%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <linearGradient id="boothFace" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#334155" />
              <stop offset="45%" stopColor="#111827" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
            <radialGradient id="vignette" cx="50%" cy="46%" r="70%">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.2" />
              <stop offset="68%" stopColor="#020617" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#000000" stopOpacity="0.82" />
            </radialGradient>
            <radialGradient id="haze" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor={config.palette.glow} stopOpacity="0.24" />
              <stop offset="55%" stopColor={config.palette.beamPrimary} stopOpacity="0.1" />
              <stop offset="100%" stopColor={config.palette.beamPrimary} stopOpacity="0" />
            </radialGradient>
            <radialGradient id="welcomePool" cx="50%" cy="40%" r="60%">
              <stop offset="0%" stopColor={config.palette.beamSecondary} stopOpacity="0.34" />
              <stop offset="100%" stopColor={config.palette.beamSecondary} stopOpacity="0" />
            </radialGradient>
            <linearGradient id="beamPrimary" x1="0" x2="1" y1="0" y2="1">
              <stop offset="0%" stopColor={config.palette.beamPrimary} stopOpacity="0.78" />
              <stop offset="100%" stopColor={config.palette.beamPrimary} stopOpacity="0" />
            </linearGradient>
            <linearGradient id="beamSecondary" x1="1" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={config.palette.beamSecondary} stopOpacity="0.72" />
              <stop offset="100%" stopColor={config.palette.beamSecondary} stopOpacity="0" />
            </linearGradient>
            <filter id="blur24">
              <feGaussianBlur stdDeviation="24" />
            </filter>
            <filter id="blur10">
              <feGaussianBlur stdDeviation="10" />
            </filter>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <rect width="960" height="540" fill="url(#stageBackdrop)" />
          <motion.ellipse
            cx="480"
            cy="225"
            rx="360"
            ry="180"
            fill="url(#haze)"
            filter="url(#blur24)"
            animate={motionEnabled ? { x: [-26, 30, -26], y: [8, -12, 8], opacity: [0.52, 0.82, 0.52] } : undefined}
            transition={motionEnabled ? { duration: 15, repeat: Infinity, ease: "easeInOut" } : undefined}
          />
          <motion.ellipse
            cx="480"
            cy="360"
            rx={serviceScope === "Velkomst, middag og fest" ? 360 : 300}
            ry="78"
            fill={config.palette.glow}
            opacity={serviceGlow}
            filter="url(#blur24)"
            animate={motionEnabled ? { scale: [1, 1.05, 1], opacity: [serviceGlow * 0.78, serviceGlow, serviceGlow * 0.78] } : undefined}
            transition={motionEnabled ? { duration: 7, repeat: Infinity, ease: "easeInOut" } : undefined}
            style={{ transformOrigin: "480px 360px" }}
          />
          {serviceScope === "Velkomst, middag og fest" ? (
            <ellipse cx="480" cy="190" rx="420" ry="140" fill="url(#welcomePool)" filter="url(#blur24)" opacity="0.5" />
          ) : null}
          <rect width="960" height="540" fill="url(#vignette)" />

          <AnimatePresence>
            {extraLighting
              ? movingHeads.map((index) => {
                  const x = size.trussLeft + ((size.trussRight - size.trussLeft) / Math.max(1, movingHeads.length - 1)) * index;
                  const isPrimary = index % 2 === 0;
                  return (
                    <motion.g
                      key={`beam-${index}`}
                      initial={motionEnabled ? { opacity: 0, scale: 0.72 } : false}
                      animate={motionEnabled ? { opacity: [0.35, 0.85, 0.35], scale: [0.88, 1, 0.88], rotate: index % 2 === 0 ? [-9, 8, -9] : [8, -9, 8] } : { opacity: 0.68, scale: 1, rotate: 0 }}
                      exit={motionEnabled ? { opacity: 0, scale: 0.72 } : undefined}
                      transition={motionEnabled ? { duration: 6 + index * 0.7, repeat: Infinity, ease: "easeInOut", delay: index * 0.35 } : undefined}
                      style={{ transformOrigin: `${x}px ${size.trussTop + 18}px` }}
                    >
                      <path
                        d={`M${x - 14} ${size.trussTop + 16} L${x - 172} 420 L${x + 68} 420 Z`}
                        fill={isPrimary ? "url(#beamPrimary)" : "url(#beamSecondary)"}
                        filter="url(#blur10)"
                      />
                      <circle cx={x} cy={size.trussTop + 13} r="13" fill={isPrimary ? config.palette.beamPrimary : config.palette.beamSecondary} opacity="1" filter="url(#glow)" />
                    </motion.g>
                  );
                })
              : null}
          </AnimatePresence>

          {extraLighting ? (
            <g>
              <motion.ellipse
                cx="270"
                cy="342"
                rx="125"
                ry="36"
                fill="url(#welcomePool)"
                filter="url(#blur10)"
                animate={motionEnabled ? { opacity: [0.22, 0.5, 0.22], scale: [0.94, 1.08, 0.94] } : undefined}
                transition={motionEnabled ? { duration: 4.6, repeat: Infinity, ease: "easeInOut" } : undefined}
                style={{ transformOrigin: "270px 342px" }}
              />
              <motion.ellipse
                cx="690"
                cy="342"
                rx="125"
                ry="36"
                fill="url(#welcomePool)"
                filter="url(#blur10)"
                animate={motionEnabled ? { opacity: [0.5, 0.22, 0.5], scale: [1.08, 0.94, 1.08] } : undefined}
                transition={motionEnabled ? { duration: 4.6, repeat: Infinity, ease: "easeInOut" } : undefined}
                style={{ transformOrigin: "690px 342px" }}
              />
            </g>
          ) : null}

          <g>
            <path d={`M${size.trussLeft} ${size.trussTop} H${size.trussRight}`} stroke="url(#metalFrame)" strokeWidth="12" strokeLinecap="round" />
            <path d={`M${size.trussLeft} ${size.trussTop} V380 M${size.trussRight} ${size.trussTop} V380`} stroke="url(#metalFrame)" strokeWidth="10" strokeLinecap="round" />
            <path d={`M${size.trussLeft + 30} ${size.trussTop + 24} H${size.trussRight - 30}`} stroke="#e2e8f0" strokeOpacity="0.22" strokeWidth="3" />
            {Array.from({ length: 8 }, (_, index) => {
              const x = size.trussLeft + 34 + ((size.trussRight - size.trussLeft - 68) / 7) * index;
              return <path key={`truss-brace-${index}`} d={`M${x} ${size.trussTop + 2} L${x + 34} ${size.trussTop + 42}`} stroke="#94a3b8" strokeOpacity="0.55" strokeWidth="2" />;
            })}
          </g>

          {sizeTier !== "compact" ? (
            <g>
              <rect x={size.trussLeft + 115} y={size.trussTop + 23} width={size.trussRight - size.trussLeft - 230} height="17" rx="8" fill="#111827" stroke="#64748b" strokeWidth="2" />
              {Array.from({ length: 12 }, (_, index) => (
                <motion.rect
                  key={`led-${index}`}
                  x={size.trussLeft + 130 + index * ((size.trussRight - size.trussLeft - 260) / 11)}
                  y={size.trussTop + 28}
                  width="10"
                  height="7"
                  rx="3"
                  fill={index % 2 === 0 ? config.palette.beamPrimary : config.palette.beamSecondary}
                  animate={motionEnabled ? { opacity: [0.28, 1, 0.35] } : undefined}
                  transition={motionEnabled ? { duration: 1.7, repeat: Infinity, delay: index * 0.1, ease: "easeInOut" } : undefined}
                />
              ))}
            </g>
          ) : null}

          <Speaker x={size.trussLeft - 5} y={size.topSpeakerY} scale={size.speakerScale} motionEnabled={motionEnabled} />
          <Speaker x={size.trussRight + 5} y={size.topSpeakerY} scale={size.speakerScale} motionEnabled={motionEnabled} />

          <AnimatePresence>
            {extraSound
              ? subwoofers.flatMap((index) => [
                  <Subwoofer key={`sub-left-${index}`} x={size.trussLeft + 32 + index * 72} y={342 - index * 4} motionEnabled={motionEnabled} color={config.palette.beamPrimary} />,
                  <Subwoofer key={`sub-right-${index}`} x={size.trussRight - 96 - index * 72} y={342 - index * 4} motionEnabled={motionEnabled} color={config.palette.beamSecondary} />,
                ])
              : null}
          </AnimatePresence>

          <motion.g
            animate={motionEnabled ? { y: [0, -3, 0] } : undefined}
            transition={motionEnabled ? { duration: 3.8, repeat: Infinity, ease: "easeInOut" } : undefined}
          >
            <circle cx="480" cy="206" r="21" fill="#111827" stroke="#94a3b8" strokeWidth="3" />
            <path d="M454 205 Q480 174 506 205" fill="none" stroke="#cbd5e1" strokeWidth="6" strokeLinecap="round" />
            <path d="M451 203 Q437 208 442 224 M509 203 Q523 208 518 224" fill="none" stroke="#94a3b8" strokeWidth="7" strokeLinecap="round" />
            <path d="M456 232 Q480 248 504 232 L518 339 H442 Z" fill="#0f172a" stroke="#475569" strokeWidth="3" />
            <path d="M459 252 L440 316 M501 252 L520 316" fill="none" stroke="#64748b" strokeWidth="6" strokeLinecap="round" />
          </motion.g>

          <g transform={`translate(480 330)`}>
            <rect x={-size.boothWidth / 2} y="0" width={size.boothWidth} height="116" rx="14" fill="url(#boothFace)" stroke="#64748b" strokeWidth="3" />
            <rect x={-size.boothWidth / 2 + 14} y="14" width={size.boothWidth - 28} height="80" rx="9" fill="#020617" stroke="#334155" strokeWidth="2" />
            <path d={`M${-size.boothWidth / 2 + 20} 104 H${size.boothWidth / 2 - 20}`} stroke={config.palette.glow} strokeOpacity={soundPresence + 0.2} strokeWidth="3" filter="url(#glow)" />
            <g transform={`translate(${-size.boothWidth / 2 + 34} 79)`}>
              {VU_HEIGHTS.map((height, index) => (
                <motion.rect
                  key={`vu-${index}`}
                  x={index * ((size.boothWidth - 68) / VU_HEIGHTS.length)}
                  y={-height * 44}
                  width="7"
                  height={height * 44}
                  rx="3"
                  fill={index % 3 === 0 ? config.palette.beamSecondary : config.palette.beamPrimary}
                  animate={motionEnabled ? { scaleY: [0.65, 1, 0.72, 0.92, 0.65] } : undefined}
                  transition={motionEnabled ? { duration: 1.3 + (index % 4) * 0.15, repeat: Infinity, delay: index * 0.07, ease: "easeInOut" } : undefined}
                  style={{ transformOrigin: "center bottom" }}
                />
              ))}
            </g>
            <rect x={-size.boothWidth / 2 + 24} y="-14" width={size.boothWidth - 48} height="18" rx="7" fill="#1e293b" stroke="#94a3b8" strokeOpacity="0.45" strokeWidth="2" />
            <circle cx="-54" cy="-5" r="5" fill={config.palette.beamPrimary} filter="url(#glow)" />
            <circle cx="54" cy="-5" r="5" fill={config.palette.beamSecondary} filter="url(#glow)" />
          </g>

          <AnimatePresence>
            {microphone ? (
              <motion.g
                initial={motionEnabled ? { opacity: 0, scale: 0.6, y: 18 } : false}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={motionEnabled ? { opacity: 0, scale: 0.6, y: 18 } : undefined}
                transition={motionEnabled ? { type: "spring", stiffness: 220, damping: 18 } : undefined}
                style={{ transformOrigin: "402px 397px" }}
              >
                <circle cx="402" cy="438" r="13" fill="#1e293b" stroke="#cbd5e1" strokeWidth="2" />
                <path d="M402 426 V374" stroke="#cbd5e1" strokeWidth="4" strokeLinecap="round" />
                <path d="M384 374 Q402 392 420 374" fill="none" stroke="#94a3b8" strokeWidth="4" strokeLinecap="round" />
                <rect x="394" y="350" width="16" height="28" rx="8" fill="#0f172a" stroke="#e2e8f0" strokeWidth="2" />
                <path d="M397 357 H407" stroke={config.palette.glow} strokeWidth="2" />
              </motion.g>
            ) : null}
          </AnimatePresence>

          <motion.ellipse
            cx="480"
            cy="458"
            rx={sizeTier === "large" ? 330 : sizeTier === "medium" ? 290 : 245}
            ry="28"
            fill={config.palette.glow}
            opacity="0.2"
            filter="url(#blur10)"
            animate={motionEnabled ? { opacity: [0.14, 0.28, 0.14], scaleX: [0.96, 1.03, 0.96] } : undefined}
            transition={motionEnabled ? { duration: 5.4, repeat: Infinity, ease: "easeInOut" } : undefined}
            style={{ transformOrigin: "480px 458px" }}
          />
          <path d="M180 472 Q480 512 780 472" fill="none" stroke="#cbd5e1" strokeOpacity="0.08" strokeWidth="2" />
        </svg>
      </div>

      <div className="flex flex-wrap gap-2 px-2 pb-2 pt-3">
        <Badge variant="outline" className="border-white/15 bg-white/5 text-slate-200">
          {size.label} setup
        </Badge>
        <Badge variant="outline" className="border-white/15 bg-white/5 text-slate-200">
          {topSpeakerCount} topspeakere
        </Badge>
        {extraSound ? (
          <Badge variant="outline" className="border-white/15 bg-white/5 text-slate-200">
            Subwoofere
          </Badge>
        ) : null}
        {extraLighting ? (
          <Badge variant="outline" className="border-white/15 bg-white/5 text-slate-200">
            Moving heads
          </Badge>
        ) : null}
        {microphone ? (
          <Badge variant="outline" className="border-white/15 bg-white/5 text-slate-200">
            Mikrofon
          </Badge>
        ) : null}
      </div>
    </div>
  );
}
