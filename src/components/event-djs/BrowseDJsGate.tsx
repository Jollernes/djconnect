import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MapPin, Search } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EventTypeGrid } from "@/components/common/EventTypeGrid";
import { readPersistedEventType } from "@/hooks/useEventContext";
import { slugForEventType } from "@/lib/eventDJsContent";

const EVENT_TYPE_STORAGE_KEY = "djconnect.eventType";

/**
 * Event the listing page (or anything else) dispatches to ask the header
 * to open the Browse-DJs gate. Optional payload pre-fills the gate with
 * the user's current selection (e.g. the city they're already filtered
 * by, so the "Change" link re-opens the gate with that city visible).
 */
export const BROWSE_GATE_EVENT = "djconnect:open-browse-djs-gate";

export type OpenBrowseGateDetail = {
  eventTypeId?: string;
  city?: string;
  date?: string;
};

export function openBrowseDJsGate(detail: OpenBrowseGateDetail = {}) {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<OpenBrowseGateDetail>(BROWSE_GATE_EVENT, { detail }),
  );
}

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Pre-fill values. */
  initial?: OpenBrowseGateDetail;
};

/**
 * Modal gate the customer passes through whenever they click "Browse DJs".
 * Collects event type (required), city (required) and an optional date.
 * On submit, redirects to the event-specific listing page with the city
 * and date carried in the URL.
 */
export function BrowseDJsGate({ open, onOpenChange, initial }: Props) {
  const navigate = useNavigate();

  const [eventTypeId, setEventTypeIdLocal] = useState<string>(
    initial?.eventTypeId ?? readPersistedEventType() ?? "",
  );
  const [city, setCity] = useState<string>(initial?.city ?? "");
  const [date, setDate] = useState<string>(initial?.date ?? "");
  const [submitted, setSubmitted] = useState(false);

  // Reset to whatever the opener passed in whenever the modal opens.
  useEffect(() => {
    if (!open) return;
    setEventTypeIdLocal(initial?.eventTypeId ?? readPersistedEventType() ?? "");
    setCity(initial?.city ?? "");
    setDate(initial?.date ?? "");
    setSubmitted(false);
  }, [open, initial?.eventTypeId, initial?.city, initial?.date]);

  const cityTrimmed = city.trim();
  const canContinue = Boolean(eventTypeId) && cityTrimmed.length >= 2;

  function handleContinue() {
    setSubmitted(true);
    if (!canContinue) return;
    // Mirror the choice into sessionStorage so the rest of the app
    // (header "Browse DJs" link, hero "Switch event" modal, etc.) reflects
    // it. We bypass useEventContext's setParams to avoid writing
    // `?eventType=` to the current URL right before we navigate away.
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(EVENT_TYPE_STORAGE_KEY, eventTypeId);
    }
    const slug = slugForEventType(eventTypeId);
    const next = new URLSearchParams();
    next.set("city", cityTrimmed);
    if (date) next.set("date", date);
    onOpenChange(false);
    navigate(`/${slug}?${next.toString()}`);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl">
            Find DJs til dit event
          </DialogTitle>
          <DialogDescription>
            Fortæl os lidt om eventet — vi viser kun DJs, der er ledige til den rette
            slags event i dit område.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <div>
            <Label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              Eventtype
              <span className="ml-1 normal-case tracking-normal text-rose-600">*</span>
            </Label>
            <EventTypeGrid
              value={eventTypeId}
              onChange={setEventTypeIdLocal}
              showDescription
              className="mt-2"
            />
            {submitted && !eventTypeId && (
              <p className="mt-1 text-xs text-rose-600">Vælg en eventtype for at fortsætte.</p>
            )}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label
                htmlFor="browse-gate-city"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                By
                <span className="ml-1 normal-case tracking-normal text-rose-600">*</span>
              </Label>
              <div className="relative mt-2">
                <MapPin className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="browse-gate-city"
                  placeholder="f.eks. København, Aarhus, Odense"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="pl-9"
                  autoComplete="address-level2"
                />
              </div>
              {submitted && cityTrimmed.length < 2 && (
                <p className="mt-1 text-xs text-rose-600">
                  Angiv byen eller området, hvor eventet afholdes.
                </p>
              )}
            </div>

            <div>
              <Label
                htmlFor="browse-gate-date"
                className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground"
              >
                Dato <span className="ml-1 text-muted-foreground/70">(valgfrit)</span>
              </Label>
              <div className="relative mt-2">
                <Calendar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="browse-gate-date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-9"
                />
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">
                Tilføj en dato for at filtrere DJs fra, der allerede er booket den aften.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Annullér
          </Button>
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            className="rounded-full"
          >
            <Search className="h-4 w-4" /> Find DJs
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
