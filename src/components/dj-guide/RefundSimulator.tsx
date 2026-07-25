import { useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

function refundPercent(days: number): number {
  if (days >= 14) return 100;
  if (days >= 7) return 50;
  return 0;
}

export function RefundSimulator() {
  const [days, setDays] = useState(10);
  const pct = refundPercent(days);
  const bookingPrice = 5000;
  const refundAmount = Math.round((bookingPrice * pct) / 100);
  const keptAmount = bookingPrice - refundAmount;

  const band =
    pct === 100 ? { label: "Fuld refundering", color: "bg-emerald-500" }
    : pct === 50 ? { label: "Delvis refundering", color: "bg-amber-500" }
    : { label: "Ingen refundering", color: "bg-red-500" };

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="flex items-center justify-between text-sm">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">Hvis en kunde afbestiller</div>
          <div className="text-lg font-semibold">
            {days} dag{days === 1 ? "" : "e"} før eventet
          </div>
        </div>
        <motion.span
          key={band.label}
          initial={{ scale: 0.9, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          className={cn("rounded-full px-3 py-1 text-xs font-semibold text-white", band.color)}
        >
          {band.label}
        </motion.span>
      </div>

      <input
        type="range"
        min={0}
        max={30}
        step={1}
        value={days}
        onChange={(e) => setDays(Number(e.target.value))}
        className="mt-4 w-full accent-[hsl(21,90%,53%)]"
      />
      <div className="relative mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>0d</span>
        <span>7d</span>
        <span>14d</span>
        <span>30d</span>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-2 text-xs">
        <Stat label="Kunde refunderet" value={`${refundAmount.toLocaleString("da-DK")} kr.`} />
        <Stat label="Beholdt" value={`${keptAmount.toLocaleString("da-DK")} kr.`} highlight />
        <Stat label="Refundering %" value={`${pct}%`} />
      </div>

      <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
        <Row active={days >= 14} label="14+ dage før eventet — 100% refundering" />
        <Row active={days >= 7 && days < 14} label="7–14 dage før eventet — 50% refundering" />
        <Row active={days < 7} label="Mindre end 7 dage — ingen refundering" />
      </ul>
    </div>
  );
}

function Stat({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={cn("rounded-lg border p-2.5", highlight ? "bg-accent/10 border-accent/40" : "bg-muted/30")}>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("mt-0.5 font-semibold", highlight ? "text-accent" : "text-foreground")}>{value}</div>
    </div>
  );
}

function Row({ active, label }: { active: boolean; label: string }) {
  return (
    <li className={cn("flex items-center gap-2", active ? "text-foreground" : "")}>
      <span className={cn("h-1.5 w-1.5 rounded-full", active ? "bg-accent" : "bg-muted-foreground/40")} />
      <span className={active ? "font-medium" : ""}>{label}</span>
    </li>
  );
}
