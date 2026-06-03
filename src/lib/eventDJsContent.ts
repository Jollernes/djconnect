import {
  Heart,
  Shield,
  CheckCircle2,
  Sparkles,
  PartyPopper,
  Building2,
  Music,
  Calendar,
  Mic,
  Users,
} from "lucide-react";
import { mockDJs } from "@/data/mock";

/**
 * Shared visual content for the event-specific DJ listing pages.
 * Every event type uses the same hero + filter + 4-col grid layout, but
 * with copy, photo, palette, value props and FAQ tailored to that event.
 */

export type EventListingTheme = {
  /** Light pill / badge background, e.g. "bg-rose-50". */
  accentBg: string;
  /** Pill text colour, e.g. "text-rose-700". */
  accentText: string;
  /** Pill border colour, e.g. "border-rose-200". */
  accentBorder: string;
  /** Icon gradient start/end used for value-prop cards. */
  iconGradFrom: string;
  iconGradTo: string;
  /** Foreground icon colour inside the value-prop bubble. */
  iconText: string;
  /** Subtle below-content section background. */
  sectionBgGradient: string;
  /** Hex used in the dark final-CTA gradient overlay. */
  ctaGradient: string;
};

export type EventValueProp = {
  Icon: React.ComponentType<{ className?: string }>;
  title: string;
  body: string;
};

export type EventListingConfig = {
  /** Matches DJ.event_types[].id. */
  id: string;
  /** Customer-facing label, e.g. "Wedding". */
  label: string;
  /** URL slug, e.g. "wedding-djs". */
  slug: string;
  /** Canonical path used for SEO. */
  canonical: string;
  /** Hero photo URL. */
  heroImage: string;
  /** Eyebrow above the hero heading, e.g. "Wedding DJs · Denmark". */
  heroEyebrow: string;
  /** Hero headline. */
  heroTitle: string;
  /** Hero lede (single sentence). */
  heroLede: string;
  /** Document title for SEO. */
  metaTitle: string;
  /** Document description for SEO. */
  metaDescription: string;
  /** Empty-grid message when no DJs match. */
  emptyHint: string;
  /** Theme. */
  theme: EventListingTheme;
  /** 4 value-prop cards shown below the grid. */
  valueProps: EventValueProp[];
  /** FAQ section. */
  faq: { q: string; a: string }[];
  /** Final-CTA section copy. */
  finalCta: {
    title: string;
    body: (count: number) => string;
    buttonLabel: string;
  };
};

const VERIFIED = {
  Icon: Shield,
  title: "Verificerede, godkendte DJs",
  body: "Interviewet, udstyrstjekket og referencetjekket, før de bliver vist. Ingen overraskelser på aftenen.",
};

const ESCROW = {
  Icon: CheckCircle2,
  title: "Escrow-beskyttet betaling",
  body: "Betal via Stripe. Pengene bliver i escrow indtil 24 timer efter dit event.",
};

const CONTRACT = {
  Icon: Sparkles,
  title: "Kontrakt inkluderet",
  body: "Tydelig skriftlig aftale: ankomsttid, udstyr, musiklister, annulleringsvilkår.",
};

export const EVENT_LISTING_CONFIG: Record<string, EventListingConfig> = {
  wedding: {
    id: "wedding",
    label: "Bryllup",
    slug: "wedding-djs",
    canonical: "/wedding-djs",
    heroImage:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=2400&auto=format&fit=crop",
    heroEyebrow: "Bryllups-DJs · Danmark",
    heroTitle: "Find din bryllups-DJ.",
    heroLede:
      "Verificerede DJs i hele Danmark. Skriftlig kontrakt og escrow-beskyttet betaling inkluderet.",
    metaTitle: "Bryllups-DJs · DJConnect",
    metaDescription:
      "Book en verificeret bryllups-DJ i Danmark. Sammenlign DJs efter setup, by og tilgængelighed.",
    emptyHint: "Ingen bryllups-DJs tilgængelige med disse filtre",
    theme: {
      accentBg: "bg-rose-50",
      accentText: "text-rose-700",
      accentBorder: "border-rose-200",
      iconGradFrom: "from-rose-500/15",
      iconGradTo: "to-rose-500/5",
      iconText: "text-rose-600",
      sectionBgGradient: "from-rose-50/40 via-white to-white",
      ctaGradient:
        "linear-gradient(120deg, hsla(346,77%,50%,0.5) 0%, hsla(21,90%,53%,0.45) 50%, hsla(45,93%,58%,0.45) 100%)",
    },
    valueProps: [
      VERIFIED,
      {
        Icon: Heart,
        title: "Læser stemningen",
        body: "Mixer på tværs af generationer \u2014 fra første dans over bedsteforældre til aftenens sidste numre.",
      },
      ESCROW,
      CONTRACT,
    ],
    faq: [
      {
        q: "Hvor lang tid i forvejen skal jeg booke en bryllups-DJ?",
        a: "6\u201312 måneder for lørdagsbryllupper maj\u2013september. Uden for højsæson (vinter, hverdage) \u2014 2\u20133 måneder er normalt fint. De mest bookede DJs er udsolgt 9+ måneder i forvejen.",
      },
      {
        q: "Fungerer DJ'en som toastmaster for taler og annonceringer?",
        a: "Ja. Alle bryllups-DJs på DJConnect kan være toastmaster for aftenen \u2014 annoncere entréen, talerne, kagen og første dans. Du kan også medbringe din egen toastmaster, så leverer vi blot lyden.",
      },
      {
        q: "Kan jeg sende en skal-spilles- og må-ikke-spilles-liste?",
        a: "Helt sikkert \u2014 når du har booket, kan du i musikplanlæggeren i dit dashboard bygge skal-spilles-, må-ikke-spilles- og øjebliks-lister. Din DJ ser dem i realtid og bekræfter, at de har alt klar inden dagen.",
      },
      {
        q: "Hvad hvis vores bryllup trækker ud?",
        a: "Hver DJ har en overtidstakst angivet på deres profil. Du kan forlænge på aftenen \u2014 din DJ bekræfter via beskedtråden, og forlængelsen tilføjes den endelige faktura (stadig escrow-beskyttet).",
      },
      {
        q: "Hvad koster det at booke en bryllups-DJ i Danmark?",
        a: "De fleste bryllups-DJs på DJConnect ligger mellem 7.500 og 18.000 kr for en hel aften (5\u20137 timer), inklusive PA, lys og transport inden for deres region. Premium- / prisvindende DJs ligger højere.",
      },
      {
        q: "Hvad sker der, hvis vores DJ er nødt til at aflyse i sidste øjeblik?",
        a: "Det er yderst sjældent, men DJConnect har et backup-hold. Hvis din DJ ikke kan komme, ombooker vi en verificeret afløser uden ekstra omkostninger eller tilbagebetaler 100% via escrow, hvis du hellere vil aflyse.",
      },
    ],
    finalCta: {
      title: "Klar til at finde din bryllups-DJ?",
      body: (n) =>
        `Se ${n} verificerede bryllups-DJs ovenfor, sammenlign profiler og skriv til hvem som helst af dem, før du beslutter dig. Ingen betaling, før du booker.`,
      buttonLabel: "Se bryllups-DJs",
    },
  },

  birthday: {
    id: "birthday",
    label: "Fødselsdagsfest",
    slug: "birthday-djs",
    canonical: "/birthday-djs",
    heroImage:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2400&auto=format&fit=crop",
    heroEyebrow: "Fødselsdags-DJs · Danmark",
    heroTitle: "Find din fødselsdags-DJ.",
    heroLede:
      "30 år, 40 år, 50 år, runde fødselsdage \u2014 verificerede DJs, der fylder dansegulvet på tværs af generationer.",
    metaTitle: "Fødselsdags-DJs · DJConnect",
    metaDescription:
      "Book en verificeret fødselsdags-DJ i Danmark. Dansegulve for alle aldre, fælles-sang, mikrofon til taler.",
    emptyHint: "Ingen fødselsdags-DJs tilgængelige med disse filtre",
    theme: {
      accentBg: "bg-violet-50",
      accentText: "text-violet-700",
      accentBorder: "border-violet-200",
      iconGradFrom: "from-violet-500/15",
      iconGradTo: "to-violet-500/5",
      iconText: "text-violet-600",
      sectionBgGradient: "from-violet-50/40 via-white to-white",
      ctaGradient:
        "linear-gradient(120deg, hsla(266,80%,55%,0.5) 0%, hsla(316,76%,60%,0.45) 50%, hsla(36,94%,60%,0.45) 100%)",
    },
    valueProps: [
      VERIFIED,
      {
        Icon: PartyPopper,
        title: "Rammer alle aldre",
        body: "Blandet publikum på tværs af generationer? DJs på DJConnect blander disco, 80'er/90'er, aktuelle hits og fødselarens favoritter.",
      },
      ESCROW,
      CONTRACT,
    ],
    faq: [
      {
        q: "Hvor lang tid i forvejen skal jeg booke en fødselsdags-DJ?",
        a: "2\u20134 måneder er det ideelle. Lørdage i forårs- og efterårssæsonen bliver hurtigst udsolgt \u2014 hvis din dato er fast, så book tidligt.",
      },
      {
        q: "Kan DJ'en spille til særlige øjeblikke \u2014 kage, taler, overraskelser?",
        a: "Ja. Alle fødselsdags-DJs medbringer en trådløs mikrofon og kan køre fødselarens yndlingssang, skrue ned til taler og bakke dig op til en overraskende fælles-sang.",
      },
      {
        q: "Hvad hvis festen er hjemme / i et lille lokale?",
        a: "Filtrer efter setup-størrelse. \u201cSmå\u201d setups er designet til stue- og lejlighedsfester \u2014 kompakt PA, ryddelige kabler, diskret lys.",
      },
      {
        q: "Kan jeg sende en skal-spilles- og må-ikke-spilles-liste?",
        a: "Ja. Når du har booket, kan du i musikplanlæggeren i dit dashboard bygge en skal-spilles- og må-ikke-spilles-liste. Din DJ bekræfter, at de har alt klar inden aftenen.",
      },
      {
        q: "Hvad koster det at booke en fødselsdags-DJ i Danmark?",
        a: "Typisk 5.500\u201312.000 kr for en fest på 4\u20136 timer inklusive PA, lys, mikrofon og transport inden for DJ'ens region. Mindre hjemmefester ligger lavere; klubkvalitets-produktion ligger højere.",
      },
    ],
    finalCta: {
      title: "Klar til at finde din fødselsdags-DJ?",
      body: (n) =>
        `Se ${n} verificerede DJs, der spiller til fødselsdagsfester i hele Danmark. Sammenlign, skriv, og book \u2014 med escrow og en skriftlig kontrakt inkluderet.`,
      buttonLabel: "Se fødselsdags-DJs",
    },
  },

  corporate_party: {
    id: "corporate_party",
    label: "Firmafest",
    slug: "corporate-djs",
    canonical: "/corporate-djs",
    heroImage:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2400&auto=format&fit=crop",
    heroEyebrow: "Firma-DJs · Danmark",
    heroTitle: "Find din firmafest-DJ.",
    heroLede:
      "Sommerfester, julefrokoster, brand-lanceringer, konferencer \u2014 verificerede DJs med festivaludstyr og firmaerfaring.",
    metaTitle: "Firmafest-DJs · DJConnect",
    metaDescription:
      "Book en verificeret firmafest-DJ i Danmark. Sommerfester, julefrokoster, brand-lanceringer, konference-afterparties.",
    emptyHint: "Ingen firmafest-DJs tilgængelige med disse filtre",
    theme: {
      accentBg: "bg-sky-50",
      accentText: "text-sky-700",
      accentBorder: "border-sky-200",
      iconGradFrom: "from-sky-500/15",
      iconGradTo: "to-sky-500/5",
      iconText: "text-sky-600",
      sectionBgGradient: "from-sky-50/40 via-white to-white",
      ctaGradient:
        "linear-gradient(120deg, hsla(206,90%,52%,0.5) 0%, hsla(228,80%,60%,0.45) 50%, hsla(186,80%,55%,0.45) 100%)",
    },
    valueProps: [
      VERIFIED,
      {
        Icon: Building2,
        title: "Klar til firmaevents",
        body: "Pæn-afslappet, til tiden, tryg som toastmaster. Forsikring, fakturering via platformen og referencer på plads.",
      },
      ESCROW,
      {
        Icon: Mic,
        title: "Toastmaster, priser & taler",
        body: "Mikrofon, monitor og en DJ, der kan være toastmaster for annonceringer, prisuddelinger og taler \u2014 ikke bare spille musik.",
      },
    ],
    faq: [
      {
        q: "Hvor lang tid i forvejen skal jeg booke en firmafest-DJ?",
        a: "Julefrokost-sæsonen (november\u2013start december) bliver udsolgt fra august. Sommerfester: 2\u20134 måneder i forvejen. Brand-lanceringer og konference-afterparties: 1\u20132 måneder.",
      },
      {
        q: "Kan DJ'en være toastmaster for prisuddelinger / program / taler?",
        a: "Ja. De fleste firmafest-DJs på DJConnect er toastmaster for prisuddelinger og annonceringer som en del af bookingen \u2014 bekræft blot køreplanen med dem i dashboardet.",
      },
      {
        q: "Kan jeg få en faktura og betale via mit firmas CVR-nummer?",
        a: "Ja. Bookinger faktureres via DJConnect med firmanavn, adresse og CVR-nummer på fakturaen. Betaling går via platformen med fuld escrow.",
      },
      {
        q: "Hvilken slags musik spiller firma-DJs?",
        a: "Tilpasset oplægget: pop, dance, disco, 80'er/90'er, aktuelle hitlister. Du kan sende en skal-spilles- / må-ikke-spilles-liste, når du har booket \u2014 de fleste virksomheder sender en referenceliste på 10\u201320 sange.",
      },
      {
        q: "Hvad koster det at booke en firma-DJ i Danmark?",
        a: "Typisk 8.000\u201320.000 kr for en fest på 4\u20136 timer inklusive PA, lys, mikrofon og transport. Større produktioner (250+ gæster, fuldt lys, scene) ligger højere.",
      },
    ],
    finalCta: {
      title: "Klar til at booke din firma-DJ?",
      body: (n) =>
        `Se ${n} verificerede DJs med firmaerfaring \u2014 fra julefrokoster til brand-lanceringer. Sammenlign profiler, anmod om et tilbud, book via platformen.`,
      buttonLabel: "Se firma-DJs",
    },
  },

  other: {
    id: "other",
    label: "Andet",
    slug: "other-djs",
    canonical: "/other-djs",
    heroImage:
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2400&auto=format&fit=crop",
    heroEyebrow: "Alle DJs · Danmark",
    heroTitle: "Find en DJ til dit event.",
    heroLede:
      "Konfirmationer, jubilæer, skolefester, private fester \u2014 verificerede DJs i hele Danmark til enhver form for fejring.",
    metaTitle: "Find en DJ \u00b7 DJConnect",
    metaDescription:
      "Book en verificeret DJ i Danmark til ethvert event \u2014 konfirmationer, jubilæer, skolefester, private fester.",
    emptyHint: "Ingen DJs tilgængelige med disse filtre",
    theme: {
      accentBg: "bg-slate-100",
      accentText: "text-slate-700",
      accentBorder: "border-slate-200",
      iconGradFrom: "from-slate-500/15",
      iconGradTo: "to-slate-500/5",
      iconText: "text-slate-700",
      sectionBgGradient: "from-slate-50 via-white to-white",
      ctaGradient:
        "linear-gradient(120deg, hsla(220,30%,30%,0.6) 0%, hsla(220,30%,20%,0.5) 50%, hsla(260,40%,30%,0.5) 100%)",
    },
    valueProps: [
      VERIFIED,
      {
        Icon: Calendar,
        title: "Enhver dato, enhver størrelse",
        body: "Fra konfirmationer til 50-års jubilæer, fra skolefester til private fester \u2014 DJs i hele landet, i alle setup-størrelser.",
      },
      ESCROW,
      {
        Icon: Music,
        title: "Musik tilpasset dig",
        body: "Send dine skal-spilles- og må-ikke-spilles-lister, når du har booket \u2014 din DJ bekræfter inden aftenen.",
      },
    ],
    faq: [
      {
        q: "Hvilke slags events kan jeg booke en DJ til her?",
        a: "Alle slags \u2014 konfirmationer, jubilæer, pensioneringer, skolefester, foreningsfester, sommerfester, private fejringer. Hvis dit event ikke er et bryllup, en fødselsdag eller en firmafest, er det her det rigtige sted.",
      },
      {
        q: "Hvor lang tid i forvejen skal jeg booke?",
        a: "2\u20133 måneder er passende for de fleste events. Knap med tid? Mange DJs tager imod bookinger med kort varsel \u2014 send en forespørgsel, så bekræfter de tilgængelighed inden for få timer.",
      },
      {
        q: "Hvad er inkluderet i prisen?",
        a: "PA, lys, mikrofon, transport inden for DJ'ens region og kontrakten. Ingen skjulte lejegebyrer. Du ser den samlede pris på hver DJ-profil.",
      },
      {
        q: "Kan jeg sende en skal-spilles- og må-ikke-spilles-liste?",
        a: "Ja. Når du har booket, kan du i musikplanlæggeren i dit dashboard bygge en skal-spilles-, må-ikke-spilles- og øjebliks-liste. Din DJ bekræfter inden aftenen.",
      },
      {
        q: "Hvad koster det?",
        a: "De fleste DJs på DJConnect ligger på 5.500\u201315.000 kr for et event på 4\u20136 timer inklusive PA, lys, mikrofon og transport. Mindre hjemmeevents ligger lavere; klubkvalitets-produktion ligger højere.",
      },
    ],
    finalCta: {
      title: "Klar til at finde din DJ?",
      body: (n) =>
        `Se ${n} verificerede DJs i hele Danmark. Sammenlign profiler, skriv til hvem som helst af dem, book med escrow og en skriftlig kontrakt.`,
      buttonLabel: "Se DJs",
    },
  },
};

export const EVENT_LISTING_ORDER: string[] = [
  "wedding",
  "birthday",
  "corporate_party",
  "other",
];

/**
 * DJs that should appear on the listing page for the given event id.
 * "other" is treated as a catch-all and returns every DJ in the catalog,
 * since no DJ explicitly tags themselves with the "other" event id.
 */
function djsForEvent(eventTypeId: string) {
  if (eventTypeId === "other") return mockDJs;
  return mockDJs.filter((d) => d.event_types.some((et) => et.id === eventTypeId));
}

/** Compute price min/avg/max from real DJs that list this event type. */
export function pricingForEvent(eventTypeId: string) {
  const djs = djsForEvent(eventTypeId);
  const prices = djs.map((d) => d.price_from_minor).filter((p): p is number => Boolean(p));
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  return { min, max, avg };
}

/** Count of real DJs that list this event type. */
export function djCountForEvent(eventTypeId: string): number {
  return djsForEvent(eventTypeId).length;
}

/** Lookup helper used by routes and the header. */
export function getEventListingConfig(
  eventTypeId: string,
): EventListingConfig | undefined {
  return EVENT_LISTING_CONFIG[eventTypeId];
}

/**
 * Maps any event-type id (including ones not represented as a dedicated
 * listing page like `corporate_event` or `private_party`) to the nearest
 * listing-page slug. Used by the hero "Switch event" modal and by the
 * header "Browse DJs" link.
 */
export function slugForEventType(eventTypeId: string | undefined | null): string {
  if (!eventTypeId) return "wedding-djs";
  if (EVENT_LISTING_CONFIG[eventTypeId]) return EVENT_LISTING_CONFIG[eventTypeId].slug;
  // Fold close cousins into the four canonical pages.
  if (eventTypeId === "corporate_event") return "corporate-djs";
  if (eventTypeId === "private_party") return "other-djs";
  return "other-djs";
}

/** The event-type id used for the listing at a given slug (inverse of slugForEventType). */
export function eventTypeForSlug(slug: string): string | undefined {
  return EVENT_LISTING_ORDER.find((id) => EVENT_LISTING_CONFIG[id].slug === slug);
}

/** Tiny icon list used in the value-prop strip on the People-also-need block. */
export const sharedTrustChips = [
  { Icon: Users, label: "100% verified" },
  { Icon: Shield, label: "Stripe-protected" },
  { Icon: CheckCircle2, label: "Free cancellation up to 14 days" },
];
