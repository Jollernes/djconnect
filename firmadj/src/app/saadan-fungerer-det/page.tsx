import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import Link from "next/link";

export default function HowItWorksPage() {
  return (
    <PublicLayout>
      <div className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Sådan fungerer det</h1>
          <p className="text-slate-300">En enkel, professionel proces fra første brief til sidste sang.</p>
        </div>
      </div>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-12">
            {[
              { step: '1', title: 'Indsend event brief', text: 'Fortæl os om dato, sted, gæster, eventtype, musik og tekniske behov. Det tager 2-3 minutter.' },
              { step: '2', title: 'Platform anbefaler pakke', text: 'Baseret på gæsteantal, lokale, eventtype og behov får I en anbefalet pakke.' },
              { step: '3', title: '2-3 kuraterede DJ-match', text: 'Vi filtrerer DJs efter tilgængelighed, region, erfaring, sprog og vibe. Kun 2-3 vises.' },
              { step: '4', title: 'Vælg selv eller lad os vælge', text: 'I kan vælge en DJ fra kortlisten, eller lade os vælge det bedste match.' },
              { step: '5', title: 'Kontrakt, teknik og backup', text: 'Vi sender kontrakt, faktura, event spørgeskema og køreplan. Backup-DJ er klar.' },
              { step: '6', title: 'Endelig køreplan', text: 'Inden event afstemmes tider, taler, must-play, do-not-play og kontaktpersoner.' },
              { step: '7', title: 'DJ leverer eventet', text: 'DJ ankommer, sætter op, spiller, pakker ned. Vi følger op bagefter.' },
            ].map((item, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-12 h-12 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xl shrink-0">{item.step}</div>
                <div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-slate-50 p-8 rounded-2xl">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">Vi viser ikke et uendeligt katalog af DJs</h2>
            <p className="text-slate-600 mb-6">
              Vi matcher ud fra jeres arrangement, fordi de fleste firmaevents kræver sikkerhed, ikke mere researcharbejde. 
              I får færre valg, men bedre match. Og en ansvarlig partner, der sikrer at teknik, kontrakt og backup er på plads.
            </p>
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white">
              <Link href="/brief">Start brief</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
