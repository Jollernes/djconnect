import { LandingPage } from "@/components/shared/LandingPage";

export default function SommerfestPage() {
  return (
    <LandingPage
      title="DJ til sommerfest"
      headline="DJ til sommerfest med energi og solsikker backup"
      description="Udendørs eller inde – vi sikrer lyd, lys og stemning til sommerfesten, så alle aldre har det sjovt."
      painPoints={[
        "Udendørs lyd og teknik",
        "Blandede aldre",
        "Vejr og praktiske forhold",
        "Opladet dansegulv hele aftenen",
      ]}
      packageRec={{ name: "Dinner & Party", reason: "Fleksibel løsning til sommerfest med god lyd og dans.", price: "Fra 13.900 DKK ekskl. moms" }}
      faq={[
        { q: "Kan I spille udendørs?", a: "Ja, vi tilpasser lyd og teknik til udendørs venue." },
        { q: "Hvad sker der ved regn?", a: "Vi planlægger backup-scenarier sammen med venue." },
        { q: "Hvad koster en DJ til sommerfest?", a: "Fra 13.900 DKK ekskl. moms for 80-150 gæster." },
      ]}
      ctaText="Tjek dato til sommerfesten"
      ctaHref="/brief"
    />
  );
}
