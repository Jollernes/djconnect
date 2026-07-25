import { useState } from "react";
import { XCircle, CalendarX } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { CANCELLATION_POLICY, computeRefundPercent } from "@/lib/constants";
import { cn } from "@/lib/utils";
import type { BookingWithRelations } from "@/types/domain";

export function CancellationCard({
  booking,
  onCancel,
}: {
  booking: BookingWithRelations;
  onCancel?: () => void;
}) {
  const eventDate = new Date(booking.event_date);
  const refundPct = computeRefundPercent(eventDate);
  const days = Math.max(
    0,
    Math.floor((eventDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
  );
  const [reason, setReason] = useState("");

  const allowCancel =
    booking.status === "pending" ||
    booking.status === "quoted" ||
    booking.status === "awaiting_payment" ||
    booking.status === "confirmed";

  function handleCancel() {
    toast.success(
      `Annullering indsendt. ${refundPct}% tilbagebetaling behandles inden for 5–7 hverdage.`,
    );
    onCancel?.();
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <CalendarX className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold">Annulleringspolitik</h2>
      </div>

      <div className="mb-4 grid gap-2">
        {CANCELLATION_POLICY.map((rule) => {
          const active =
            (rule.windowDays === 14 && days >= 14) ||
            (rule.windowDays === 7 && days >= 7 && days < 14) ||
            (rule.windowDays === 0 && days < 7);
          return (
            <div
              key={rule.windowDays}
              className={cn(
                "flex items-center justify-between rounded-lg border bg-background px-4 py-2.5 text-sm",
                active && "border-accent bg-accent/5 ring-1 ring-accent/30",
              )}
            >
              <div className="flex items-center gap-2">
                {active && (
                  <span className="grid h-1.5 w-1.5 place-items-center rounded-full bg-accent" />
                )}
                <span className={cn(active ? "text-foreground" : "text-muted-foreground")}>
                  {rule.label}
                </span>
              </div>
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-medium",
                  rule.refundPercent === 100 && "bg-emerald-100 text-emerald-800",
                  rule.refundPercent === 50 && "bg-amber-100 text-amber-800",
                  rule.refundPercent === 0 && "bg-rose-100 text-rose-800",
                )}
              >
                {rule.refundPercent}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">
        I dag ville din tilbagebetaling være <strong>{refundPct}%</strong> ({days} dag{days === 1 ? "" : "e"} til dit event).
      </div>

      {allowCancel && (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="mt-4 w-full">
              <XCircle className="h-4 w-4" /> Anmod om annullering
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Annullér denne booking?</DialogTitle>
              <DialogDescription>
                Ifølge vores annulleringspolitik ville du modtage en <strong>{refundPct}% tilbagebetaling</strong>.
                Vi giver din DJ besked og behandler tilbagebetalingen inden for 5–7 hverdage.
              </DialogDescription>
            </DialogHeader>
            <Textarea
              rows={3}
              placeholder="Årsag til annullering (valgfrit)"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
            <DialogFooter>
              <Button variant="destructive" onClick={handleCancel}>
                Bekræft annullering
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
