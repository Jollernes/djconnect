import { useMemo, useState, type ReactNode } from "react";
import { CheckCircle2, CircleCheckBig } from "lucide-react";
import { z } from "zod";
import { useForm, useWatch, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { createDJApplication } from "@/lib/store";
import { useDanishPageSeo } from "@/lib/seo";
import { REGION_OPTIONS, VIBE_OPTIONS } from "@/lib/constants";
import type { DJLanguage, Region, VibeTag } from "@/types/domain";

const formSchema = z.object({
  stage_name: z.string().min(2, "Skriv dit kunstnernavn."),
  legal_name: z.string().min(2, "Skriv dit juridiske navn."),
  email: z.string().email("Indtast en gyldig e-mail."),
  phone: z.string().min(6, "Indtast telefonnummer."),
  city: z.string().min(2, "Skriv din by."),
  regions: z.array(z.string()).min(1, "Vælg mindst én region."),
  languages: z.array(z.string()).min(1, "Vælg mindst ét sprog."),
  vibe_tags: z.array(z.string()).min(1, "Vælg mindst ét fokusområde."),
  years_of_experience: z.coerce.number().min(0, "Angiv antal år."),
  corporate_experience_years: z.coerce.number().min(0, "Angiv antal år."),
  equipment_sound: z.boolean(),
  equipment_lighting: z.boolean(),
  can_handle_speeches: z.boolean(),
  can_provide_mc: z.boolean(),
  sample_mix_url: z.string().optional().or(z.literal("")),
  references: z.string().optional().or(z.literal("")),
  short_bio: z.string().min(20, "Skriv en kort bio."),
  links: z.string().optional().or(z.literal("")),
  cvr_number: z.string().optional().or(z.literal("")),
  availability_commitment: z.boolean(),
});

type FormValues = z.infer<typeof formSchema>;

const defaultValues: FormValues = {
  stage_name: "",
  legal_name: "",
  email: "",
  phone: "",
  city: "",
  regions: [],
  languages: [],
  vibe_tags: [],
  years_of_experience: 0,
  corporate_experience_years: 0,
  equipment_sound: true,
  equipment_lighting: true,
  can_handle_speeches: true,
  can_provide_mc: false,
  sample_mix_url: "",
  references: "",
  short_bio: "",
  links: "",
  cvr_number: "",
  availability_commitment: false,
};

export function DJPartnerApplicationPage() {
  useDanishPageSeo({
    title: "Bliv DJ-partner",
    description: "Bliv en del af et kurateret netværk for professionelle firmafest-DJs.",
    canonical: "/bliv-dj-partner",
  });

  const [submitted, setSubmitted] = useState<string | null>(null);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as Resolver<FormValues>,
    defaultValues,
  });

  const { register, handleSubmit, setValue, reset, formState, control } = form;
  const selectedRegions = useWatch({ control, name: "regions" }) ?? [];
  const selectedLanguages = useWatch({ control, name: "languages" }) ?? [];
  const selectedVibes = useWatch({ control, name: "vibe_tags" }) ?? [];
  const equipmentSound = useWatch({ control, name: "equipment_sound" }) ?? false;
  const equipmentLighting = useWatch({ control, name: "equipment_lighting" }) ?? false;
  const canHandleSpeeches = useWatch({ control, name: "can_handle_speeches" }) ?? false;
  const canProvideMc = useWatch({ control, name: "can_provide_mc" }) ?? false;
  const availabilityCommitment = useWatch({ control, name: "availability_commitment" }) ?? false;

  const regionOptions = useMemo(() => REGION_OPTIONS.map((option) => option.label), []);
  const vibeOptions = useMemo(() => VIBE_OPTIONS.map((option) => option.label), []);
  const languageOptions = useMemo(() => ["Dansk", "Engelsk"], []);

  function toggleArray(value: string[], item: string) {
    return value.includes(item) ? value.filter((entry) => entry !== item) : [...value, item];
  }

  function onSubmit(values: FormValues) {
    const application = createDJApplication({
      stage_name: values.stage_name,
      legal_name: values.legal_name,
      email: values.email,
      phone: values.phone,
      city: values.city,
      regions: values.regions as Region[],
      languages: values.languages as DJLanguage[],
      vibe_tags: values.vibe_tags as VibeTag[],
      years_of_experience: values.years_of_experience,
      corporate_experience_years: values.corporate_experience_years,
      equipment_sound: values.equipment_sound,
      equipment_lighting: values.equipment_lighting,
      can_handle_speeches: values.can_handle_speeches,
      can_provide_mc: values.can_provide_mc,
      sample_mix_url: values.sample_mix_url?.trim() ? values.sample_mix_url.trim() : null,
      references: values.references?.trim() ? values.references.trim() : null,
      short_bio: values.short_bio.trim(),
      links: values.links?.trim() ? values.links.trim() : null,
      cvr_number: values.cvr_number?.trim() ? values.cvr_number.trim() : null,
      availability_commitment: values.availability_commitment,
    });
    setSubmitted(application.id);
    reset(defaultValues);
  }

  return (
    <>
      <section className="border-b border-border/60 bg-[radial-gradient(circle_at_top_right,_rgba(212,164,72,0.14),_transparent_30%),linear-gradient(180deg,_hsl(var(--background))_0%,_hsl(var(--background))_100%)]">
        <Container className="py-16 lg:py-20">
          <div className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="space-y-6">
              <Badge variant="secondary" className="rounded-full px-3 py-1 uppercase tracking-[0.2em]">
                Kurateret partnernetværk
              </Badge>
              <h1 className="text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
                Bliv en del af et kurateret netværk for professionelle firmafest-DJs
              </h1>
              <p className="max-w-2xl text-lg leading-8 text-muted-foreground">
                Vi arbejder med DJs, der kan levere pålidelig corporate afvikling, professionel kommunikation og tydelig tilgængelighed.
              </p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  "Vi håndterer booking, kontrakt og koordinering",
                  "Du får tydelige briefs og et professionelt setup",
                  "Vi prioriterer kvalitet, backup og sikker afvikling",
                  "Du arbejder med faste pakker og klare forventninger",
                ].map((item) => (
                  <div key={item} className="rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                    <p className="text-sm text-foreground">{item}</p>
                  </div>
                ))}
              </div>
            </div>
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Hvad vi leder efter</CardTitle>
                <CardDescription>Professionel, stabil og god til virksomhedsarrangementer.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm text-muted-foreground">
                {[
                  "Du kan kommunikere tydeligt før og under eventet.",
                  "Du kan opdatere din tilgængelighed løbende.",
                  "Du er komfortabel med taler, middag og dansegulv.",
                  "Du arbejder trygt med lyd, lys og backup-planer.",
                ].map((item) => (
                  <div key={item} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                    <p>{item}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </Container>
      </section>

      <Container className="py-10 lg:py-14">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Ansøg om partnerskab</CardTitle>
            <CardDescription>Udfyld formularen, så vender vi tilbage med næste skridt.</CardDescription>
          </CardHeader>
          <CardContent>
            {submitted ? (
              <div className="rounded-3xl border border-success/20 bg-success/10 p-6">
                <div className="flex items-start gap-3">
                  <CircleCheckBig className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <div className="space-y-2">
                    <p className="font-semibold text-foreground">Tak — vi har modtaget din ansøgning.</p>
                    <p className="text-sm leading-6 text-muted-foreground">Status er sat til pending review, og vi vender tilbage, når vi har gennemgået din profil.</p>
                  </div>
                </div>
              </div>
            ) : (
              <form className="grid gap-4 md:grid-cols-2" onSubmit={handleSubmit(onSubmit)}>
                <FormField label="Kunstnernavn" error={formState.errors.stage_name?.message}>
                  <Input {...register("stage_name")} />
                </FormField>
                <FormField label="Juridisk navn" error={formState.errors.legal_name?.message}>
                  <Input {...register("legal_name")} />
                </FormField>
                <FormField label="E-mail" error={formState.errors.email?.message}>
                  <Input type="email" {...register("email")} />
                </FormField>
                <FormField label="Telefon" error={formState.errors.phone?.message}>
                  <Input {...register("phone")} />
                </FormField>
                <FormField label="By" error={formState.errors.city?.message}>
                  <Input {...register("city")} />
                </FormField>
                <FormField label="År med erfaring" error={formState.errors.years_of_experience?.message}>
                  <Input type="number" {...register("years_of_experience")} />
                </FormField>
                <FormField label="År med corporate events" error={formState.errors.corporate_experience_years?.message}>
                  <Input type="number" {...register("corporate_experience_years")} />
                </FormField>
                <FormField label="CVR (valgfrit)" error={formState.errors.cvr_number?.message}>
                  <Input {...register("cvr_number")} />
                </FormField>

                <div className="space-y-2 md:col-span-2">
                  <Label>Regioner</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {regionOptions.map((label) => (
                      <ToggleButton key={label} active={selectedRegions.includes(label)} onClick={() => setValue("regions", toggleArray(selectedRegions, label), { shouldValidate: true })}>
                        {label}
                      </ToggleButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Sprog</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {languageOptions.map((label) => (
                      <ToggleButton key={label} active={selectedLanguages.includes(label)} onClick={() => setValue("languages", toggleArray(selectedLanguages, label), { shouldValidate: true })}>
                        {label}
                      </ToggleButton>
                    ))}
                  </div>
                </div>

                <div className="space-y-2 md:col-span-2">
                  <Label>Stemningsprofil</Label>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {vibeOptions.map((label) => (
                      <ToggleButton key={label} active={selectedVibes.includes(label)} onClick={() => setValue("vibe_tags", toggleArray(selectedVibes, label), { shouldValidate: true })}>
                        {label}
                      </ToggleButton>
                    ))}
                  </div>
                </div>

                <div className="grid gap-4 md:col-span-2 md:grid-cols-2">
                  <FormField label="Prøvemix URL" error={formState.errors.sample_mix_url?.message}>
                    <Input {...register("sample_mix_url")} />
                  </FormField>
                  <FormField label="Referencer" error={formState.errors.references?.message}>
                    <Input {...register("references")} />
                  </FormField>
                  <FormField label="Links" error={formState.errors.links?.message}>
                    <Input {...register("links")} />
                  </FormField>
                  <FormField label="Kort bio" error={formState.errors.short_bio?.message}>
                    <Textarea className="min-h-28" {...register("short_bio")} />
                  </FormField>
                </div>

                <div className="md:col-span-2 grid gap-3 rounded-3xl border border-border/60 bg-muted/20 p-5">
                  <label className="flex items-start gap-3 text-sm">
                    <Checkbox checked={equipmentSound} onCheckedChange={(checked) => setValue("equipment_sound", Boolean(checked), { shouldValidate: true })} />
                    <span>Jeg kan levere lyd</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm">
                    <Checkbox checked={equipmentLighting} onCheckedChange={(checked) => setValue("equipment_lighting", Boolean(checked), { shouldValidate: true })} />
                    <span>Jeg kan levere lys</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm">
                    <Checkbox checked={canHandleSpeeches} onCheckedChange={(checked) => setValue("can_handle_speeches", Boolean(checked), { shouldValidate: true })} />
                    <span>Jeg kan håndtere taler og mikrofon</span>
                  </label>
                  <label className="flex items-start gap-3 text-sm">
                    <Checkbox checked={canProvideMc} onCheckedChange={(checked) => setValue("can_provide_mc", Boolean(checked), { shouldValidate: true })} />
                    <span>Jeg kan også være MC</span>
                  </label>
                </div>

                <div className="md:col-span-2 flex items-start gap-3 rounded-3xl border border-border/60 bg-muted/20 p-5">
                  <Checkbox checked={availabilityCommitment} onCheckedChange={(checked) => setValue("availability_commitment", Boolean(checked), { shouldValidate: true })} />
                  <div className="space-y-1">
                    <Label>Jeg forpligter mig til at opdatere min tilgængelighed løbende</Label>
                    <p className="text-sm text-muted-foreground">Det er en del af den professionelle standard i partnernetværket.</p>
                  </div>
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" variant="accent">
                    Send ansøgning
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </Container>
    </>
  );
}

function FormField({ label, error, children }: { label: string; error?: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function ToggleButton({ active, children, onClick }: { active: boolean; children: ReactNode; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={active ? "rounded-2xl border border-accent bg-accent/10 px-4 py-3 text-left text-sm" : "rounded-2xl border border-border/60 bg-card px-4 py-3 text-left text-sm"}
    >
      {children}
    </button>
  );
}
