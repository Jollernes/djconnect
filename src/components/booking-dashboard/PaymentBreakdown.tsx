import { CreditCard, ShieldCheck, FileText, Receipt, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency, formatDate } from "@/lib/utils";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";
import type { BookingWithRelations } from "@/types/domain";

export function PaymentBreakdown({ booking }: { booking: BookingWithRelations }) {
  const hasQuote = booking.price_minor !== null && booking.price_minor > 0;
  const total = hasQuote ? booking.price_minor! + booking.platform_fee_minor : 0;
  const escrow = booking.paid_at !== null && booking.completed_at === null;
  const released = booking.completed_at !== null;

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-4 flex items-center gap-2">
        <CreditCard className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold">Betaling</h2>
      </div>

      {!hasQuote ? (
        <div className="rounded-lg border border-dashed bg-muted/30 p-4 text-sm text-muted-foreground">
          Afventer et tilbud fra din DJ. Du bliver ikke opkrævet, før du accepterer og betaler.
        </div>
      ) : (
        <>
          <dl className="space-y-2 text-sm">
            <Row label={`Bookingpris`} value={formatCurrency(booking.price_minor!, booking.currency)} />
            <Row
              label={`Platformgebyr (${PLATFORM_FEE_PERCENT}%)`}
              value={formatCurrency(booking.platform_fee_minor, booking.currency)}
              hint="Dækker escrow, betalingsbehandling & support"
            />
            <Separator className="my-2" />
            <Row
              label="Samlet betalt"
              value={<span className="font-semibold">{formatCurrency(total, booking.currency)}</span>}
            />
          </dl>

          <div className="mt-5 rounded-xl border bg-background p-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              {released ? (
                <>
                  <Receipt className="h-4 w-4 text-emerald-600" />
                  Frigivet til DJ
                </>
              ) : escrow ? (
                <>
                  <Lock className="h-4 w-4 text-emerald-600" />
                  I escrow
                </>
              ) : (
                <>
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  Afventer betaling
                </>
              )}
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {released
                ? `Pengene blev frigivet til ${booking.dj_profile.stage_name} den ${formatDate(booking.completed_at!)}.`
                : escrow
                  ? "Din betaling er sikker hos DJConnect og frigives først til DJ'en efter dit event."
                  : "Betalingen holdes i escrow, indtil dit event er gennemført."}
            </p>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <FileText className="h-4 w-4" /> Download faktura (PDF)
            </Button>
            <Button variant="outline" size="sm" className="gap-2">
              <Receipt className="h-4 w-4" /> Bookingbekræftelse
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function Row({
  label,
  value,
  hint,
}: {
  label: string;
  value: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="text-foreground">{label}</div>
        {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
      </div>
      <div className="text-right">{value}</div>
    </div>
  );
}
