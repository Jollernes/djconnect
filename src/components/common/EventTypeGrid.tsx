import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { EVENT_TYPE_OPTIONS } from "@/lib/eventTypeOptions";

type Props = {
  value: string;
  onChange: (id: string) => void;
  /** When true, cards are larger and show the description (use in modal). */
  showDescription?: boolean;
  className?: string;
};

export function EventTypeGrid({ value, onChange, showDescription, className }: Props) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", className)}>
      {EVENT_TYPE_OPTIONS.map((option, i) => {
        const isSelected = option.id === value;
        return (
          <motion.button
            key={option.id}
            type="button"
            role="option"
            aria-selected={isSelected}
            onClick={() => onChange(option.id)}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03, duration: 0.18 }}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={cn(
              "group relative flex flex-col items-center gap-1.5 rounded-xl border bg-background p-3 text-center transition",
              isSelected
                ? "border-accent ring-2 ring-accent/40 shadow-sm"
                : "border-border hover:border-foreground/20 hover:shadow-sm",
            )}
          >
            <span
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br",
                option.tint,
              )}
            >
              <option.Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold leading-tight">{option.label}</span>
            {showDescription && (
              <span className="text-[11px] leading-snug text-muted-foreground">
                {option.description}
              </span>
            )}
            {isSelected && (
              <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-accent text-accent-foreground">
                <Check className="h-2.5 w-2.5" />
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}
