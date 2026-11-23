import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mail,
  FileText,
  CreditCard,
  Calendar,
  PartyPopper,
  Banknote,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type Stage = {
  id: string;
  icon: LucideIcon;
  title: string;
  body: string;
  party: "customer" | "dj" | "platform";
};

const STAGES: Stage[] = [
  { id: "request", icon: Mail, title: "Bookingforespørgsel", body: "Kunden sender dig eventdetaljer. Du får en e-mail + dashboard-notifikation. Du har 24 timer til at svare.", party: "customer" },
  { id: "quote", icon: FileText, title: "Tilbud / Accept", body: "Du accepterer enten til din angivne pris eller svarer med et skræddersyet tilbud. Kunden gennemgår det.", party: "dj" },
  { id: "payment", icon: CreditCard, title: "Betaling i escrow", body: "Kunden betaler hele beløbet via Stripe. Pengene holdes i escrow — endnu ikke dine.", party: "customer" },
  { id: "confirmed", icon: Calendar, title: "Bekræftet", body: "Bookingen vises i begge dashboards. Brug beskeder på platformen til at koordinere logistik.", party: "platform" },
  { id: "event", icon: PartyPopper, title: "Eventdag", body: "Du møder op, leverer et godt sæt, og kunden markerer eventet som gennemført (eller vi gør det automatisk).", party: "dj" },
  { id: "payout", icon: Banknote, title: "Udbetaling frigivet", body: "24 timer efter eventet udbetaler Stripe 90% til din tilknyttede bankkonto. DJConnect tager et gebyr på 10%.", party: "platform" },
];

const partyStyles = {
  customer: "bg-sky-100 text-sky-700 dark:bg-sky-900/40 dark:text-sky-300",
  dj: "bg-accent/15 text-accent",
  platform: "bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-300",
};

export function BookingFlowDemo() {
  const [active, setActive] = useState(0);
  const stage = STAGES[active]!;

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-sm">
      <ol className="flex items-start justify-between gap-1">
        {STAGES.map((s, i) => {
          const selected = i === active;
          const done = i < active;
          const Icon = s.icon;
          return (
            <li key={s.id} className="relative flex-1">
              <button
                type="button"
                onClick={() => setActive(i)}
                className="group flex w-full flex-col items-center gap-1"
              >
                <span
                  className={cn(
                    "relative flex h-9 w-9 items-center justify-center rounded-full border-2 transition-all",
                    selected && "border-accent bg-accent text-accent-foreground shadow-lg shadow-accent/30",
                    !selected && done && "border-accent/60 bg-accent/15 text-accent",
                    !selected && !done && "border-muted-foreground/30 text-muted-foreground",
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {selected && (
                    <motion.span
                      layoutId="bookingFlowPing"
                      className="absolute -inset-1 rounded-full border-2 border-accent/40"
                    />
                  )}
                </span>
                <span className={cn("hidden text-[10px] font-medium md:block", selected ? "text-foreground" : "text-muted-foreground")}>
                  {s.title.split(" ")[0]}
                </span>
              </button>
              {i < STAGES.length - 1 && (
                <span
                  aria-hidden
                  className={cn(
                    "absolute left-1/2 top-4 h-0.5 w-full -translate-y-1/2",
                    i < active ? "bg-accent/60" : "bg-muted",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>

      <motion.div
        key={stage.id}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-6 rounded-xl border bg-muted/30 p-4"
      >
        <div className="flex items-center gap-2">
          <span className={cn("rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide", partyStyles[stage.party])}>
            {stage.party === "dj" ? "Din handling" : stage.party === "customer" ? "Kundens handling" : "Platform"}
          </span>
          <span className="text-sm font-semibold">{stage.title}</span>
        </div>
        <p className="mt-2 text-sm text-muted-foreground">{stage.body}</p>
      </motion.div>

      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
        <button
          type="button"
          className="underline-offset-4 hover:underline disabled:opacity-50"
          onClick={() => setActive((a) => Math.max(a - 1, 0))}
          disabled={active === 0}
        >
          ← Forrige trin
        </button>
        <button
          type="button"
          className="underline-offset-4 hover:underline disabled:opacity-50"
          onClick={() => setActive((a) => Math.min(a + 1, STAGES.length - 1))}
          disabled={active === STAGES.length - 1}
        >
          Næste trin →
        </button>
      </div>
    </div>
  );
}
