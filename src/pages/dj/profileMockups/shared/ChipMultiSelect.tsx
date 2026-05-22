import { useEffect, useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Reusable chip-multi-select field. Rendered as a single bordered control
 * containing the selected items as chips with × buttons and a caret on
 * the right that opens a small dropdown menu of un-selected suggestions.
 *
 * Matches the "Musikstilarter" and "Særlige ydelser" fields in the user's
 * reference screenshot.
 */
export function ChipMultiSelect({
  value,
  options,
  onChange,
  placeholder,
}: {
  value: string[];
  options: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  function toggle(option: string) {
    if (value.includes(option)) {
      onChange(value.filter((v) => v !== option));
    } else {
      onChange([...value, option]);
    }
  }

  const remainingOptions = options.filter((o) => !value.includes(o));

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex min-h-[42px] w-full items-center gap-1.5 rounded-lg border border-input bg-white px-2 py-1.5 text-sm",
          "focus-within:ring-2 focus-within:ring-ring",
        )}
      >
        <div className="flex flex-1 flex-wrap items-center gap-1.5">
          {value.length === 0 && placeholder && (
            <span className="px-1 text-muted-foreground">{placeholder}</span>
          )}
          {value.map((v) => (
            <span
              key={v}
              className="inline-flex items-center gap-1 rounded-full border border-border bg-muted/50 px-2.5 py-0.5 text-xs font-medium"
              onClick={(e) => e.stopPropagation()}
            >
              {v}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggle(v);
                }}
                className="rounded-full p-0.5 text-muted-foreground hover:bg-foreground/10 hover:text-foreground"
                aria-label={`Fjern ${v}`}
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
      </button>
      {open && remainingOptions.length > 0 && (
        <div className="absolute left-0 right-0 z-30 mt-1 max-h-56 overflow-y-auto rounded-lg border bg-popover p-1 text-sm shadow-md">
          {remainingOptions.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => toggle(o)}
              className="block w-full rounded-md px-2.5 py-1.5 text-left hover:bg-muted"
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
