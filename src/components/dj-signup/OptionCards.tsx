import { cn } from "@/lib/utils";
import { Check, type LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

type Option = {
  id: string;
  label: string;
  description?: string;
  icon?: LucideIcon;
  emoji?: string;
};

type Props = {
  options: Option[];
  value: string | string[];
  multiple?: boolean;
  onChange: (value: string | string[]) => void;
  columns?: 2 | 3 | 4;
};

export function OptionCards({ options, value, multiple = false, onChange, columns = 3 }: Props) {
  const isSelected = (id: string) => (multiple ? (value as string[]).includes(id) : value === id);

  const toggle = (id: string) => {
    if (multiple) {
      const arr = value as string[];
      onChange(arr.includes(id) ? arr.filter((v) => v !== id) : [...arr, id]);
    } else {
      onChange(id);
    }
  };

  const gridClass =
    columns === 2 ? "grid-cols-2" : columns === 3 ? "grid-cols-2 md:grid-cols-3" : "grid-cols-2 md:grid-cols-4";

  return (
    <div className={cn("grid gap-3", gridClass)}>
      {options.map((opt) => {
        const selected = isSelected(opt.id);
        const Icon = opt.icon;
        return (
          <motion.button
            key={opt.id}
            type="button"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => toggle(opt.id)}
            className={cn(
              "relative flex flex-col items-start gap-1 rounded-xl border-2 bg-card p-4 text-left transition-colors",
              selected ? "border-accent bg-accent/5" : "border-border hover:border-accent/40",
            )}
          >
            {selected && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full bg-accent text-accent-foreground"
              >
                <Check className="h-3 w-3" />
              </motion.span>
            )}
            {opt.emoji && <span className="text-2xl">{opt.emoji}</span>}
            {Icon && (
              <span className={cn("flex h-9 w-9 items-center justify-center rounded-lg", selected ? "bg-accent/15 text-accent" : "bg-muted text-muted-foreground")}>
                <Icon className="h-5 w-5" />
              </span>
            )}
            <div className="mt-1 text-sm font-semibold">{opt.label}</div>
            {opt.description && <div className="text-xs text-muted-foreground">{opt.description}</div>}
          </motion.button>
        );
      })}
    </div>
  );
}
