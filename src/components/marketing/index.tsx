import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Headphones,
  PlayCircle,
  ShieldCheck,
  Sparkles,
  Speaker,
  Ticket,
  Wand2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn, formatDKKFrom } from "@/lib/utils";
import { EVENT_TYPE_OPTIONS, GUEST_COUNT_RANGE_OPTIONS } from "@/lib/constants";
import { useCollection } from "@/lib/store";
import { HOME_FAQ_ITEMS } from "@/lib/faq";
import { USE_CASE_CONFIGS } from "@/lib/useCases";
import { StarRating } from "@/components/common/StarRating";
import type { DJ, EventType, Package, Review } from "@/types/domain";

export type BookingWidgetValues = {
  eventDate: string;
  city: string;
  guestCountRange: string;
  eventType: EventType | "";
};

export function BookingWidget({ className, initialValues }: { className?: string; initialValues?: Partial<BookingWidgetValues> }) {
  const navigate = useNavigate();
  const [form, setForm] = useState<BookingWidgetValues>({
    eventDate: initialValues?.eventDate ?? "",
    city: initialValues?.city ?? "",
    guestCountRange: initialValues?.guestCountRange ?? "",
    eventType: initialValues?.eventType ?? "",
  });
  const isComplete = Boolean(form.eventDate && form.city.trim() && form.guestCountRange && form.eventType);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isComplete) return;
    navigate("/brief", { state: { prefill: form } });
  }

  return (
    <Card className={cn("border-border/60 bg-card/95 shadow-lg backdrop-blur", className)}>
      <CardHeader className="space-y-2">
        <CardTitle className="text-xl">Find løsning</CardTitle>
        <CardDescription>Udfyld de vigtigste detaljer, så matcher vi jer med en realistisk løsning.</CardDescription>
      </CardHeader>
      <CardContent>
        <form className="grid gap-4 sm:grid-cols-2" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <Label htmlFor="widget-event-date">Dato</Label>
            <Input
              id="widget-event-date"
              type="date"
              value={form.eventDate}
              onChange={(event) => setForm((current) => ({ ...current, eventDate: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="widget-city">By</Label>
            <Input
              id="widget-city"
              placeholder="København"
              value={form.city}
              onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="widget-guest-count">Gæster</Label>
            <Select value={form.guestCountRange} onValueChange={(value) => setForm((current) => ({ ...current, guestCountRange: value }))}>
              <SelectTrigger id="widget-guest-count">
                <SelectValue placeholder="Vælg gæsteinterval" />
              </SelectTrigger>
              <SelectContent>
                {GUEST_COUNT_RANGE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="widget-event-type">Eventtype</Label>
            <Select value={form.eventType} onValueChange={(value) => setForm((current) => ({ ...current, eventType: value as EventType }))}>
              <SelectTrigger id="widget-event-type">
                <SelectValue placeholder="Vælg eventtype" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPE_OPTIONS.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button className="sm:col-span-2" type="submit" variant="accent" disabled={!isComplete}>
            Find løsning
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

export function TrustBar({ className }: { className?: string }) {
  const items = [
    "Kontrakt og faktura samlet ét sted",
    "Backup-garanti",
    "Professionelt lyd og lys",
    "Kuraterede firmafest-DJs",
    "Svar samme dag",
  ];

  return (
    <div className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-5", className)}>
      {items.map((item) => (
        <div key={item} className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-gold" />
          <span className="text-sm font-medium text-foreground">{item}</span>
        </div>
      ))}
    </div>
  );
}

export function StepsExplainer({ className }: { className?: string }) {
  const steps = [
    { number: "1", title: "Fortæl om arrangementet", description: "Udfyld eventtype, dato, sted og de vigtigste behov." },
    { number: "2", title: "Få anbefalet pakke og 2 til 3 DJ-match", description: "Vi filtrerer på relevans, tilgængelighed og erfaring med firmaevents." },
    { number: "3", title: "Reservér trygt med kontrakt, teknik og backup", description: "Platformen tager ansvar for rammerne og den praktiske afvikling." },
  ];

  return (
    <div className={cn("grid gap-4 md:grid-cols-3", className)}>
      {steps.map((step) => (
        <Card key={step.number} className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
              {step.number}
            </div>
            <CardTitle className="mt-4 text-lg">{step.title}</CardTitle>
            <CardDescription>{step.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

const USE_CASES = Object.values(USE_CASE_CONFIGS).map((config) => ({
  title: config.title,
  description: config.heroLead,
  href: config.path,
  image: config.image,
}));

export function UseCaseCard({ title, description, href, image }: (typeof USE_CASES)[number]) {
  return (
    <Link to={href} className="group block overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-transform hover:-translate-y-1 hover:shadow-lg">
      <div className="relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-primary via-slate-800 to-primary">
        <img src={image} alt="" className="h-full w-full object-cover opacity-80 transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
      </div>
      <div className="space-y-2 p-5">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        <span className="inline-flex items-center gap-1 text-sm font-medium text-accent">
          Se løsning <ChevronRight className="h-4 w-4" />
        </span>
      </div>
    </Link>
  );
}

export function UseCaseGrid({ className }: { className?: string }) {
  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {USE_CASES.map((useCase) => (
        <UseCaseCard key={useCase.title} {...useCase} />
      ))}
    </div>
  );
}

function packageBullets(pkg: Package) {
  return [
    `${pkg.hours_included} timers musik`,
    pkg.sound_included ? "Professionelt lydsetup" : null,
    pkg.lighting_included ? "Danselys inkluderet" : null,
    pkg.microphone_included ? "Trådløs mikrofon til taler" : null,
    pkg.technical_coordination_included ? "Teknisk koordinering" : null,
    pkg.setup_included ? "Opsætning inkluderet" : null,
    pkg.setup_teardown_included ? "Nedtagning inkluderet" : null,
  ].filter((item): item is string => Boolean(item)).slice(0, 5);
}

export function PackageCard({ pkg, recommended = false }: { pkg: Package; recommended?: boolean }) {
  return (
    <Card className={cn("h-full border-border/60 shadow-sm transition-shadow", recommended && "border-gold/60 ring-1 ring-gold/40")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{pkg.name}</CardTitle>
            <CardDescription className="mt-2">{pkg.best_for}</CardDescription>
          </div>
          {recommended ? <Badge variant="outline" className="border-gold text-gold">Anbefalet</Badge> : null}
        </div>
        <p className="mt-4 text-3xl font-semibold tracking-tight text-foreground">{formatDKKFrom(pkg.price_from)}</p>
        <p className="text-sm text-muted-foreground">{pkg.vat_note}</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm leading-6 text-muted-foreground">{pkg.description}</p>
        <ul className="space-y-2 text-sm text-foreground/90">
          {packageBullets(pkg).map((bullet) => (
            <li key={bullet} className="flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter className="flex-col items-start gap-3">
        <Button asChild variant={recommended ? "accent" : "outline"} className="w-full">
          <Link to="/brief">Vælg løsning</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function CustomEnterpriseCard() {
  return (
    <Card className="border-dashed border-border/70 bg-muted/30 shadow-sm">
      <CardHeader>
        <CardTitle>Custom / Enterprise</CardTitle>
        <CardDescription>For større events, koncerthuse, messer eller særlige tekniske behov.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-muted-foreground">
        <p>Vi samler DJ, teknik, koordinering og backup i en løsning, der kan tilpasses den konkrete produktion.</p>
        <p>Her er målet ikke en standardpakke, men et trygt setup med tydelig ansvarlighed.</p>
      </CardContent>
      <CardFooter>
        <Button asChild variant="accent" className="w-full">
          <Link to="/kontakt">Tal med os om jeres behov</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}

export function PricingNote({ className }: { className?: string }) {
  return (
    <p className={cn("text-sm leading-6 text-muted-foreground", className)}>
      Priser vises ekskl. moms. Transport og særlige tekniske behov beregnes tydeligt før bekræftelse.
    </p>
  );
}

export function TrustGuaranteeCards({ className }: { className?: string }) {
  const cards = [
    { icon: Wand2, title: "Kurateret DJ-match", description: "Vi foreslår kun DJs, der passer til briefen og eventets rammer." },
    { icon: ShieldCheck, title: "Backup ved sygdom eller nødsituation", description: "Vi arbejder med backup, så der er en plan, hvis noget uforudset sker." },
    { icon: Ticket, title: "Klar pakke og pris", description: "Du ser en tydelig løsning med pakkeniveau, før I bekræfter." },
    { icon: Speaker, title: "Professionel lyd og lys", description: "Den tekniske leverance følger den valgte løsning." },
    { icon: ClipboardList, title: "Struktureret eventspørgeskema", description: "Vi indsamler de vigtige detaljer, så afviklingen bliver nemmere." },
    { icon: CalendarDays, title: "Endelig run sheet før eventet", description: "Dagens forløb gennemgås, så alle ved, hvad der skal ske." },
    { icon: Headphones, title: "Menneskelig opfølgning når det er nødvendigt", description: "Hvis noget kræver ekstra dialog, tager vi den direkte og professionelt." },
  ] as const;

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {cards.map((card) => (
        <Card key={card.title} className="border-border/60 shadow-sm">
          <CardHeader>
            <div className="inline-flex h-11 w-11 items-center justify-center rounded-2xl bg-accent/10 text-accent">
              <card.icon className="h-5 w-5" />
            </div>
            <CardTitle className="mt-4 text-lg">{card.title}</CardTitle>
            <CardDescription>{card.description}</CardDescription>
          </CardHeader>
        </Card>
      ))}
    </div>
  );
}

export function ShortlistExplainer({ className }: { className?: string }) {
  return (
    <Card className={cn("overflow-hidden border-border/60 shadow-sm", className)}>
      <div className="grid gap-0 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="space-y-4 p-6 lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Hvorfor shortlist?</p>
          <h3 className="text-2xl font-semibold tracking-tight">Du behøver ikke browse gennem dusinvis af DJs.</h3>
          <p className="text-sm leading-7 text-muted-foreground">
            Vi filtrerer efter tilgængelighed, eventtype, lokation, gæsteantal, musikprofil, erfaring med firmaevents, sprog og tekniske behov.
            Du får derefter en shortlist på 2 til 3 relevante matches — eller lader os vælge det bedste match for jer.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              "Tilgængelighed",
              "Eventtype",
              "Location",
              "Gæsteantal",
              "Musikprofil",
              "Corporate erfaring",
              "Sprog",
              "Teknik",
            ].map((item) => (
              <Badge key={item} variant="secondary">
                {item}
              </Badge>
            ))}
          </div>
        </div>
        <div className="bg-gradient-to-br from-primary via-slate-800 to-primary p-6 text-primary-foreground lg:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Kontrolleret valg</p>
          <div className="mt-6 space-y-4 rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent text-accent-foreground">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <p className="font-medium">2 til 3 matches</p>
                <p className="text-sm text-primary-foreground/70">Ikke et åbent katalog</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-primary-foreground/80">
              <p>• Kuraterede kandidater med høj relevans</p>
              <p>• Platformen kan vælge for jer</p>
              <p>• I kan også vælge selv blandt shortlist'en</p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ReviewCard({ review }: { review: Review }) {
  return (
    <Card className="h-full border-border/60 shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base">{review.reviewer_label}</CardTitle>
            <CardDescription className="mt-1">{review.event_type ? review.event_type : "Erhvervskunde"}</CardDescription>
          </div>
          <StarRating rating={review.rating} />
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-7 text-foreground/90">“{review.quote}”</p>
      </CardContent>
    </Card>
  );
}

export function ReviewGrid({ className, reviews: inputReviews }: { className?: string; reviews?: Review[] }) {
  const storedReviews = useCollection("reviews");
  const reviews = (inputReviews ?? storedReviews).filter((review) => review.approved).slice(0, 6);

  return (
    <div className={cn("grid gap-4 md:grid-cols-2 xl:grid-cols-3", className)}>
      {reviews.map((review) => (
        <ReviewCard key={review.id} review={review} />
      ))}
    </div>
  );
}

export function FaqAccordion({
  items = HOME_FAQ_ITEMS,
  className,
}: {
  items?: { question: string; answer: string }[];
  className?: string;
}) {
  return (
    <Accordion type="single" collapsible className={cn("w-full rounded-3xl border border-border/60 bg-card px-6 shadow-sm", className)}>
      {items.map((item) => (
        <AccordionItem key={item.question} value={item.question}>
          <AccordionTrigger>{item.question}</AccordionTrigger>
          <AccordionContent>{item.answer}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}

function initialsFromName(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function DJShortlistCard({
  dj,
  matchScore,
  reasons = [],
  reviews = [],
  selectable = false,
  selected = false,
  recommended = false,
  onSelect,
}: {
  dj: DJ;
  matchScore?: number;
  reasons?: string[];
  reviews?: Review[];
  selectable?: boolean;
  selected?: boolean;
  recommended?: boolean;
  onSelect?: () => void;
}) {
  const snippets = reviews.slice(0, 2);

  return (
    <Card className={cn("h-full border-border/60 shadow-sm transition-shadow", selected && "border-gold/60 ring-1 ring-gold/40")}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border border-border/50">
              <AvatarImage src={dj.photo_url ?? undefined} alt={dj.public_display_name} />
              <AvatarFallback>{initialsFromName(dj.public_display_name)}</AvatarFallback>
            </Avatar>
            <div>
              <CardTitle className="text-lg">{dj.public_display_name}</CardTitle>
              <CardDescription className="mt-1">
                {dj.city} · {dj.regions[0]}
              </CardDescription>
              <p className="mt-2 text-sm text-muted-foreground">{dj.corporate_experience_years} års erfaring med firmaevents</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <Badge variant="accent">{matchScore ? `${matchScore}% match` : "Match"}</Badge>
            {recommended ? (
              <Badge variant="outline" className="border-gold text-gold">
                Anbefalet match
              </Badge>
            ) : null}
            <Badge variant="outline" className="border-success text-success">
              Foreløbigt ledig på datoen
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {dj.vibe_tags.slice(0, 3).map((tag) => (
            <Badge key={tag} variant="secondary">
              {tag}
            </Badge>
          ))}
          {dj.languages.map((language) => (
            <Badge key={language} variant="outline">
              {language}
            </Badge>
          ))}
        </div>
        <div className="space-y-2 text-sm text-muted-foreground">
          {dj.specialties.slice(0, 2).map((specialty) => (
            <p key={specialty} className="flex items-start gap-2 text-foreground/90">
              <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
              <span>{specialty}</span>
            </p>
          ))}
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center gap-3">
            <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground" aria-label="Afspil prøve-mix">
              <PlayCircle className="h-5 w-5" />
            </button>
            <div className="flex-1">
              <p className="text-sm font-medium text-foreground">Prøve-mix</p>
              <div className="mt-2 h-2 rounded-full bg-border">
                <div className="h-2 w-2/5 rounded-full bg-accent" />
              </div>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">Klip af den musikalske retning — spiller ikke automatisk.</p>
        </div>
        {reasons.length ? (
          <div className="flex flex-wrap gap-2">
            {reasons.slice(0, 5).map((reason) => (
              <Badge key={reason} variant="outline">
                {reason}
              </Badge>
            ))}
          </div>
        ) : null}
        {snippets.length ? (
          <div className="space-y-3 border-t border-border/60 pt-4">
            {snippets.map((review) => (
              <div key={review.id} className="space-y-1 text-sm">
                <StarRating rating={review.rating} />
                <p className="text-foreground/90">“{review.quote}”</p>
                <p className="text-xs text-muted-foreground">{review.reviewer_label}</p>
              </div>
            ))}
          </div>
        ) : null}
      </CardContent>
      {selectable ? (
        <CardFooter>
          <Button type="button" variant={selected ? "accent" : "outline"} className="w-full" onClick={onSelect}>
            {selected ? "Valgt" : "Vælg denne DJ"}
          </Button>
        </CardFooter>
      ) : null}
    </Card>
  );
}
