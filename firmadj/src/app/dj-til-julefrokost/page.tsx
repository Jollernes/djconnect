import { LandingPage } from "@/components/shared/LandingPage";

export default function JulefrokostPage() {
  return (
    <LandingPage
      title="DJ til julefrokost"
      headline="DJ til julefrokost med styr på middag, taler og dansegulv"
      description="Julefrokosten kræver en særlig balance: fællessang, klassikere, taler og et dansegulv, der holder hele aftenen."
      painPoints={[
        "Musik for alle aldre",
        "Transition fra middag til fest",
        "Mikrofon og taler skal virke",
        "Backup hvis noget går galt",
      ]}
      packageRec={{ name: "Dinner & Party", reason: "Perfekt til julefrokost med middag, taler og dansegulv efterfølgende.", price: "Fra 13.900 DKK ekskl. moms" }}
      faq={[
        { q: "Kan DJ spille julehits?", a: "Ja, vores DJs har erfaring med julefrokost-stemning og klassikere." },
        { q: "Hvornår skal vi booke?", a: "Julefrokostsæsonen er populær. Book gerne 2-3 måneder før." },
        { q: "Hvad med taler?", a: "Dinner & Party inkluderer mikrofon, og DJ kan assistere med taler." },
      ]}
      ctaText="Tjek dato til julefrokosten"
      ctaHref="/brief"
    />
  );
}
