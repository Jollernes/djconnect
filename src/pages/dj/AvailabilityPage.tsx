import { useMemo, useState } from "react";
import {
  TrendingUp,
  AlertTriangle,
  Check,
  X,
  CalendarDays,
  ChevronDown,
} from "lucide-react";
import { AvailabilityCalendar } from "@/components/common/AvailabilityCalendar";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Status = "available" | "unavailable";

/** How many weeks of upcoming weekends the guided list shows. */
const WEEKS_AHEAD = 12;

function iso(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;
}

type WeekendDay = { date: Date; iso: string; label: "Fredag" | "Lørdag" };
type Weekend = { key: string; rangeLabel: string; days: WeekendDay[] };

/** Build the next `WEEKS_AHEAD` Friday/Saturday pairs starting from today. */
function buildWeekends(): Weekend[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  // Walk forward to the first upcoming Friday.
  const firstFriday = new Date(today);
  const dow = firstFriday.getDay(); // 0 Sun … 5 Fri … 6 Sat
  const daysUntilFriday = (5 - dow + 7) % 7;
  firstFriday.setDate(firstFriday.getDate() + daysUntilFriday);

  const weekends: Weekend[] = [];
  for (let w = 0; w < WEEKS_AHEAD; w++) {
    const friday = new Date(firstFriday);
    friday.setDate(firstFriday.getDate() + w * 7);
    const saturday = new Date(friday);
    saturday.setDate(friday.getDate() + 1);

    const days: WeekendDay[] = [];
    if (friday >= today) days.push({ date: friday, iso: iso(friday), label: "Fredag" });
    days.push({ date: saturday, iso: iso(saturday), label: "Lørdag" });

    weekends.push({
      key: iso(friday),
      rangeLabel: `${friday.toLocaleDateString("da-DK", {
        day: "numeric",
        month: "short",
      })} – ${saturday.toLocaleDateString("da-DK", {
        day: "numeric",
        month: "short",
      })}`,
      days,
    });
  }
  return weekends;
}

export function DJAvailabilityPage() {
  const weekends = useMemo(() => buildWeekends(), []);
  const totalDays = useMemo(
    () => weekends.reduce((n, w) => n + w.days.length, 0),
    [weekends],
  );

  const [statuses, setStatuses] = useState<Record<string, Status>>({});
  const [showCalendar, setShowCalendar] = useState(false);

  const answered = Object.keys(statuses).length;
  const availableCount = Object.values(statuses).filter(
    (s) => s === "available",
  ).length;
  const pct = totalDays === 0 ? 0 : Math.round((answered / totalDays) * 100);

  function setStatus(dateIso: string, status: Status) {
    setStatuses((prev) => {
      // Tapping the active choice again clears it (back to "ikke besvaret").
      if (prev[dateIso] === status) {
        const next = { ...prev };
        delete next[dateIso];
        return next;
      }
      return { ...prev, [dateIso]: status };
    });
  }

  const blockedDates = useMemo(
    () =>
      Object.entries(statuses)
        .filter(([, s]) => s === "unavailable")
        .map(([d]) => d),
    [statuses],
  );

  function toggleBlock(dateIso: string) {
    setStatus(dateIso, "unavailable");
  }

  async function save() {
    // In production: upsert into `availability` table
    toast.success(
      `Gemte din tilgængelighed for ${answered} weekend-dag${answered === 1 ? "" : "e"}`,
    );
  }

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Tilgængelighed</h1>
        <p className="text-sm text-muted-foreground">
          De fleste fester ligger på fredage og lørdage. Markér hvilke weekender
          du er ledig — så ved kunderne hvornår de kan booke dig.
        </p>
      </div>

      {/* Benefits + warning */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex gap-3 rounded-xl border border-emerald-500/30 bg-emerald-500/5 p-4">
          <TrendingUp className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <div className="text-sm font-semibold text-foreground">
              Bliv vist højere oppe
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              DJs der holder deres weekender opdateret bliver prioriteret højere
              i søgeresultaterne, når kunder browser efter en ledig DJ.
            </p>
          </div>
        </div>
        <div className="flex gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <div className="text-sm font-semibold text-foreground">
              Hold det realistisk
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Markerer du dig ledig, men afviser gentagne gange når kunder
              spørger, kan du i stedet blive underprioriteret på platformen.
            </p>
          </div>
        </div>
      </div>

      {/* Progress */}
      <Card>
        <CardContent className="space-y-3 p-5">
          <div className="flex items-end justify-between">
            <div className="text-sm font-medium">Din fremdrift</div>
            <div className="text-xs text-muted-foreground">
              {answered} af {totalDays} weekend-dage besvaret
            </div>
          </div>
          <Progress value={pct} />
          <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500" />
              {availableCount} ledig
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-destructive" />
              {answered - availableCount} ikke ledig
            </span>
            <span className="flex items-center gap-1.5">
              <span className="inline-block h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
              {totalDays - answered} mangler
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Guided weekend list */}
      <div className="space-y-3">
        {weekends.map((weekend) => (
          <Card key={weekend.key}>
            <CardContent className="p-4">
              <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5 text-accent" />
                Weekend · {weekend.rangeLabel}
              </div>
              <div className="space-y-2">
                {weekend.days.map((day) => {
                  const status = statuses[day.iso];
                  return (
                    <div
                      key={day.iso}
                      className="flex items-center justify-between gap-3 rounded-lg border border-border/70 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-medium">{day.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {day.date.toLocaleDateString("da-DK", {
                            day: "numeric",
                            month: "long",
                          })}
                        </div>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        <button
                          type="button"
                          onClick={() => setStatus(day.iso, "available")}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                            status === "available"
                              ? "border-emerald-500 bg-emerald-500 text-white"
                              : "border-border bg-background text-muted-foreground hover:border-emerald-500/50 hover:text-foreground",
                          )}
                        >
                          <Check className="h-3.5 w-3.5" /> Ledig
                        </button>
                        <button
                          type="button"
                          onClick={() => setStatus(day.iso, "unavailable")}
                          className={cn(
                            "inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-colors",
                            status === "unavailable"
                              ? "border-destructive bg-destructive text-white"
                              : "border-border bg-background text-muted-foreground hover:border-destructive/50 hover:text-foreground",
                          )}
                        >
                          <X className="h-3.5 w-3.5" /> Ikke ledig
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Advanced: full calendar */}
      <div>
        <button
          type="button"
          onClick={() => setShowCalendar((v) => !v)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ChevronDown
            className={cn(
              "h-4 w-4 transition-transform",
              showCalendar && "rotate-180",
            )}
          />
          {showCalendar ? "Skjul hele kalenderen" : "Se hele kalenderen"}
        </button>
        {showCalendar && (
          <Card className="mt-3">
            <CardContent className="p-6">
              <p className="mb-4 text-xs text-muted-foreground">
                Brug kalenderen til at blokere enkelte hverdage eller andre
                datoer. Tryk på en dato for at markere den som ikke ledig.
              </p>
              <AvailabilityCalendar
                blockedDates={blockedDates}
                bookedDates={[]}
                editable
                onToggleBlock={toggleBlock}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="flex items-center gap-3">
        <Button onClick={save}>Gem ændringer</Button>
        <span className="text-xs text-muted-foreground">
          Du kan altid opdatere din tilgængelighed senere.
        </span>
      </div>
    </div>
  );
}
