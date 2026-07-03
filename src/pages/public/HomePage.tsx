import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import {
  BookingWidget,
  CustomEnterpriseCard,
  FaqAccordion,
  PackageCard,
  PricingNote,
  ReviewGrid,
  ShortlistExplainer,
  StepsExplainer,
  TrustBar,
  TrustGuaranteeCards,
  UseCaseGrid,
} from "@/components/marketing";
import { useCollection } from "@/lib/store";
import { HOME_FAQ_ITEMS } from "@/lib/faq";
import { PLATFORM_TAGLINES } from "@/lib/constants";
import { useDanishPageSeo } from "@/lib/seo";

export function HomePage() {
  useDanishPageSeo({
    title: "Book en professionel DJ til firmafesten uden usikkerhed",
    description:
      "Få en kurateret løsning med DJ, lyd, lys, kontrakt og backup. Udfyld jeres eventdetaljer og få et anbefalet match.",
    canonical: "/",
  });

  const packages = useCollection("packages")
    .filter((pkg) => pkg.active)
    .sort((a, b) => a.display_order - b.display_order)
    .slice(0, 3);

  return (
    <div className="overflow-hidden">
      <section className="relative border-b border-border/60 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.16),_transparent_34%),radial-gradient(circle_at_25%_20%,_rgba(212,164,72,0.16),_transparent_32%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--background))_65%,_rgba(255,255,255,0.95)_100%)]">
        <Container className="relative py-16 sm:py-20 lg:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
              <Badge variant="secondary" className="mb-5 rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                {PLATFORM_TAGLINES[0]}
              </Badge>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
                Book en professionel DJ til firmafesten uden usikkerhed
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-muted-foreground sm:text-xl">
                Få en kurateret løsning med DJ, lyd, lys, kontrakt og backup. Udfyld jeres eventdetaljer og få et anbefalet match.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="accent" size="lg">
                  <Link to="/brief">
                    Tjek dato og få match <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/pakker">Se pakker</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-2 text-sm text-muted-foreground">
                {[
                  "Professionel afvikling",
                  "Kurateret shortlist",
                  "Tydelig pris og kontrakt",
                  "Backup og teknik",
                ].map((item) => (
                  <span key={item} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 shadow-sm">
                    <Sparkles className="h-4 w-4 text-gold" />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.05 }}>
              <BookingWidget />
            </motion.div>
          </div>
        </Container>
      </section>

      <section className="border-b border-border/60 bg-background py-8">
        <Container>
          <TrustBar />
        </Container>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Sådan virker det"
            title="Tre enkle trin fra brief til tryg booking"
            description="Vi gør det let at bestille musik til firmaevents uden at miste kontrol over kvalitet, pris og ansvar."
            align="center"
          />
          <StepsExplainer />
        </Container>
      </section>

      <section className="bg-muted/20 py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Firmaevents"
            title="Vælg ud fra jeres anledning"
            description="Hver løsning er tænkt som en konkret firmaevent-anledning, ikke et åbent katalog."
            align="center"
          />
          <UseCaseGrid />
        </Container>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Pakker"
            title="Tre standardpakker — med en anbefaling, der tager udgangspunkt i jeres brief"
            description="Den endelige anbefaling afhænger af eventets detaljer, men de tre pakker giver et klart udgangspunkt."
            align="center"
          />
          <div className="grid gap-4 xl:grid-cols-4">
            {packages.map((pkg) => (
              <PackageCard key={pkg.id} pkg={pkg} recommended={pkg.slug === "dinner-party"} />
            ))}
            <CustomEnterpriseCard />
          </div>
          <PricingNote className="max-w-3xl text-center mx-auto" />
        </Container>
      </section>

      <section className="bg-muted/20 py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Tryghed"
            title="Én ansvarlig partner fra booking til sidste sang"
            description="Vi tager ansvar for det praktiske og minimerer risikoen, så I kan koncentrere jer om arrangementet."
            align="center"
          />
          <TrustGuaranteeCards />
        </Container>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <Container className="grid gap-10 lg:grid-cols-[1fr_0.92fr] lg:items-start">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Kurateret shortlist"
              title="I skal ikke gennemsøge markedet for DJs"
              description="Vi matcher ud fra tilgængelighed, eventtype, lokation, gæsteantal, musikprofil, erfaring med firmaevents, sprog og tekniske behov."
            />
            <ShortlistExplainer className="mt-6" />
          </div>
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Kundecitater"
              title="Det siger erhvervskunderne"
              description="Her er plads til de første anmeldelser fra virksomheder, der vil have en løsning, der føles nem og sikker."
            />
            <ReviewGrid />
          </div>
        </Container>
      </section>

      <section className="bg-muted/20 py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="FAQ"
            title="Ofte stillede spørgsmål"
            description="Svarene nedenfor dækker de vigtigste spørgsmål om valg, backup, teknik og pris."
            align="center"
          />
          <FaqAccordion items={HOME_FAQ_ITEMS} />
        </Container>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <Container>
          <div className="rounded-[2rem] border border-border/60 bg-gradient-to-br from-primary via-slate-800 to-primary px-6 py-10 text-primary-foreground shadow-xl sm:px-10 sm:py-14">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Klar til næste skridt?</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Klar til at finde den rette løsning?</h2>
              <p className="max-w-2xl text-base leading-7 text-primary-foreground/75">
                Fortæl os om jeres event, og få et anbefalet match med tydelig pris, pakke og ansvarlighed.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="accent" size="lg">
                <Link to="/brief">Tjek dato og få match</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/pakker">Se pakker</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}
