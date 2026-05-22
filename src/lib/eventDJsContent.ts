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
  title: "Verified, vetted DJs",
  body: "Interviewed, equipment-checked, and reference-verified before they're listed. No surprises on the night.",
};

const ESCROW = {
  Icon: CheckCircle2,
  title: "Escrow-protected payment",
  body: "Pay through Stripe. Money stays in escrow until 24h after your event.",
};

const CONTRACT = {
  Icon: Sparkles,
  title: "Contract included",
  body: "Clear written agreement: arrival time, equipment, music lists, cancellation terms.",
};

export const EVENT_LISTING_CONFIG: Record<string, EventListingConfig> = {
  wedding: {
    id: "wedding",
    label: "Wedding",
    slug: "wedding-djs",
    canonical: "/wedding-djs",
    heroImage:
      "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=2400&auto=format&fit=crop",
    heroEyebrow: "Wedding DJs · Denmark",
    heroTitle: "Find your wedding DJ.",
    heroLede:
      "Verified DJs across Denmark. Written contract and escrow-protected payment included.",
    metaTitle: "Wedding DJs · DJConnect",
    metaDescription:
      "Book a verified wedding DJ in Denmark. Compare DJs by setup, city and availability.",
    emptyHint: "No wedding DJs available with these filters",
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
        title: "Reads the room",
        body: "Mixes across generations \u2014 first dance through grandparents through dancefloor closers.",
      },
      ESCROW,
      CONTRACT,
    ],
    faq: [
      {
        q: "How far in advance should I book a wedding DJ?",
        a: "6\u201312 months for Saturday weddings May\u2013September. Off-peak (winter, weekdays) \u2014 2\u20133 months is usually fine. The most-booked DJs sell out 9+ months ahead.",
      },
      {
        q: "Will the DJ act as MC for speeches and announcements?",
        a: "Yes. Every wedding DJ on DJConnect can MC the night \u2014 announce the entrance, speeches, cake cut, and first dance. You can also bring your own MC and we'll just supply the sound.",
      },
      {
        q: "Can I send a must-play and do-not-play list?",
        a: "Absolutely \u2014 once you've booked, the music planner in your dashboard lets you build must-play, do-not-play, and special-moment lists. Your DJ sees them in real time and confirms they have everything before the day.",
      },
      {
        q: "What if our wedding runs late?",
        a: "Each DJ has an overtime rate listed on their profile. You can extend on the night \u2014 your DJ confirms via the messages thread, and the extension is added to the final invoice (still escrow-protected).",
      },
      {
        q: "What does it cost to book a wedding DJ in Denmark?",
        a: "Most DJConnect wedding DJs are between DKK 7,500 and DKK 18,000 for a full evening (5\u20137 hours), including PA, lighting, and travel within their region. Premium / award-winning DJs go higher.",
      },
      {
        q: "What happens if our DJ has to cancel last-minute?",
        a: "It's extremely rare, but DJConnect maintains a backup roster. If your DJ can't make it, we re-book a verified replacement at no extra cost or refund 100% via the escrow if you'd prefer to cancel.",
      },
    ],
    finalCta: {
      title: "Ready to find your wedding DJ?",
      body: (n) =>
        `Browse ${n} verified wedding DJs above, compare profiles, and message any of them before you decide. No payment until you book.`,
      buttonLabel: "Browse wedding DJs",
    },
  },

  birthday: {
    id: "birthday",
    label: "Birthday Party",
    slug: "birthday-djs",
    canonical: "/birthday-djs",
    heroImage:
      "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?q=80&w=2400&auto=format&fit=crop",
    heroEyebrow: "Birthday DJs · Denmark",
    heroTitle: "Find your birthday DJ.",
    heroLede:
      "30ths, 40ths, 50ths, milestone parties \u2014 verified DJs who fill the floor across generations.",
    metaTitle: "Birthday DJs · DJConnect",
    metaDescription:
      "Book a verified birthday-party DJ in Denmark. Mixed-age dancefloors, sing-alongs, mic for speeches.",
    emptyHint: "No birthday DJs available with these filters",
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
        title: "Reads every age",
        body: "Mixed-generation crowd? DJs at DJConnect blend disco, 80s/90s, current hits and your guest of honour's favourites.",
      },
      ESCROW,
      CONTRACT,
    ],
    faq: [
      {
        q: "How far in advance should I book a birthday DJ?",
        a: "2\u20134 months is the sweet spot. Saturdays during the spring and autumn party season sell out fastest \u2014 if your date is firm, book early.",
      },
      {
        q: "Can the DJ play special moments \u2014 cake, speeches, surprises?",
        a: "Yes. Every birthday DJ comes with a wireless mic and can cue your guest of honour's favourite song, lower volume for speeches, and back you up on a surprise singalong.",
      },
      {
        q: "What if the party is at home / in a small venue?",
        a: "Filter by setup size. \u201cSmall\u201d setups are designed for living-room and apartment parties \u2014 compact PA, neat cabling, discreet lighting.",
      },
      {
        q: "Can I send a must-play and do-not-play list?",
        a: "Yes. Once booked, the music planner in your dashboard lets you build a must-play and do-not-play list. Your DJ confirms they have everything before the night.",
      },
      {
        q: "What does it cost to book a birthday DJ in Denmark?",
        a: "Typically DKK 5,500\u201312,000 for a 4\u20136 hour party including PA, lighting, mic, and travel within the DJ's region. Smaller home parties land lower; club-quality production lands higher.",
      },
    ],
    finalCta: {
      title: "Ready to find your birthday DJ?",
      body: (n) =>
        `Browse ${n} verified DJs who play birthday parties across Denmark. Compare, message, then book \u2014 with escrow and a written contract included.`,
      buttonLabel: "Browse birthday DJs",
    },
  },

  corporate_party: {
    id: "corporate_party",
    label: "Corporate Party",
    slug: "corporate-djs",
    canonical: "/corporate-djs",
    heroImage:
      "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2400&auto=format&fit=crop",
    heroEyebrow: "Corporate DJs · Denmark",
    heroTitle: "Find your corporate-party DJ.",
    heroLede:
      "Summer parties, Christmas parties, brand launches, conferences \u2014 verified DJs with festival-grade kit and corporate experience.",
    metaTitle: "Corporate Party DJs · DJConnect",
    metaDescription:
      "Book a verified corporate-party DJ in Denmark. Summer parties, Christmas parties, brand launches, conference after-parties.",
    emptyHint: "No corporate-party DJs available with these filters",
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
        title: "Corporate-ready",
        body: "Smart-casual, on-time, MC-comfortable. Insurance, invoicing through the platform, and references on file.",
      },
      ESCROW,
      {
        Icon: Mic,
        title: "MC, awards & speeches",
        body: "Mic, monitor and a DJ who can MC announcements, awards and speeches \u2014 not just play music.",
      },
    ],
    faq: [
      {
        q: "How far in advance should I book a corporate-party DJ?",
        a: "Christmas-party season (November\u2013early December) sells out from August. Summer parties: 2\u20134 months ahead. Brand launches and conference after-parties: 1\u20132 months.",
      },
      {
        q: "Can the DJ MC the awards / agenda / speeches?",
        a: "Yes. Most corporate-party DJs on DJConnect MC awards and announcements as part of the booking \u2014 just confirm the run-of-show with them in the dashboard.",
      },
      {
        q: "Can I get an invoice and pay against my company VAT number?",
        a: "Yes. Bookings are invoiced through DJConnect with company name, address and CVR/VAT number on the invoice. Payment goes via the platform with full escrow.",
      },
      {
        q: "What kind of music do corporate DJs play?",
        a: "Tailored to the brief: pop, dance, disco, 80s/90s, current charts. You can send a must-play / do-not-play list once booked \u2014 most companies send a 10\u201320 song reference list.",
      },
      {
        q: "What does it cost to book a corporate DJ in Denmark?",
        a: "Typically DKK 8,000\u201320,000 for a 4\u20136 hour party including PA, lighting, mic, and travel. Larger productions (250+ guests, full lighting, stage) land higher.",
      },
    ],
    finalCta: {
      title: "Ready to book your corporate DJ?",
      body: (n) =>
        `Browse ${n} verified DJs with corporate experience \u2014 from Christmas parties to brand launches. Compare profiles, request a quote, book through the platform.`,
      buttonLabel: "Browse corporate DJs",
    },
  },

  other: {
    id: "other",
    label: "Other",
    slug: "other-djs",
    canonical: "/other-djs",
    heroImage:
      "https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=2400&auto=format&fit=crop",
    heroEyebrow: "All DJs · Denmark",
    heroTitle: "Find a DJ for your event.",
    heroLede:
      "Confirmations, anniversaries, school galas, private parties \u2014 verified DJs across Denmark for every kind of celebration.",
    metaTitle: "Find a DJ \u00b7 DJConnect",
    metaDescription:
      "Book a verified DJ in Denmark for any event \u2014 confirmations, anniversaries, school galas, private parties.",
    emptyHint: "No DJs available with these filters",
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
        title: "Any date, any size",
        body: "Confirmations to 50th anniversaries, school galas to private parties \u2014 DJs across the country, at every setup size.",
      },
      ESCROW,
      {
        Icon: Music,
        title: "Music tailored to you",
        body: "Send your must-play and do-not-play lists once booked \u2014 your DJ confirms before the night.",
      },
    ],
    faq: [
      {
        q: "What kind of events can I book a DJ for here?",
        a: "Any kind \u2014 confirmations, anniversaries, retirements, school galas, association parties, summer parties, private celebrations. If your event isn't a wedding, birthday or corporate party, this is the right place.",
      },
      {
        q: "How far in advance should I book?",
        a: "2\u20133 months is comfortable for most events. Tight on time? Many DJs accept short-notice bookings \u2014 send a request and they'll confirm availability within hours.",
      },
      {
        q: "What's included in the price?",
        a: "PA, lighting, mic, travel within the DJ's region, and the contract. No hidden hire fees. You see the all-in price on every DJ profile.",
      },
      {
        q: "Can I send a must-play and do-not-play list?",
        a: "Yes. Once booked, the music planner in your dashboard lets you build a must-play, do-not-play and special-moments list. Your DJ confirms before the night.",
      },
      {
        q: "What does it cost?",
        a: "Most DJConnect DJs are DKK 5,500\u201315,000 for a 4\u20136 hour event including PA, lighting, mic, and travel. Smaller home events land lower; club-quality production lands higher.",
      },
    ],
    finalCta: {
      title: "Ready to find your DJ?",
      body: (n) =>
        `Browse ${n} verified DJs across Denmark. Compare profiles, message any of them, book with escrow and a written contract.`,
      buttonLabel: "Browse DJs",
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
