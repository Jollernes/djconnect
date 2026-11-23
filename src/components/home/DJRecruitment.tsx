import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const POINTS = [
  "Få forespørgsler fra kunder i hele Danmark",
  "Sæt dine egne priser og vælg dine datoer",
  "Sikker betaling direkte til din konto",
];

export function DJRecruitment() {
  return (
    <section className="container pb-16 sm:pb-24">
      <div className="grid overflow-hidden rounded-3xl bg-slate-900 text-white lg:grid-cols-2">
        <div className="p-8 sm:p-12 lg:p-16">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent">For DJs</span>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            Har du dit eget lyd- og lysanlæg?
          </h2>
          <p className="mt-4 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
            Bliv en del af Danmarks marketplace for mobile DJs, og få flere bookinger til bryllupper, firmafester og
            private fester.
          </p>
          <ul className="mt-6 space-y-3">
            {POINTS.map((p) => (
              <li key={p} className="flex items-start gap-3 text-slate-200">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" />
                {p}
              </li>
            ))}
          </ul>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="accent" size="lg" className="rounded-full px-8">
              <Link to="/signup/dj">
                Bliv DJ <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="ghost"
              className="rounded-full border border-white/20 px-8 text-white hover:bg-white/10 hover:text-white"
            >
              <Link to="/how-it-works#djs">Sådan fungerer det</Link>
            </Button>
          </div>
          <p className="mt-6 text-xs text-slate-400">
            Kun DJs med eget mobilt diskotek kan optages. Bands, sangere og andre optrædende optages ikke.
          </p>
        </div>
        <div className="relative min-h-[260px] lg:min-h-full">
          <img
            src="/dj-photos/flashback/setup-2.png"
            alt="Mobilt diskotek med lyd og lys klar til fest"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </div>
      </div>
    </section>
  );
}
