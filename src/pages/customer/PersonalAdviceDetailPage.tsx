import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft, Check, Clock, MapPin, Music2, Phone, Sparkles, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useAuth } from "@/hooks/useAuth";
import {
  advisoryRecordIsVisibleTo,
  readAdvisoryRecord,
  writeAdvisoryRecord,
  type PersonalAdviceRecord,
} from "@/lib/personalAdviceStore";

/**
 * Customer-dashboard page that mirrors the live-progress page used by the
 * "Get 3 offers" flow, but for advisory requests. Shows the recommended
 * package, an explanation of *why* the platform recommends it, and the two
 * CTAs (reserve / decline). Gated on the active customer owning the record.
 */
export function PersonalAdviceDetailPage() {
  useDocumentHead({
    title: "Din personlige anbefaling · DJConnect",
    description: "Din personlige DJ-anbefaling baseret på dit eventbrief.",
  });

  const { adviceId } = useParams<{ adviceId: string }>();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const customerId = profile?.role === "customer" ? profile.id : null;

  const [record, setRecord] = useState<PersonalAdviceRecord | null>(null);

  useEffect(() => {
    if (!adviceId) return;
    function load() {
      if (!adviceId) return;
      setRecord(readAdvisoryRecord(adviceId));
    }
    load();
    const onUpdate = () => load();
    window.addEventListener("personalAdvice:update", onUpdate);
    window.addEventListener("storage", onUpdate);
    return () => {
      window.removeEventListener("personalAdvice:update", onUpdate);
      window.removeEventListener("storage", onUpdate);
    };
  }, [adviceId]);

  const wedding = record?.brief.eventType === "wedding" ? record.brief.wedding : null;

  const eventSummary = useMemo(() => {
    if (!wedding) return null;
    const parts = wedding.parts
      .map((p) => (p === "ceremony" ? "ceremoni" : p === "dinner" ? "middag" : "fest"))
      .join(" + ");
    return {
      headline: `Bryllup for ${wedding.coupleNames || "jer"}`,
      sub: [
        wedding.weddingDate ? formatDateDanish(wedding.weddingDate) : null,
        wedding.guestCount ? `${wedding.guestCount} gæster` : null,
        wedding.city,
        parts,
      ]
        .filter(Boolean)
        .join(" · "),
      hours: wedding.totalHours,
      style: wedding.musicStyle,
      setup: wedding.setupNeeds,
    };
  }, [wedding]);

  if (!record) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Den personlige rådgivning kunne ikke findes.
        </p>
        <Button asChild variant="outline">
          <a href="/dashboard/requests">
            <ArrowLeft className="h-4 w-4" /> Tilbage til mine anmodninger
          </a>
        </Button>
      </div>
    );
  }

  if (!advisoryRecordIsVisibleTo(record, customerId)) {
    return (
      <div className="mx-auto max-w-2xl space-y-4 py-10 text-center">
        <p className="text-sm text-muted-foreground">
          Du har ikke adgang til denne rådgivning.
        </p>
        <Button asChild variant="outline">
          <a href="/dashboard/requests">
            <ArrowLeft className="h-4 w-4" /> Tilbage
          </a>
        </Button>
      </div>
    );
  }

  function setStatus(next: PersonalAdviceRecord["status"]) {
    if (!record) return;
    writeAdvisoryRecord({ ...record, status: next });
    setRecord({ ...record, status: next });
  }

  function handleReserve() {
    setStatus("reserved");
  }

  function handleDecline() {
    if (window.confirm("Er du sikker på, at du vil afslå denne anbefaling?")) {
      setStatus("declined");
    }
  }

  const { recommendation, status } = record;
  const priceLabel = formatDkk(recommendation.priceDkk);

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <button
        type="button"
        onClick={() => navigate("/dashboard/requests")}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Mine anmodninger
      </button>

      <header className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-700">
            <Sparkles className="h-3 w-3" />
            Personlig rådgivning
          </span>
          <StatusPill status={status} />
        </div>
        <h1 className="text-3xl font-semibold leading-tight tracking-tight md:text-4xl">
          Din personlige anbefaling er klar
        </h1>
        {eventSummary && (
          <p className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">{eventSummary.headline}</span>
            <span> · {eventSummary.sub}</span>
          </p>
        )}
      </header>

      {/* Status-aware lede paragraph */}
      <div className="rounded-2xl border border-border/60 bg-card/40 p-5 text-sm leading-relaxed">
        {status === "awaiting_call" && (
          <p>
            Tak — vi har modtaget jeres brief. Baseret på det, I har sendt, har
            vi sammensat den anbefaling, du ser nedenfor. <strong>En rådgiver
            ringer dig op inden for et par timer</strong> for at gennemgå
            detaljerne og sikre, at løsningen passer, før bookingen bekræftes.
          </p>
        )}
        {status === "reserved" && (
          <p className="text-emerald-800">
            <Check className="mr-1 inline h-4 w-4" />
            Datoen er reserveret. En rådgiver ringer dig op for at bekræfte de
            sidste detaljer og sende den endelige aftale.
          </p>
        )}
        {status === "declined" && (
          <p className="text-muted-foreground">
            Du har afslået denne anbefaling. Vil du have et nyt forslag eller
            tale med en rådgiver alligevel?{" "}
            <a href="/contact" className="font-medium text-foreground underline-offset-2 hover:underline">
              Kontakt os her
            </a>
            .
          </p>
        )}
      </div>

      {/* Personalized rationale + package */}
      <section className="overflow-hidden rounded-2xl border border-border/60 bg-card">
        <div className="space-y-2 border-b border-border/60 bg-muted/20 p-5 sm:p-6">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Vores anbefaling til jer
          </p>
          <p className="text-base leading-relaxed">
            Baseret på dit eventbrief anbefaler vi{" "}
            <strong>{recommendation.name}-pakken</strong>. Den passer til{" "}
            jeres gæsteantal, eventtype og ønskede setup.
          </p>
          {eventSummary && (
            <p className="text-sm text-muted-foreground">
              {recommendation.rationale}
            </p>
          )}
        </div>

        <div className="space-y-5 p-5 sm:p-6">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                DJ-pakke
              </p>
              <p className="text-2xl font-semibold">
                {recommendation.name} · {recommendation.hours} timer
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Pris
              </p>
              <p className="text-2xl font-semibold tabular-nums">{priceLabel}</p>
            </div>
          </div>

          <div className="space-y-1.5">
            <p className="text-sm font-medium">Inkluderet i pakken</p>
            <ul className="grid gap-1.5 sm:grid-cols-2">
              {recommendation.includes.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm">
                  <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {eventSummary && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Hvorfor {recommendation.name}?
              </p>
              <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
                {wedding && wedding.guestCount > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-foreground/60" />
                    <span>
                      <span className="text-foreground">{wedding.guestCount} gæster</span>{" "}
                      passer til denne pakkestørrelse — anlægget dækker rummet uden at overdøve middagen.
                    </span>
                  </li>
                )}
                {wedding && wedding.parts.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-foreground/60" />
                    <span>
                      Vi har sat <span className="text-foreground">{recommendation.hours} timer</span> af —
                      nok til at dække {wedding.parts.includes("ceremony") ? "ceremoni, " : ""}
                      {wedding.parts.includes("dinner") ? "middag " : ""}
                      {wedding.parts.includes("party") ? "og dansefest" : ""} med god margin.
                    </span>
                  </li>
                )}
                {wedding && wedding.setupNeeds.length > 0 && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-foreground/60" />
                    <span>
                      Pakken inkluderer{" "}
                      <span className="text-foreground">{wedding.setupNeeds.join(", ").toLowerCase()}</span>{" "}
                      som I har efterspurgt.
                    </span>
                  </li>
                )}
                {wedding && wedding.musicStyle && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-foreground/60" />
                    <span>
                      Vi briefer DJ'en på jeres musikstil: "{wedding.musicStyle}".
                    </span>
                  </li>
                )}
                {wedding && wedding.city && (
                  <li className="flex items-start gap-2">
                    <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-foreground/60" />
                    <span>
                      Transport til <span className="text-foreground">{wedding.city}</span>{" "}
                      er inkluderet i prisen.
                    </span>
                  </li>
                )}
              </ul>
            </div>
          )}

          {/* Advisor reassurance */}
          <div className="flex items-start gap-3 rounded-xl border border-rose-100 bg-rose-50/60 p-4">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-rose-100 text-rose-700">
              <Phone className="h-4 w-4" />
            </span>
            <div className="space-y-1 text-sm">
              <p className="font-medium text-foreground">
                En rådgiver ringer dig op inden for et par timer
              </p>
              <p className="text-muted-foreground">
                Vi gennemgår detaljerne sammen, justerer pakken hvis I har
                yderligere ønsker, og bekræfter først bookingen når I er
                tilfredse. Du betaler ingenting før alt er aftalt.
              </p>
            </div>
          </div>

          {/* CTAs */}
          {status === "awaiting_call" && (
            <div className="flex flex-wrap gap-3 pt-1">
              <Button onClick={handleReserve} size="lg" className="gap-1.5">
                Reserver din dato nu
              </Button>
              <Button
                onClick={handleDecline}
                variant="outline"
                size="lg"
                className="gap-1.5"
              >
                <X className="h-4 w-4" />
                Afslå tilbud
              </Button>
            </div>
          )}
          {status === "reserved" && (
            <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 text-sm">
              <p className="flex items-center gap-2 font-medium text-emerald-800">
                <Check className="h-4 w-4" /> Datoen er reserveret
              </p>
              <p className="mt-1 text-emerald-900/80">
                Vi har holdt {formatDateDanish(wedding?.weddingDate ?? "")}{" "}
                til jer. Rådgiveren ringer dig op for at bekræfte aftalen.
              </p>
            </div>
          )}
          {status === "declined" && (
            <div className="rounded-xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
              Du har afslået anbefalingen. Hvis du fortryder, skriv til os —
              vi kan let lave en ny anbefaling.
            </div>
          )}
        </div>
      </section>

      {/* Brief recap (helps DJ understand what they submitted) */}
      {wedding && (
        <section className="space-y-3">
          <h2 className="text-lg font-semibold">Det vi har modtaget</h2>
          <dl className="grid gap-3 rounded-2xl border border-border/60 bg-card/40 p-5 text-sm sm:grid-cols-2">
            <BriefRow icon={<Clock className="h-3.5 w-3.5" />} label="Dato">
              {formatDateDanish(wedding.weddingDate)}
            </BriefRow>
            <BriefRow icon={<MapPin className="h-3.5 w-3.5" />} label="By">
              {wedding.city}
              {wedding.venueName && (
                <span className="text-muted-foreground"> · {wedding.venueName}</span>
              )}
            </BriefRow>
            <BriefRow icon={<Sparkles className="h-3.5 w-3.5" />} label="Gæster">
              {wedding.guestCount}
            </BriefRow>
            <BriefRow icon={<Music2 className="h-3.5 w-3.5" />} label="Stil">
              {wedding.musicStyle || "Ikke angivet"}
            </BriefRow>
            {wedding.mustPlay && (
              <BriefRow icon={<Music2 className="h-3.5 w-3.5" />} label="Skal-spilles" wide>
                {wedding.mustPlay}
              </BriefRow>
            )}
            {wedding.doNotPlay && (
              <BriefRow icon={<X className="h-3.5 w-3.5" />} label="Må-ikke-spilles" wide>
                {wedding.doNotPlay}
              </BriefRow>
            )}
            {wedding.notes && (
              <BriefRow icon={<Sparkles className="h-3.5 w-3.5" />} label="Bemærkninger" wide>
                {wedding.notes}
              </BriefRow>
            )}
          </dl>
        </section>
      )}
    </div>
  );
}

function BriefRow({
  icon,
  label,
  children,
  wide,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-2" : undefined}>
      <dt className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </dt>
      <dd className="mt-1 text-sm">{children}</dd>
    </div>
  );
}

function StatusPill({ status }: { status: PersonalAdviceRecord["status"] }) {
  if (status === "reserved") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        <Check className="h-3 w-3" />
        Reserveret
      </span>
    );
  }
  if (status === "declined") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted/40 px-3 py-1 text-xs font-medium text-muted-foreground">
        Afslået
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-800">
      <Phone className="h-3 w-3" />
      Afventer rådgiver-opkald
    </span>
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

function formatDkk(amount: number): string {
  return amount.toLocaleString("da-DK") + " kr.";
}
