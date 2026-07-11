import { LandingPage } from "@/components/shared/LandingPage";

export default function FirmafestPage() {
  return (
    <LandingPage
      title="DJ til firmafest"
      headline="DJ til firmafest med styr på hele aftenen"
      description="Fra middag til sidste dans. Professionel DJ, lyd, lys og backup – samlet ét sted til firmafesten."
      painPoints={[
        "Blandede aldre og forskellig musiksmag",
        "Overgangen fra middag til dansegulv",
        "Taler og mikrofon skal fungere",
        "Teknik skal passe til lokalet",
      ]}
      packageRec={{ name: "Dinner & Party", reason: "Den fleksible løsning til de fleste firmafester med middag og fest.", price: "Fra 13.900 DKK ekskl. moms" }}
      faq={[
        { q: "Hvordan vælger vi den rigtige DJ?", a: "Udfyld eventbrieven, så matcher vi jer med 2-3 DJs ud fra gæster, venue og vibe." },
        { q: "Er lyd og lys inkluderet?", a: "Ja, i vores standardpakker er professionel lyd og lys inkluderet." },
        { q: "Hvad koster en DJ til firmafest?", a: "Fra 8.900 DKK ekskl. moms. Endelig pris afhænger af gæsteantal, venue og transport." },
      ]}
      ctaText="Tjek dato til firmafesten"
      ctaHref="/brief"
    />
  );
}
