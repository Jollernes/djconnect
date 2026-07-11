import { PublicLayout } from "@/components/layout/PublicLayout";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function FAQPage() {
  const faq = [
    { q: 'Kan vi vælge DJ?', a: 'Ja. Efter eventbrieven får I en kortliste med 2-3 DJs. I kan vælge én, eller lade os vælge det bedste match.' },
    { q: 'Hvorfor kan vi ikke browse alle DJs?', a: 'Vi arbejder som et kurateret bureau. De fleste firmaevents kræver sikkerhed, ikke mere researcharbejde.' },
    { q: 'Hvad er inkluderet i prisen?', a: 'Pakken definerer timer, lyd, lys, mikrofon, op- og nedpakning og teknisk koordinering. Transport beregnes før bekræftelse.' },
    { q: 'Er priserne inklusive eller eksklusive moms?', a: 'Alle priser vises eksklusive moms. Moms fremgår tydeligt på kontrakt og faktura.' },
    { q: 'Hvad sker der, hvis DJ bliver syg?', a: 'Vi har altid en backup-DJ klar. Det er vores ansvar at finde en lige så kvalificeret afløser.' },
    { q: 'Kan vi ønske sange?', a: 'Ja. Under spørgeskemaet kan I angive must-play og do-not-play. DJ tager hensyn til ønskerne.' },
    { q: 'Kan DJ hjælpe med taler?', a: 'Ja. Mange pakker inkluderer trådløs mikrofon, og vores DJs kan assistere med taler.' },
    { q: 'Kan vi booke uden fast venue?', a: 'Ja. I kan sende briefen og opdatere venue senere. Vælg blot status i briefen.' },
    { q: 'Hvor lang tid før skal vi booke?', a: 'Jo før, jo bedre. Særligt julefrokostsæsonen er populær. Vi svarer samme dag.' },
    { q: 'Kan I levere uden for København?', a: 'Ja. Vores netværk dækker hele Danmark. Transport og rejsetid beregnes i prisen.' },
    { q: 'Kan vi få en faktura?', a: 'Ja. Vi sender faktura, kontrakt og event depositum gennem platformen.' },
    { q: 'Kan vi genbestille samme DJ?', a: 'Ja, hvis DJ er ledig. Brug genbookingsfunktionen i klientportalen.' },
    { q: 'Håndterer I lyd og lys?', a: 'Ja. Professionel lyd og lys er en del af vores standardpakker. Større events kræver teknisk vurdering.' },
    { q: 'Hvorfor ser vi kun 2-3 DJs?', a: 'For at give jer færre, men bedre match. Det sparer tid og reducerer risiko.' },
    { q: 'Kan vi booke til 200+ gæster?', a: 'Ja. Vælg Custom / Enterprise. Vi kontakter jer for en teknisk vurdering.' },
    { q: 'Kan vi booke samme setup næste år?', a: 'Ja. Gem eventdetaljerne og brug genbookingsfunktionen.' },
  ];

  return (
    <PublicLayout>
      <div className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">FAQ</h1>
          <p className="text-slate-300">Svar på de mest almindelige spørgsmål om booking af DJ til firmafesten.</p>
        </div>
      </div>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Accordion className="space-y-4">
            {faq.map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="border border-slate-200 rounded-xl px-4">
                <AccordionTrigger className="text-left font-semibold text-slate-900 hover:no-underline">{item.q}</AccordionTrigger>
                <AccordionContent className="text-slate-600">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          <div className="mt-12 text-center">
            <p className="text-slate-600 mb-4">Fandt du ikke svar?</p>
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white">
              <Link href="/kontakt">Kontakt os</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
