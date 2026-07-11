import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Shield, Users, Package, Headphones, ClipboardList, FileText, CheckCircle } from "lucide-react";
import Link from "next/link";

export default function QualityPage() {
  return (
    <PublicLayout>
      <div className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Tryghed og kvalitet</h1>
          <p className="text-slate-300">Vi fjerner risikoen, når I booker DJ til firmafesten.</p>
        </div>
      </div>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Users, title: 'Kuraterede DJs', text: 'Kun DJs med firmaerfaring, professionel kommunikation og god feedback bliver godkendt.' },
              { icon: ClipboardList, title: 'Corporate event experience', text: 'Vores DJs har erfaring med taler, middag, mixed age groups og transitions.' },
              { icon: Package, title: 'Standardiserede pakker', text: 'Lyd, lys, timer, mikrofon og setup er tydeligt defineret. Ingen overrigelser.' },
              { icon: Shield, title: 'Backup policy', text: 'Hvis DJ bliver syg, finder vi en lige så kvalificeret afløser. Det er vores ansvar.' },
              { icon: Headphones, title: 'Teknisk checklist', text: 'Vi gennemgår venue, strøm, load-in, adgang og lydbehov inden event.' },
              { icon: FileText, title: 'Event spørgeskema', text: 'Must-play, do-not-play, taler, dress code og kontaktpersoner samlet ét sted.' },
              { icon: CheckCircle, title: 'Endelig køreplan', text: 'Tidsplan, teknik, kontaktpunkter og nødplan dokumenteres inden event.' },
              { icon: Headphones, title: 'Én kontaktpunkt', text: 'Én ansvarlig partner gennem hele forløbet.' },
              { icon: CheckCircle, title: 'Professionel kommunikation', text: 'Kontrakt, faktura og beskeder samlet på platformen.' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                <item.icon className="w-8 h-8 text-amber-600 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-600 text-sm">{item.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-16 bg-slate-900 text-white p-8 rounded-2xl text-center">
            <h2 className="text-2xl font-bold mb-4">Vores garanti</h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Vi kan ikke garantere, at alle gæster danser hele aftenen. Men vi kan garantere en professionel proces, 
              tydelig forventningsafstemning og en plan B, hvis noget uventet sker.
            </p>
            <Button asChild className="mt-6 bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
              <Link href="/brief">Få anbefalet løsning</Link>
            </Button>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
