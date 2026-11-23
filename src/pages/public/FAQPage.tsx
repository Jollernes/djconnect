import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { PLATFORM_FEE_PERCENT } from "@/lib/constants";

const faqs = [
  {
    q: "Hvordan fungerer DJ-verificering?",
    a: "Hver DJ indsender en fuld ansøgning inklusive udstyrsliste, billeder af udstyret, erfaringsniveau og valgfrie referencer eller certifikater. Vores team gennemgår hver ansøgning, før DJ'en må acceptere bookinger. Godkendte DJs får et grønt 'Verificeret'-mærke på deres profil.",
  },
  {
    q: "Er min betaling sikker?",
    a: "Ja. Alle betalinger behandles af Stripe, en af verdens førende betalingsudbydere. Dine kortoplysninger rører aldrig vores servere. Pengene holdes i escrow af Stripe og frigives først til DJ'en 24 timer efter dit event er afsluttet.",
  },
  {
    q: "Hvad sker der, hvis jeg er nødt til at aflyse?",
    a: "Vores annulleringspolitik er: aflys mere end 14 dage før eventet og få 100% tilbagebetaling, aflys 7–14 dage før og få 50%, aflys mindre end 7 dage før og ingen tilbagebetaling. Politikken vises tydeligt ved betaling.",
  },
  {
    q: "Hvad er et mobilt diskotek?",
    a: "Et komplet, selvstændigt DJ-setup, som DJ'en medbringer til dit lokale — inklusive afspillere/controller, mixer, højttalere, subwoofer, lys og mikrofoner. Du behøver ikke stille andet udstyr til rådighed end strøm.",
  },
  {
    q: "Hvordan ved jeg, at DJ'en møder op?",
    a: "Hver DJ på platformen er identitetsverificeret og har gennemgået vores udstyrskontrol. Betalinger holdes i escrow — hvis en DJ ikke møder op, har du ret til fuld tilbagebetaling, og vi hjælper dig med at finde en afløser i sidste øjeblik, hvor det er muligt.",
  },
  {
    q: "Hvordan skriver jeg en anmeldelse?",
    a: "Efter din eventdato er passeret, modtager du en e-mail med et link til at skrive en anmeldelse. Du har 14 dage til at indsende den. Kun kunder med en gennemført booking kan anmelde en DJ.",
  },
  {
    q: "Hvordan får DJs betaling?",
    a: "DJs tilknytter en Stripe-konto under onboarding. Når en booking er gennemført, frigives DJ'ens andel (90% af bookingbeløbet som standard) til deres Stripe-konto 24 timer efter eventet.",
  },
  {
    q: "Hvad er platformens servicegebyr?",
    a: `Platformen tager et servicegebyr på ${PLATFORM_FEE_PERCENT}%, som vises tydeligt ved betaling. Det dækker sikre betalinger, kundesupport, tvistløsning, DJ-verificering og udvikling af platformen.`,
  },
];

export function FAQPage() {
  return (
    <div className="container max-w-3xl py-16">
      <h1 className="text-3xl font-semibold">Ofte stillede spørgsmål</h1>
      <p className="mt-2 text-muted-foreground">
        Fandt du ikke det, du ledte efter? <a className="text-accent underline" href="/contact">Kontakt os</a>.
      </p>
      <div className="mt-8">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`item-${i}`}>
              <AccordionTrigger>{f.q}</AccordionTrigger>
              <AccordionContent>{f.a}</AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </div>
  );
}
