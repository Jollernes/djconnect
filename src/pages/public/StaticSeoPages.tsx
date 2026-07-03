import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { z } from "zod";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CheckCircle2, Clock3, Mail, ShieldCheck, Sparkles } from "lucide-react";
import { toast } from "sonner";
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
} from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCallbackRequest, createContactRequest, useCollection } from "@/lib/store";
import { FAQ_ITEMS, FAQ_SECTIONS } from "@/lib/faq";
import { PLATFORM_SUPPORT_EMAIL } from "@/lib/constants";
import { useDanishPageSeo } from "@/lib/seo";
import type { Package } from "@/types/domain";
import type { UseCaseConfig } from "@/lib/useCases";
import type { LucideIcon } from "lucide-react";

type ContactValues = {
  full_name: string;
  company_name: string;
  email: string;
  phone: string;
  message: string;
  preferred_callback_time: string;
  request_callback: boolean;
};

const contactSchema = z.object({
  full_name: z.string().min(2, "Skriv jeres navn."),
  company_name: z.string().min(2, "Skriv virksomhedsnavn."),
  email: z.string().email("Skriv en gyldig e-mail."),
  phone: z.string().min(6, "Skriv et telefonnummer."),
  message: z.string().min(10, "Skriv en besked med lidt flere detaljer."),
  preferred_callback_time: z.string(),
  request_callback: z.boolean(),
});

type LegalSection = {
  title: string;
  paragraphs: string[];
};

export function PackagesPage() {
  useDanishPageSeo({
    title: "Pakker og priseksempler",
    description: "Se vores tre pakker til firmaevents, og hvordan vi anbefaler den rigtige løsning ud fra jeres brief.",
    canonical: "/pakker",
  });

  const packages = useCollection("packages")
    .filter((pkg) => pkg.active)
    .sort((a, b) => a.display_order - b.display_order);

  const compareRows = [
    { label: "Timer inkluderet", key: "hours" },
    { label: "Lyd", key: "sound" },
    { label: "Lys", key: "lighting" },
    { label: "Mikrofon til taler", key: "microphone" },
    { label: "Teknisk koordinering", key: "coordination" },
    { label: "Opsætning", key: "setup" },
    { label: "Nedtagning", key: "teardown" },
  ] as const;

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-muted/20 py-16 sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Pakker"
              title="Tre gennemarbejdede løsninger med klar anbefaling"
              description="Vi vælger ikke pakken på forhånd alene ud fra pris. Den endelige anbefaling afhænger af jeres brief, gæsteantal, venue og tekniske behov."
            />
            <p className="max-w-2xl text-base leading-7 text-muted-foreground">
              Her kan I se, hvad der typisk følger med i de tre standardpakker. Når I udfylder briefen, anbefaler vi den løsning, der matcher jeres arrangement bedst.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild variant="accent">
                <Link to="/brief">Tjek dato og få match <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/kontakt">Har I et særligt setup?</Link>
              </Button>
            </div>
          </div>
          <Card className="border-border/60 shadow-sm">
            <CardContent className="space-y-3 p-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Sådan anbefaler vi</p>
              <p className="text-sm leading-7 text-muted-foreground">
                1) Vi læser jeres brief. 2) Vi matcher eventtype, gæsteantal og teknik. 3) Vi præsenterer den pakke, der giver mest værdi og mindst friktion.
              </p>
              <p className="text-sm leading-7 text-muted-foreground">
                Hvis jeres behov ligger uden for standardrammen, anbefaler vi i stedet en custom-løsning, så I får en plan, der passer til produktionen.
              </p>
            </CardContent>
          </Card>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="space-y-10">
          <div className="grid gap-4 xl:grid-cols-4">
            {packages.map((pkg, index) => (
              <PackageCard key={pkg.id} pkg={pkg} recommended={index === 1} />
            ))}
            <CustomEnterpriseCard />
          </div>
          <PricingNote className="max-w-3xl" />
        </Container>
      </section>

      <section className="bg-muted/20 py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Sammenligning"
            title="Hvad er forskellen på pakkerne?"
            description="Her er den korte oversigt over, hvad hver pakke typisk dækker."
          />
          <Card className="overflow-hidden border-border/60 shadow-sm">
            <CardContent className="overflow-x-auto p-0">
              <table className="min-w-full divide-y divide-border/60 text-left text-sm">
                <thead className="bg-muted/40">
                  <tr>
                    <th className="px-5 py-4 font-medium">Element</th>
                    {packages.map((pkg) => (
                      <th key={pkg.id} className="px-5 py-4 font-medium">
                        {pkg.name}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {compareRows.map((row) => (
                    <tr key={row.label}>
                      <td className="px-5 py-4 font-medium text-foreground">{row.label}</td>
                      {packages.map((pkg) => (
                        <td key={`${pkg.id}-${row.label}`} className="px-5 py-4 text-muted-foreground">
                          {packageFeatureValue(pkg, row.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="accent">
              <Link to="/brief">Få anbefalet løsning</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/kontakt">Tal med os om en specialløsning</Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}

export function HowItWorksPage() {
  useDanishPageSeo({
    title: "Sådan fungerer det",
    description: "Læs hvordan brief, shortlist, reservation, questionnaire og run sheet hænger sammen i den managed-agency model.",
    canonical: "/saadan-fungerer-det",
  });

  const steps = [
    { title: "1. Udfyld briefen", body: "Fortæl os om eventtype, dato, lokation, gæsteantal, musikprofil og tekniske behov." },
    { title: "2. Få en kurateret shortlist", body: "Vi anbefaler en pakke og 2 til 3 DJs, der passer til arrangementet og kan levere på datoen." },
    { title: "3. Reservér med kontrakt og backup", body: "I vælger selv eller lader os vælge det bedste match, og vi tager ansvar for kontrakt, teknik og backup." },
    { title: "4. Udfyld eventspørgeskema", body: "Når reservationen er på plads, samler vi de sidste detaljer om venue, timing og program." },
    { title: "5. Run sheet og koordinering", body: "Vi samler overblik over forløbet, så alle ved, hvad der sker hvornår." },
    { title: "6. Selve eventet", body: "På dagen står vi for den del af leverancen, der gør oplevelsen stabil, professionel og tryg." },
  ];

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-muted/20 py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Sådan fungerer det"
            title="Managed-agency model for firmaevents"
            description="Vi har gjort processen enkel for jer, men vi har ikke gjort den uklar. I ved, hvad der sker, og hvem der har ansvaret."
          />
          <StepsExplainer />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Forløbet"
              title="Fra brief til event uden at I skal koordinere leverandører selv"
              description="Det er netop managed-agency tanken: vi samler det praktiske og holder det professionelt, mens I får en tydelig proces."
            />
            <div className="grid gap-3">
              {steps.map((step) => (
                <Card key={step.title} className="border-border/60 shadow-sm">
                  <CardContent className="p-5">
                    <p className="font-medium text-foreground">{step.title}</p>
                    <p className="mt-2 text-sm leading-7 text-muted-foreground">{step.body}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Tryghed"
              title="Hvorfor vores model føles lettere for kunden"
              description="I stedet for at browse og koordinere flere navne, får I en kurateret løsning med tydeligt ansvar."
            />
            <TrustGuaranteeCards />
          </div>
        </Container>
      </section>

      <section className="bg-muted/20 py-16 sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <SectionHeading
              eyebrow="Næste skridt"
              title="Start med briefen og få en reel anbefaling"
              description="Når vi har de vigtigste detaljer, kan vi anbefale både pakke og DJ-match på et langt mere kvalificeret grundlag."
            />
          </div>
          <Button asChild variant="accent" size="lg">
            <Link to="/brief">Tjek dato og få match</Link>
          </Button>
        </Container>
      </section>
    </div>
  );
}

export function TrustQualityPage() {
  useDanishPageSeo({
    title: "Tryghed og kvalitet",
    description: "Se hvordan DJs kurateres, hvordan backup virker, og hvordan vi arbejder med pris- og datapræcision.",
    canonical: "/tryghed-og-kvalitet",
  });

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-muted/20 py-16 sm:py-20">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="Tryghed og kvalitet"
            title="Én ansvarlig partner hele vejen"
            description="Vi går op i kuratering, tydelighed og professionel afvikling. Det skal være let at stole på processen."
          />
          <TrustBar />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="space-y-10">
          <TrustGuaranteeCards />
          <div className="grid gap-4 lg:grid-cols-3">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Vetting og kuratering</CardTitle>
                <CardDescription>Vi arbejder kun med DJs, der er relevante til corporate setup.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>Vi kigger på erfaring med firmaevents, kvalitet i profilmateriale, tilgængelighed og hvordan DJ'en matcher den konkrete anledning.</p>
                <p>Det betyder, at shortlist'en ikke er et katalog, men et kontrolleret udvalg af muligheder.</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Backup og teknisk levering</CardTitle>
                <CardDescription>Hvis noget går galt, har vi en plan.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>Vi tænker backup ind fra start, og vi arbejder med en leverancemodel, hvor lyd, lys og koordinering følger løsningen.</p>
                <p>Det er netop derfor, vi ikke sælger en løs DJ uden kontekst.</p>
              </CardContent>
            </Card>
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Transparens i pris og data</CardTitle>
                <CardDescription>Priser vises ekskl. moms og bliver tydeliggjort før bekræftelse.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm leading-7 text-muted-foreground">
                <p>Transport eller særlige tekniske krav bliver opgjort åbent, så der ikke opstår overraskelser.</p>
                <p>Vi behandler kontaktoplysninger og bookingdata med den samme seriøsitet som resten af processen.</p>
              </CardContent>
            </Card>
          </div>
          <ShortlistExplainer />
        </Container>
      </section>

      <section className="bg-muted/20 py-16 sm:py-20">
        <Container className="flex flex-wrap items-center gap-3">
          <Button asChild variant="accent">
            <Link to="/brief">Tjek dato og få match</Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/kontakt">Kontakt os</Link>
          </Button>
        </Container>
      </section>
    </div>
  );
}

export function FaqPage() {
  useDanishPageSeo({
    title: "FAQ",
    description: "Svar på de mest almindelige spørgsmål om booking, backup, teknik, pris og genbooking.",
    canonical: "/faq",
  });

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-muted/20 py-16 sm:py-20">
        <Container className="space-y-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Svar på de vigtigste spørgsmål"
            description="Her finder I svar på de spørgsmål, virksomheder oftest stiller, før de sender en reservationsanmodning."
          />
          <FaqAccordion items={FAQ_ITEMS} />
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="space-y-10">
          {FAQ_SECTIONS.map((section) => (
            <div key={section.title} className="space-y-4">
              <SectionHeading eyebrow="Spørgsmål" title={section.title} />
              <FaqAccordion items={section.items} />
            </div>
          ))}
          <div className="flex flex-wrap gap-3">
            <Button asChild variant="accent">
              <Link to="/brief">Tjek dato og få match</Link>
            </Button>
            <Button asChild variant="outline">
              <Link to="/kontakt">Skriv til os</Link>
            </Button>
          </div>
        </Container>
      </section>
    </div>
  );
}

export function ContactPage() {
  useDanishPageSeo({
    title: "Kontakt",
    description: "Kontakt platformen for et tilbud, en callback eller spørgsmål om jeres kommende firmaevent.",
    canonical: "/kontakt",
  });

  const [submitted, setSubmitted] = useState<"contact" | "callback" | null>(null);
  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      full_name: "",
      company_name: "",
      email: "",
      phone: "",
      message: "",
      preferred_callback_time: "",
      request_callback: false,
    },
  });
  const requestCallback = useWatch({ control: form.control, name: "request_callback" });

  function onSubmit(values: ContactValues) {
    if (values.request_callback || values.preferred_callback_time.trim()) {
      createCallbackRequest({
        proposal_id: null,
        full_name: values.full_name,
        phone: values.phone,
        preferred_time: values.preferred_callback_time.trim() ? values.preferred_callback_time.trim() : null,
        message: values.message,
      });
      setSubmitted("callback");
      toast.success("Vi har modtaget jeres callback-anmodning.");
    } else {
      createContactRequest({
        full_name: values.full_name,
        company_name: values.company_name,
        email: values.email,
        phone: values.phone || null,
        role: "client",
        message: values.message,
      });
      setSubmitted("contact");
      toast.success("Vi har modtaget jeres besked.");
    }
    form.reset();
  }

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-muted/20 py-16 sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Kontakt"
              title="Tal med os om jeres arrangement"
              description="Skriv til os, hvis I vil drøfte en løsning, have et hurtigt callback eller har særlige tekniske spørgsmål."
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <InfoPill icon={Mail} label="E-mail" value={PLATFORM_SUPPORT_EMAIL} />
              <InfoPill icon={Clock3} label="Svar" value="Vi svarer samme dag" />
            </div>
            <p className="text-sm leading-7 text-muted-foreground">
              Virksomhedsnavn, telefon og øvrige kontaktoplysninger bruges kun til at behandle henvendelsen og følge op på den konkrete dialog.
            </p>
          </div>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>{submitted ? "Tak for beskeden" : "Send en besked"}</CardTitle>
              <CardDescription>
                {submitted
                  ? submitted === "callback"
                    ? "Vi har modtaget jeres callback-anmodning og vender tilbage hurtigst muligt."
                    : "Vi har modtaget jeres besked og svarer samme dag."
                  : "Udfyld formularen nedenfor, så vender vi tilbage med næste skridt."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {submitted ? (
                <div className="rounded-3xl border border-border/60 bg-muted/20 p-6 text-sm leading-7 text-muted-foreground">
                  <p>Hvis I foretrækker, kan I også starte direkte i briefen og få en anbefaling med det samme.</p>
                  <div className="mt-4">
                    <Button asChild variant="accent">
                      <Link to="/brief">Tjek dato og få match</Link>
                    </Button>
                  </div>
                </div>
              ) : (
                <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Navn">
                      <Input {...form.register("full_name")} />
                    </Field>
                    <Field label="Virksomhed">
                      <Input {...form.register("company_name")} />
                    </Field>
                    <Field label="E-mail">
                      <Input type="email" {...form.register("email")} />
                    </Field>
                    <Field label="Telefon">
                      <Input {...form.register("phone")} />
                    </Field>
                  </div>
                  <Field label="Besked">
                    <Textarea className="min-h-32" {...form.register("message")} />
                  </Field>
                  <Field label="Foretrukket callback-tid" hint="Valgfrit">
                    <Input placeholder="Fx tirsdag kl. 10-12" {...form.register("preferred_callback_time")} />
                  </Field>
                  <label className="flex items-center gap-3 rounded-2xl border border-border/60 bg-muted/20 px-4 py-3 text-sm">
                    <Checkbox checked={requestCallback} onCheckedChange={(checked) => form.setValue("request_callback", Boolean(checked))} />
                    Jeg vil gerne ringes op
                  </label>
                  <Button type="submit" variant="accent" className="w-full">
                    Send besked
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </Container>
      </section>
    </div>
  );
}

export function TermsPage() {
  useDanishPageSeo({
    title: "Handelsbetingelser",
    description: "Vilkår for brug af platformen, reservationer, betaling, ansvar og afbestilling.",
    canonical: "/handelsbetingelser",
  });

  const sections: LegalSection[] = [
    {
      title: "1. Aftalens karakter",
      paragraphs: [
        "DJConnect er en dansk B2B bookingplatform og managed-agency løsning for firmaevents. Vi formidler en professionel leverance, hvor DJ, teknik og koordinering håndteres som én samlet opgave.",
        "Disse handelsbetingelser er en generel platformstekst og skal inden lancering gennemgås af juridisk rådgiver, så de afspejler den endelige driftsmodel.",
      ],
    },
    {
      title: "2. Booking og reservationsanmodning",
      paragraphs: [
        "Når kunden sender en reservationsanmodning, er det en anmodning om at reservere en løsning på de angivne vilkår. En reservation er først endeligt bekræftet, når vi har bekræftet leverancen skriftligt.",
        "Hvis en DJ bliver syg eller en tilsvarende ekstraordinær situation opstår, kan platformen erstatte leverancen med en tilsvarende eller bedre løsning, så længe kvalitet og formål bevares.",
      ],
    },
    {
      title: "3. Pris, moms og tillæg",
      paragraphs: [
        "Priser vises som udgangspunkt ekskl. moms. Eventuelle transportomkostninger, særlige tekniske krav eller udvidet koordinering oplyses tydeligt inden bekræftelse.",
        "Den konkrete pris kan derfor afvige fra den indledende estimatramme, hvis briefen ændrer sig eller kræver ekstra bemanding eller udstyr.",
      ],
    },
    {
      title: "4. Ændringer og aflysning",
      paragraphs: [
        "Ændringer i dato, venue, program eller tekniske forhold skal meddeles hurtigst muligt. Vi arbejder for at finde en praktisk løsning, men kan ikke garantere samme leverance ved væsentlige ændringer.",
        "Afbestillingsvilkår fastsættes i den endelige aftale og skal afspejle den konkrete booking, det reserverede udstyr og den afsatte kapacitet.",
      ],
    },
    {
      title: "5. Ansvar og begrænsninger",
      paragraphs: [
        "Platformen tilstræber professionel afvikling, backup og tydelig kommunikation. Ansvarsfordelingen mellem kunde, platform og leverandører fastlægges i den individuelle aftale.",
        "Vi er ikke ansvarlige for forhold uden for vores kontrol, herunder force majeure, venue-relaterede forhold eller manglende adgang til faciliteter, som ikke er oplyst i tide.",
      ],
    },
    {
      title: "6. Kontakt",
      paragraphs: [
        "Spørgsmål til handelsbetingelserne kan rettes til support@djconnect.dk. Indholdet på denne side er et udkast og skal færdigbehandles inden kommerciel lancering.",
      ],
    },
  ];

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-muted/20 py-16 sm:py-20">
        <Container className="space-y-6">
          <SectionHeading eyebrow="Juridisk" title="Handelsbetingelser" description="Et læsbart og komplet udkast til platformens vilkår." />
        </Container>
      </section>
      <section className="py-16 sm:py-20">
        <Container className="space-y-6">
          {sections.map((section) => (
            <Card key={section.title} className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </Container>
      </section>
    </div>
  );
}

export function PrivacyPage() {
  useDanishPageSeo({
    title: "Privatlivspolitik",
    description: "Hvordan vi behandler personoplysninger i forbindelse med booking, kontakt og partneransøgninger.",
    canonical: "/privatlivspolitik",
  });

  const sections: LegalSection[] = [
    {
      title: "1. Dataansvarlig",
      paragraphs: [
        "DJConnect er dataansvarlig for de oplysninger, der indsamles via platformen i forbindelse med forespørgsler, reservationer og partneransøgninger.",
        "Oplysninger om juridisk enhed, adresse og eventuel databeskyttelsesansvarlig indsættes ved lancering.",
      ],
    },
    {
      title: "2. Hvilke oplysninger behandler vi?",
      paragraphs: [
        "Vi behandler kontaktoplysninger, virksomhedsoplysninger, eventdetaljer, beskeder, reservationsdata, questionnaire-svar og relevante logoplysninger fra platformens processer.",
        "For DJ-partnere og ansøgere kan vi også behandle profildata, geografisk tilknytning, erfaring, links og dokumentation, der er nødvendig for at vurdere samarbejdet.",
      ],
    },
    {
      title: "3. Formål og retsgrundlag",
      paragraphs: [
        "Vi bruger oplysningerne til at besvare henvendelser, udarbejde forslag, håndtere reservationer, koordinere leverancen og drive platformen sikkert og effektivt.",
        "Behandlingen sker på baggrund af den aftale eller forberedende aftale, som kunden eller partneren indgår med os, samt vores legitime interesse i at drive og forbedre tjenesten.",
      ],
    },
    {
      title: "4. Opbevaring og adgang",
      paragraphs: [
        "Vi opbevarer oplysninger så længe det er nødvendigt for drift, dokumentation, opfølgning og lovpligtige krav. Adgang begrænses til de medarbejdere og leverandører, der har et sagligt behov.",
        "DJ-private kontaktoplysninger vises kun internt og kun, hvor det er nødvendigt for leverance eller drift.",
      ],
    },
    {
      title: "5. Modtagere og databehandlere",
      paragraphs: [
        "Vi kan anvende tekniske underleverandører til hosting, e-mail, beskedhåndtering og analyse. Disse fungerer efter vores instruktioner og må ikke bruge data til egne formål.",
        "Data deles kun med tredjeparter, når det er nødvendigt for at levere en booking eller opfylde en juridisk forpligtelse.",
      ],
    },
    {
      title: "6. Dine rettigheder",
      paragraphs: [
        "Du har ret til indsigt, berigtigelse, sletning, begrænsning og i visse tilfælde dataportabilitet. Du kan også gøre indsigelse mod behandlingen, hvor lovgivningen giver adgang til det.",
        "Henvendelser om rettigheder kan sendes til support@djconnect.dk. Denne tekst er et udkast og skal gennemgås endeligt af juridisk rådgiver før lancering.",
      ],
    },
  ];

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-muted/20 py-16 sm:py-20">
        <Container className="space-y-6">
          <SectionHeading eyebrow="Juridisk" title="Privatlivspolitik" description="Et klart udkast til, hvordan platformen håndterer personoplysninger." />
        </Container>
      </section>
      <section className="py-16 sm:py-20">
        <Container className="space-y-6">
          {sections.map((section) => (
            <Card key={section.title} className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>{section.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm leading-7 text-muted-foreground">
                {section.paragraphs.map((paragraph) => (
                  <p key={paragraph}>{paragraph}</p>
                ))}
              </CardContent>
            </Card>
          ))}
        </Container>
      </section>
    </div>
  );
}

export function UseCaseLandingPage({ config }: { config: UseCaseConfig }) {
  useDanishPageSeo({
    title: config.seoTitle,
    description: config.seoDescription,
    canonical: config.path,
  });

  const packages = useCollection("packages").filter((pkg) => pkg.active);
  const recommendedPackage = packages.find((pkg) => pkg.slug === config.packageSlug) ?? packages[0];
  const reviews = useCollection("reviews")
    .filter((review) => review.approved && review.event_type && config.reviewEventTypes.includes(review.event_type))
    .slice(0, 6);

  return (
    <div className="bg-background">
      <section className="border-b border-border/60 bg-[radial-gradient(circle_at_top_right,_rgba(56,189,248,0.14),_transparent_33%),radial-gradient(circle_at_25%_20%,_rgba(212,164,72,0.14),_transparent_28%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--background))_68%,_rgba(255,255,255,0.95)_100%)]">
        <Container className="py-16 sm:py-20 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{config.heroEyebrow}</p>
              <h1 className="max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl lg:text-6xl">{config.heroTitle}</h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">{config.heroLead}</p>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Button asChild variant="accent" size="lg">
                  <Link to="/brief">Tjek dato og få match <ArrowRight className="h-4 w-4" /></Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link to="/pakker">Se pakker</Link>
                </Button>
              </div>
              <div className="flex flex-wrap gap-2">
                {config.comparisonBullets.map((bullet) => (
                  <span key={bullet} className="inline-flex items-center gap-2 rounded-full border border-border/60 bg-card px-3 py-1.5 text-sm shadow-sm">
                    <Sparkles className="h-4 w-4 text-gold" />
                    {bullet}
                  </span>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <Card className="overflow-hidden border-border/60 shadow-xl">
                <div className="aspect-[16/10] overflow-hidden">
                  <img src={config.image} alt="" className="h-full w-full object-cover" />
                </div>
                <CardContent className="space-y-4 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">{config.introTitle}</p>
                  <p className="text-sm leading-7 text-muted-foreground">{config.introBody}</p>
                  <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm leading-7 text-muted-foreground">
                    {config.packageReason}
                  </div>
                </CardContent>
              </Card>
              <BookingWidget initialValues={{ eventType: config.bookingPrefillEventType }} />
            </div>
          </div>
        </Container>
      </section>

      <section className="border-b border-border/60 bg-background py-8">
        <Container>
          <TrustBar />
        </Container>
      </section>

      <section className="bg-muted/20 py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Hvorfor denne løsning"
            title={`Hvad gør ${config.pageTitle.toLowerCase()} stærk?`}
            description="Denne side er bygget til at give jer et konkret og troværdigt udgangspunkt for den type event."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {config.trustPoints.map((point, index) => (
              <Card key={point} className="border-border/60 shadow-sm">
                <CardHeader>
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">{index + 1}</div>
                  <CardTitle className="mt-4 text-lg">{point}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="grid gap-8 lg:grid-cols-[1fr_0.95fr]">
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Pakkeanbefaling"
              title="Den pakke vi oftest anbefaler til denne anledning"
              description="Pakken er en startrettesnor. Den endelige anbefaling afhænger stadig af briefen."
            />
            {recommendedPackage ? <PackageCard pkg={recommendedPackage} recommended /> : null}
            <PricingNote />
          </div>
          <div className="space-y-6">
            <SectionHeading
              eyebrow="Trust"
              title="Det, der gør arrangementet lettere at stole på"
              description="Her er vores vigtigste løfter på tværs af den type event."
            />
            <div className="grid gap-4">
              <Card className="border-border/60 shadow-sm">
                <CardContent className="flex items-start gap-3 p-5">
                  <ShieldCheck className="mt-1 h-5 w-5 text-gold" />
                  <div>
                    <p className="font-medium">Backup og ansvar</p>
                    <p className="text-sm text-muted-foreground">Vi tænker backup ind fra start og holder ansvarslinjen tydelig.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60 shadow-sm">
                <CardContent className="flex items-start gap-3 p-5">
                  <CheckCircle2 className="mt-1 h-5 w-5 text-gold" />
                  <div>
                    <p className="font-medium">Tydelig pris</p>
                    <p className="text-sm text-muted-foreground">Priser vises ekskl. moms, og tillæg forklares, før I bekræfter.</p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60 shadow-sm">
                <CardContent className="flex items-start gap-3 p-5">
                  <Clock3 className="mt-1 h-5 w-5 text-gold" />
                  <div>
                    <p className="font-medium">Hurtig opfølgning</p>
                    <p className="text-sm text-muted-foreground">Vi prioriterer klare svar samme dag, så I kan komme videre i planlægningen.</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-muted/20 py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading
            eyebrow="Social proof"
            title="Relevante kundecitater"
            description="Vi viser kun reviews, der matcher den type event, I kigger på."
          />
          {reviews.length > 0 ? (
            <ReviewGrid reviews={reviews} />
          ) : (
            <Card className="border-border/60 shadow-sm">
              <CardContent className="p-6 text-sm leading-7 text-muted-foreground">
                Vi har endnu ikke nok offentlige anmeldelser for netop denne eventtype, så vi viser i stedet den generelle kundetilfredshed i andre dele af sitet.
              </CardContent>
            </Card>
          )}
        </Container>
      </section>

      <section className="py-16 sm:py-20">
        <Container className="space-y-10">
          <SectionHeading eyebrow="FAQ" title="Spørgsmål om denne type event" />
          <FaqAccordion items={config.faqItems} />
        </Container>
      </section>

      <section className="bg-background py-16 sm:py-20">
        <Container>
          <div className="rounded-[2rem] border border-border/60 bg-gradient-to-br from-primary via-slate-800 to-primary px-6 py-10 text-primary-foreground shadow-xl sm:px-10 sm:py-14">
            <div className="max-w-3xl space-y-4">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-gold">Klar til at gå videre?</p>
              <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">Få den rigtige løsning til {config.pageTitle.toLowerCase()}</h2>
              <p className="max-w-2xl text-base leading-7 text-primary-foreground/75">
                Start i briefen og få en kurateret anbefaling med tydelig pris, pakke og ansvarlig afvikling.
              </p>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="accent" size="lg">
                <Link to="/brief">Tjek dato og få match</Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-primary-foreground/20 bg-transparent text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground">
                <Link to="/kontakt">Kontakt os</Link>
              </Button>
            </div>
          </div>
        </Container>
      </section>
    </div>
  );
}

function packageFeatureValue(pkg: Package, key: "hours" | "sound" | "lighting" | "microphone" | "coordination" | "setup" | "teardown") {
  switch (key) {
    case "hours":
      return `${pkg.hours_included} timer`;
    case "sound":
      return pkg.sound_included ? "Ja" : "Nej";
    case "lighting":
      return pkg.lighting_included ? "Ja" : "Nej";
    case "microphone":
      return pkg.microphone_included ? "Ja" : "Nej";
    case "coordination":
      return pkg.technical_coordination_included ? "Ja" : "Nej";
    case "setup":
      return pkg.setup_included ? "Ja" : "Nej";
    case "teardown":
      return pkg.setup_teardown_included ? "Ja" : "Nej";
  }
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-end justify-between gap-2">
        <Label>{label}</Label>
        {hint ? <span className="text-xs text-muted-foreground">{hint}</span> : null}
      </div>
      {children}
    </div>
  );
}

function InfoPill({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-card px-4 py-3 shadow-sm">
      <Icon className="h-4 w-4 text-gold" />
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
        <p className="text-sm font-medium">{value}</p>
      </div>
    </div>
  );
}
