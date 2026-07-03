import type { EventType } from "@/types/domain";
import type { FaqItem } from "@/lib/faq";

export type UseCasePath =
  | "/dj-til-firmafest"
  | "/dj-til-julefrokost"
  | "/dj-til-sommerfest"
  | "/dj-til-firmaarrangement"
  | "/dj-til-middag-og-fest"
  | "/mobildiskotek-firmafest";

export interface UseCaseConfig {
  path: UseCasePath;
  title: string;
  pageTitle: string;
  seoTitle: string;
  seoDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroLead: string;
  introTitle: string;
  introBody: string;
  bookingPrefillEventType: EventType;
  packageSlug: string;
  packageReason: string;
  comparisonBullets: string[];
  trustPoints: string[];
  reviewEventTypes: EventType[];
  faqItems: FaqItem[];
  image: string;
}

const firmafestFaq: FaqItem[] = [
  { question: "Kan vi vælge mellem flere DJs?", answer: "Ja. Til firmafester er det normalt, at vi viser en kort shortlist, så I enten kan vælge selv eller lade os vælge det bedste match." },
  { question: "Kan I håndtere både middag og dansegulv?", answer: "Ja. Det er netop en klassisk firmafest-løsning, hvor musikken understøtter middagen og bygger trygt op mod festen." },
  { question: "Får vi en tydelig pris før bekræftelse?", answer: "Ja. Pris og eventuelle tillæg bliver gennemgået tydeligt, før I sender reservationsanmodningen." },
];

const julefrokostFaq: FaqItem[] = [
  { question: "Kan I bookes til julefrokost på hverdage?", answer: "Ja. Julefrokoster kan både ligge i højsæsonen og som mindre firmabegivenheder i løbet af vinteren." },
  { question: "Er der backup, hvis der opstår sygdom?", answer: "Ja. Backup er en del af modellen, så vi kan handle hurtigt, hvis noget uforudset sker." },
  { question: "Kan vi ønske klassikere og fællessang?", answer: "Ja. Vi arbejder gerne med både must-play og do-not-play, så julefrokosten rammer den rigtige tone." },
];

const sommerfestFaq: FaqItem[] = [
  { question: "Fungerer løsningen til udendørs arrangementer?", answer: "Ja, så længe vi kender venue og de tekniske rammer på forhånd, kan vi planlægge lyd og opsætning derefter." },
  { question: "Kan vi få musik til både reception og fest?", answer: "Ja. Mange sommerfester starter let og går derefter over i en mere festlig afslutning." },
  { question: "Skal vi selv koordinere med venue?", answer: "Nej, vi hjælper med koordineringen, når det er relevant, så I ikke står med det praktiske alene." },
];

const firmaarrangementFaq: FaqItem[] = [
  { question: "Er løsningen egnet til kick-off og interne fejringer?", answer: "Ja. De arrangementer kræver ofte mere struktur end et åbent festformat, og det er en del af vores setup." },
  { question: "Kan I tage højde for taler og program?", answer: "Ja. Vi matcher med en DJ, der er tryg ved mikrofon, timing og programafvikling." },
  { question: "Kan vi vælge en roligere profil?", answer: "Ja. Vi tilpasser musikken til stemningen og gør det nemt at holde et professionelt niveau hele vejen." },
];

const middagOgFestFaq: FaqItem[] = [
  { question: "Kan DJ'en spille under middagen?", answer: "Ja. Det er en central del af denne type arrangement, hvor middagsmusik og efterfølgende fest skal glide naturligt sammen." },
  { question: "Kan I håndtere taler og en stram tidsplan?", answer: "Ja. Vi tager højde for taler, overgange og den praktiske koordinering, så forløbet bliver roligt." },
  { question: "Er pakkerne fleksible?", answer: "Ja. Vi anbefaler en pakke som udgangspunkt, men justerer efter gæster, venue og tekniske behov." },
];

const mobildiskotekFaq: FaqItem[] = [
  { question: "Hvad er forskellen på mobildiskotek og en standard DJ-løsning?", answer: "Mobildiskotek er oplagt, når I vil have en mere komplet løsning med eget lyd- og lysudstyr i et komprimeret setup." },
  { question: "Kan I levere til mindre venues?", answer: "Ja. Det er netop en styrke ved denne løsning, at den kan tilpasses mindre lokaler og enklere opsætninger." },
  { question: "Kan vi stadig få en premium oplevelse?", answer: "Ja. Selv i et kompakt setup holder vi fokus på lyd, lys og en professionel afvikling." },
];

export const USE_CASE_CONFIGS: Record<UseCasePath, UseCaseConfig> = {
  "/dj-til-firmafest": {
    path: "/dj-til-firmafest",
    title: "DJ til firmafest",
    pageTitle: "DJ til firmafest",
    seoTitle: "DJ til firmafest med kurateret match og tryg afvikling",
    seoDescription: "Få en professionel DJ-løsning til firmafesten med tydelig pris, backup og et match, der passer til jeres brief.",
    heroEyebrow: "Firmafest",
    heroTitle: "DJ til firmafest, der føles sikker fra første brief",
    heroLead: "Her får I en løsning, hvor musik, teknik, pris og ansvar hænger sammen — uden at I skal lede gennem et åbent katalog.",
    introTitle: "Når firmafesten skal være professionel og nem at gennemføre",
    introBody: "Denne løsning er til den klassiske firmafest, hvor I vil have en DJ med erfaring i erhvervsarrangementer, en klar anbefaling og en proces, som gør det let at tage næste skridt.",
    bookingPrefillEventType: "Firmafest",
    packageSlug: "pkg_dinner_party",
    packageReason: "Det er den mest fleksible løsning til den klassiske firmafest med middag, taler og et stærkt dansegulv.",
    comparisonBullets: ["Tydelig løsning til de fleste firmafester", "God balance mellem middag og fest", "Passer til bredt publikum"],
    trustPoints: ["Kuraterede DJs med corporate erfaring", "Backup ved sygdom eller nødsituation", "Lyd, lys og koordinering samlet ét sted"],
    reviewEventTypes: ["Firmafest"],
    faqItems: firmafestFaq,
    image: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1600&q=80",
  },
  "/dj-til-julefrokost": {
    path: "/dj-til-julefrokost",
    title: "DJ til julefrokost",
    pageTitle: "DJ til julefrokost",
    seoTitle: "DJ til julefrokost med styr på stemning, middag og dans",
    seoDescription: "Book en DJ til julefrokosten med backup, kontrakt og en kurateret shortlist, så I får en tryg og festlig løsning.",
    heroEyebrow: "Julefrokost",
    heroTitle: "DJ til julefrokost med den rette balance mellem hygge og fest",
    heroLead: "Julefrokoster kræver et sikkert håndtag om både stemning, bred musiksmag og timing. Det er præcis, hvad denne løsning er bygget til.",
    introTitle: "Når julefrokosten skal ramme den rigtige tone",
    introBody: "Vi anbefaler DJs, der kan håndtere både klassikere, fællessang og et dansegulv, der løfter aftenen uden at blive for voldsom.",
    bookingPrefillEventType: "Julefrokost",
    packageSlug: "pkg_dinner_party",
    packageReason: "Julefrokoster er ofte længst og mest dynamiske, så den mellemstore pakke giver god dækning til både middag, taler og fest.",
    comparisonBullets: ["Velegnet til kollektive julefester", "Kan bære både middag og natlig fest", "Passer til publikum med blandet alder og smag"],
    trustPoints: ["Erfarne firmaevent-DJs", "Tydelig pris ekskl. moms", "Vi tager backup alvorligt hele sæsonen"],
    reviewEventTypes: ["Julefrokost"],
    faqItems: julefrokostFaq,
    image: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1600&q=80",
  },
  "/dj-til-sommerfest": {
    path: "/dj-til-sommerfest",
    title: "DJ til sommerfest",
    pageTitle: "DJ til sommerfest",
    seoTitle: "DJ til sommerfest til virksomheder med bredt publikum",
    seoDescription: "Få en sommerfestløsning med DJ, teknik og backup, der passer til alt fra reception til dansegulv.",
    heroEyebrow: "Sommerfest",
    heroTitle: "DJ til sommerfest med let stemning og stærk afslutning",
    heroLead: "Sommerfester fungerer bedst, når musik og teknik er en del af rammerne uden at tage over. Her får I et match med den balance.",
    introTitle: "Når sommerfesten skal føles afslappet og elegant",
    introBody: "Vi lægger vægt på DJs, der kan bygge stemningen op fra en lys og social start til en mere energisk afslutning.",
    bookingPrefillEventType: "Sommerfest",
    packageSlug: "pkg_dinner_party",
    packageReason: "Sommerfester rummer ofte både reception, middag og dans, så standardløsningen giver god fleksibilitet.",
    comparisonBullets: ["Skalerbar fra let reception til fest", "Stærk til blandede publikumstyper", "God til events i dagslys og over i aften"],
    trustPoints: ["Kurateret shortlist frem for katalog", "Koordinering med venue og udstyr", "Tydelig opfølgning fra første kontakt"],
    reviewEventTypes: ["Sommerfest", "Reception"],
    faqItems: sommerfestFaq,
    image: "https://images.unsplash.com/photo-1521334884684-d80222895322?auto=format&fit=crop&w=1600&q=80",
  },
  "/dj-til-firmaarrangement": {
    path: "/dj-til-firmaarrangement",
    title: "DJ til firmaarrangement",
    pageTitle: "DJ til firmaarrangement",
    seoTitle: "DJ til firmaarrangement, kick-off eller intern fejring",
    seoDescription: "Skab et professionelt firmaarrangement med DJ, backup og en løsning, der matcher det konkrete program.",
    heroEyebrow: "Firmaarrangement",
    heroTitle: "DJ til kick-off eller intern fejring med struktureret afvikling",
    heroLead: "Her er fokus ikke bare fest — men en løsning, der respekterer formatet, talerne og virksomhedens tone.",
    introTitle: "Når arrangementet skal være mere end bare en fest",
    introBody: "Kick-offs, interne markeringer og udvalgsarrangementer kræver ofte ekstra forståelse for timing, program og det professionelle udtryk.",
    bookingPrefillEventType: "Kick-off",
    packageSlug: "pkg_kompakt_firmafest",
    packageReason: "Til mindre og mere kontrollerede firmaarrangementer er den kompakte pakke ofte det mest omkostningseffektive og trygge valg.",
    comparisonBullets: ["God til korte og skarpe programmer", "Passer til interne og semi-formelle formater", "Nem at tilpasse venue og lydniveau"],
    trustPoints: ["Passer til både små og mellemstore events", "Mikrofon og taler håndteres professionelt", "Vi reducerer usikkerhed i programmet"],
    reviewEventTypes: ["Kick-off", "Andet firmaarrangement"],
    faqItems: firmaarrangementFaq,
    image: "https://images.unsplash.com/photo-1511895426328-dc8714191300?auto=format&fit=crop&w=1600&q=80",
  },
  "/dj-til-middag-og-fest": {
    path: "/dj-til-middag-og-fest",
    title: "DJ til middag og fest",
    pageTitle: "DJ til middag og fest",
    seoTitle: "DJ til middag og fest med rolig middag og stærkt dansegulv",
    seoDescription: "Bestil en DJ-løsning, hvor middagen glider naturligt over i fest med backup, teknik og tydelig pris.",
    heroEyebrow: "Middag og fest",
    heroTitle: "DJ til middag og fest, hvor overgangen bliver en del af oplevelsen",
    heroLead: "Den gode løsning her er en DJ, der kan styre middagen elegant og samtidig få dansegulvet i gang, når tiden er rigtig.",
    introTitle: "Når musikken skal følge aftenen, ikke dominere den",
    introBody: "Vi matcher på erfaring med taler, middagsmusik og energistyring, så arrangementet føles gennemtænkt hele vejen.",
    bookingPrefillEventType: "Middag og efterfest",
    packageSlug: "pkg_dinner_party",
    packageReason: "Denne type event er vores klassiske kernecase, fordi pakken understøtter både middag, speeches og fest.",
    comparisonBullets: ["God til events med tydeligt before/after-flow", "Sikker til taler og program", "Stærk til overgangen mod dans"],
    trustPoints: ["Lyd, lys og DJ samles i én løsning", "Vi tager ansvar for koordineringen", "Backup og pris er tydeligt beskrevet"],
    reviewEventTypes: ["Middag og efterfest", "Firmafest"],
    faqItems: middagOgFestFaq,
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1600&q=80",
  },
  "/mobildiskotek-firmafest": {
    path: "/mobildiskotek-firmafest",
    title: "Mobildiskotek til firmafest",
    pageTitle: "Mobildiskotek til firmafest",
    seoTitle: "Mobildiskotek til firmafest med lyd, lys og tryg afvikling",
    seoDescription: "Få et mobildiskotek til firmafesten med komplet setup, backup og en løsning, der passer til mindre venues.",
    heroEyebrow: "Mobildiskotek",
    heroTitle: "Mobildiskotek til firmafest med komplet setup og tydelig ansvarlighed",
    heroLead: "Når der er brug for en kompakt men premium løsning, kombinerer vi DJ, udstyr og planlægning i ét forløb.",
    introTitle: "Når venue eller formatet kræver en mere samlet løsning",
    introBody: "Denne side passer til virksomheder, der ønsker den komplette oplevelse uden at skulle koordinere separate leverandører for lyd og lys.",
    bookingPrefillEventType: "Firmafest",
    packageSlug: "pkg_kompakt_firmafest",
    packageReason: "Mobildiskotek er ofte mest relevant, når der er behov for en kompakt, samlet og effektiv løsning til et mindre eller mellemstort rum.",
    comparisonBullets: ["Egnet til mindre venues og stramme setup-tider", "Lyd og lys tænkes ind fra starten", "God til events, hvor enkelhed er vigtig"],
    trustPoints: ["Pakket som en samlet leverance", "Tydelig håndtering af udstyr og behov", "Velegnet til bynære venues og mindre rum"],
    reviewEventTypes: ["Firmafest", "Andet firmaarrangement"],
    faqItems: mobildiskotekFaq,
    image: "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1600&q=80",
  },
};
