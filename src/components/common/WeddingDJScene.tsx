import { cn } from "@/lib/utils";

type Props = { className?: string };

// Self-contained animated SVG illustration of a DJ playing at a wedding reception.
// Pure inline SVG + CSS animations — no JS state, no runtime deps.
export function WeddingDJScene({ className }: Props) {
  return (
    <div
      className={cn(
        "relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-white/10 bg-[#0b1220] shadow-2xl",
        className,
      )}
      role="img"
      aria-label="Animated DJ playing at a wedding reception"
    >
      <style>{`
        /* Multi-rhythm timing:
           --beat:  kick drum (0.5s)
           --half:  swing (1s)
           --bar:   phrasing (2s)
           --breath breathing / slow bob (4s) */
        .djs-wrap { --beat: .5s; --half: 1s; --bar: 2s; --breath: 4s; }

        @keyframes djs-spin    { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes djs-bob     { 0%,100% { transform: translateY(0); }    45% { transform: translateY(-1.6px); } 55% { transform: translateY(-2.2px); } }
        @keyframes djs-sway    { 0%,100% { transform: translateX(-1.2px) rotate(-1.2deg); } 50% { transform: translateX(1.2px) rotate(1.2deg); } }
        @keyframes djs-shoulderL { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-1.2px) rotate(-3deg); } }
        @keyframes djs-shoulderR { 0%,100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-1.2px) rotate(3deg); } }
        @keyframes djs-armFader { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-3px); } }
        @keyframes djs-armJog   { 0%,100% { transform: rotate(-6deg); } 50% { transform: rotate(8deg); } }
        @keyframes djs-fingers  { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.2px); } }
        @keyframes djs-mouth    { 0%,55% { transform: scaleY(1); }   60%,90% { transform: scaleY(0.4); } 100% { transform: scaleY(1); } }
        @keyframes djs-blink    { 0%,92%,100% { transform: scaleY(1); } 95%,97% { transform: scaleY(.05); } }
        @keyframes djs-breathe  { 0%,100% { transform: scaleY(1); } 50% { transform: scaleY(1.02); } }
        @keyframes djs-fader    { 0%,100% { transform: translateX(0); } 50% { transform: translateX(3px); } }

        @keyframes djs-beamL    { 0%,100% { transform: rotate(-22deg); } 50% { transform: rotate(-4deg); } }
        @keyframes djs-beamR    { 0%,100% { transform: rotate(22deg); }  50% { transform: rotate(4deg); } }
        @keyframes djs-bassPulse{ 0%,100% { transform: scale(1); opacity:.55; } 50% { transform: scale(1.15); opacity:.9; } }
        @keyframes djs-eq       { 0%,100% { transform: scaleY(.2); } 50% { transform: scaleY(1); } }
        @keyframes djs-twinkle  { 0%,100% { opacity: .25; } 50% { opacity: 1; } }
        @keyframes djs-confetti { 0% { transform: translateY(-10%) rotate(0deg); opacity: 0; }
                                  15% { opacity: 1; }
                                  100% { transform: translateY(110%) rotate(720deg); opacity: 0; } }
        @keyframes djs-hearts   { 0% { transform: translateY(0) scale(.9); opacity: 0; }
                                  20% { opacity: .9; }
                                  100% { transform: translateY(-70px) scale(1.1); opacity: 0; } }
        @keyframes djs-float    { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        @keyframes djs-headTilt { 0%,100% { transform: rotate(-2deg); } 50% { transform: rotate(2deg); } }
        @keyframes djs-coupleSway { 0%,100% { transform: rotate(-3deg) translateX(0); } 50% { transform: rotate(3deg) translateX(1px); } }
        @keyframes djs-dressFlow  { 0%,100% { transform: skewX(-3deg); } 50% { transform: skewX(3deg); } }
        @keyframes djs-pulse    { 0%,100% { opacity: .6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.08); } }
        @keyframes djs-crowdBob { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-1.5px); } }

        .djs-deck        { transform-origin: center; animation: djs-spin 2.6s linear infinite; }
        .djs-deckSlow    { transform-origin: center; animation: djs-spin 3.6s linear infinite; }

        .djs-body        { transform-origin: 200px 175px; animation: djs-sway var(--bar) ease-in-out infinite; }
        .djs-torso       { transform-origin: 200px 175px; animation: djs-bob var(--half) ease-in-out infinite, djs-breathe var(--breath) ease-in-out infinite; }
        .djs-head        { transform-origin: 200px 118px; animation: djs-headTilt 3s ease-in-out infinite; }
        .djs-headBob     { transform-origin: 200px 118px; animation: djs-bob var(--half) ease-in-out infinite; }
        .djs-shoulderL   { transform-origin: 178px 158px; animation: djs-shoulderL var(--half) ease-in-out infinite; }
        .djs-shoulderR   { transform-origin: 222px 158px; animation: djs-shoulderR var(--half) ease-in-out infinite; }
        .djs-armFader    { animation: djs-armFader var(--half) ease-in-out infinite; }
        .djs-armJog      { transform-origin: 222px 158px; animation: djs-armJog var(--half) ease-in-out infinite; }
        .djs-fingersL    { animation: djs-fingers var(--half) ease-in-out infinite; animation-delay: .1s; }
        .djs-fader       { animation: djs-fader var(--half) ease-in-out infinite; }
        .djs-mouth       { transform-origin: center; transform-box: fill-box; animation: djs-mouth 1.4s ease-in-out infinite; }
        .djs-eyeL, .djs-eyeR { transform-origin: center; transform-box: fill-box; animation: djs-blink 5.5s ease-in-out infinite; }

        .djs-beamL       { transform-origin: 90px 40px;  animation: djs-beamL 3.2s ease-in-out infinite; }
        .djs-beamR       { transform-origin: 310px 40px; animation: djs-beamR 3.2s ease-in-out infinite; animation-delay: .4s; }
        .djs-disco       { transform-origin: 200px 40px; animation: djs-spin 7s linear infinite; }
        .djs-sparkle     { animation: djs-twinkle 1.4s ease-in-out infinite; }

        .djs-coupleL     { transform-origin: 88px 278px;  animation: djs-coupleSway 2.4s ease-in-out infinite; }
        .djs-coupleR     { transform-origin: 312px 278px; animation: djs-coupleSway 2.4s ease-in-out infinite; animation-delay: .7s; }
        .djs-dressA      { transform-origin: top center; transform-box: fill-box; animation: djs-dressFlow 2.4s ease-in-out infinite; }
        .djs-dressB      { transform-origin: top center; transform-box: fill-box; animation: djs-dressFlow 2.4s ease-in-out infinite; animation-delay: .7s; }

        .djs-eq > rect   { transform-origin: bottom; animation: djs-eq .7s ease-in-out infinite; }
        .djs-eq > rect:nth-child(1) { animation-delay: 0s; }
        .djs-eq > rect:nth-child(2) { animation-delay: .08s; }
        .djs-eq > rect:nth-child(3) { animation-delay: .16s; }
        .djs-eq > rect:nth-child(4) { animation-delay: .24s; }
        .djs-eq > rect:nth-child(5) { animation-delay: .32s; }
        .djs-eq > rect:nth-child(6) { animation-delay: .40s; }
        .djs-eq > rect:nth-child(7) { animation-delay: .48s; }
        .djs-eq > rect:nth-child(8) { animation-delay: .56s; }
        .djs-eq > rect:nth-child(9) { animation-delay: .64s; }
        .djs-eq > rect:nth-child(10){ animation-delay: .72s; }

        .djs-speakerL    { transform-origin: 40px 240px;  animation: djs-bassPulse var(--half) ease-in-out infinite; }
        .djs-speakerR    { transform-origin: 360px 240px; animation: djs-bassPulse var(--half) ease-in-out infinite; animation-delay: .05s; }
        .djs-beatL       { animation: djs-twinkle var(--half) ease-in-out infinite; }
        .djs-beatR       { animation: djs-twinkle var(--half) ease-in-out infinite; animation-delay: .25s; }

        .djs-crowd g     { transform-origin: bottom; animation: djs-crowdBob var(--half) ease-in-out infinite; }
        .djs-crowd g:nth-child(odd)  { animation-delay: .1s; }
        .djs-crowd g:nth-child(even) { animation-delay: .3s; }

        .djs-confetti span {
          position: absolute; top: 0; width: 6px; height: 10px; border-radius: 2px;
          animation: djs-confetti 4.5s linear infinite;
        }
        .djs-heart { position: absolute; font-size: 14px; animation: djs-hearts 3.6s ease-out infinite; opacity: 0; }
        .djs-float { animation: djs-float 3.2s ease-in-out infinite; }

        @media (prefers-reduced-motion: reduce) {
          .djs-wrap *, .djs-wrap *::before, .djs-wrap *::after { animation: none !important; }
        }
      `}</style>

      <div className="djs-wrap absolute inset-0">
        {/* Ambient gradient */}
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at 50% 20%, hsla(21,90%,53%,.25), transparent 55%), radial-gradient(ellipse at 20% 80%, hsla(280,85%,60%,.35), transparent 55%), radial-gradient(ellipse at 80% 80%, hsla(199,89%,60%,.25), transparent 55%), linear-gradient(180deg, #0b1220 0%, #17223d 60%, #1a1140 100%)",
          }}
        />

        {/* Fairy lights string across the top */}
        <div aria-hidden className="pointer-events-none absolute left-0 right-0 top-3 flex justify-between px-4">
          {Array.from({ length: 16 }).map((_, i) => (
            <span
              key={i}
              className="djs-sparkle h-2 w-2 rounded-full"
              style={{
                background: i % 2 === 0 ? "hsl(48,95%,60%)" : "hsl(21,90%,60%)",
                boxShadow: i % 2 === 0 ? "0 0 8px hsl(48,95%,60%)" : "0 0 8px hsl(21,90%,60%)",
                animationDelay: `${(i * 120) % 1400}ms`,
              }}
            />
          ))}
        </div>

        {/* Confetti */}
        <div aria-hidden className="djs-confetti pointer-events-none absolute inset-0">
          {Array.from({ length: 14 }).map((_, i) => (
            <span
              key={i}
              style={{
                left: `${(i * 73) % 100}%`,
                background: ["#F97316", "#FBBF24", "#A855F7", "#38BDF8", "#F472B6"][i % 5],
                animationDelay: `${(i * 400) % 4500}ms`,
                animationDuration: `${3 + (i % 4)}s`,
              }}
            />
          ))}
        </div>

        {/* Floating hearts */}
        <div aria-hidden className="pointer-events-none absolute inset-0">
          {[
            { left: "18%", bottom: "28%", delay: "0s" },
            { left: "74%", bottom: "32%", delay: "1.1s" },
            { left: "50%", bottom: "45%", delay: "2.1s" },
          ].map((h, i) => (
            <span key={i} className="djs-heart text-pink-300" style={{ left: h.left, bottom: h.bottom, animationDelay: h.delay }}>
              ♥
            </span>
          ))}
        </div>

        {/* Core scene */}
        <svg viewBox="0 0 400 300" className="absolute inset-0 h-full w-full" preserveAspectRatio="xMidYMid slice">
          <defs>
            <linearGradient id="djs-floor" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#1a1140" stopOpacity="0" />
              <stop offset="100%" stopColor="#0b1220" stopOpacity="1" />
            </linearGradient>
            <radialGradient id="djs-spot" cx="50%" cy="0%" r="60%">
              <stop offset="0%" stopColor="hsl(21,95%,62%)" stopOpacity=".45" />
              <stop offset="100%" stopColor="hsl(21,95%,62%)" stopOpacity="0" />
            </radialGradient>
            <radialGradient id="djs-spot2" cx="50%" cy="0%" r="60%">
              <stop offset="0%" stopColor="hsl(280,85%,70%)" stopOpacity=".45" />
              <stop offset="100%" stopColor="hsl(280,85%,70%)" stopOpacity="0" />
            </radialGradient>
            <linearGradient id="djs-arch" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fde68a" />
              <stop offset="100%" stopColor="#f472b6" />
            </linearGradient>
            <linearGradient id="djs-shirt" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#0f172a" />
              <stop offset="100%" stopColor="#1e293b" />
            </linearGradient>
            <linearGradient id="djs-dressA" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#ffffff" />
              <stop offset="100%" stopColor="#e2e8f0" />
            </linearGradient>
            <radialGradient id="djs-cheek" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#f87171" stopOpacity=".45" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Stage light beams */}
          <g className="djs-beamL">
            <polygon points="90,40 40,280 140,280" fill="url(#djs-spot)" />
          </g>
          <g className="djs-beamR">
            <polygon points="310,40 260,280 360,280" fill="url(#djs-spot2)" />
          </g>

          {/* Disco ball */}
          <g className="djs-float">
            <line x1="200" y1="0" x2="200" y2="22" stroke="#cbd5e1" strokeWidth="1" />
            <g className="djs-disco">
              <circle cx="200" cy="38" r="16" fill="#cbd5e1" />
              <circle cx="200" cy="38" r="16" fill="url(#djs-spot2)" />
              {Array.from({ length: 6 }).map((_, i) => (
                <line
                  key={i}
                  x1={200 + Math.cos((i * Math.PI) / 3) * 4}
                  y1={38 + Math.sin((i * Math.PI) / 3) * 4}
                  x2={200 + Math.cos((i * Math.PI) / 3) * 16}
                  y2={38 + Math.sin((i * Math.PI) / 3) * 16}
                  stroke="#94a3b8"
                  strokeWidth="0.6"
                />
              ))}
            </g>
            {[
              { x: 170, y: 28, d: "0s" },
              { x: 230, y: 32, d: ".6s" },
              { x: 184, y: 56, d: "1.1s" },
              { x: 220, y: 58, d: ".3s" },
            ].map((s, i) => (
              <g key={i} className="djs-sparkle" style={{ animationDelay: s.d }}>
                <circle cx={s.x} cy={s.y} r="1.4" fill="#fde68a" />
              </g>
            ))}
          </g>

          {/* Wedding arch backdrop */}
          <g opacity="0.9">
            <path d="M 60 280 Q 60 150, 200 140 Q 340 150, 340 280" fill="none" stroke="url(#djs-arch)" strokeWidth="3" />
            {[
              [70, 210], [78, 190], [92, 168], [115, 150], [150, 142],
              [200, 140], [250, 142], [285, 150], [308, 168], [322, 190], [330, 210],
            ].map(([x, y], i) => (
              <g key={i} transform={`translate(${x} ${y})`}>
                <circle r="4" fill={i % 2 === 0 ? "#f9a8d4" : "#fde68a"} />
                <circle r="1.6" fill="#9f1239" />
              </g>
            ))}
          </g>

          {/* Seated crowd silhouettes along the back */}
          <g className="djs-crowd" opacity="0.55">
            {[50, 118, 164, 236, 282, 350].map((x, i) => (
              <g key={i} transform={`translate(${x} 252)`}>
                <circle r="5" fill="#0f172a" />
                <rect x="-7" y="5" width="14" height="18" rx="3" fill="#0f172a" />
              </g>
            ))}
          </g>

          {/* Dancefloor couple — left */}
          <Couple x={86} suitColor="#0f172a" dressClass="djs-dressA" rootClass="djs-coupleL" />

          {/* Dancefloor couple — right */}
          <Couple x={312} suitColor="#111827" dressClass="djs-dressB" rootClass="djs-coupleR" dressTone="#fce7f3" />

          {/* Speakers */}
          <g className="djs-speakerL">
            <rect x="28" y="200" width="36" height="70" rx="4" fill="#1f2937" stroke="#334155" />
            <circle cx="46" cy="220" r="7" fill="#0f172a" stroke="#475569" />
            <circle cx="46" cy="220" r="3" fill="#f97316" />
            <circle cx="46" cy="250" r="11" fill="#0f172a" stroke="#475569" />
            <circle cx="46" cy="250" r="5" fill="#f97316" />
          </g>
          <g className="djs-speakerR">
            <rect x="336" y="200" width="36" height="70" rx="4" fill="#1f2937" stroke="#334155" />
            <circle cx="354" cy="220" r="7" fill="#0f172a" stroke="#475569" />
            <circle cx="354" cy="220" r="3" fill="#f97316" />
            <circle cx="354" cy="250" r="11" fill="#0f172a" stroke="#475569" />
            <circle cx="354" cy="250" r="5" fill="#f97316" />
          </g>

          {/* ---------- DJ character ---------- */}
          <g className="djs-body">
            {/* Torso behind the booth — body + breathing */}
            <g className="djs-torso">
              {/* Shirt */}
              <path d="M170 170 C 170 150 176 136 200 124 C 224 136 230 150 230 170 Z" fill="url(#djs-shirt)" />
              {/* Neckline + accent stripe across chest */}
              <path d="M170 170 L 230 170 L 230 167 L 170 167 Z" fill="#f97316" opacity="0.95" />
              <path d="M196 124 L 204 124 L 202 138 L 198 138 Z" fill="#0b1220" />
              {/* Neck */}
              <rect x="195" y="111" width="10" height="11" rx="2" fill="#d4a373" />
              {/* Collarbone shadow */}
              <path d="M188 126 Q 200 130, 212 126" stroke="#0b1220" strokeWidth="1" fill="none" opacity="0.5" />

              {/* Left shoulder group (viewer's left = DJ's right hand on jog wheel) */}
              <g className="djs-shoulderL">
                {/* Upper arm */}
                <path d="M176 155 C 170 162 166 172 168 180" stroke="#d4a373" strokeWidth="8" strokeLinecap="round" fill="none" />
                {/* Forearm + hand onto decks (left turntable) */}
                <g className="djs-fingersL">
                  <path d="M168 180 C 168 184 172 187 180 186" stroke="#d4a373" strokeWidth="7" strokeLinecap="round" fill="none" />
                  {/* Hand / palm */}
                  <ellipse cx="183" cy="186" rx="5" ry="3.5" fill="#d4a373" />
                  {/* Fingers — 3 tiny lines */}
                  <path d="M186 185 L 190 184 M186 187 L 190 188 M186 189 L 189 190" stroke="#a27247" strokeWidth="0.8" strokeLinecap="round" />
                </g>
                {/* Wristwatch */}
                <rect x="174" y="182" width="4" height="3" rx="1" fill="#fbbf24" />
                {/* Sleeve detail */}
                <path d="M176 155 C 172 158 169 164 170 168" stroke="#0b1220" strokeWidth="1" fill="none" opacity="0.6" />
              </g>

              {/* Right shoulder group (viewer's right = DJ's left hand on fader) */}
              <g className="djs-shoulderR">
                {/* Upper arm rotates a bit with the jog wheel */}
                <g className="djs-armJog">
                  <path d="M224 155 C 230 162 233 170 232 178" stroke="#d4a373" strokeWidth="8" strokeLinecap="round" fill="none" />
                </g>
                {/* Forearm — up-down on fader */}
                <g className="djs-armFader">
                  <path d="M232 178 C 232 182 228 186 222 186" stroke="#d4a373" strokeWidth="7" strokeLinecap="round" fill="none" />
                  <ellipse cx="219" cy="186" rx="5" ry="3.5" fill="#d4a373" />
                  <path d="M216 185 L 213 183 M216 187 L 213 187 M216 189 L 214 190" stroke="#a27247" strokeWidth="0.8" strokeLinecap="round" />
                </g>
              </g>
            </g>

            {/* Head — slow tilt combined with bob */}
            <g className="djs-headBob">
              <g className="djs-head">
                {/* Ears */}
                <ellipse cx="187" cy="102" rx="2" ry="3" fill="#d4a373" />
                <ellipse cx="213" cy="102" rx="2" ry="3" fill="#d4a373" />
                {/* Face */}
                <path d="M186 106 Q 186 86, 200 86 Q 214 86, 214 106 Q 214 118, 200 120 Q 186 118, 186 106 Z" fill="#e0a881" />
                {/* Jaw line shadow */}
                <path d="M190 114 Q 200 120, 210 114" stroke="#a27247" strokeWidth="0.8" fill="none" opacity="0.5" />
                {/* Hair — swept */}
                <path d="M184 98 C 184 84, 194 78, 200 78 C 210 78, 218 86, 216 100 C 212 90, 202 90, 196 96 C 192 99, 188 101, 184 102 Z" fill="#1e1b4b" />
                {/* Eyebrows */}
                <rect x="189" y="99" width="7" height="1.4" rx="0.7" fill="#1e1b4b" />
                <rect x="204" y="99" width="7" height="1.4" rx="0.7" fill="#1e1b4b" />
                {/* Cheeks */}
                <circle cx="191" cy="111" r="2.2" fill="url(#djs-cheek)" />
                <circle cx="209" cy="111" r="2.2" fill="url(#djs-cheek)" />
                {/* Eyes with blink */}
                <g className="djs-eyeL"><ellipse cx="192" cy="104" rx="1.3" ry="1.4" fill="#0b1220" /></g>
                <g className="djs-eyeR"><ellipse cx="208" cy="104" rx="1.3" ry="1.4" fill="#0b1220" /></g>
                {/* Nose */}
                <path d="M200 106 Q 199 110, 201 112" stroke="#a27247" strokeWidth="0.9" fill="none" strokeLinecap="round" />
                {/* Mouth — open on singing beats */}
                <g className="djs-mouth">
                  <path d="M195 114 Q 200 117, 205 114 Q 200 118, 195 114 Z" fill="#7f1d1d" />
                </g>
                {/* Beard stubble */}
                <path d="M192 116 Q 200 118, 208 116" stroke="#3f2b1a" strokeWidth="0.6" strokeDasharray="0.5 0.8" opacity="0.55" fill="none" />
                {/* Headphones — band */}
                <path d="M182 98 Q 200 74, 218 98" stroke="#0b1220" strokeWidth="3" fill="none" />
                <path d="M183 97 Q 200 75, 217 97" stroke="#334155" strokeWidth="1" fill="none" />
                {/* Ear cups */}
                <rect x="176" y="96" width="10" height="14" rx="3" fill="#0b1220" />
                <rect x="214" y="96" width="10" height="14" rx="3" fill="#0b1220" />
                <rect x="178" y="100" width="6" height="7" rx="2" fill="#f97316" />
                <rect x="216" y="100" width="6" height="7" rx="2" fill="#f97316" />
                {/* Cup highlight */}
                <rect x="179" y="101" width="2" height="2" rx="0.5" fill="#fde68a" opacity="0.8" />
                <rect x="217" y="101" width="2" height="2" rx="0.5" fill="#fde68a" opacity="0.8" />
              </g>
            </g>
          </g>

          {/* ---------- DJ booth ---------- */}
          <g>
            <rect x="140" y="175" width="120" height="55" rx="6" fill="#111827" stroke="#374151" />
            <rect x="140" y="175" width="120" height="10" rx="3" fill="#1f2937" />
            {/* Equalizer booth front */}
            <g className="djs-eq" transform="translate(150 198)">
              {Array.from({ length: 10 }).map((_, i) => (
                <rect key={i} x={i * 10} y={0} width="6" height="22" rx="1" fill={i % 2 === 0 ? "#f97316" : "#38bdf8"} />
              ))}
            </g>
          </g>

          {/* Turntables + mixer (in front of the DJ) */}
          <g transform="translate(156 168)">
            <g className="djs-deck">
              <circle cx="14" cy="14" r="14" fill="#0f172a" stroke="#334155" />
              <circle cx="14" cy="14" r="9" fill="#1f2937" />
              <rect x="13" y="2" width="2" height="12" fill="#f97316" />
              <circle cx="14" cy="14" r="1.6" fill="#fbbf24" />
            </g>
            {/* Tonearm */}
            <path d="M3 3 L 14 14" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="3" cy="3" r="1.5" fill="#94a3b8" />
          </g>
          <g transform="translate(228 168)">
            <g className="djs-deckSlow">
              <circle cx="14" cy="14" r="14" fill="#0f172a" stroke="#334155" />
              <circle cx="14" cy="14" r="9" fill="#1f2937" />
              <rect x="13" y="2" width="2" height="12" fill="#38bdf8" />
              <circle cx="14" cy="14" r="1.6" fill="#fbbf24" />
            </g>
            <path d="M25 3 L 14 14" stroke="#94a3b8" strokeWidth="1" />
            <circle cx="25" cy="3" r="1.5" fill="#94a3b8" />
          </g>
          {/* Center mixer */}
          <g transform="translate(190 170)">
            <rect width="20" height="16" rx="2" fill="#0f172a" stroke="#334155" />
            <rect className="djs-beatL" x="2" y="3" width="3" height="4" fill="#f97316" />
            <rect className="djs-beatR" x="7" y="3" width="3" height="4" fill="#38bdf8" />
            <rect className="djs-beatL" x="12" y="3" width="3" height="4" fill="#fbbf24" />
            {/* Fader track */}
            <rect x="3" y="10" width="14" height="3" rx="1" fill="#334155" />
            {/* Moving fader knob */}
            <g className="djs-fader">
              <rect x="5" y="9" width="3" height="5" rx="1" fill="#fbbf24" />
            </g>
          </g>

          {/* Floor reflection */}
          <rect x="0" y="270" width="400" height="30" fill="url(#djs-floor)" />

          {/* Soft dancefloor glow */}
          <ellipse cx="200" cy="280" rx="160" ry="14" fill="hsl(21,95%,62%)" opacity="0.15" />
        </svg>

        {/* LIVE badge */}
        <div aria-hidden className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-accent/60 bg-background/10 px-3 py-1 backdrop-blur">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500" />
          </span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.28em] text-white">Live · DJConnect</span>
        </div>
      </div>
    </div>
  );
}

function Couple({
  x,
  suitColor,
  dressClass,
  rootClass,
  dressTone = "#f8fafc",
}: {
  x: number;
  suitColor: string;
  dressClass: string;
  rootClass: string;
  dressTone?: string;
}) {
  return (
    <g className={rootClass}>
      {/* Groom */}
      <g transform={`translate(${x} 240)`}>
        {/* Head */}
        <circle cx="0" cy="0" r="6" fill="#f3d5b5" />
        <path d="M-6 -3 Q 0 -8, 6 -3 L 6 0 Q 0 -4, -6 0 Z" fill="#1e1b4b" />
        {/* Torso */}
        <path d="M-6 6 L 6 6 L 8 28 L -8 28 Z" fill={suitColor} />
        {/* Bowtie */}
        <path d="M-3 7 L -5 9 L -3 11 L 0 10 L 3 11 L 5 9 L 3 7 L 0 8 Z" fill="#7f1d1d" />
        {/* Legs */}
        <rect x="-6" y="28" width="4" height="14" fill="#0b1220" />
        <rect x="2" y="28" width="4" height="14" fill="#0b1220" />
        {/* Left arm around bride */}
        <path d="M6 10 Q 14 14, 18 20" stroke="#f3d5b5" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
      {/* Bride */}
      <g transform={`translate(${x + 18} 240)`}>
        <circle cx="0" cy="0" r="6" fill="#f3d5b5" />
        {/* Veil */}
        <path d="M-6 -4 Q 0 -10, 6 -4 Q 4 2, 0 0 Q -4 2, -6 -4 Z" fill="#fde68a" opacity="0.7" />
        {/* Dress with flowing skew animation */}
        <g className={dressClass}>
          <path d="M-7 6 L 7 6 L 11 32 L -11 32 Z" fill={dressTone} stroke="#cbd5e1" strokeWidth="0.5" />
          {/* Waist sash */}
          <rect x="-7" y="14" width="14" height="1.5" fill="#f97316" opacity="0.8" />
        </g>
        {/* Arm around groom */}
        <path d="M-6 10 Q -14 14, -18 20" stroke="#f3d5b5" strokeWidth="3" strokeLinecap="round" fill="none" />
        {/* Bouquet */}
        <circle cx="-14" cy="22" r="3" fill="#f9a8d4" />
        <circle cx="-12" cy="20" r="2" fill="#fde68a" />
      </g>
    </g>
  );
}
