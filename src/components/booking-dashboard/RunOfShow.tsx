import { useEffect, useMemo, useState } from "react";
import { Clock, GripVertical, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Slot = { id: string; time: string; label: string };

const DEFAULTS: Record<string, Slot[]> = {
  wedding: [
    { id: "1", time: "16:00", label: "Ceremoni / ankomstmusik" },
    { id: "2", time: "18:00", label: "Velkomstdrinks" },
    { id: "3", time: "19:30", label: "Middag & taler" },
    { id: "4", time: "21:00", label: "Første dans" },
    { id: "5", time: "21:15", label: "Dansegulvet åbner" },
    { id: "6", time: "00:30", label: "Sidste sang" },
  ],
  birthday: [
    { id: "1", time: "19:00", label: "Gæster ankommer — roligt sæt" },
    { id: "2", time: "20:30", label: "Kage & skål" },
    { id: "3", time: "21:00", label: "Dansegulvet åbner" },
    { id: "4", time: "23:30", label: "Sidste sang" },
  ],
  corporate_event: [
    { id: "1", time: "18:00", label: "Reception / netværk" },
    { id: "2", time: "19:30", label: "Middag & program" },
    { id: "3", time: "21:00", label: "Dansegulvet åbner" },
    { id: "4", time: "00:00", label: "Afslutning" },
  ],
  default: [
    { id: "1", time: "19:00", label: "Ankomst" },
    { id: "2", time: "20:00", label: "Middag" },
    { id: "3", time: "21:30", label: "Dansegulvet åbner" },
    { id: "4", time: "00:00", label: "Sidste sang" },
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
      { id: crypto.randomUUID(), time: "22:00", label: "Eget øjeblik" },
    ]);
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-1 flex items-center gap-2">
        <Clock className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold">Køreplan</h2>
      </div>
      <p className="mb-4 text-sm text-muted-foreground">
        Læg tidsplanen for dit event. Din DJ bruger den til at planlægge overgange og tempo.
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
                placeholder="Øjeblik"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => remove(slot.id)}
                aria-label={`Fjern ${slot.label}`}
              >
                <Trash2 className="h-4 w-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
      </div>

      <Button type="button" variant="outline" size="sm" onClick={add} className="mt-3">
        <Plus className="h-4 w-4" /> Tilføj øjeblik
      </Button>
    </div>
  );
}
