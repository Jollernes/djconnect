import { Badge } from "@/components/ui/badge";
import { BOOKING_STATUSES, type BookingStatus } from "@/lib/constants";

export function BookingStatusBadge({ status }: { status: BookingStatus }) {
  const config = BOOKING_STATUSES[status];
  const variant = (config.color as "warning" | "success" | "destructive" | "muted") ?? "muted";
  return <Badge variant={variant}>{config.label}</Badge>;
}
