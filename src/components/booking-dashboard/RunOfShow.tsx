import { useEffect, useMemo, useState } from "react";
import { Clock, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Slot = { id: string; time: string; label: string };

const DEFAULTS: Record<string, Slot[]> = {
  wedding: [
    { id: "1", time: "16:00", label: "Ceremony / arrival music" },
    { id: "2", time: "18:00", label: "Cocktail hour" },
    { id: "3", time: "19:30", label: "Dinner & speeches" },
    { id: "4", time: "21:00", label: "First dance" },
    { id: "5", time: "21:15", label: "Dancefloor open" },
    { id: "6", time: "00:30", label: "Last song" },
  ],
  birthday: [
    { id: "1", time: "19:00", label: "Guests arriving — chill set" },
    { id: "2", time: "20:30", label: "Cake & toast" },
    { id: "3", time: "21:00", label: "Dancefloor open" },
    { id: "4", time: "23:30", label: "Last song" },
  ],
  corporate_event: [
    { id: "1", time: "18:00", label: "Reception / networking" },
    { id: "2", time: "19:30", label: "Dinner & program" },
    { id: "3", time: "21:00", label: "Dancefloor open" },
    { id: "4", time: "00:00", label: "Closing" },
  ],
  default: [
    { id: "1", time: "19:00", label: "Arrival" },
    { id: "2", time: "20:00", label: "Dinner" },
    { id: "3", time: "21:30", label: "Dancefloor open" },
    { id: "4", time: "00:00", label: "Last song" },
  ],
};

export function RunOfShow({
  bookingId,
  eventTypeId,
}: {
  bookingId: string;
  eventTypeId: string | null;
}) {
  const storageKey = useMemo(() => `djconnect:runofshow:${bookingId}`, [bookingId]);
  const initial = DEFAULTS[eventTypeId ?? "default"] ?? DEFAULTS.default!;
  const [slots, setSlots] = useState<Slot[]>(initial);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) setSlots(parsed);
      }
    } catch {
      /* ignore */
    }
  }, [storageKey]);

  function persist(next: Slot[]) {
    setSlots(next);
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {
      /* ignore */
    }
  }

  function update(id: string, patch: Partial<Slot>) {
    persist(slots.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function remove(id: string) {
    persist(slots.filter((s) => s.id !== id));
  }
  function add() {
    persist([
      ...slots,
      { id: crypto.randomUUID(), time: "22:00", label: "Custom moment" },
    ]);
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-1 flex items-center gap-2">
        <Clock className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold">Run of show</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Lay out the timeline of your event. Your DJ will use this to plan transitions and pacing.
      </p>

      <div className="space-y-2">
        {[...slots]
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((slot) => (
            <div
              key={slot.id}
              className="grid gap-2 rounded-lg border bg-background p-2 sm:grid-cols-[auto_6.5rem_1fr_auto] sm:items-center"
            >
              <span className="hidden text-muted-foreground sm:block">
                <GripVertical className="h-4 w-4" />
              </span>
              <Input
                type="time"
                value={slot.time}
                onChange={(e) => update(slot.id, { time: e.target.value })}
                className="font-mono"
              />
              <Input
                value={slot.label}
                onChange={(e) => update(slot.id, { label: e.target.value })}
                placeholder="Moment"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(slot.id)}
                aria-label={`Remove ${slot.label}`}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={add} className="mt-3">
        <Plus className="h-4 w-4" /> Add moment
      </Button>
    </div>
  );
}
