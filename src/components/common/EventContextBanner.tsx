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

  const verb = variant === "profile" ? "Viewing this DJ for" : variant === "booking" ? "Booking for" : "Browsing DJs for";

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
              {selected ? selected.label : "Any event"}
              {selected && variant === "search" && (
                <span className="ml-2 hidden text-sm font-normal text-muted-foreground sm:inline">
                  · DJ profiles tailored for {selected.longLabel}
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
            Change event
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
              <span className="hidden sm:inline">Browse all</span>
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
            ? "Change the event you're booking"
            : variant === "profile"
              ? "Change the event you're planning"
              : "Change your event"
        }
        description={
          variant === "booking"
            ? "Switching events may change pricing and what the DJ brings — confirm before continuing."
            : "We'll re-tailor the DJ profiles you see to match."
        }
      />
    </>
  );
}
