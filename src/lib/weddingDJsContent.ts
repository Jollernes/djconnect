import { Heart, Shield, CheckCircle2, Sparkles, Speaker, Disc3, Mic2, Lightbulb, Headphones } from "lucide-react";
import { mockReviews, mockDJs } from "@/data/mock";

export const HERO_IMAGE =
  "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=2400&auto=format&fit=crop";

export const CANONICAL_PATH = "/wedding-djs";

export const valueProps = [
  {
    Icon: Shield,
    title: "Verified, vetted DJs",
    body: "Interviewed, equipment-checked, and reference-verified before they're listed. No surprises on the night.",
  },
  {
    Icon: Heart,
    title: "Reads the room",
    body: "Mixes across generations — first dance through grandparents through dancefloor closers.",
  },
  {
    Icon: CheckCircle2,
    title: "Escrow-protected payment",
    body: "Pay through Stripe. Money stays in escrow until 24h after your wedding.",
  },
  {
    Icon: Sparkles,
    title: "Contract included",
    body: "Clear written agreement: arrival time, equipment, music lists, cancellation terms.",
  },
];

export const runOfShow = [
  { time: "16:00", label: "Setup & sound check", body: "Discreet load-in 2h before guests arrive." },
  { time: "17:30", label: "Ceremony / arrival music", body: "Soft acoustic set as guests arrive." },
  { time: "18:30", label: "Reception drinks", body: "Lounge & bossanova while photos happen outside." },
  { time: "20:00", label: "Dinner & speeches", body: "Background bed under speeches, mic'd toasts." },
  { time: "22:00", label: "First dance", body: "Your chosen song, room set, lighting cued." },
  { time: "22:15", label: "Dancefloor opens", body: "Mid-tempo openers; older guests still up." },
  { time: "23:00", label: "Peak set", body: "Floor-fillers across decades; everyone in." },
  { time: "01:00", label: "Closer", body: "One last big sing-along then a soft fade-out." },
];

export const playlistArc = [
  { label: "Arrival", energy: 18, hint: "Acoustic / bossa" },
  { label: "Dinner", energy: 28, hint: "Soul / standards" },
  { label: "First dance", energy: 55, hint: "Your song" },
  { label: "Opening", energy: 62, hint: "Pop classics" },
  { label: "Build", energy: 78, hint: "Disco / 80s" },
  { label: "Peak", energy: 95, hint: "Floor-fillers" },
  { label: "Late", energy: 82, hint: "Sing-alongs" },
  { label: "Closer", energy: 60, hint: "One big finish" },
];

export const equipmentChecklist = [
  { Icon: Speaker, label: "Pro PA system (sized to venue)" },
  { Icon: Disc3, label: "Pioneer DDJ-1000 / CDJ-3000 setup" },
  { Icon: Mic2, label: "Wireless mic for speeches & toasts" },
  { Icon: Lightbulb, label: "Discreet uplighting & moving heads" },
  { Icon: Sparkles, label: "Light haze for dancefloor cinematography" },
  { Icon: Headphones, label: "Backup laptop, decks & cables" },
];

export const faq = [
  {
    q: "How far in advance should I book a wedding DJ?",
    a: "6–12 months for Saturday weddings May–September. Off-peak (winter, weekdays) — 2–3 months is usually fine. The most-booked DJs sell out 9+ months ahead.",
  },
  {
    q: "Will the DJ act as MC for speeches and announcements?",
    a: "Yes. Every wedding DJ on DJConnect can MC the night — announce the entrance, speeches, cake cut, and first dance. You can also bring your own MC and we'll just supply the sound.",
  },
  {
    q: "Can I send a must-play and do-not-play list?",
    a: "Absolutely — once you've booked, the music planner in your dashboard lets you build must-play, do-not-play, and special-moment lists. Your DJ sees them in real time and confirms they have everything before the day.",
  },
  {
    q: "What if our wedding runs late?",
    a: "Each DJ has an overtime rate listed on their profile. You can extend on the night — your DJ confirms via the messages thread, and the extension is added to the final invoice (still escrow-protected).",
  },
  {
    q: "What does it cost to book a wedding DJ in Denmark?",
    a: "Most DJConnect wedding DJs are between DKK 7,500 and DKK 18,000 for a full evening (5–7 hours), including PA, lighting, and travel within their region. Premium / award-winning DJs go higher.",
  },
  {
    q: "What happens if our DJ has to cancel last-minute?",
    a: "It's extremely rare, but DJConnect maintains a backup roster. If your DJ can't make it, we re-book a verified replacement at no extra cost or refund 100% via the escrow if you'd prefer to cancel.",
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
