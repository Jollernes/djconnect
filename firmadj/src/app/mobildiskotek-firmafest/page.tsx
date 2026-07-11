import { LandingPage } from "@/components/shared/LandingPage";

export default function MobildiskotekPage() {
  return (
    <LandingPage
      title="Mobildiskotek til firmafest"
      headline="Mobildiskotek til firmafest med lyd, lys og professionel DJ"
      description="Komplet mobildiskotek med alt nødvendigt udstyr. Ideelt til firmafester, julefrokoster og sommerfester."
      painPoints={[
        "Hele lydsættet skal medbringe",
        "Lys og effekter skal passe",
        "Setup og nedpakning skal gå hurtigt",
        "Teknisk koordinering med venue",
      ]}
      packageRec={{ name: "Dinner & Party", reason: "Inkluderer lyd, lys, mikrofon og op- og nedpakning – mobildiskotek klar.", price: "Fra 13.900 DKK ekskl. moms" }}
      faq={[
        { q: "Hvad er inkluderet i mobildiskotek?", a: "DJ, lyd, lys, mikrofon, op- og nedpakning og 5 timers musik." },
        { q: "Skal venue have udstyr?", a: "Nej, DJ medbringer komplet setup. Venue skal kun stille strøm og plads." },
        { q: "Hvor meget plads skal bruges?", a: "Typisk 2-3 x 2 meter afhængig af pakke." },
      ]}
      ctaText="Tjek dato til mobildiskotek"
      ctaHref="/brief"
    />
  );
}
