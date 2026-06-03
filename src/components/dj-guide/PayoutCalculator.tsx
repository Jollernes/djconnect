import { useState } from "react";
import { motion } from "framer-motion";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";

export function PayoutCalculator() {
  const [price, setPrice] = useState(5000);
  const fee = Math.round((price * PLATFORM_FEE_PERCENT) / 100);
  const payout = price - fee;
  const payoutPct = 100 - PLATFORM_FEE_PERCENT;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between text-xs uppercase tracking-wider text-muted-foreground">
        <span>Bookingpris</span>
        <span>Din udbetaling</span>
      </div>
      <div className="flex items-baseline justify-between">
        <div>
          <div className="text-3xl font-semibold">{price.toLocaleString("da-DK")} kr.</div>
          <div className="text-xs text-muted-foreground">Kunden betaler dette forud</div>
        </div>
        <div className="text-right">
          <motion.div
            key={payout}
            initial={{ scale: 0.96, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20 }}
            className="text-3xl font-semibold text-accent"
          >
            {payout.toLocaleString("da-DK")} kr.
          </motion.div>
          <div className="text-xs text-muted-foreground">{payoutPct}% går til dig</div>
        </div>
      </div>

      <input
        type="range"
        min={500}
        max={25000}
        step={100}
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        className="mt-5 w-full accent-[hsl(21,90%,53%)]"
      />
      <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
        <span>500 kr.</span>
        <span>25.000 kr.</span>
      </div>

      <div className="mt-5 overflow-hidden rounded-full border">
        <div className="flex h-7 text-xs font-semibold text-white">
          <motion.div
            animate={{ width: `${payoutPct}%` }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-center bg-accent"
          >
            {payoutPct}% udbetaling
          </motion.div>
          <motion.div
            animate={{ width: `${PLATFORM_FEE_PERCENT}%` }}
            transition={{ duration: 0.35 }}
            className="flex items-center justify-center bg-muted text-muted-foreground"
          >
            {PLATFORM_FEE_PERCENT}% gebyr
          </motion.div>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
        <Stat label="Platformsgebyr" value={`${fee.toLocaleString("da-DK")} kr.`} />
        <Stat label="Frigives" value="24t efter event" />
        <Stat label="Bankindbetaling" value="2–5 bankdage" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-semibold text-foreground">{value}</div>
    </div>
  );
}
