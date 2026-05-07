import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, Sparkles, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useAuth } from "@/hooks/useAuth";
import {
  recommendWeddingPackage,
  writeAdvisoryRecord,
  type WeddingAdvisoryBrief,
} from "@/lib/personalAdviceStore";

/**
 * Personal advisory landing page.
 *
 * Surfaces the Danish hook copy ("Er du i tvivl…"), then drops the user
 * straight into an extended wedding-brief form. On submit:
 *   1. Writes a `PersonalAdviceRecord` to localStorage with a deterministic
 *      package recommendation derived from the brief.
 *   2. Auto-creates a demo customer account via `mockLogin` (Supabase later).
 *   3. Navigates to the customer-dashboard advisory waiting page.
 *
 * Other event types (birthday, corporate, other) currently show a
 * "kommer snart" placeholder and route the user back to the wedding flow,
 * but the underlying store + dashboard pages are scaffolded so adding
 * those later is just a new form template + recommendation rules.
 */
export function PersonalAdvicePage() {
  useDocumentHead({
    title: "Personlig rådgivning · DJConnect",
    description:
      "Få personlig rådgivning til dit event. Vi ringer dig op og hjælper med at finde den rette DJ-løsning.",
  });

  const navigate = useNavigate();
  const { profile, mockLogin } = useAuth();

  const [eventType, setEventType] = useState<
    "wedding" | "birthday" | "corporate" | "other"
  >("wedding");

  // Wedding form state
  const [coupleNames, setCoupleNames] = useState("");
  const [weddingDate, setWeddingDate] = useState("");
  const [venueName, setVenueName] = useState("");
  const [city, setCity] = useState("");
  const [guestCount, setGuestCount] = useState<number | "">("");
  const [parts, setParts] = useState<Array<"ceremony" | "dinner" | "party">>([
    "dinner",
    "party",
  ]);
  const [totalHours, setTotalHours] = useState<number | "">(5);
  const [musicStyle, setMusicStyle] = useState("");
  const [mustPlay, setMustPlay] = useState("");
  const [doNotPlay, setDoNotPlay] = useState("");
  const [setupNeeds, setSetupNeeds] = useState<string[]>([
    "Lyd",
    "Lys",
    "Mikrofon",
  ]);
  const [venueNotes, setVenueNotes] = useState("");
  const [budget, setBudget] = useState("");
  const [notes, setNotes] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const valid = useMemo(() => {
    if (eventType !== "wedding") return false;
    return (
      coupleNames.trim().length > 0 &&
      weddingDate.length > 0 &&
      city.trim().length > 0 &&
      typeof guestCount === "number" && guestCount > 0 &&
      contactName.trim().length > 0 &&
      contactEmail.trim().length > 0 &&
      contactPhone.trim().length > 0
    );
  }, [eventType, coupleNames, weddingDate, city, guestCount, contactName, contactEmail, contactPhone]);

  function togglePart(p: "ceremony" | "dinner" | "party") {
    setParts((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p],
    );
  }

  function toggleSetup(label: string) {
    setSetupNeeds((prev) =>
      prev.includes(label) ? prev.filter((x) => x !== label) : [...prev, label],
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!valid || submitting) return;
    setSubmitting(true);

    // Auto-create / log in a demo customer account if there's no session yet.
    if (!profile || profile.role !== "customer") {
      mockLogin("customer", { customerKind: "private" });
    }
    // The mockLogin call above sets the profile in state synchronously, but
    // the customerId we attach to the record uses the same deterministic id
    // mockLogin assigns ("user-customer-1" for private).
    const customerId =
      profile?.role === "customer" ? profile.id : "user-customer-1";

    const brief: WeddingAdvisoryBrief = {
      coupleNames: coupleNames.trim(),
      weddingDate,
      venueName: venueName.trim(),
      city: city.trim(),
      guestCount: typeof guestCount === "number" ? guestCount : 0,
      parts,
      totalHours: typeof totalHours === "number" ? totalHours : 5,
      musicStyle: musicStyle.trim(),
      mustPlay: mustPlay.trim(),
      doNotPlay: doNotPlay.trim(),
      setupNeeds,
      venueNotes: venueNotes.trim(),
      budget: budget.trim(),
      notes: notes.trim(),
      contactName: contactName.trim(),
      contactEmail: contactEmail.trim(),
      contactPhone: contactPhone.trim(),
    };

    const recommendation = recommendWeddingPackage(brief);
    const id = `adv_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

    writeAdvisoryRecord({
      id,
      createdAtMs: Date.now(),
      customerId,
      status: "awaiting_call",
      brief: { eventType: "wedding", wedding: brief },
      recommendation,
    });

    navigate(`/dashboard/personlig-radgivning/${id}`);
  }

  return (
    <div className="container py-10">
      <div className="mx-auto max-w-2xl space-y-8">
        <header className="space-y-3">
          <p className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
            <Sparkles className="h-3 w-3" />
            Personlig rådgivning
          </p>
          <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
            Lad os finde den rette løsning til jeres event
          </h1>
          <p className="text-base leading-relaxed text-muted-foreground">
            Er du i tvivl om, hvilken DJ, pakke eller løsning der passer til dit
            event? Fortæl os lidt mere om festen, så ringer vi dig op og hjælper
            med at finde den rette løsning!
          </p>
          <ul className="space-y-1.5 pt-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              Personlig anbefaling baseret på dit eventbrief — ingen forpligtelser.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              En rådgiver ringer dig op typisk inden for et par timer.
            </li>
            <li className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
              Mulighed for at booke direkte gennem platformen — alt samlet ét sted.
            </li>
          </ul>
        </header>

        {/* Event type selector */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Hvilken slags event er det?</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
            {([
              { id: "wedding", label: "Bryllup" },
              { id: "birthday", label: "Fødselsdag" },
              { id: "corporate", label: "Firmaevent" },
              { id: "other", label: "Andet" },
            ] as const).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => setEventType(opt.id)}
                className={
                  "rounded-xl border px-3 py-3 text-sm font-medium transition-colors " +
                  (eventType === opt.id
                    ? "border-foreground bg-foreground text-background"
                    : "border-border bg-background hover:border-foreground/40")
                }
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {eventType !== "wedding" ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/20 p-6 text-center">
            <p className="text-sm font-medium">Kommer snart</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Vi tilbyder lige nu kun personlig rådgivning til bryllupper. Vi
              udvider snart — i mellemtiden kan du{" "}
              <button
                type="button"
                onClick={() => setEventType("wedding")}
                className="font-medium text-foreground underline-offset-2 hover:underline"
              >
                udfylde bryllupsformularen
              </button>{" "}
              hvis det passer, eller{" "}
              <a href="/get-offers" className="font-medium text-foreground underline-offset-2 hover:underline">
                få 3 tilbud
              </a>{" "}
              fra DJ'er på platformen.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection
              title="Om jeres bryllup"
              description="Lidt baggrund om dagen, så rådgiveren ved hvad det handler om."
            >
              <Field label="Brudeparrets navne" htmlFor="adv-couple">
                <Input
                  id="adv-couple"
                  required
                  placeholder="Anna & Mikkel"
                  value={coupleNames}
                  onChange={(e) => setCoupleNames(e.target.value)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Bryllupsdato" htmlFor="adv-date">
                  <Input
                    id="adv-date"
                    type="date"
                    required
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                  />
                </Field>
                <Field label="By / region" htmlFor="adv-city">
                  <Input
                    id="adv-city"
                    required
                    placeholder="København"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </Field>
              </div>
              <Field label="Festlokale (valgfrit)" htmlFor="adv-venue">
                <Input
                  id="adv-venue"
                  placeholder="Fx Moltkes Palæ, festsal hjemme, sommerhus..."
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Antal gæster og forløb"
              description="Hvor stort er det, og hvor meget af dagen skal DJ'en dække?"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Antal gæster (ca.)" htmlFor="adv-guests">
                  <Input
                    id="adv-guests"
                    type="number"
                    min={0}
                    required
                    placeholder="80"
                    value={guestCount}
                    onChange={(e) =>
                      setGuestCount(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </Field>
                <Field label="Antal timer DJ-tid (ca.)" htmlFor="adv-hours">
                  <Input
                    id="adv-hours"
                    type="number"
                    min={1}
                    max={12}
                    placeholder="5"
                    value={totalHours}
                    onChange={(e) =>
                      setTotalHours(e.target.value === "" ? "" : Number(e.target.value))
                    }
                  />
                </Field>
              </div>
              <Field label="DJ skal dække">
                <div className="flex flex-wrap gap-2">
                  {([
                    { id: "ceremony", label: "Ceremoni" },
                    { id: "dinner", label: "Middag" },
                    { id: "party", label: "Dansefest" },
                  ] as const).map((p) => {
                    const active = parts.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePart(p.id)}
                        className={
                          "rounded-full border px-4 py-1.5 text-sm transition-colors " +
                          (active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background hover:border-foreground/40")
                        }
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              </Field>
            </FormSection>

            <FormSection
              title="Musik og stemning"
              description="Det vi bruger til at briefe DJ'en. Du behøver ikke kende alle navne."
            >
              <Field label="Musikstil / genrer" htmlFor="adv-music">
                <Input
                  id="adv-music"
                  placeholder="Fx 80s/90s pop, dansk pop, lidt house til sent på aftenen"
                  value={musicStyle}
                  onChange={(e) => setMusicStyle(e.target.value)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Skal-spilles (valgfrit)" htmlFor="adv-must">
                  <Textarea
                    id="adv-must"
                    rows={3}
                    placeholder="Vores første dans, brudens fars yndlingssang, ..."
                    value={mustPlay}
                    onChange={(e) => setMustPlay(e.target.value)}
                  />
                </Field>
                <Field label="Må-ikke-spilles (valgfrit)" htmlFor="adv-dontplay">
                  <Textarea
                    id="adv-dontplay"
                    rows={3}
                    placeholder="Genrer eller numre der absolut ikke skal spilles."
                    value={doNotPlay}
                    onChange={(e) => setDoNotPlay(e.target.value)}
                  />
                </Field>
              </div>
            </FormSection>

            <FormSection
              title="Setup og praktisk"
              description="Hvad har I selv, og hvad skal vi medbringe?"
            >
              <Field label="Vi skal sørge for">
                <div className="flex flex-wrap gap-2">
                  {[
                    "Lyd",
                    "Lys",
                    "Mikrofon",
                    "Uplights",
                    "Røg-effekt",
                    "Backup-udstyr",
                  ].map((label) => {
                    const active = setupNeeds.includes(label);
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => toggleSetup(label)}
                        className={
                          "rounded-full border px-3 py-1.5 text-sm transition-colors " +
                          (active
                            ? "border-foreground bg-foreground text-background"
                            : "border-border bg-background hover:border-foreground/40")
                        }
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </Field>
              <Field label="Bemærkninger om lokalet (valgfrit)" htmlFor="adv-venue-notes">
                <Textarea
                  id="adv-venue-notes"
                  rows={2}
                  placeholder="Indendørs/udendørs, strøm, adgangsforhold, lydbegrænsninger..."
                  value={venueNotes}
                  onChange={(e) => setVenueNotes(e.target.value)}
                />
              </Field>
              <Field label="Budget (valgfrit)" htmlFor="adv-budget">
                <Input
                  id="adv-budget"
                  placeholder="Fx 8.000–12.000 kr."
                  value={budget}
                  onChange={(e) => setBudget(e.target.value)}
                />
              </Field>
              <Field label="Andet vi skal vide? (valgfrit)" htmlFor="adv-notes">
                <Textarea
                  id="adv-notes"
                  rows={3}
                  placeholder="Alt I tænker er værd at nævne."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
            </FormSection>

            <FormSection
              title="Hvor kan vi ringe dig?"
              description="En rådgiver kontakter dig typisk inden for et par timer i dagtimerne."
            >
              <Field label="Dit navn" htmlFor="adv-name">
                <Input
                  id="adv-name"
                  required
                  placeholder="Mikkel Hansen"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" htmlFor="adv-email">
                  <Input
                    id="adv-email"
                    type="email"
                    required
                    placeholder="dig@email.dk"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </Field>
                <Field label="Telefon" htmlFor="adv-phone">
                  <Input
                    id="adv-phone"
                    type="tel"
                    required
                    placeholder="+45 12 34 56 78"
                    value={contactPhone}
                    onChange={(e) => setContactPhone(e.target.value)}
                  />
                </Field>
              </div>
            </FormSection>

            <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-xs text-muted-foreground">
              Når du sender, opretter vi automatisk en konto til dig så du kan
              følge med på din anbefaling og kommunikere med rådgiveren. Du
              betaler ingenting før alt er aftalt på telefon.
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-xs text-muted-foreground">
                Ved at sende accepterer du vores{" "}
                <a href="/terms" className="underline-offset-2 hover:underline">
                  vilkår
                </a>{" "}
                og{" "}
                <a href="/privacy" className="underline-offset-2 hover:underline">
                  privatlivspolitik
                </a>
                .
              </p>
              <Button type="submit" disabled={!valid || submitting} className="gap-1.5">
                <Phone className="h-4 w-4" />
                {submitting ? "Sender..." : "Send og få rådgivning"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4 rounded-2xl border border-border/60 bg-card/40 p-5 sm:p-6">
      <header>
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  children,
}: {
  label: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}
