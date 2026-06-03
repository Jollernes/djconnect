import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  MapPin,
  Shield,
  Music4,
  Users,
  Calendar as CalendarIcon,
  Star,
  Headphones,
  Speaker,
  Mic2,
  Lightbulb,
  Sparkles,
  MessageCircle,
  Clock,
  Languages,
  Check,
  Award,
  Disc3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { StarRating } from "@/components/common/StarRating";
import { ProfileGallery } from "@/components/common/ProfileGallery";
import { Equalizer } from "@/components/common/Equalizer";
import { AvailabilityCalendar } from "@/components/common/AvailabilityCalendar";
import { EmptyState } from "@/components/common/EmptyState";
import { DJCard } from "@/components/common/DJCard";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { DJProfileWithRelations, Review } from "@/types/domain";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";
import { EVENT_TYPE_OPTIONS } from "@/lib/eventTypeOptions";

export interface DJProfileViewProps {
  dj: DJProfileWithRelations;
  reviews: Review[];
  similarDJs: DJProfileWithRelations[];
  eventTypeId?: string | null;
  onEventTypeChange?: (id: string) => void;
  /**
   * `"page"` (default) renders the fully-interactive public profile.
   * `"preview"` neuters every navigation/CTA so the same JSX can be
   * embedded inside the DJ profile editor as a faithful live preview
   * without the share / save / book affordances doing anything.
   */
  mode?: "page" | "preview";
}

/**
 * Visual body of a DJ's public profile.
 *
 * Lives independently from the route wrapper (`DJProfilePage`) so the
 * same component can be reused inside the profile editor as a live
 * preview. In `"preview"` mode interactive surfaces become inert and
 * the sticky mobile booking CTA / similar-DJs section are hidden so
 * the preview doesn't extend beyond what's relevant to the editor.
 */
export function DJProfileView({
  dj,
  reviews,
  similarDJs,
  eventTypeId = null,
  onEventTypeChange,
  mode = "page",
}: DJProfileViewProps) {
  const preview = mode === "preview";
  const [aboutExpanded, setAboutExpanded] = useState(false);

  const bookHref = eventTypeId
    ? `/book/${dj.username}?eventType=${eventTypeId}`
    : `/book/${dj.username}`;

  const galleryImages = useMemo(() => {
    const equip = dj.equipment_photos.map((p) => ({
      id: p.id,
      url: p.url,
      alt: `${dj.stage_name} live setup`,
    }));
    if (dj.profile.avatar_url) {
      equip.push({
        id: "avatar",
        url: dj.profile.avatar_url,
        alt: dj.stage_name,
      });
    }
    return equip;
  }, [dj]);

  const longBio = (dj.bio?.length ?? 0) > 280;
  const equipmentLines = dj.equipment_description
    .split(/[,.·]/)
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <div className={cn("bg-gradient-to-b from-white via-white to-slate-50", preview ? "pb-6" : "pb-28")}>
      <div className={cn(preview ? "px-4 pt-4 sm:px-6 sm:pt-6" : "container pt-6 sm:pt-10")}>
        {/* Photo collage */}
        <ProfileGallery images={galleryImages} />

        {/* Festive ribbon — neon strip with equalizer + signal pills */}
        <div className="relative mt-5 overflow-hidden rounded-2xl border bg-[hsl(222_47%_10%)] px-4 py-3 text-white sm:px-6">
          <div
            className="absolute inset-0 opacity-80"
            style={{
              background:
                "linear-gradient(90deg, hsla(21,90%,53%,0.55) 0%, hsla(280,85%,60%,0.45) 35%, hsla(199,89%,60%,0.4) 65%, hsla(21,90%,53%,0.55) 100%)",
              backgroundSize: "200% 100%",
              animation: "marquee 14s linear infinite",
            }}
          />
          <div className="absolute inset-0 bg-grid opacity-30" />
          <div className="relative flex flex-wrap items-center gap-x-5 gap-y-2 text-xs sm:text-sm">
            <span className="inline-flex items-center gap-2 font-medium">
              <Equalizer bars={4} className="h-4 text-amber-300" />
              <span>LIVE på DJConnect</span>
            </span>
            <Separator orientation="vertical" className="hidden h-4 bg-white/30 sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Award className="h-4 w-4 text-amber-300" /> {dj.events_performed} events udført
            </span>
            <Separator orientation="vertical" className="hidden h-4 bg-white/30 sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" /> Svarer inden for 2 timer
            </span>
            <Separator orientation="vertical" className="hidden h-4 bg-white/30 sm:block" />
            <span className="inline-flex items-center gap-1.5">
              <Disc3 className="h-4 w-4 animate-spin-slow" style={{ animationDuration: "8s" }} />
              {dj.years_experience} års erfaring
            </span>
          </div>
        </div>
      </div>

      <div
        className={cn(
          "mt-8 grid gap-x-12 gap-y-8",
          preview ? "px-4 sm:px-6" : "container lg:grid-cols-[minmax(0,1fr)_400px]",
        )}
      >
        {/* Main column */}
        <div className="min-w-0 space-y-10">
          {/* DJ identity */}
          <section className="flex items-start justify-between gap-6 border-b pb-8">
            <div>
              <h2 className="text-xl font-semibold sm:text-2xl">
                DJ {dj.stage_name}
              </h2>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1 font-medium text-foreground">
                  <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  {dj.rating_average.toFixed(2)}
                  <span className="text-muted-foreground">
                    · {dj.rating_count} anmeldelser
                  </span>
                </span>
                <span className="inline-flex items-center gap-1">
                  <Shield className="h-4 w-4 text-emerald-600" />
                  Verificeret DJ
                </span>
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-4 w-4" />
                  Kører i hele {dj.base_location}
                </span>
              </div>
            </div>
            <Avatar className="h-16 w-16 ring-2 ring-white sm:h-20 sm:w-20">
              <AvatarImage src={dj.profile.avatar_url ?? undefined} alt={dj.stage_name} />
              <AvatarFallback>{dj.stage_name.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </section>

          {/* Highlight stats */}
          <section className="grid gap-4 border-b pb-10 sm:grid-cols-2">
            <Highlight
              icon={<Sparkles className="h-5 w-5" />}
              title="Topbedømt på DJConnect"
              body={`${dj.rating_count} anmeldelser med et gennemsnit på ${dj.rating_average.toFixed(1)}★ — gæsterne fremhæver konsekvent energien på dansegulvet.`}
            />
            <Highlight
              icon={<Shield className="h-5 w-5" />}
              title="Baggrundsverificeret"
              body="ID + virksomhedsdokumenter gennemgået af DJConnect. Betalinger holdes i depot indtil 24 timer efter dit event."
            />
            <Highlight
              icon={<MessageCircle className="h-5 w-5" />}
              title="Hurtig til at svare"
              body="Svarer på bookingforespørgsler inden for 2 timer i gennemsnit — du hører hurtigt tilbage."
            />
            <Highlight
              icon={<Music4 className="h-5 w-5" />}
              title="Læser stemningen"
              body="Planlægger aftenen med dig på forhånd og tilpasser sig live. Glidende overgange mellem taler, middag og dans."
            />
          </section>

          {/* About */}
          <section>
            <h2 className="mb-3 text-xl font-semibold sm:text-2xl">Om denne DJ</h2>
            <p
              className={
                "whitespace-pre-line text-[15px] leading-relaxed text-foreground/85 " +
                (longBio && !aboutExpanded ? "line-clamp-5" : "")
              }
            >
              {dj.bio}
            </p>
            {longBio && (
              <button
                type="button"
                onClick={() => setAboutExpanded((e) => !e)}
                className="mt-2 text-sm font-medium underline underline-offset-4"
              >
                {aboutExpanded ? "Vis mindre" : "Vis mere"}
              </button>
            )}
          </section>

          <Separator />

          {/* What's included / equipment */}
          <section>
            <h2 className="mb-1 text-xl font-semibold sm:text-2xl">Hvad er inkluderet</h2>
            <p className="mb-5 text-sm text-muted-foreground">
              Alt {dj.profile.full_name?.split(" ")[0] ?? "din DJ"} tager med til dit event.
            </p>
            <div className="grid gap-x-8 gap-y-3 sm:grid-cols-2">
              {equipmentLines.slice(0, 8).map((line, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 to-rose-100 text-amber-700">
                    {iconForLine(i)}
                  </span>
                  <span className="text-[15px] leading-snug">{line}</span>
                </div>
              ))}
            </div>
            {dj.equipment_description && equipmentLines.length === 0 && (
              <p className="text-muted-foreground">{dj.equipment_description}</p>
            )}
          </section>

          <Separator />

          {/* Genres / event types */}
          <section>
            <h2 className="mb-3 text-xl font-semibold sm:text-2xl">Perfekt til</h2>
            <div className="flex flex-wrap gap-2">
              {dj.event_types.map((et) => (
                <Badge
                  key={et.id}
                  variant="outline"
                  className="rounded-full border-foreground/15 bg-white px-4 py-1.5 text-sm font-medium"
                >
                  {et.label}
                </Badge>
              ))}
            </div>
          </section>

          {/* Live mix tile — festive */}
          <section className="relative overflow-hidden rounded-3xl border bg-[hsl(222_47%_10%)] p-6 text-white sm:p-8">
            <div className="absolute inset-0 hero-gradient opacity-50" />
            <div className="absolute inset-0 bg-grid opacity-20" />
            <div className="relative flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-center">
              <div>
                <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium uppercase tracking-widest backdrop-blur">
                  <Headphones className="h-3.5 w-3.5" /> Prøvemix
                </div>
                <h3 className="text-xl font-semibold sm:text-2xl">
                  60-minutters bryllups-warm-up-sæt
                </h3>
                <p className="mt-1 max-w-md text-sm text-white/75">
                  Et indtryk af hvordan {dj.stage_name} bygger stemningen op fra velkomstdrinks til den første dans.
                </p>
              </div>
              <Button
                variant="accent"
                size="lg"
                className="gap-2 shadow-lg shadow-black/30"
                aria-label="Play sample mix"
                disabled={preview}
              >
                <Disc3 className="h-5 w-5 animate-spin-slow" />
                Afspil prøve
              </Button>
            </div>
            <Waveform />
          </section>

          {/* Notable */}
          {dj.notable_clients && (
            <section>
              <h2 className="mb-2 text-xl font-semibold sm:text-2xl">Markante events & kunder</h2>
              <p className="text-[15px] leading-relaxed text-foreground/85">{dj.notable_clients}</p>
            </section>
          )}

          <Separator />

          {/* Availability */}
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-xl font-semibold sm:text-2xl">Tilgængelighed</h2>
              <span className="text-sm text-muted-foreground">Tryk på en dato for at starte booking</span>
            </div>
            <div className="overflow-hidden rounded-2xl border bg-white">
              <AvailabilityCalendar bookedDates={[]} blockedDates={[]} />
            </div>
          </section>

          <Separator />

          {/* Reviews */}
          <section>
            <div className="mb-5 flex items-center gap-3">
              <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
              <h2 className="text-xl font-semibold sm:text-2xl">
                {dj.rating_average.toFixed(2)} · {dj.rating_count} anmeldelser
              </h2>
            </div>
            {reviews.length === 0 ? (
              <EmptyState
                title="Ingen anmeldelser endnu"
                description="Denne DJ er ny på platformen — vær den første til at booke."
              />
            ) : (
              <div className="grid gap-5 sm:grid-cols-2">
                {reviews.slice(0, 6).map((review) => (
                  <Card key={review.id} className="border-none shadow-none">
                    <CardContent className="space-y-3 p-0">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback>
                            {String(review.customer_id).slice(-2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-semibold">Verificeret gæst</div>
                          <div className="text-xs text-muted-foreground">
                            {formatDate(review.created_at)}
                          </div>
                        </div>
                      </div>
                      <StarRating value={review.rating} size="sm" />
                      <p className="text-[15px] leading-relaxed">{review.body}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </section>

          <Separator />

          {/* FAQ */}
          <section>
            <h2 className="mb-4 text-xl font-semibold sm:text-2xl">Godt at vide</h2>
            <Accordion type="multiple" className="rounded-2xl border bg-white">
              <AccordionItem value="cancel" className="border-b px-5">
                <AccordionTrigger className="py-5 text-left text-base font-medium">
                  Afbestillingspolitik
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
                  Gratis afbestilling op til 30 dage før eventet. 50% refunderet 14–30 dage før.
                  Inden for 14 dage er bookingen ikke-refunderbar, så DJ'en kan holde datoen.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="travel" className="border-b px-5">
                <AccordionTrigger className="py-5 text-left text-base font-medium">
                  Transport & logistik
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
                  Kører op til {dj.travel_radius_km} km fra {dj.base_location}. Transport ud over det
                  kan tilbydes efter aftale. Standardopsætning er 90 minutter; nedtagning er 45 minutter.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="venue" className="border-b px-5">
                <AccordionTrigger className="py-5 text-left text-base font-medium">
                  Krav til lokationen
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
                  Kræver en flad flade på 3m×2m nær en 230V-stikkontakt samt adgang til en mindre indbæring.
                  Kan skalere udstyret op eller ned, så det passer til enhver lokation.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="payment" className="px-5">
                <AccordionTrigger className="py-5 text-left text-base font-medium">
                  Betaling & beskyttelse
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-[15px] leading-relaxed text-muted-foreground">
                  Betal sikkert gennem DJConnect. Pengene holdes i depot og frigives først til
                  DJ'en 24 timer efter eventet — så du er beskyttet, hvis noget går galt.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </section>
        </div>

        {/* Sticky booking sidebar */}
        {!preview && (
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <Card className="overflow-hidden rounded-2xl shadow-xl ring-1 ring-black/5">
                <CardContent className="space-y-5 p-6">
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="text-2xl font-semibold">
                        {dj.price_on_request
                          ? "På forespørgsel"
                          : dj.price_from_minor
                          ? formatCurrency(dj.price_from_minor, dj.currency)
                          : "—"}
                      </span>
                      <span className="ml-1 text-sm text-muted-foreground">/ event</span>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                      <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                      {dj.rating_average.toFixed(2)}
                      <span className="text-muted-foreground/70">
                        · {dj.rating_count}
                      </span>
                    </span>
                  </div>

                  <div className="grid grid-cols-2 overflow-hidden rounded-xl border">
                    <div className="border-r p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Eventtype
                      </div>
                      <div className="mt-1 text-sm font-medium">Bryllup · 6t</div>
                    </div>
                    <div className="p-3">
                      <div className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                        Gæster
                      </div>
                      <div className="mt-1 text-sm font-medium">Op til 250</div>
                    </div>
                  </div>

                  <Button asChild variant="accent" size="lg" className="w-full text-base shadow-lg">
                    <Link to={bookHref}>Anmod om booking</Link>
                  </Button>
                  <p className="text-center text-xs text-muted-foreground">
                    Du bliver ikke opkrævet endnu — først et tilbud, derefter sikker betaling.
                  </p>

                  <Separator />

                  <ul className="space-y-3 text-sm">
                    <li className="flex items-start gap-3">
                      <Shield className="mt-0.5 h-4 w-4 text-emerald-600" />
                      <span>Betaling holdes sikkert i depot indtil 24 timer efter dit event.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Clock className="mt-0.5 h-4 w-4 text-foreground/70" />
                      <span>Gennemsnitlig svartid: under 2 timer.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <Languages className="mt-0.5 h-4 w-4 text-foreground/70" />
                      <span>Taler flydende dansk & engelsk.</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CalendarIcon className="mt-0.5 h-4 w-4 text-foreground/70" />
                      <span>Gratis afbestilling op til 30 dage før eventet.</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              {eventTypeId && onEventTypeChange && (
                <div className="mt-3 inline-flex items-center px-2">
                  <span className="text-[11px] text-muted-foreground/60">Viewing</span>
                  <div className="relative ml-1">
                    <select
                      value={eventTypeId}
                      onChange={(e) => onEventTypeChange(e.target.value)}
                      className="appearance-none border-none bg-transparent py-0 pl-0 pr-4 text-[11px] font-medium text-muted-foreground/70 outline-none hover:text-muted-foreground cursor-pointer"
                    >
                      {EVENT_TYPE_OPTIONS.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.label}-profil
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute right-0 top-1/2 h-2.5 w-2.5 -translate-y-1/2 text-muted-foreground/40" />
                  </div>
                </div>
              )}

              <p className="mt-4 px-2 text-xs text-muted-foreground">
                Anmeld denne profil · Senest opdateret {formatDate(dj.updated_at)}
              </p>
            </div>
          </aside>
        )}

        {/* Preview-mode booking pill (replaces sticky sidebar) */}
        {preview && (
          <section className="rounded-2xl border bg-white p-5 shadow-sm">
            <div className="flex items-baseline justify-between gap-2">
              <div>
                <span className="text-2xl font-semibold">
                  {dj.price_on_request
                    ? "På forespørgsel"
                    : dj.price_from_minor
                    ? formatCurrency(dj.price_from_minor, dj.currency)
                    : "—"}
                </span>
                <span className="ml-1 text-sm text-muted-foreground">/ event</span>
              </div>
              <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
                <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                {dj.rating_average.toFixed(2)}
                <span className="text-muted-foreground/70">· {dj.rating_count}</span>
              </span>
            </div>
            <Button
              variant="accent"
              size="lg"
              className="mt-4 w-full text-base shadow-lg"
              disabled
            >
              Anmod om booking
            </Button>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Kunder ser dette bookingpanel — deaktiveret her, mens du redigerer.
            </p>
          </section>
        )}
      </div>

      {/* Similar DJs */}
      {!preview && similarDJs.length > 0 && (
        <section className="container mt-16">
          <h2 className="mb-5 text-xl font-semibold sm:text-2xl">Flere DJs du måske vil elske</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {similarDJs.map((d) => (
              <DJCard key={d.id} dj={d} />
            ))}
          </div>
        </section>
      )}

      {/* Sticky mobile CTA */}
      {!preview && (
        <div className="fixed inset-x-0 bottom-0 z-30 border-t bg-background/95 p-3 shadow-2xl backdrop-blur lg:hidden">
          <div className="container flex items-center justify-between gap-3">
            <div>
              <div className="text-base font-semibold">
                {dj.price_on_request
                  ? "På forespørgsel"
                  : dj.price_from_minor
                  ? formatCurrency(dj.price_from_minor, dj.currency)
                  : "—"}
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                {dj.rating_average.toFixed(2)} · {dj.rating_count} anmeldelser
              </div>
            </div>
            <Button asChild variant="accent" size="lg" className="shadow-lg">
              <Link to={bookHref}>Anmod om booking</Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

function Highlight({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-100 via-rose-100 to-violet-100 text-amber-700">
        {icon}
      </span>
      <div>
        <div className="text-base font-semibold">{title}</div>
        <p className="mt-0.5 text-sm leading-snug text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function iconForLine(i: number) {
  const icons = [
    <Music4 key="m" className="h-5 w-5" />,
    <Speaker key="sp" className="h-5 w-5" />,
    <Lightbulb key="l" className="h-5 w-5" />,
    <Mic2 key="mc" className="h-5 w-5" />,
    <Disc3 key="d" className="h-5 w-5" />,
    <Headphones key="h" className="h-5 w-5" />,
    <Sparkles key="s" className="h-5 w-5" />,
    <Check key="c" className="h-5 w-5" />,
    <Users key="u" className="h-5 w-5" />,
  ];
  return icons[i % icons.length];
}

function Waveform() {
  const bars = Array.from({ length: 56 });
  return (
    <div className="relative mt-6 flex h-24 items-end gap-[3px] sm:h-28">
      {bars.map((_, i) => {
        const h = 14 + Math.abs(Math.sin(i * 0.42)) * 70 + (i % 7) * 4;
        return (
          <span
            key={i}
            className="block w-[5px] rounded-sm bg-gradient-to-t from-amber-400 via-rose-400 to-violet-400"
            style={{
              height: `${Math.min(100, h)}%`,
              animation: "eq-bounce 1.2s ease-in-out infinite",
              animationDelay: `${(i * 0.05) % 1.4}s`,
              transformOrigin: "bottom",
            }}
          />
        );
      })}
    </div>
  );
}
