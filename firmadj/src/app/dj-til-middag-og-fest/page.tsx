import { LandingPage } from "@/components/shared/LandingPage";

export default function MiddagOgFestPage() {
  return (
    <LandingPage
      title="DJ til middag og efterfølgende fest"
      headline="DJ til middag og efterfølgende fest"
      description="Elegant middag, smooth overgange og et dansegulv, der starter på det helt rigtige tidspunkt."
      painPoints={[
        "Middagsmusik skal være elegant",
        "Overgangen skal være smooth",
        "Taler og mikrofon skal integreres",
        "Stemningen skal bygges op gradvist",
      ]}
      packageRec={{ name: "Dinner & Party", reason: "Skabt til arrangementer med både middag og efterfølgende fest.", price: "Fra 13.900 DKK ekskl. moms" }}
      faq={[
        { q: "Spiller DJ under middagen?", a: "Ja, Dinner & Party inkluderer middags- og baggrundsmusik." },
        { q: "Hvordan håndteres taler?", a: "DJ stiller mikrofon til rådighed og justerer lyden." },
        { q: "Hvordan starter dansegulvet?", a: "DJ læser stemningen og bygger energien op naturligt." },
      ]}
      ctaText="Tjek dato til middag og fest"
      ctaHref="/brief"
    />
  );
}
