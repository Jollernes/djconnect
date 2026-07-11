import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, Shield, Headphones, Package, Users, Mic } from "lucide-react";
import Link from "next/link";

export function LandingPage({
  title,
  headline,
  description,
  painPoints,
  packageRec,
  faq,
  ctaText,
  ctaHref,
  children,
}: {
  title: string;
  headline: string;
  description: string;
  painPoints: string[];
  packageRec: { name: string; reason: string; price: string };
  faq: { q: string; a: string }[];
  ctaText: string;
  ctaHref: string;
  children?: React.ReactNode;
}) {
  return (
    <PublicLayout>
      <div className="gradient-hero text-white py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-5xl font-bold tracking-tight mb-6">{headline}</h1>
            <p className="text-lg sm:text-xl text-slate-300 mb-8">{description}</p>
            <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
              <Link href={ctaHref}>{ctaText}</Link>
            </Button>
          </div>
        </div>
      </div>

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Hvad kræver denne type event?</h2>
              <ul className="space-y-3">
                {painPoints.map((p, i) => (
                  <li key={i} className="flex items-start gap-3 text-slate-700">
                    <CheckCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                    <span>{p}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Card className="bg-slate-50 border-amber-200">
              <CardContent className="p-6">
                <h3 className="text-lg font-bold text-slate-900">Anbefalet pakke</h3>
                <p className="text-xl font-bold text-amber-600 mt-2">{packageRec.name}</p>
                <p className="text-slate-700 mt-2">{packageRec.reason}</p>
                <p className="text-sm text-slate-500 mt-2">{packageRec.price}</p>
                <Button asChild className="mt-4 bg-slate-900 hover:bg-slate-800 text-white">
                  <Link href={ctaHref}>Få anbefalet løsning</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">Sådan reducerer vi risiko</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Users, title: 'Kurateret match', text: '2-3 DJs der passer til jeres event.' },
              { icon: Shield, title: 'Backup-garanti', text: 'Plan B klar, hvis noget uventet sker.' },
              { icon: Package, title: 'Tydelig pakke', text: 'Lyd, lys, mikrofon og timer defineret.' },
              { icon: Mic, title: 'Koordinering', text: 'Vi håndterer venue, køreplan og teknik.' },
            ].map((item, i) => (
              <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                <item.icon className="w-8 h-8 text-amber-600 mb-4" />
                <h3 className="font-bold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-sm text-slate-600">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {children}

      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-8">FAQ</h2>
          <div className="space-y-4">
            {faq.map((item, i) => (
              <div key={i} className="border-b border-slate-200 pb-4">
                <h3 className="font-semibold text-slate-900 mb-1">{item.q}</h3>
                <p className="text-slate-600 text-sm">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl font-bold mb-4">Klar til at finde den rette løsning?</h2>
          <p className="text-slate-300 mb-8">Udfyld eventbrieven, så matcher vi jer med en anbefalet pakke og op til 3 DJs.</p>
          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
            <Link href="/brief">Tjek dato og få match</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
