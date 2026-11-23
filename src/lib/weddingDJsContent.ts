import { Heart, Shield, CheckCircle2, Sparkles, Speaker, Disc3, Mic2, Lightbulb, Headphones } from "lucide-react";
import { mockReviews, mockDJs } from "@/data/mock";

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=2400&auto=format&fit=crop";

export const CANONICAL_PATH = "/wedding-djs";

export const valueProps = [
  {
    Icon: Shield,
    title: "Verificerede, godkendte DJs",
    body: "Interviewet, udstyrstjekket og referencetjekket, før de bliver vist. Ingen overraskelser på aftenen.",
  },
  {
    Icon: Heart,
    title: "Læser stemningen",
    body: "Mixer på tværs af generationer — fra første dans over bedsteforældre til aftenens sidste numre.",
  },
  {
    Icon: CheckCircle2,
    title: "Escrow-beskyttet betaling",
    body: "Betal via Stripe. Pengene bliver i escrow indtil 24 timer efter dit bryllup.",
  },
  {
    Icon: Sparkles,
    title: "Kontrakt inkluderet",
    body: "Tydelig skriftlig aftale: ankomsttid, udstyr, musiklister, annulleringsvilkår.",
  },
];

export const runOfShow = [
  { time: "16:00", label: "Opstilling & lydtjek", body: "Diskret indrykning 2 timer før gæsterne ankommer." },
  { time: "17:30", label: "Ceremoni / ankomstmusik", body: "Blødt akustisk sæt mens gæsterne ankommer." },
  { time: "18:30", label: "Velkomstdrinks", body: "Lounge & bossanova mens billederne tages udenfor." },
  { time: "20:00", label: "Middag & taler", body: "Baggrundsmusik under taler, mikrofon til skåltaler." },
  { time: "22:00", label: "Første dans", body: "Jeres valgte sang, lokalet klar, lyset sat." },
  { time: "22:15", label: "Dansegulvet åbner", body: "Numre i mellemtempo; de ældre gæster er stadig oppe." },
  { time: "23:00", label: "Højdepunkt", body: "Dansegulvsfyldere på tværs af årtier; alle er med." },
  { time: "01:00", label: "Afslutning", body: "En sidste stor fællessang og så en blød udtoning." },
];

export const playlistArc = [
  { label: "Ankomst", energy: 18, hint: "Akustisk / bossa" },
  { label: "Middag", energy: 28, hint: "Soul / standards" },
  { label: "Første dans", energy: 55, hint: "Jeres sang" },
  { label: "Opvarmning", energy: 62, hint: "Popklassikere" },
  { label: "Stigning", energy: 78, hint: "Disco / 80'er" },
  { label: "Højdepunkt", energy: 95, hint: "Dansegulvsfyldere" },
  { label: "Sent", energy: 82, hint: "Fællessange" },
  { label: "Afslutning", energy: 60, hint: "Én stor finale" },
];

export const equipmentChecklist = [
  { Icon: Speaker, label: "Professionelt PA-system (tilpasset lokalet)" },
  { Icon: Disc3, label: "Pioneer DDJ-1000 / CDJ-3000 setup" },
  { Icon: Mic2, label: "Trådløs mikrofon til taler & skåltaler" },
  { Icon: Lightbulb, label: "Diskret uplighting & moving heads" },
  { Icon: Sparkles, label: "Let røg/haze til dansegulvets stemning" },
  { Icon: Headphones, label: "Backup-laptop, afspillere & kabler" },
];

export const faq = [
  {
    q: "Hvor lang tid i forvejen skal jeg booke en bryllups-DJ?",
    a: "6–12 måneder for lørdagsbryllupper maj–september. Uden for højsæson (vinter, hverdage) — 2–3 måneder er normalt fint. De mest bookede DJs er udsolgt 9+ måneder i forvejen.",
  },
  {
    q: "Fungerer DJ'en som toastmaster for taler og annonceringer?",
    a: "Ja. Alle bryllups-DJs på DJConnect kan være toastmaster for aftenen — annoncere entréen, talerne, kagen og første dans. Du kan også medbringe din egen toastmaster, så leverer vi blot lyden.",
  },
  {
    q: "Kan jeg sende en skal-spilles- og må-ikke-spilles-liste?",
    a: "Helt sikkert — når du har booket, kan du i musikplanlæggeren i dit dashboard bygge skal-spilles-, må-ikke-spilles- og øjebliks-lister. Din DJ ser dem i realtid og bekræfter, at de har alt klar inden dagen.",
  },
  {
    q: "Hvad hvis vores bryllup trækker ud?",
    a: "Hver DJ har en overtidstakst angivet på deres profil. Du kan forlænge på aftenen — din DJ bekræfter via beskedtråden, og forlængelsen tilføjes den endelige faktura (stadig escrow-beskyttet).",
  },
  {
    q: "Hvad koster det at booke en bryllups-DJ i Danmark?",
    a: "De fleste bryllups-DJs på DJConnect ligger mellem 7.500 og 18.000 kr for en hel aften (5–7 timer), inklusive PA, lys og transport inden for deres region. Premium- / prisvindende DJs ligger højere.",
  },
  {
    q: "Hvad sker der, hvis vores DJ er nødt til at aflyse i sidste øjeblik?",
    a: "Det er yderst sjældent, men DJConnect har et backup-hold. Hvis din DJ ikke kan komme, ombooker vi en verificeret afløser uden ekstra omkostninger eller tilbagebetaler 100% via escrow, hvis du hellere vil aflyse.",
  },
];

export const weddingReviews = mockReviews
  .filter((r) => r.body.toLowerCase().includes("wedding") || r.body.toLowerCase().includes("first dance"))
  .slice(0, 4)
  .map((r) => ({ review: r, dj: mockDJs.find((d) => d.id === r.dj_profile_id) }));

export const weddingPricing = (() => {
  const weddingDJs = mockDJs.filter((d) => d.event_types.some((et) => et.id === "wedding"));
  const prices = weddingDJs.map((d) => d.price_from_minor).filter((p): p is number => Boolean(p));
  if (prices.length === 0) return null;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
  return { min, max, avg };
})();

export const totalWeddingDJs = mockDJs.filter((d) =>
  d.event_types.some((et) => et.id === "wedding"),
).length;
