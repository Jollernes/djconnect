import { PublicLayout } from "@/components/layout/PublicLayout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";
import Link from "next/link";
import { getPackages } from "@/lib/data";
import { formatCurrency } from "@/lib/format";

export default function PackagesPage() {
  const packages = getPackages();

  return (
    <PublicLayout>
      <div className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Pakker og priser</h1>
          <p className="text-slate-300 max-w-2xl mx-auto">Standardiserede løsninger, der gør booking nemt og trygt. Den endelige anbefaling afhænger af dato, venue, gæsteantal og tekniske behov.</p>
        </div>
      </div>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {packages.map((pkg) => (
              <Card key={pkg.id} className={`h-full flex flex-col ${pkg.slug === 'dinner-party' ? 'ring-2 ring-amber-400 relative' : ''}`}>
                {pkg.slug === 'dinner-party' && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900">Mest populær</Badge>}
                <CardContent className="p-6 flex flex-col h-full">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                  <p className="text-sm text-slate-500 mb-4">{pkg.best_for}</p>
                  <div className="text-3xl font-bold text-slate-900 mb-4">{formatCurrency(pkg.price_from)}</div>
                  <p className="text-slate-600 text-sm mb-6 flex-1">{pkg.description}</p>
                  <ul className="text-sm space-y-2 mb-6">
                    <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> {pkg.hours_included} musik</li>
                    {pkg.sound_included && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Lyd inkluderet</li>}
                    {pkg.lighting_included && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Lys inkluderet</li>}
                    {pkg.microphone_included && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Mikrofon inkluderet</li>}
                    {pkg.setup_teardown_included && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Op- og nedpakning</li>}
                    {pkg.technical_coordination_included && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Teknisk koordinering</li>}
                  </ul>
                  <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                    <Link href="/brief">Få anbefalet pakke</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-16 bg-slate-50 rounded-2xl p-6 overflow-auto">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">Sammenlign pakker</h2>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="text-left py-3 px-4">Pakke</th>
                  {packages.map((p) => <th key={p.id} className="text-left py-3 px-4">{p.name}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-slate-200"><td className="py-3 px-4 font-medium">Gæster</td>{packages.map((p) => <td key={p.id} className="py-3 px-4">{p.recommended_guest_range}</td>)}</tr>
                <tr className="border-b border-slate-200"><td className="py-3 px-4 font-medium">Timer</td>{packages.map((p) => <td key={p.id} className="py-3 px-4">{p.hours_included}</td>)}</tr>
                <tr className="border-b border-slate-200"><td className="py-3 px-4 font-medium">Lyd</td>{packages.map((p) => <td key={p.id} className="py-3 px-4">{p.sound_included ? 'Ja' : 'Aftales'}</td>)}</tr>
                <tr className="border-b border-slate-200"><td className="py-3 px-4 font-medium">Lys</td>{packages.map((p) => <td key={p.id} className="py-3 px-4">{p.lighting_included ? 'Ja' : 'Aftales'}</td>)}</tr>
                <tr className="border-b border-slate-200"><td className="py-3 px-4 font-medium">Mikrofon</td>{packages.map((p) => <td key={p.id} className="py-3 px-4">{p.microphone_included ? 'Ja' : 'Aftales'}</td>)}</tr>
                <tr className="border-b border-slate-200"><td className="py-3 px-4 font-medium">Middagsmusik</td>{packages.map((p) => <td key={p.id} className="py-3 px-4">{p.slug === 'dinner-party' || p.slug === 'stor-firmafest' ? 'Ja' : 'Aftales'}</td>)}</tr>
                <tr className="border-b border-slate-200"><td className="py-3 px-4 font-medium">Teknisk koordinering</td>{packages.map((p) => <td key={p.id} className="py-3 px-4">{p.technical_coordination_included ? 'Ja' : 'Aftales'}</td>)}</tr>
                <tr className="border-b border-slate-200"><td className="py-3 px-4 font-medium">Backup plan</td>{packages.map((p) => <td key={p.id} className="py-3 px-4">{p.backup_level === 'premium' ? 'Premium' : 'Standard'}</td>)}</tr>
                <tr><td className="py-3 px-4 font-medium">Bedst til</td>{packages.map((p) => <td key={p.id} className="py-3 px-4">{p.best_for}</td>)}</tr>
              </tbody>
            </table>
          </div>

          <p className="text-center text-sm text-slate-500 mt-8">{packages[0].vat_note}</p>
        </div>
      </section>
    </PublicLayout>
  );
}
