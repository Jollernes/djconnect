import { PublicLayout } from "@/components/layout/PublicLayout";

export default function PrivacyPage() {
  return (
    <PublicLayout>
      <div className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Privatlivspolitik</h1>
          <p className="text-slate-300">Skal gennemgås juridisk før offentlig lancering.</p>
        </div>
      </div>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-slate-700">
          <p className="text-amber-600 font-semibold">Skal gennemgås juridisk før offentlig lancering.</p>
          <p>Denne privatlivspolitik er en placeholder. Inden produktion skal den juridisk gennemgås og tilpasses GDPR og dansk lovgivning.</p>
          <p>Vi behandler kontaktoplysninger, eventdetaljer og kommunikation sikkert. Data deles ikke med tredjepart uden samtykke.</p>
          <p>Du har ret til indsigt, berigtigelse og sletning af dine data. Kontakt os på hello@firmadj.demo.</p>
        </div>
      </section>
    </PublicLayout>
  );
}
