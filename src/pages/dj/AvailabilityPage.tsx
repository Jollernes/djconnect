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
    toast.success(`Saved ${blockedDates.length} unavailable date${blockedDates.length === 1 ? "" : "s"}`);
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Availability</h1>
        <p className="text-sm text-muted-foreground">Tap a date to block or unblock it. Confirmed bookings can't be changed.</p>
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
      <Button onClick={save}>Save changes</Button>
    </div>
  );
}
