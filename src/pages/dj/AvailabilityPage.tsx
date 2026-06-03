import { useState } from "react";
import { AvailabilityCalendar } from "@/components/common/AvailabilityCalendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function DJAvailabilityPage() {
  const [blockedDates, setBlockedDates] = useState<string[]>([]);

  function toggle(iso: string) {
    setBlockedDates((prev) => (prev.includes(iso) ? prev.filter((d) => d !== iso) : [...prev, iso]));
  }

  async function save() {
    // In production: upsert into `availability` table
    toast.success(`Gemte ${blockedDates.length} utilgængelig${blockedDates.length === 1 ? " dato" : "e datoer"}`);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tilgængelighed</h1>
        <p className="text-sm text-muted-foreground">Tryk på en dato for at blokere eller frigive den. Bekræftede bookinger kan ikke ændres.</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <AvailabilityCalendar
            blockedDates={blockedDates}
            bookedDates={[]}
            editable
            onToggleBlock={toggle}
          />
        </CardContent>
      </Card>
      <Button onClick={save}>Gem ændringer</Button>
    </div>
  );
}
