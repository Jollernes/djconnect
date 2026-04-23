import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Props {
  /** ISO dates (YYYY-MM-DD) that are unavailable */
  blockedDates?: string[];
  /** ISO dates that are confirmed bookings */
  bookedDates?: string[];
  selectedDate?: string;
  onSelect?: (date: string) => void;
  editable?: boolean;
  onToggleBlock?: (date: string) => void;
}

export function AvailabilityCalendar({
  blockedDates = [],
  bookedDates = [],
  selectedDate,
  onSelect,
  editable = false,
  onToggleBlock,
}: Props) {
  const [viewDate, setViewDate] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const blocked = useMemo(() => new Set(blockedDates), [blockedDates]);
  const booked = useMemo(() => new Set(bookedDates), [bookedDates]);

  const monthLabel = viewDate.toLocaleString("en-GB", { month: "long", year: "numeric" });
  const firstDay = viewDate.getDay() === 0 ? 6 : viewDate.getDay() - 1; // Monday-first
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate();

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function dateISO(day: number) {
    const d = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    return d.toISOString().slice(0, 10);
  }

  return (
    <div className="rounded-lg border bg-card p-4">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h4 className="text-sm font-semibold">{monthLabel}</h4>
        <Button
          variant="ghost"
          size="icon"
          type="button"
          onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs">
        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
          <div key={d} className="py-1 text-muted-foreground">
            {d}
          </div>
        ))}
        {Array.from({ length: firstDay }, (_, i) => (
          <div key={`blank-${i}`} />
        ))}
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const iso = dateISO(day);
          const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
          const isPast = date < today;
          const isBlocked = blocked.has(iso);
          const isBooked = booked.has(iso);
          const isSelected = selectedDate === iso;
          const disabled = isPast || (!editable && (isBlocked || isBooked));
          return (
            <button
              key={iso}
              type="button"
              disabled={disabled}
              onClick={() => {
                if (editable && onToggleBlock && !isBooked) {
                  onToggleBlock(iso);
                } else if (onSelect) {
                  onSelect(iso);
                }
              }}
              className={cn(
                "aspect-square rounded-md text-sm transition-colors",
                "hover:bg-accent/10",
                isPast && "text-muted-foreground/40 line-through",
                isBooked && "bg-success/20 text-success font-medium",
                isBlocked && !isBooked && "bg-destructive/15 text-destructive line-through",
                isSelected && "bg-accent text-accent-foreground",
                disabled && !isSelected && "cursor-not-allowed",
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
      <div className="mt-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-success/40" /> Booked
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-destructive/30" /> Unavailable
        </span>
        <span className="flex items-center gap-1.5">
          <span className="inline-block h-3 w-3 rounded bg-accent" /> Selected
        </span>
      </div>
    </div>
  );
}
