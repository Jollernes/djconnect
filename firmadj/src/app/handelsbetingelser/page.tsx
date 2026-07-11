import { PublicLayout } from "@/components/layout/PublicLayout";

export default function TermsPage() {
  return (
    <PublicLayout>
      <div className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Handelsbetingelser</h1>
          <p className="text-slate-300">Skal gennemgås juridisk før offentlig lancering.</p>
        </div>
      </div>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 text-slate-700">
          <p className="text-amber-600 font-semibold">Skal gennemgås juridisk før offentlig lancering.</p>
          <p>Disse handelsbetingelser er en placeholder. Inden produktion skal de juridisk gennemgås og tilpasses dansk lovgivning.</p>
          <p>Generelt: Alle priser vises eksklusiv moms, medmindre andet er angivet. Transport og særlige tekniske behov beregnes tydeligt før bekræftelse.</p>
          <p>Reservationer er foreløbige indtil endelig bekræftelse. Kontrakt og faktura sendes efter bekræftelse.</p>
          <p>Platformen står for backup i tilfælde af sygdom eller nødsituation, når det er inkluderet i pakken.</p>
        </div>
      </section>
    </PublicLayout>
  );
}
