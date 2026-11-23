import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { CalendarDays, MapPin, PartyPopper, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const SEARCH_EVENT_TYPES: { id: string; label: string; path: string }[] = [
  { id: "wedding", label: "Bryllup", path: "/wedding-djs" },
  { id: "corporate_party", label: "Firmafest", path: "/corporate-djs" },
  { id: "birthday", label: "Fødselsdag", path: "/birthday-djs" },
  { id: "private_party", label: "Voksenfest", path: "/other-djs" },
  { id: "other", label: "Anden fest", path: "/other-djs" },
];

const CITIES = ["København", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Vejle", "Roskilde", "Herning"];

export function HeroSearch() {
  const navigate = useNavigate();
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");
  const [eventType, setEventType] = useState("");
  const today = new Date().toISOString().slice(0, 10);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (date) params.set("date", date);
    const match = SEARCH_EVENT_TYPES.find((t) => t.id === eventType);
    if (match) {
      params.set("eventType", match.id);
      navigate(`${match.path}?${params.toString()}`);
      return;
    }
    const qs = params.toString();
    navigate(`/search${qs ? `?${qs}` : ""}`);
  }

  return (
    <form
      onSubmit={submit}
      aria-label="Søg efter DJ"
      className="grid gap-2 rounded-3xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/5 md:grid-cols-[1fr_1fr_1fr_auto] md:gap-0 md:rounded-full"
    >
      <SearchField label="Hvor" icon={MapPin}>
        <Select value={city || undefined} onValueChange={setCity}>
          <SelectTrigger className="h-auto border-0 p-0 text-left text-sm font-medium text-slate-900 shadow-none focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Vælg by" />
          </SelectTrigger>
          <SelectContent>
            {CITIES.map((r) => (
              <SelectItem key={r} value={r}>
                {r}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SearchField>

      <SearchField label="Hvornår" icon={CalendarDays} divider>
        <input
          type="date"
          min={today}
          value={date}
          onChange={(e) => setDate(e.target.value)}
          aria-label="Dato for festen"
          className="w-full border-0 bg-transparent p-0 text-sm font-medium text-slate-900 focus:outline-none focus:ring-0"
        />
      </SearchField>

      <SearchField label="Type fest" icon={PartyPopper} divider>
        <Select value={eventType || undefined} onValueChange={setEventType}>
          <SelectTrigger className="h-auto border-0 p-0 text-left text-sm font-medium text-slate-900 shadow-none focus:ring-0 focus:ring-offset-0">
            <SelectValue placeholder="Vælg type fest" />
          </SelectTrigger>
          <SelectContent>
            {SEARCH_EVENT_TYPES.map((t) => (
              <SelectItem key={t.id} value={t.id}>
                {t.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </SearchField>

      <Button
        type="submit"
        variant="accent"
        className="h-14 rounded-2xl px-8 text-base font-semibold shadow-md md:m-1 md:h-auto md:rounded-full"
      >
        <Search className="h-5 w-5" />
        Find DJ
      </Button>
    </form>
  );
}

function SearchField({
  label,
  icon: Icon,
  divider,
  children,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  divider?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={
        "flex items-center gap-3 rounded-2xl px-4 py-3 transition-colors hover:bg-slate-50 md:rounded-full md:px-6" +
        (divider ? " md:border-l md:border-slate-200" : "")
      }
    >
      <Icon className="h-5 w-5 shrink-0 text-slate-400" />
      <div className="min-w-0 flex-1">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</div>
        {children}
      </div>
    </div>
  );
}
