import { Check, FileText, MessageSquare, CreditCard, ShieldCheck, PartyPopper, Trophy } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import type { BookingStatus } from "@/lib/constants";
import type { BookingWithRelations } from "@/types/domain";

type Stage = {
  id: string;
  label: string;
  description: string;
  icon: LucideIcon;
};

const STAGES: Stage[] = [
  { id: "requested", label: "Forespørgsel sendt", description: "Vi har sendt dine eventdetaljer til DJ'en.", icon: FileText },
  { id: "quoted", label: "Tilbud modtaget", description: "DJ'en har svaret med en pris.", icon: MessageSquare },
  { id: "paid", label: "Betaling i escrow", description: "Pengene er beskyttet indtil dit event.", icon: CreditCard },
  { id: "confirmed", label: "Booking bekræftet", description: "DJ'en er booket til din dato.", icon: ShieldCheck },
  { id: "event", label: "Eventdag", description: "Len dig tilbage — DJ'en tager over herfra.", icon: PartyPopper },
  { id: "completed", label: "Gennemført & udbetalt", description: "Håber, det blev en succes. Skriv en anmeldelse!", icon: Trophy },
];

function translateStatus(status: BookingStatus): string {
  switch (status) {
    case "cancelled":
      return "annulleret";
    case "declined":
      return "afslået";
    case "refunded":
      return "refunderet";
    default:
      return status;
  }
}

function indexFromStatus(status: BookingStatus, eventDate: Date, now: Date): number {
  const isEventDay = now.toDateString() === eventDate.toDateString();
  const isPast = now > eventDate;
  switch (status) {
    case "pending":
      return 0;
    case "quoted":
      return 1;
    case "awaiting_payment":
      return 1;
    case "confirmed":
      if (isPast) return 5;
      if (isEventDay) return 4;
      return 3;
    case "completed":
      return 5;
    case "cancelled":
    case "declined":
    case "refunded":
      return -1;
    default:
      return 0;
  }
}

export function StatusTimeline({ booking }: { booking: BookingWithRelations }) {
  const eventDate = new Date(`${booking.event_date}T${booking.start_time || "18:00"}:00`);
  const currentIndex = indexFromStatus(booking.status, eventDate, new Date());

  if (currentIndex === -1) {
    return (
      <div className="rounded-2xl border bg-card p-6">
        <h2 className="text-lg font-semibold">Bookingforløb</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Denne booking blev {translateStatus(booking.status)}. {booking.cancellation_reason ?? ""}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border bg-card p-6">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Bookingforløb</h2>
        <span className="text-xs text-muted-foreground">
          Trin {currentIndex + 1} af {STAGES.length}
        </span>
      </div>
      <p className="mb-5 text-sm text-muted-foreground">
        {STAGES[currentIndex]?.description}
      </p>

      {/* Desktop horizontal timeline */}
      <ol className="hidden md:grid md:grid-cols-6">
        {STAGES.map((stage, i) => {
          const completed = i < currentIndex;
          const current = i === currentIndex;
          const Icon = stage.icon;
          return (
            <li key={stage.id} className="relative flex flex-col items-center text-center">
              {i > 0 && (
                <span
                  className={cn(
                    "absolute left-0 right-1/2 top-5 h-0.5 -translate-y-1/2",
                    completed || current ? "bg-accent" : "bg-border"
                  )}
                />
              )}
              {i < STAGES.length - 1 && (
                <span
                  className={cn(
                    "absolute left-1/2 right-0 top-5 h-0.5 -translate-y-1/2",
                    completed ? "bg-accent" : "bg-border"
                  )}
                />
              )}
              <span
                className={cn(
                  "relative z-10 grid h-10 w-10 place-items-center rounded-full border-2 transition-all",
                  completed && "border-accent bg-accent text-accent-foreground",
                  current && "border-accent bg-background text-accent ring-4 ring-accent/15",
                  !completed && !current && "border-border bg-background text-muted-foreground"
                )}
              >
                {completed ? <Check className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
              </span>
              <span
                className={cn(
                  "mt-2 max-w-[8rem] text-xs font-medium leading-tight",
                  current && "text-foreground",
                  completed && "text-foreground",
                  !completed && !current && "text-muted-foreground"
                )}
              >
                {stage.label}
              </span>
            </li>
          );
        })}
      </ol>

      {/* Mobile vertical timeline */}
      <ol className="space-y-3 md:hidden">
        {STAGES.map((stage, i) => {
          const completed = i < currentIndex;
          const current = i === currentIndex;
          const Icon = stage.icon;
          return (
            <li key={stage.id} className="flex items-start gap-3">
              <span
                className={cn(
                  "mt-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-full border-2",
                  completed && "border-accent bg-accent text-accent-foreground",
                  current && "border-accent bg-background text-accent ring-4 ring-accent/15",
                  !completed && !current && "border-border bg-background text-muted-foreground"
                )}
              >
                {completed ? <Check className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </span>
              <div className="flex-1 pt-1">
                <div className="text-sm font-medium">{stage.label}</div>
                <div className="text-xs text-muted-foreground">{stage.description}</div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
