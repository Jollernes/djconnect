import { useEffect, useState } from "react";
import { Calendar, MapPin, Users, MessageCircle, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { BookingWithRelations } from "@/types/domain";

function diffParts(target: Date, now: Date) {
  const ms = target.getTime() - now.getTime();
  const totalSec = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;
  return { days, hours, minutes, seconds, isPast: ms <= 0 };
}

export function BookingHero({ booking }: { booking: BookingWithRelations }) {
  const eventDate = new Date(`${booking.event_date}T${booking.start_time || "18:00"}:00`);
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);
  const { days, hours, minutes, seconds, isPast } = diffParts(eventDate, now);

  const total =
    booking.price_minor !== null ? booking.price_minor + booking.platform_fee_minor : null;
  const dj = booking.dj_profile;

  return (
    <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary via-primary to-primary/90 text-primary-foreground shadow-2xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(249,115,22,0.25),transparent_55%)]" />
      <div className="absolute -right-12 -top-16 h-72 w-72 rounded-full bg-accent/15 blur-3xl" />
      <div className="absolute -left-20 bottom-0 h-72 w-72 rounded-full bg-fuchsia-500/15 blur-3xl" />

      <div className="relative grid gap-6 p-6 sm:p-8 lg:grid-cols-[1.2fr_1fr]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full bg-white/10 px-2.5 py-1 font-mono uppercase tracking-wide">
              {booking.reference}
            </span>
            <BookingStatusBadge status={booking.status} />
          </div>

          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-white/60">
              {booking.event_type?.label ?? "Event"}
            </div>
            <h1 className="mt-1 text-3xl font-semibold leading-tight sm:text-4xl">
              {dj.stage_name}
              <span className="block text-xl font-normal text-white/80 sm:text-2xl">
                {formatDate(booking.event_date)}
              </span>
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-white/85">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {booking.start_time}
              {booking.end_time ? ` – ${booking.end_time}` : ""}
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="h-4 w-4" />
              {booking.venue_name}
            </span>
            {booking.estimated_guests && (
              <span className="flex items-center gap-1.5">
                <Users className="h-4 w-4" />
                {booking.estimated_guests} gæster
              </span>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="accent" className="gap-2">
              <a href="#messages">
                <MessageCircle className="h-4 w-4" />
                Skriv til {dj.stage_name.split(" ")[0]}
              </a>
            </Button>
            <Button
              asChild
              variant="secondary"
              className="border-white/20 bg-white/10 text-white backdrop-blur hover:bg-white/20"
            >
              <Link to={`/djs/${dj.username}`}>Se profil</Link>
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          {!isPast && booking.status !== "cancelled" && booking.status !== "declined" && (
            <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
              <div className="flex items-center justify-between text-xs uppercase tracking-wider text-white/65">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5" /> Tid til showtime
                </span>
              </div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">
                {[
                  { label: "Dage", value: days },
                  { label: "Timer", value: hours },
                  { label: "Min", value: minutes },
                  { label: "Sek", value: seconds },
                ].map((part) => (
                  <div
                    key={part.label}
                    className="rounded-xl bg-white/10 px-2 py-3 ring-1 ring-white/10"
                  >
                    <div className="font-mono text-2xl font-semibold tabular-nums sm:text-3xl">
                      {String(part.value).padStart(2, "0")}
                    </div>
                    <div className="mt-0.5 text-[10px] uppercase tracking-wider text-white/55">
                      {part.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-white/15 bg-white/5 p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <img
                src={dj.profile.avatar_url ?? ""}
                alt=""
                className="h-12 w-12 rounded-full object-cover ring-2 ring-white/30"
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-semibold">{dj.stage_name}</div>
                <div className="truncate text-xs text-white/65">
                  ★ {dj.rating_average.toFixed(2)} · {dj.rating_count} anmeldelser
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs uppercase tracking-wider text-white/55">Total</div>
                <div className="text-lg font-semibold">
                  {total !== null
                    ? formatCurrency(total, booking.currency)
                    : "Tilbud afventer"}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
