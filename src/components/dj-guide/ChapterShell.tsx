import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

type Props = {
  index: number;
  total: number;
  icon: LucideIcon;
  eyebrow: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
  illustration: React.ReactNode;
  ackLabel?: string;
  acked: boolean;
  onAck: (v: boolean) => void;
  className?: string;
};

export function ChapterShell({
  index,
  total,
  icon: Icon,
  eyebrow,
  title,
  subtitle,
  children,
  illustration,
  ackLabel = "I understand how this works",
  acked,
  onAck,
  className,
}: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className={cn("grid gap-8 p-6 md:p-10 lg:grid-cols-[1fr_1.1fr]", className)}
    >
      <div className="order-2 lg:order-1">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <Icon className="h-5 w-5" />
          </span>
          <span className="text-xs font-semibold uppercase tracking-[0.22em] text-muted-foreground">
            {eyebrow} · Chapter {index + 1} of {total}
          </span>
        </div>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">{subtitle}</p>

        <div className="mt-6 space-y-4">{children}</div>

        <label
          className={cn(
            "mt-8 flex cursor-pointer items-start gap-3 rounded-xl border-2 p-4 transition-colors",
            acked ? "border-accent bg-accent/10" : "border-border hover:border-accent/40",
          )}
        >
          <input
            type="checkbox"
            checked={acked}
            onChange={(e) => onAck(e.target.checked)}
            className="mt-0.5 h-5 w-5 accent-[hsl(21,90%,53%)]"
          />
          <span className="text-sm">
            <span className="font-medium">{ackLabel}</span>
            <span className="mt-0.5 block text-xs text-muted-foreground">
              You can only advance once you've confirmed you've read and understood this chapter.
            </span>
          </span>
        </label>
      </div>

      <div className="order-1 flex items-start justify-center lg:order-2">
        <div className="w-full">{illustration}</div>
      </div>
    </motion.div>
  );
}
