import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUS_META, type BookingStatus } from "@/types/domain";
import { cn } from "@/lib/utils";

const colorClasses: Record<string, string> = {
  amber: "border-amber-200 bg-amber-50 text-amber-800",
  blue: "border-sky-200 bg-sky-50 text-sky-800",
  violet: "border-violet-200 bg-violet-50 text-violet-800",
  green: "border-emerald-200 bg-emerald-50 text-emerald-800",
  slate: "border-slate-200 bg-slate-50 text-slate-800",
  rose: "border-rose-200 bg-rose-50 text-rose-800",
};

export function BookingStatusBadge({ status, className }: { status: BookingStatus; className?: string }) {
  const meta = BOOKING_STATUS_META[status];
  return (
    <Badge variant="outline" className={cn("rounded-full border px-2.5 py-0.5", colorClasses[meta.color] ?? "", className)}>
      {meta.label}
    </Badge>
  );
}
