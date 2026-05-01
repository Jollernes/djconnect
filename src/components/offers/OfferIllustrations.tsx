import { motion } from "framer-motion";

/**
 * Brand-styled inline-SVG illustrations for the Get 3 Offers wizard.
 * Palette mirrors the wedding-page setup icons (slate / rose / amber)
 * so the wizard feels like a sibling of the existing platform.
 */

const BG = "from-rose-50 via-amber-50 to-rose-50";

function Frame({
  children,
  className = "",
  size = "md",
}: {
  children: React.ReactNode;
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const sizes = {
    sm: "h-28 w-40",
    md: "h-40 w-56",
    lg: "h-48 w-72",
  } as const;
  return (
    <div
      className={`relative grid place-items-center overflow-hidden rounded-3xl bg-gradient-to-br ${BG} ${sizes[size]} ${className}`}
    >
      <svg viewBox="0 0 200 140" className="h-full w-full">
        {children}
      </svg>
    </div>
  );
}

export function WelcomeIllustration({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Frame size={size}>
      {/* backdrop dots */}
      <circle cx="35" cy="30" r="2" fill="#FBBF24" opacity="0.5" />
      <circle cx="170" cy="35" r="2.5" fill="#F43F5E" opacity="0.5" />
      <circle cx="160" cy="105" r="2" fill="#FBBF24" opacity="0.4" />
      <circle cx="40" cy="100" r="2" fill="#F43F5E" opacity="0.4" />

      {/* booth */}
      <rect x="55" y="78" width="90" height="36" rx="4" fill="#1E293B" />
      <rect x="55" y="78" width="90" height="6" fill="#0F172A" />
      <rect x="62" y="92" width="76" height="16" rx="2" fill="#FECDD3" />

      {/* CDJ left + right */}
      <circle cx="78" cy="100" r="6" fill="#F43F5E" />
      <circle cx="78" cy="100" r="2" fill="#FFF" />
      <circle cx="122" cy="100" r="6" fill="#F43F5E" />
      <circle cx="122" cy="100" r="2" fill="#FFF" />
      {/* mixer */}
      <rect x="92" y="96" width="16" height="10" rx="1" fill="#FBBF24" />

      {/* speakers L + R */}
      <rect x="20" y="64" width="22" height="50" rx="3" fill="#1E293B" />
      <circle cx="31" cy="80" r="6" fill="#F43F5E" />
      <circle cx="31" cy="100" r="3" fill="#FBBF24" />
      <rect x="158" y="64" width="22" height="50" rx="3" fill="#1E293B" />
      <circle cx="169" cy="80" r="6" fill="#F43F5E" />
      <circle cx="169" cy="100" r="3" fill="#FBBF24" />

      {/* truss */}
      <rect x="60" y="34" width="80" height="4" rx="2" fill="#475569" />
      <rect x="58" y="32" width="4" height="14" fill="#475569" />
      <rect x="138" y="32" width="4" height="14" fill="#475569" />
      {/* moving heads */}
      {[80, 100, 120].map((cx) => (
        <g key={cx}>
          <circle cx={cx} cy="42" r="3" fill="#FBBF24" />
          <motion.path
            d={`M ${cx - 6} 46 L ${cx + 6} 46 L ${cx + 14} 78 L ${cx - 14} 78 Z`}
            fill="#FCD34D"
            opacity="0.35"
            initial={{ opacity: 0.2 }}
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2.4, repeat: Infinity, delay: cx * 0.01 }}
          />
        </g>
      ))}

      {/* sound waves around speakers */}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={`l-${i}`}
          cx="31"
          cy="84"
          r={10 + i * 6}
          fill="none"
          stroke="#F43F5E"
          strokeWidth="1.2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: i * 0.6 }}
        />
      ))}
      {[0, 1, 2].map((i) => (
        <motion.circle
          key={`r-${i}`}
          cx="169"
          cy="84"
          r={10 + i * 6}
          fill="none"
          stroke="#F43F5E"
          strokeWidth="1.2"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 0.5, 0] }}
          transition={{ duration: 2.4, repeat: Infinity, delay: 0.3 + i * 0.6 }}
        />
      ))}

      {/* dancing figure silhouette */}
      <motion.g
        initial={{ y: 0 }}
        animate={{ y: [0, -2, 0] }}
        transition={{ duration: 1.4, repeat: Infinity }}
      >
        <circle cx="100" cy="58" r="4" fill="#0F172A" />
        <path d="M97 62 L96 74 L94 80 M103 62 L104 74 L106 80 M97 64 L92 70 M103 64 L108 68" stroke="#0F172A" strokeWidth="2" strokeLinecap="round" />
      </motion.g>
    </Frame>
  );
}

export function CalendarIllustration({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Frame size={size}>
      <rect x="60" y="38" width="80" height="74" rx="6" fill="#FFF" stroke="#FECDD3" strokeWidth="2" />
      <rect x="60" y="38" width="80" height="16" rx="6" fill="#F43F5E" />
      <rect x="60" y="48" width="80" height="6" fill="#F43F5E" />
      <circle cx="74" cy="32" r="4" fill="#1E293B" />
      <circle cx="126" cy="32" r="4" fill="#1E293B" />
      <rect x="72" y="28" width="4" height="14" rx="1" fill="#1E293B" />
      <rect x="124" y="28" width="4" height="14" rx="1" fill="#1E293B" />
      {/* day grid */}
      {[0, 1, 2, 3, 4].map((row) =>
        [0, 1, 2, 3, 4, 5, 6].map((col) => (
          <circle
            key={`${row}-${col}`}
            cx={68 + col * 11}
            cy={64 + row * 9}
            r="2"
            fill={row === 2 && col === 3 ? "#F43F5E" : "#CBD5E1"}
          />
        )),
      )}
      <motion.circle
        cx="101"
        cy="82"
        r="6"
        fill="none"
        stroke="#F43F5E"
        strokeWidth="2"
        initial={{ scale: 0.8, opacity: 0.6 }}
        animate={{ scale: [0.8, 1.3, 0.8], opacity: [0.6, 0, 0.6] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
    </Frame>
  );
}

export function CityIllustration({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Frame size={size}>
      {/* Copenhagen-ish skyline */}
      <rect x="20" y="80" width="160" height="34" fill="#1E293B" />
      <polygon points="40,80 50,60 60,80" fill="#0F172A" />
      <rect x="44" y="62" width="2" height="14" fill="#FBBF24" />
      <polygon points="46,60 46,55 50,58" fill="#F43F5E" />
      <rect x="68" y="64" width="20" height="16" fill="#475569" />
      <rect x="74" y="58" width="2" height="22" fill="#FBBF24" />
      <rect x="82" y="56" width="2" height="24" fill="#FBBF24" />
      <polygon points="100,80 110,52 120,80" fill="#0F172A" />
      <polygon points="105,58 110,50 115,58" fill="#F43F5E" />
      <rect x="130" y="68" width="22" height="12" fill="#475569" />
      <rect x="158" y="60" width="14" height="20" fill="#0F172A" />
      <rect x="160" y="62" width="2" height="2" fill="#FBBF24" />
      <rect x="166" y="62" width="2" height="2" fill="#FBBF24" />
      <rect x="160" y="68" width="2" height="2" fill="#FBBF24" />
      <rect x="166" y="68" width="2" height="2" fill="#FBBF24" />
      {/* lit windows */}
      {[72, 78, 84, 132, 138, 144, 150].map((x) =>
        [70, 74].map((y) => <rect key={`${x}-${y}`} x={x} y={y} width="2" height="2" fill="#FBBF24" />),
      )}
      {/* rose pin */}
      <motion.g
        initial={{ y: -4, opacity: 0.8 }}
        animate={{ y: [-4, -7, -4] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <circle cx="100" cy="40" r="9" fill="#F43F5E" />
        <circle cx="100" cy="40" r="3" fill="#FFF" />
        <polygon points="93,46 107,46 100,58" fill="#F43F5E" />
      </motion.g>
    </Frame>
  );
}

export function GuestsIllustration({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Frame size={size}>
      {/* small crowd */}
      {[
        { x: 40, c: "#F43F5E" },
        { x: 60, c: "#FBBF24" },
        { x: 80, c: "#1E293B" },
        { x: 100, c: "#F43F5E" },
        { x: 120, c: "#FBBF24" },
        { x: 140, c: "#1E293B" },
        { x: 160, c: "#F43F5E" },
      ].map((p, i) => (
        <motion.g
          key={p.x}
          initial={{ y: 0 }}
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.15 }}
        >
          <circle cx={p.x} cy={68} r="6" fill={p.c} />
          <rect x={p.x - 6} y={74} width="12" height="22" rx="3" fill={p.c} opacity="0.85" />
          <rect x={p.x - 6} y={94} width="5" height="16" rx="1" fill={p.c} opacity="0.7" />
          <rect x={p.x + 1} y={94} width="5" height="16" rx="1" fill={p.c} opacity="0.7" />
        </motion.g>
      ))}
      {/* floor */}
      <rect x="0" y="116" width="200" height="2" fill="#FECDD3" />
    </Frame>
  );
}

export function VibeIllustration({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Frame size={size}>
      <rect x="30" y="80" width="140" height="4" fill="#475569" rx="2" />
      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => {
        const heights = [22, 36, 18, 44, 28, 50, 32, 24, 40, 20];
        const colors = ["#F43F5E", "#FBBF24", "#F43F5E", "#FBBF24", "#F43F5E"];
        return (
          <motion.rect
            key={i}
            x={32 + i * 14}
            y={80 - heights[i]!}
            width="10"
            height={heights[i]}
            rx="2"
            fill={colors[i % colors.length]}
            initial={{ scaleY: 0.6 }}
            animate={{ scaleY: [0.6, 1, 0.6] }}
            transition={{ duration: 1.2 + (i % 3) * 0.3, repeat: Infinity, delay: i * 0.08 }}
            style={{ transformOrigin: `${37 + i * 14}px 80px` }}
          />
        );
      })}
      {/* music notes */}
      <motion.g initial={{ y: 0 }} animate={{ y: [0, -6, 0] }} transition={{ duration: 2, repeat: Infinity }}>
        <text x="40" y="36" fontSize="20" fill="#F43F5E">♪</text>
      </motion.g>
      <motion.g initial={{ y: 0 }} animate={{ y: [0, -8, 0] }} transition={{ duration: 2.2, repeat: Infinity, delay: 0.4 }}>
        <text x="150" y="32" fontSize="20" fill="#FBBF24">♫</text>
      </motion.g>
    </Frame>
  );
}

export function ExtrasIllustration({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Frame size={size}>
      {/* mic */}
      <motion.g
        initial={{ rotate: -4 }}
        animate={{ rotate: [-4, 4, -4] }}
        transition={{ duration: 2.4, repeat: Infinity }}
        style={{ transformOrigin: "100px 70px" }}
      >
        <rect x="92" y="36" width="16" height="34" rx="8" fill="#1E293B" />
        <circle cx="100" cy="44" r="6" fill="#F43F5E" />
        <rect x="98" y="68" width="4" height="38" fill="#475569" />
        <rect x="86" y="104" width="28" height="4" rx="2" fill="#1E293B" />
      </motion.g>
      {/* sparkles */}
      {[
        { x: 50, y: 50, d: 0 },
        { x: 150, y: 56, d: 0.3 },
        { x: 56, y: 96, d: 0.6 },
        { x: 150, y: 96, d: 0.9 },
      ].map((s) => (
        <motion.g
          key={`${s.x}-${s.y}`}
          initial={{ opacity: 0.4, scale: 0.8 }}
          animate={{ opacity: [0.4, 1, 0.4], scale: [0.8, 1.2, 0.8] }}
          transition={{ duration: 1.6, repeat: Infinity, delay: s.d }}
        >
          <path
            d={`M ${s.x} ${s.y - 6} L ${s.x + 1.5} ${s.y - 1.5} L ${s.x + 6} ${s.y} L ${s.x + 1.5} ${s.y + 1.5} L ${s.x} ${s.y + 6} L ${s.x - 1.5} ${s.y + 1.5} L ${s.x - 6} ${s.y} L ${s.x - 1.5} ${s.y - 1.5} Z`}
            fill="#FBBF24"
          />
        </motion.g>
      ))}
    </Frame>
  );
}

export function BudgetIllustration({
  variant,
  size = "md",
}: {
  variant: "tight" | "comfortable" | "premium";
  size?: "sm" | "md" | "lg";
}) {
  const cfg = {
    tight: { coins: 1, jar: "#FECDD3" },
    comfortable: { coins: 3, jar: "#FBBF24" },
    premium: { coins: 5, jar: "#F43F5E" },
  } as const;
  const { coins, jar } = cfg[variant];
  return (
    <Frame size={size}>
      {/* jar */}
      <path
        d="M 70 64 L 70 110 Q 70 116 76 116 L 124 116 Q 130 116 130 110 L 130 64"
        fill={jar}
        opacity="0.55"
        stroke="#1E293B"
        strokeWidth="2"
      />
      <rect x="66" y="58" width="68" height="8" rx="2" fill="#1E293B" />
      {Array.from({ length: coins }).map((_, i) => (
        <motion.circle
          key={i}
          cx={92 + (i % 3) * 12}
          cy={104 - Math.floor(i / 3) * 12}
          r="6"
          fill="#FBBF24"
          stroke="#1E293B"
          strokeWidth="1.5"
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 + i * 0.15, type: "spring" }}
        />
      ))}
      {/* big coin floating */}
      <motion.circle
        cx="100"
        cy="38"
        r="10"
        fill="#FBBF24"
        stroke="#1E293B"
        strokeWidth="2"
        initial={{ y: 0 }}
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      />
      <text x="100" y="42" fontSize="10" textAnchor="middle" fill="#1E293B" fontWeight="bold">DKK</text>
    </Frame>
  );
}

export function ContactIllustration({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Frame size={size}>
      {/* envelope */}
      <motion.g
        initial={{ y: 4 }}
        animate={{ y: [4, 0, 4] }}
        transition={{ duration: 2.4, repeat: Infinity }}
      >
        <rect x="50" y="50" width="100" height="60" rx="6" fill="#FFF" stroke="#1E293B" strokeWidth="2" />
        <path d="M 50 56 L 100 88 L 150 56" stroke="#F43F5E" strokeWidth="2" fill="none" />
        <path d="M 50 110 L 90 80 M 150 110 L 110 80" stroke="#1E293B" strokeWidth="1.5" fill="none" opacity="0.4" />
      </motion.g>
      {/* check */}
      <motion.circle
        cx="148"
        cy="50"
        r="10"
        fill="#10B981"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, delay: 0.4, type: "spring" }}
      />
      <motion.path
        d="M 144 50 L 148 54 L 154 47"
        stroke="#FFF"
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 0.4, delay: 0.7 }}
      />
    </Frame>
  );
}

export function CelebrationIllustration({ size = "lg" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <Frame size={size} className="bg-gradient-to-br from-rose-100 via-amber-50 to-rose-100">
      {/* confetti */}
      {Array.from({ length: 18 }).map((_, i) => {
        const colors = ["#F43F5E", "#FBBF24", "#1E293B", "#FECDD3"];
        const x = 10 + ((i * 23) % 180);
        const delay = (i * 0.12) % 2;
        return (
          <motion.rect
            key={i}
            x={x}
            y={-8}
            width="4"
            height="8"
            rx="1"
            fill={colors[i % colors.length]}
            initial={{ y: -10, rotate: 0 }}
            animate={{ y: 140, rotate: 360 }}
            transition={{ duration: 3 + (i % 4) * 0.4, repeat: Infinity, delay, ease: "linear" }}
          />
        );
      })}
      {/* trophy / heart */}
      <motion.g
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.6, type: "spring" }}
      >
        <circle cx="100" cy="70" r="30" fill="#F43F5E" opacity="0.15" />
        <path
          d="M 100 92 C 78 76, 78 56, 90 56 C 96 56, 100 60, 100 64 C 100 60, 104 56, 110 56 C 122 56, 122 76, 100 92 Z"
          fill="#F43F5E"
        />
      </motion.g>
    </Frame>
  );
}
