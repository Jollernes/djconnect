import { LandingPage } from "@/components/shared/LandingPage";

export default function FirmaarrangementPage() {
  return (
    <LandingPage
      title="DJ til firmaarrangement"
      headline="DJ til firmaarrangement med professionalisme og fleksibilitet"
      description="Reception, konference, kick-off eller networking event – vi matcher jer med den rette DJ og teknik."
      painPoints={[
        "Muskik skal passe til professionelt publikum",
        "Mulig brug af mikrofon og taler",
        "Teknik skal virke fra start",
        "Eventtype varierer meget",
      ]}
      packageRec={{ name: "Dinner & Party", reason: "Fleksibel løsning der dækker de fleste firmaarrangementer.", price: "Fra 13.900 DKK ekskl. moms" }}
      faq={[
        { q: "Kan I dække receptioner?", a: "Ja, vi tilpasser musik og lyd til receptionens stemning." },
        { q: "Hvad med konference-events?", a: "Vi kan levere lyd, mikrofon og baggrundsmusik." },
        { q: "Hvordan booker vi?", a: "Udfyld eventbrieven, så anbefaler vi den rette løsning." },
      ]}
      ctaText="Tjek dato til arrangementet"
      ctaHref="/brief"
    />
  );
}
