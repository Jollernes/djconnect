import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  CalendarHeart,
  MapPin,
  Users,
  Clock,
  Music2,
  Sparkles,
  Wallet,
  Phone,
  Check,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useAuth, mockCustomerIdFor } from "@/hooks/useAuth";
import {
  recommendWeddingPackage,
  writeAdvisoryRecord,
  type WeddingAdvisoryBrief,
} from "@/lib/personalAdviceStore";
import { OfferWizardLayout } from "@/components/offers/OfferWizardLayout";

/**
 * Personal advisory wizard.
 *
 * Mirrors the 3-offers wizard shape: a full-screen `OfferWizardLayout`
 * with a top progress bar, one or two questions per step, and a sticky
 * back / continue bar at the bottom. On submit:
 *   1. Writes a `PersonalAdviceRecord` to localStorage with a deterministic
 *      package recommendation derived from the brief.
 *   2. Auto-creates a demo customer account via `mockLogin` if the user
 *      isn't already logged in as a customer (existing DJ / admin demo
 *      sessions are protected — those users are asked to sign out first
 *      so we don't overwrite their session).
 *   3. Navigates to the dashboard recommendation page.
 *
 * Step layout (URL `?step=0..9`):
 *   0  Welcome / lede
 *   1  Couple's names + date
 *   2  City + venue
 *   3  Guests + DJ hours
 *   4  Schedule (ceremony / dinner / party)
 *   5  Music style + must-play / må-ikke-spilles
 *   6  Setup needs
 *   7  Budget + notes
 *   8  Contact
 *   9  Review & submit
 */

const TOTAL_STEPS = 8; // questions counted in the progress bar (steps 1..8)

type StepConfig = {
  stepNumber: number;
  title: string;
  subtitle?: string;
  content: React.ReactNode;
  hideBack?: boolean;
  hideNext?: boolean;
  showProgress?: boolean;
  nextLabel?: string;
};

export function PersonalAdviceWeddingPage() {
  useDocumentHead({
    title: "Personlig rådgivning · Bryllup · DJConnect",
    description:
      "Få personlig rådgivning til jeres bryllup. Vi ringer dig op og hjælper med at finde den rette DJ-løsning.",
    canonical: "/personal-advice/wedding",
  });

  const navigate = useNavigate();
  const { profile, mockLogin } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const stepParam = parseInt(searchParams.get("step") ?? "0", 10);
  const step =
    Number.isFinite(stepParam) && stepParam >= 0 && stepParam <= 9
      ? stepParam
      : 0;

  function setStep(next: number) {
    setSearchParams({ step: String(next) }, { replace: false });
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

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
  const [submitError, setSubmitError] = useState<string | null>(null);

  // DJ / admin demo sessions can't be silently overwritten without
  // destroying that user's dashboard access on the next reload.
  const blockedRole = profile && profile.role !== "customer" ? profile.role : null;

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

  const nextDisabled = useMemo(() => {
    switch (step) {
      case 1:
        return coupleNames.trim().length === 0 || weddingDate.length === 0;
      case 2:
        return city.trim().length === 0;
      case 3:
        return !(typeof guestCount === "number" && guestCount > 0);
      case 4:
        return parts.length === 0;
      case 5:
        return false; // music details optional
      case 6:
        return false; // setup optional (chips)
      case 7:
        return false; // budget + notes optional
      case 8:
        return (
          contactName.trim().length === 0 ||
          !/.+@.+\..+/.test(contactEmail) ||
          contactPhone.trim().length === 0
        );
      default:
        return false;
    }
  }, [step, coupleNames, weddingDate, city, guestCount, parts, contactName, contactEmail, contactPhone]);

  function handleSubmit() {
    if (submitting) return;

    if (profile && profile.role !== "customer") {
      setSubmitError(
        `Du er logget ind som ${profile.role === "dj" ? "DJ" : "administrator"}. Log ud først for at sende en personlig rådgivnings-anmodning som kunde.`,
      );
      return;
    }

    setSubmitError(null);
    setSubmitting(true);

    try {
      let customerId: string;
      let sessionEstablished = profile?.role === "customer";
      if (sessionEstablished && profile) {
        customerId = profile.id;
      } else {
        try {
          mockLogin("customer", { customerKind: "private" });
          sessionEstablished = true;
        } catch {
          // localStorage may be full or blocked. We still try to persist
          // the advisory record (writeAdvisoryRecord has its own error
          // handling) and surface a recoverable message below instead of
          // navigating into an auth-gated dashboard route the user can't
          // actually reach.
        }
        customerId = mockCustomerIdFor("private");
      }

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

      if (!sessionEstablished) {
        setSubmitError(
          "Din anmodning er gemt, men vi kunne ikke automatisk logge dig ind i denne browser (privat-tilstand eller fuld lagring?). Log venligst manuelt ind for at se anbefalingen.",
        );
        setSubmitting(false);
        return;
      }

      navigate(`/dashboard/personlig-radgivning/${id}`);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? `Noget gik galt: ${err.message}. Prøv venligst igen.`
          : "Noget gik galt. Prøv venligst igen.",
      );
      setSubmitting(false);
    }
  }

  // Step configuration
  const config: StepConfig = (() => {
    switch (step) {
      case 0:
        return {
          stepNumber: 0,
          title: "Lad os finde den rette løsning til jeres bryllup.",
          subtitle:
            "Er du i tvivl om, hvilken DJ, pakke eller løsning der passer til dit event? Fortæl os lidt mere om festen, så ringer vi dig op og hjælper med at finde den rette løsning.",
          content: <WelcomeStep />,
          hideBack: false,
          showProgress: false,
          nextLabel: "Start — det tager ~2 min",
        };
      case 1:
        return {
          stepNumber: 1,
          title: "Hvem skal giftes — og hvornår?",
          subtitle: "Vi bruger det til at adressere jer korrekt og holde datoen åben.",
          content: (
            <StepCard icon={<CalendarHeart className="h-5 w-5" />}>
              <Field label="Brudeparrets navne" htmlFor="adv-couple" required>
                <Input
                  id="adv-couple"
                  required
                  placeholder="Anna & Mikkel"
                  value={coupleNames}
                  onChange={(e) => setCoupleNames(e.target.value)}
                />
              </Field>
              <Field label="Bryllupsdato" htmlFor="adv-date" required>
                <Input
                  id="adv-date"
                  type="date"
                  required
                  value={weddingDate}
                  onChange={(e) => setWeddingDate(e.target.value)}
                />
              </Field>
            </StepCard>
          ),
        };
      case 2:
        return {
          stepNumber: 2,
          title: "Hvor holder I det?",
          subtitle: "Bare byen er nok. Festlokalet er valgfrit hvis I endnu ikke har valgt.",
          content: (
            <StepCard icon={<MapPin className="h-5 w-5" />}>
              <Field label="By / region" htmlFor="adv-city" required>
                <Input
                  id="adv-city"
                  required
                  placeholder="København"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                />
              </Field>
              <Field label="Festlokale (valgfrit)" htmlFor="adv-venue">
                <Input
                  id="adv-venue"
                  placeholder="Fx Moltkes Palæ, festsal hjemme, sommerhus..."
                  value={venueName}
                  onChange={(e) => setVenueName(e.target.value)}
                />
              </Field>
            </StepCard>
          ),
        };
      case 3:
        return {
          stepNumber: 3,
          title: "Hvor stort er det?",
          subtitle: "Antallet af gæster og DJ-tiden afgør hvilken pakke vi anbefaler.",
          content: (
            <StepCard icon={<Users className="h-5 w-5" />}>
              <Field label="Antal gæster (ca.)" htmlFor="adv-guests" required>
                <Input
                  id="adv-guests"
                  type="number"
                  inputMode="numeric"
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
                  inputMode="numeric"
                  min={1}
                  max={12}
                  placeholder="5"
                  value={totalHours}
                  onChange={(e) =>
                    setTotalHours(e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              </Field>
            </StepCard>
          ),
        };
      case 4:
        return {
          stepNumber: 4,
          title: "Hvilke dele af dagen skal DJ'en dække?",
          subtitle: "Vælg alle der passer — det styrer både timeforbrug og udstyr.",
          content: (
            <StepCard icon={<Clock className="h-5 w-5" />}>
              <Field label="DJ skal dække" required>
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
            </StepCard>
          ),
        };
      case 5:
        return {
          stepNumber: 5,
          title: "Hvilken musik forestiller I jer?",
          subtitle:
            "Du behøver ikke have det hele klar — bare nævn det vigtigste, så briefer vi DJ'en.",
          content: (
            <StepCard icon={<Music2 className="h-5 w-5" />}>
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
                    placeholder="Vores første dans, brudens fars yndlingssang..."
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
            </StepCard>
          ),
        };
      case 6:
        return {
          stepNumber: 6,
          title: "Hvad skal vi sørge for?",
          subtitle:
            "Vælg det udstyr vi skal medbringe. Vi har det hele med som standard.",
          content: (
            <StepCard icon={<Sparkles className="h-5 w-5" />}>
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
            </StepCard>
          ),
        };
      case 7:
        return {
          stepNumber: 7,
          title: "Budget og særlige ønsker?",
          subtitle:
            "Helt valgfrit. Det hjælper rådgiveren med at finde den rette pakke til jer.",
          content: (
            <StepCard icon={<Wallet className="h-5 w-5" />}>
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
                  rows={4}
                  placeholder="Alt I tænker er værd at nævne — overraskelser, tradition, sprog..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </Field>
            </StepCard>
          ),
        };
      case 8:
        return {
          stepNumber: 8,
          title: "Hvor kan rådgiveren ringe dig?",
          subtitle:
            "Vi kontakter dig typisk inden for et par timer i dagtimerne — ingen forpligtelser.",
          content: (
            <StepCard icon={<Phone className="h-5 w-5" />}>
              <Field label="Dit navn" htmlFor="adv-name" required>
                <Input
                  id="adv-name"
                  required
                  placeholder="Mikkel Hansen"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </Field>
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Email" htmlFor="adv-email" required>
                  <Input
                    id="adv-email"
                    type="email"
                    required
                    placeholder="dig@email.dk"
                    value={contactEmail}
                    onChange={(e) => setContactEmail(e.target.value)}
                  />
                </Field>
                <Field label="Telefon" htmlFor="adv-phone" required>
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
              <p className="text-xs text-muted-foreground">
                Når du sender, opretter vi automatisk en konto til dig så du
                kan følge med på din anbefaling. Du betaler ingenting før alt
                er aftalt på telefon.
              </p>
            </StepCard>
          ),
          nextLabel: "Gå til oversigt",
        };
      case 9:
        return {
          stepNumber: 9,
          title: "Klar til at sende dit brief?",
          subtitle:
            "Tjek lige at det hele ser rigtigt ud. Du kan altid justere bagefter sammen med rådgiveren.",
          content: (
            <ReviewStep
              data={{
                coupleNames,
                weddingDate,
                city,
                venueName,
                guestCount,
                totalHours,
                parts,
                musicStyle,
                mustPlay,
                doNotPlay,
                setupNeeds,
                budget,
                notes,
                contactName,
                contactEmail,
                contactPhone,
              }}
              blockedRole={blockedRole}
              submitError={submitError}
              onEdit={(s) => setStep(s)}
            />
          ),
          nextLabel: submitting ? "Sender..." : "Send og få rådgivning",
          showProgress: false,
        };
      default:
        return {
          stepNumber: step,
          title: "",
          content: null,
        };
    }
  })();

  function handleNext() {
    if (step === 9) {
      handleSubmit();
      return;
    }
    setStep(step + 1);
  }

  function handleBack() {
    if (step > 0) {
      setStep(step - 1);
      return;
    }
    navigate("/personal-advice");
  }

  return (
    <OfferWizardLayout
      step={config.stepNumber}
      totalSteps={TOTAL_STEPS}
      title={config.title}
      subtitle={config.subtitle}
      onBack={handleBack}
      onNext={handleNext}
      nextLabel={config.nextLabel}
      nextDisabled={nextDisabled || (step === 9 && Boolean(blockedRole))}
      hideBack={config.hideBack}
      hideNext={config.hideNext}
      showProgress={config.showProgress}
    >
      {config.content}
    </OfferWizardLayout>
  );
}

/* -------------------------------------------------------------------- */
/* Step UI helpers                                                       */
/* -------------------------------------------------------------------- */

function WelcomeStep() {
  return (
    <div className="space-y-6">
      <ul className="mx-auto max-w-md space-y-2 text-sm">
        {[
          "Personlig anbefaling baseret på dit eventbrief — ingen forpligtelser.",
          "En rådgiver ringer dig op typisk inden for et par timer.",
          "Mulighed for at booke direkte gennem platformen — alt samlet ét sted.",
        ].map((point) => (
          <li key={point} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <span>{point}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function StepCard({
  icon,
  children,
}: {
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto max-w-xl space-y-5 rounded-2xl border border-border/60 bg-card/40 p-5 shadow-sm sm:p-6">
      {icon && (
        <div className="grid h-10 w-10 place-items-center rounded-full bg-rose-100 text-rose-700">
          {icon}
        </div>
      )}
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  htmlFor,
  required,
  children,
}: {
  label: string;
  htmlFor?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="ml-0.5 text-rose-600">*</span>}
      </Label>
      {children}
    </div>
  );
}

type ReviewData = {
  coupleNames: string;
  weddingDate: string;
  city: string;
  venueName: string;
  guestCount: number | "";
  totalHours: number | "";
  parts: Array<"ceremony" | "dinner" | "party">;
  musicStyle: string;
  mustPlay: string;
  doNotPlay: string;
  setupNeeds: string[];
  budget: string;
  notes: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
};

function ReviewStep({
  data,
  blockedRole,
  submitError,
  onEdit,
}: {
  data: ReviewData;
  blockedRole: string | null;
  submitError: string | null;
  onEdit: (step: number) => void;
}) {
  const partsLabel = data.parts
    .map((p) => (p === "ceremony" ? "ceremoni" : p === "dinner" ? "middag" : "fest"))
    .join(" + ");

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <SummaryRow
        label="Brudepar"
        onEdit={() => onEdit(1)}
        value={`${data.coupleNames} · ${formatDateDanish(data.weddingDate)}`}
      />
      <SummaryRow
        label="Sted"
        onEdit={() => onEdit(2)}
        value={[data.city, data.venueName].filter(Boolean).join(" · ")}
      />
      <SummaryRow
        label="Størrelse"
        onEdit={() => onEdit(3)}
        value={`${data.guestCount || "?"} gæster · ${data.totalHours || "?"} timer DJ-tid`}
      />
      <SummaryRow label="Forløb" onEdit={() => onEdit(4)} value={partsLabel || "—"} />
      <SummaryRow
        label="Musik"
        onEdit={() => onEdit(5)}
        value={data.musicStyle || "Ikke specificeret"}
        secondary={[
          data.mustPlay && `Skal: ${data.mustPlay}`,
          data.doNotPlay && `Ikke: ${data.doNotPlay}`,
        ]
          .filter(Boolean)
          .join(" · ")}
      />
      <SummaryRow
        label="Setup"
        onEdit={() => onEdit(6)}
        value={data.setupNeeds.join(", ") || "Standard"}
      />
      {(data.budget || data.notes) && (
        <SummaryRow
          label="Budget & noter"
          onEdit={() => onEdit(7)}
          value={data.budget || "Intet specifikt budget"}
          secondary={data.notes}
        />
      )}
      <SummaryRow
        label="Kontakt"
        onEdit={() => onEdit(8)}
        value={data.contactName}
        secondary={`${data.contactEmail} · ${data.contactPhone}`}
      />

      {blockedRole && (
        <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
          Du er logget ind som{" "}
          <strong>{blockedRole === "dj" ? "DJ" : "administrator"}</strong>. Log
          ud først for at sende en personlig rådgivnings-anmodning som kunde,
          så vi ikke overskriver din nuværende session.
        </div>
      )}
      {submitError && !blockedRole && (
        <div className="rounded-xl border border-rose-300 bg-rose-50 p-4 text-sm text-rose-900">
          {submitError}
        </div>
      )}
    </div>
  );
}

function SummaryRow({
  label,
  value,
  secondary,
  onEdit,
}: {
  label: string;
  value: string;
  secondary?: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-xl border border-border/60 bg-card/40 p-4">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm font-medium">{value || "—"}</p>
        {secondary && (
          <p className="mt-1 truncate text-xs text-muted-foreground">{secondary}</p>
        )}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="shrink-0 text-xs font-medium text-rose-700 underline-offset-2 hover:underline"
      >
        Rediger
      </button>
    </div>
  );
}

function formatDateDanish(iso: string): string {
  if (!iso) return "Ikke valgt";
  try {
    return new Date(iso).toLocaleDateString("da-DK", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}
