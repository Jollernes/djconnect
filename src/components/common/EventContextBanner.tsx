import { useState } from "react";
import { Pencil, X, PartyPopper } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getEventTypeOption } from "@/lib/eventTypeOptions";
import { EventContextModal } from "./EventContextModal";

type Props = {
  eventTypeId: string;
  onChange: (id: string) => void;
  /** Where this banner is rendered — affects copy. */
  variant?: "search" | "profile" | "booking";
  className?: string;
};

export function EventContextBanner({ eventTypeId, onChange, variant = "search", className }: Props) {
  const [open, setOpen] = useState(false);
  const selected = getEventTypeOption(eventTypeId);

  const verb = variant === "profile" ? "Ser denne DJ til" : variant === "booking" ? "Booker til" : "Finder DJs til";

  return (
    <>
      <div
        className={cn(
          "flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl border bg-card px-4 py-3 sm:px-5",
          selected ? "border-accent/30 bg-gradient-to-r from-accent/5 to-transparent" : "",
          className,
        )}
      >
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {selected ? (
            <span
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br",
                selected.tint,
              )}
            >
              <selected.Icon className="h-5 w-5" />
            </span>
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-muted text-muted-foreground">
              <PartyPopper className="h-5 w-5" />
            </span>
          )}
          <div className="min-w-0">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {verb}
            </div>
            <div className="truncate text-base font-semibold leading-tight sm:text-lg">
              {selected ? selected.label : "Alle events"}
              {selected && variant === "search" && (
                <span className="ml-2 hidden text-sm font-normal text-muted-foreground sm:inline">
                  · DJ-profiler tilpasset {selected.longLabel}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setOpen(true)}
            className="rounded-full"
          >
            <Pencil className="h-3.5 w-3.5" />
            Skift event
          </Button>
          {selected && variant === "search" && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => onChange("")}
              className="rounded-full text-muted-foreground"
            >
              <X className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Se alle</span>
            </Button>
          )}
        </div>
      </div>

      <EventContextModal
        open={open}
        onOpenChange={setOpen}
        value={eventTypeId}
        onSelect={onChange}
        onBrowseAll={() => onChange("")}
        title={
          variant === "booking"
            ? "Skift det event, du booker til"
            : variant === "profile"
              ? "Skift det event, du planlægger"
              : "Skift dit event"
        }
        description={
          variant === "booking"
            ? "At skifte event kan ændre prisen og hvad DJ'en tager med — bekræft før du fortsætter."
            : "Vi tilpasser de DJ-profiler, du ser, så de matcher."
        }
      />
    </>
  );
}
