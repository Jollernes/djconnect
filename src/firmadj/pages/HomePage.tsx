import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Wand2 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PackageCard } from "@/firmadj/components/PackageCard";
import { TrustBand } from "@/firmadj/components/TrustBand";
import { packages } from "@/firmadj/data/mock";

const uspItems = [
  { icon: ShieldCheck, title: "Ro i maven", text: "I får en fast løsning med backup-DJ og tydelig afvikling." },
  { icon: Sparkles, title: "Premium produktion", text: "Lyd, lys og setup til firmabegivenheder med ambitioner." },
  { icon: Wand2, title: "Præcis pris", text: "Se hvad jeres event koster, før I binder jer til noget." },
];

export function HomePage() {
  return (
    <div className="space-y-16 pb-16">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 firma-hero-gradient" />
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 firma-noise opacity-30" />
        <div className="container relative grid min-h-[82vh] items-center py-16 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="max-w-3xl">
            <div className="mb-5 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm text-white/90 backdrop-blur">
              Managed marketplace til danske firmafester
            </div>
            <h1 className="font-display text-5xl font-extrabold tracking-tight text-white md:text-7xl">
              Eksklusiv underholdning til firmafesten. Ro i maven – garanteret.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80 md:text-xl">
              Book en komplet, professionel DJ-løsning med faktura og backup.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/book">
                  Se priser og ledighed
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white">
                <Link to="/vores-djs">Se DJs</Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.55, delay: 0.05 }}
            className="mt-10 lg:mt-0"
          >
            <Card className="glass overflow-hidden border-white/10">
              <div className="relative aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=1200&q=80"
                  alt="Corporate party med lys og dans"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <CardContent className="absolute inset-x-0 bottom-0 space-y-4 p-6 text-white">
                  <div className="text-sm uppercase tracking-[0.22em] text-white/70">Firmafest, julefrokost, gallamiddag</div>
                  <div className="font-display text-3xl font-bold">Teknik, timing og topklasse energi.</div>
                  <div className="text-sm leading-6 text-white/80">
                    Vi matcher jer med DJs, der er vant til corporate settings, formelle rammer og fyldte dansegulve.
                  </div>
                </CardContent>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      <div className="container space-y-16">
        <TrustBand />

        <section className="space-y-8">
          <div className="max-w-2xl">
            <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Pakker</div>
            <h2 className="font-display mt-3 text-3xl font-bold md:text-4xl">Vælg en løsning, der passer til jeres gæster og ambitionsniveau.</h2>
          </div>
          <div className="grid gap-6 lg:grid-cols-3">
            {packages.map((firmaPackage) => (
              <PackageCard key={firmaPackage.id} firmaPackage={firmaPackage} />
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="glass border-white/10">
            <CardContent className="space-y-5 p-8">
              <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Vores DJs</div>
              <h2 className="font-display text-3xl font-bold">Kuraterede profiler med erfaring fra danske virksomheder.</h2>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground">
                Se vores corporate-ready DJs, deres lyd og de referencer, de allerede er trygge ved at spille for.
              </p>
              <Button asChild size="lg" className="w-fit">
                <Link to="/vores-djs">Mød profilerne</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="glass border-white/10">
            <CardContent className="space-y-4 p-8">
              <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Sådan fungerer det</div>
              <div className="space-y-4">
                {uspItems.map(({ icon: Icon, title, text }) => (
                  <div key={title} className="flex gap-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/20 text-primary">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-semibold">{title}</div>
                      <div className="text-sm leading-6 text-muted-foreground">{text}</div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="glass flex flex-col items-start justify-between gap-5 rounded-3xl border-white/10 p-8 md:flex-row md:items-center">
          <div>
            <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Klar til næste skridt?</div>
            <h2 className="font-display mt-2 text-3xl font-bold">Se priser og ledighed på under et minut.</h2>
          </div>
          <Button asChild size="lg">
            <Link to="/book">
              Se priser og ledighed
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </section>
      </div>
    </div>
  );
}
