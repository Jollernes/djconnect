import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm, useWatch, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronLeft, ChevronRight } from "lucide-react";
import { FlowLayout } from "@/components/layout/FlowLayout";
import { Container } from "@/components/common/Container";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  BRIEF_CONTACT_ROLE_OPTIONS,
  BUDGET_BAND_OPTIONS,
  EVENT_TYPE_OPTIONS,
  GUEST_COUNT_RANGE_OPTIONS,
  REGION_OPTIONS,
  TECHNICAL_NEEDS_OPTIONS,
  VIBE_OPTIONS,
  YES_NO_UNSURE_OPTIONS,
} from "@/lib/constants";
import { createEventBrief, createProposalForBrief } from "@/lib/store";
import { useDanishPageSeo } from "@/lib/seo";
import { cn, formatDanishDateShort } from "@/lib/utils";
import type {
  BriefContactRole,
  BriefDateFlexibility,
  BriefVenueStatus,
  BudgetBand,
  EventType,
  GuestCountRange,
  LanguagePreference,
  Region,
  VibeTag,
  YesNoUnsure,
} from "@/types/domain";

const EVENT_TYPES = [
  "Firmafest",
  "Julefrokost",
  "Sommerfest",
  "Middag og efterfest",
  "Kick-off",
  "Jubilæum",
  "Reception",
  "Andet firmaarrangement",
] as const satisfies readonly [EventType, ...EventType[]];

const DATE_FLEXIBILITY_OPTIONS = ["Fast dato", "Muligvis fleksibel", "Ikke besluttet endnu"] as const satisfies readonly [BriefDateFlexibility, ...BriefDateFlexibility[]];
const VENUE_STATUS_OPTIONS = ["Vi har booket venue", "Vi er tæt på at booke venue", "Vi mangler stadig venue"] as const satisfies readonly [BriefVenueStatus, ...BriefVenueStatus[]];
const LANGUAGE_OPTIONS = ["Dansk", "Engelsk", "Begge"] as const satisfies readonly [LanguagePreference, ...LanguagePreference[]];

const STORAGE_KEY = "djconnect.flow.briefDraft.v1";
const TEST_MODE_STORAGE_KEY = "djconnect.flow.briefTestMode.v1";

const briefSchema = z.object({
  event_type: z.enum(EVENT_TYPES, { message: "Vælg en eventtype." }),
  event_date: z.string().min(1, "Vælg en eventdato."),
  start_time: z.string().min(1, "Angiv starttidspunkt."),
  end_time: z.string().min(1, "Angiv sluttidspunkt."),
  date_flexibility: z.enum(DATE_FLEXIBILITY_OPTIONS, { message: "Vælg om datoen er fast eller fleksibel." }),
  city: z.string().min(2, "Skriv en by."),
  venue_name: z.string().optional(),
  venue_status: z.enum(VENUE_STATUS_OPTIONS, { message: "Vælg venue-status." }),
  region: z.enum(REGION_OPTIONS.map((option) => option.id) as [Region, ...Region[]], { message: "Vælg region." }),
  guest_count_range: z.enum(GUEST_COUNT_RANGE_OPTIONS.map((option) => option.id) as [GuestCountRange, ...GuestCountRange[]], { message: "Vælg gæsteinterval." }),
  needs_sound: z.enum(["Ja", "Nej", "Ikke sikker"] as const),
  needs_lighting: z.enum(["Ja", "Nej", "Ikke sikker"] as const),
  needs_microphone: z.enum(["Ja", "Nej", "Ikke sikker"] as const),
  needs_dinner_music: z.enum(["Ja", "Nej", "Ikke sikker"] as const),
  needs_venue_coordination: z.enum(["Ja", "Nej", "Ikke sikker"] as const),
  music_vibe_tags: z.array(z.enum(VIBE_OPTIONS.map((option) => option.id) as [VibeTag, ...VibeTag[]])).default([]),
  music_vibe_other: z.string().optional(),
  must_play: z.string().optional(),
  do_not_play: z.string().optional(),
  language_preference: z.enum(LANGUAGE_OPTIONS, { message: "Vælg foretrukket sprog." }),
  budget_band: z.enum(BUDGET_BAND_OPTIONS.map((option) => option.id) as [BudgetBand, ...BudgetBand[]], { message: "Vælg et budgetinterval." }),
  success_description: z.string().min(1, "Beskriv hvad der skal lykkes."),
  contact_name: z.string().min(2, "Skriv navn."),
  company_name: z.string().min(2, "Skriv firmanavn."),
  contact_email: z.string().email("Indtast en gyldig arbejdsmail."),
  contact_phone: z.string().optional(),
  contact_role: z.enum(BRIEF_CONTACT_ROLE_OPTIONS.map((option) => option.value) as [BriefContactRole, ...BriefContactRole[]], {
    message: "Vælg en rolle.",
  }),
});

type BriefFormValues = z.infer<typeof briefSchema>;

const DEFAULT_VALUES: BriefFormValues = {
  event_type: "Firmafest",
  event_date: "",
  start_time: "",
  end_time: "",
  date_flexibility: "Fast dato",
  city: "",
  venue_name: "",
  venue_status: "Vi mangler stadig venue",
  region: "København / Sjælland",
  guest_count_range: "Under 50",
  needs_sound: "Ikke sikker",
  needs_lighting: "Ikke sikker",
  needs_microphone: "Ikke sikker",
  needs_dinner_music: "Ikke sikker",
  needs_venue_coordination: "Ikke sikker",
  music_vibe_tags: [],
  music_vibe_other: "",
  must_play: "",
  do_not_play: "",
  language_preference: "Dansk",
  budget_band: "Ikke sikker",
  success_description: "",
  contact_name: "",
  company_name: "",
  contact_email: "",
  contact_phone: "",
  contact_role: "Other",
};

const steps = [
  "Eventtype",
  "Dato og timing",
  "Lokation",
  "Gæster",
  "Tekniske behov",
  "Stil og musik",
  "Budget",
  "Succes",
  "Kontakt",
] as const;

const stepFieldNames: Array<(keyof BriefFormValues)[]> = [
  ["event_type"],
  ["event_date", "start_time", "end_time", "date_flexibility"],
  ["city", "venue_name", "venue_status", "region"],
  ["guest_count_range"],
  ["needs_sound", "needs_lighting", "needs_microphone", "needs_dinner_music", "needs_venue_coordination"],
  ["music_vibe_tags", "music_vibe_other", "must_play", "do_not_play", "language_preference"],
  ["budget_band"],
  ["success_description"],
  ["contact_name", "company_name", "contact_email", "contact_phone", "contact_role"],
];

function getDraft(): Partial<BriefFormValues> {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return {};
  }
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Partial<BriefFormValues>) : {};
  } catch {
    return {};
  }
}

function saveDraft(values: BriefFormValues) {
  if (typeof window === "undefined" || typeof localStorage === "undefined") {
    return;
  }
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(values));
  } catch {
    // Ignore draft persistence errors in demo mode.
  }
}

function toggleTag(values: VibeTag[], tag: VibeTag) {
  return values.includes(tag) ? values.filter((item) => item !== tag) : [...values, tag];
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 border-b border-border/60 py-3 last:border-b-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right text-sm font-medium text-foreground">{value}</span>
    </div>
  );
}

function StepPills({
  currentStep,
  testMode,
  onSelectStep,
}: {
  currentStep: number;
  testMode: boolean;
  onSelectStep: (step: number) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {steps.map((label, index) => (
        testMode ? (
          <button
            key={label}
            type="button"
            onClick={() => onSelectStep(index)}
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-sm font-medium transition-colors",
              index === currentStep
                ? "bg-accent text-accent-foreground shadow-sm"
                : index < currentStep
                  ? "bg-secondary text-secondary-foreground"
                  : "border border-border/70 bg-background text-muted-foreground",
              "cursor-pointer hover:border-accent/40 hover:bg-accent/10 hover:text-foreground",
            )}
            aria-current={index === currentStep ? "step" : undefined}
          >
            {index + 1}. {label}
          </button>
        ) : (
          <Badge
            key={label}
            variant={index === currentStep ? "accent" : index < currentStep ? "secondary" : "outline"}
            className={cn("rounded-full px-3 py-1", index === currentStep ? "shadow-sm" : "")}
          >
            {index + 1}. {label}
          </Badge>
        )
      ))}
    </div>
  );
}

function isNonEmpty(value: string | undefined | null) {
  return typeof value === "string" && value.trim().length > 0;
}

function buildTestModeValues(values: BriefFormValues): BriefFormValues {
  const today = new Date();
  const year = today.getFullYear();
  const month = `${today.getMonth() + 1}`.padStart(2, "0");
  const day = `${today.getDate()}`.padStart(2, "0");

  return {
    ...DEFAULT_VALUES,
    ...values,
    event_date: isNonEmpty(values.event_date) ? values.event_date : `${year}-${month}-${day}`,
    start_time: isNonEmpty(values.start_time) ? values.start_time : "18:00",
    end_time: isNonEmpty(values.end_time) ? values.end_time : "23:30",
    city: isNonEmpty(values.city) ? values.city : "København",
    venue_name: isNonEmpty(values.venue_name) ? values.venue_name : "",
    success_description: isNonEmpty(values.success_description)
      ? values.success_description
      : "Testtilstand: Vi vil gerne se en fuld, realistisk løsning med DJ, teknik og backup.",
    contact_name: isNonEmpty(values.contact_name) ? values.contact_name : "Test Bruger",
    company_name: isNonEmpty(values.company_name) ? values.company_name : "DJConnect Demo A/S",
    contact_email: isNonEmpty(values.contact_email) ? values.contact_email : "test@djconnect.dk",
    contact_phone: isNonEmpty(values.contact_phone) ? values.contact_phone : "+45 12 34 56 78",
    music_vibe_other: isNonEmpty(values.music_vibe_other) ? values.music_vibe_other : "",
    must_play: isNonEmpty(values.must_play) ? values.must_play : "",
    do_not_play: isNonEmpty(values.do_not_play) ? values.do_not_play : "",
  };
}

function OptionCards({
  options,
  value,
  onChange,
}: {
  options: readonly string[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <RadioGroup value={value} onValueChange={onChange} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {options.map((option) => (
        <Label
          key={option}
          className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-colors hover:border-accent/40"
        >
          <RadioGroupItem value={option} />
          <span className="text-sm font-medium text-foreground">{option}</span>
        </Label>
      ))}
    </RadioGroup>
  );
}

function BriefSummaryCard({ values }: { values: Partial<BriefFormValues> }) {
  const selectedVibesTags = values.music_vibe_tags ?? [];
  const selectedVibes = selectedVibesTags.length ? selectedVibesTags.join(", ") : "Ikke valgt endnu";

  return (
    <Card className="sticky top-24 border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Din brief</CardTitle>
        <CardDescription>Det her bruger vi til at finde et realistisk match.</CardDescription>
      </CardHeader>
      <CardContent className="divide-y divide-border/60 pt-0">
        <SummaryRow label="Eventtype" value={values.event_type ?? "—"} />
        <SummaryRow label="Dato" value={values.event_date ? formatDanishDateShort(values.event_date) : "—"} />
        <SummaryRow label="Tid" value={values.start_time && values.end_time ? `${values.start_time} – ${values.end_time}` : "—"} />
        <SummaryRow label="By" value={values.city ?? "—"} />
        <SummaryRow label="Region" value={values.region ?? "—"} />
        <SummaryRow label="Gæster" value={values.guest_count_range ?? "—"} />
        <SummaryRow label="Budget" value={values.budget_band ?? "—"} />
        <SummaryRow label="Stemning" value={selectedVibes} />
      </CardContent>
    </Card>
  );
}

export function BriefPage() {
  useDanishPageSeo({
    title: "Eventbrief",
    description: "Udfyld jeres eventbrief og få en kurateret løsning med DJ, teknik og backup.",
    canonical: "/brief",
  });

  const navigate = useNavigate();
  const location = useLocation();
  const prefill = useMemo<Partial<BriefFormValues>>(
    () => (location.state as { prefill?: Partial<BriefFormValues> } | null)?.prefill ?? {},
    [location.state],
  );
  const [currentStep, setCurrentStep] = useState(0);
  const [testMode, setTestMode] = useState(() => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return false;
    }
    return localStorage.getItem(TEST_MODE_STORAGE_KEY) === "1";
  });

  const form = useForm<BriefFormValues>({
    resolver: zodResolver(briefSchema) as unknown as Resolver<BriefFormValues>,
    defaultValues: DEFAULT_VALUES,
    mode: "onTouched",
  });

  const { register, handleSubmit, trigger, setValue, reset, formState, control } = form;
  const values = useWatch({ control }) as BriefFormValues;

  useEffect(() => {
    reset({ ...DEFAULT_VALUES, ...getDraft(), ...prefill } as BriefFormValues);
  }, [prefill, reset]);

  useEffect(() => {
    saveDraft(values as BriefFormValues);
  }, [values]);

  useEffect(() => {
    if (typeof window === "undefined" || typeof localStorage === "undefined") {
      return;
    }
    localStorage.setItem(TEST_MODE_STORAGE_KEY, testMode ? "1" : "0");
  }, [testMode]);

  const progress = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep]);
  const isFinalStep = currentStep === steps.length - 1;

  async function goNext() {
    if (testMode) {
      setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
      return;
    }
    const valid = await trigger(stepFieldNames[currentStep]);
    if (valid) {
      setCurrentStep((step) => Math.min(step + 1, steps.length - 1));
    }
  }

  function goBack() {
    setCurrentStep((step) => Math.max(step - 1, 0));
  }

  const submitBrief = async (values: BriefFormValues) => {
    const brief = createEventBrief({
      company_name: values.company_name,
      contact_name: values.contact_name,
      contact_email: values.contact_email,
      contact_phone: values.contact_phone?.trim() ? values.contact_phone.trim() : null,
      contact_role: values.contact_role,
      event_type: values.event_type,
      event_date: values.event_date,
      date_flexibility: values.date_flexibility,
      start_time: values.start_time,
      end_time: values.end_time,
      city: values.city,
      region: values.region,
      venue_name: values.venue_name?.trim() ? values.venue_name.trim() : null,
      venue_status: values.venue_status,
      guest_count_range: values.guest_count_range,
      needs_sound: values.needs_sound,
      needs_lighting: values.needs_lighting,
      needs_microphone: values.needs_microphone,
      needs_dinner_music: values.needs_dinner_music,
      needs_venue_coordination: values.needs_venue_coordination,
      music_vibe_tags: values.music_vibe_tags ?? [],
      music_vibe_other: values.music_vibe_other?.trim() ? values.music_vibe_other.trim() : null,
      must_play: values.must_play?.trim() ? values.must_play.trim() : null,
      do_not_play: values.do_not_play?.trim() ? values.do_not_play.trim() : null,
      language_preference: values.language_preference,
      budget_band: values.budget_band,
      success_description: values.success_description.trim(),
    });
    const proposal = createProposalForBrief(brief.id);
    if (typeof window !== "undefined" && typeof localStorage !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    navigate(`/proposal/${proposal.id}`);
  };

  const onSubmit: SubmitHandler<BriefFormValues> = async (submittedValues) => {
    await submitBrief(submittedValues);
  };

  const handleFormSubmit = testMode
    ? (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        void submitBrief(buildTestModeValues({ ...values }));
      }
    : handleSubmit(onSubmit);

  return (
    <FlowLayout>
      <section className="border-b border-border/60 bg-background">
        <Container className="py-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Eventbrief</p>
                <h1 className="mt-2 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Fortæl os om jeres arrangement</h1>
              </div>
              <Badge variant="secondary" className="hidden rounded-full px-3 py-1 md:inline-flex">
                {currentStep + 1} / {steps.length}
              </Badge>
            </div>
            <Progress value={progress} className="h-2" />
            <div className="flex flex-col gap-4 rounded-3xl border border-border/60 bg-muted/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">Testtilstand</p>
                <p className="text-sm text-muted-foreground">Klik rundt mellem trin uden validering.</p>
              </div>
              <div className="flex items-center gap-3">
                <Switch checked={testMode} onCheckedChange={setTestMode} aria-label="Testtilstand" />
                <span className="text-sm font-medium text-foreground">{testMode ? "Til" : "Fra"}</span>
              </div>
            </div>
            <StepPills currentStep={currentStep} testMode={testMode} onSelectStep={setCurrentStep} />
          </div>
        </Container>
      </section>

      <Container className="py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>{steps[currentStep]}</CardTitle>
              <CardDescription>
                {currentStep === 0
                  ? "Vælg den eventtype, der bedst beskriver arrangementet."
                  : currentStep === 1
                    ? "Fortæl os om dato, tider og om den er fast eller fleksibel."
                    : currentStep === 2
                      ? "Angiv hvor eventet skal afholdes."
                      : currentStep === 3
                        ? "Vælg gæsteinterval."
                        : currentStep === 4
                          ? "Sæt kryds ved de tekniske behov, der er relevante."
                          : currentStep === 5
                            ? "Beskriv stemningen og hvilke musikvalg der skal tages hensyn til."
                            : currentStep === 6
                              ? "Vælg et realistisk budgetniveau."
                              : currentStep === 7
                                ? "Fortæl os, hvad der skal lykkes for jer."
                                : "Indtast kontaktoplysninger, så vi kan sende anbefalingen."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleFormSubmit} className="space-y-8">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentStep}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-6"
                  >
                    {currentStep === 0 ? (
                      <div className="space-y-3">
                        <OptionCards
                          options={EVENT_TYPE_OPTIONS.map((option) => option.label)}
                          value={values.event_type ?? DEFAULT_VALUES.event_type}
                          onChange={(value) => setValue("event_type", value as EventType, { shouldValidate: true })}
                        />
                        {formState.errors.event_type ? <p className="text-sm text-destructive">{formState.errors.event_type.message}</p> : null}
                      </div>
                    ) : null}

                    {currentStep === 1 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="event_date">Eventdato</Label>
                          <Input id="event_date" type="date" {...register("event_date")} />
                          {formState.errors.event_date ? <p className="text-sm text-destructive">{formState.errors.event_date.message}</p> : null}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date_flexibility">Datoens fleksibilitet</Label>
                          <Select
                            value={values.date_flexibility}
                            onValueChange={(value) => setValue("date_flexibility", value as BriefDateFlexibility, { shouldValidate: true })}
                          >
                            <SelectTrigger id="date_flexibility">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {DATE_FLEXIBILITY_OPTIONS.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formState.errors.date_flexibility ? (
                            <p className="text-sm text-destructive">{formState.errors.date_flexibility.message}</p>
                          ) : null}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="start_time">Starttid</Label>
                          <Input id="start_time" type="time" {...register("start_time")} />
                          {formState.errors.start_time ? <p className="text-sm text-destructive">{formState.errors.start_time.message}</p> : null}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="end_time">Sluttid</Label>
                          <Input id="end_time" type="time" {...register("end_time")} />
                          {formState.errors.end_time ? <p className="text-sm text-destructive">{formState.errors.end_time.message}</p> : null}
                        </div>
                      </div>
                    ) : null}

                    {currentStep === 2 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="city">By</Label>
                          <Input id="city" placeholder="København" {...register("city")} />
                          {formState.errors.city ? <p className="text-sm text-destructive">{formState.errors.city.message}</p> : null}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="region">Region</Label>
                          <Select value={values.region} onValueChange={(value) => setValue("region", value as Region, { shouldValidate: true })}>
                            <SelectTrigger id="region">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {REGION_OPTIONS.map((option) => (
                                <SelectItem key={option.id} value={option.id}>
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {formState.errors.region ? <p className="text-sm text-destructive">{formState.errors.region.message}</p> : null}
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label htmlFor="venue_name">Spillested (valgfrit)</Label>
                          <Input id="venue_name" placeholder="Fx Hotel d'Angleterre" {...register("venue_name")} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Status på spillested</Label>
                          <OptionCards
                            options={VENUE_STATUS_OPTIONS}
                            value={values.venue_status ?? DEFAULT_VALUES.venue_status}
                            onChange={(value) => setValue("venue_status", value as BriefVenueStatus, { shouldValidate: true })}
                          />
                          {formState.errors.venue_status ? <p className="text-sm text-destructive">{formState.errors.venue_status.message}</p> : null}
                        </div>
                      </div>
                    ) : null}

                    {currentStep === 3 ? (
                      <div className="space-y-2">
                        <Label>Gæsteinterval</Label>
                        <OptionCards
                          options={GUEST_COUNT_RANGE_OPTIONS.map((option) => option.label)}
                          value={values.guest_count_range ?? DEFAULT_VALUES.guest_count_range}
                          onChange={(value) => setValue("guest_count_range", value as GuestCountRange, { shouldValidate: true })}
                        />
                        {formState.errors.guest_count_range ? (
                          <p className="text-sm text-destructive">{formState.errors.guest_count_range.message}</p>
                        ) : null}
                      </div>
                    ) : null}

                    {currentStep === 4 ? (
                      <div className="grid gap-4">
                        {TECHNICAL_NEEDS_OPTIONS.map((item) => (
                          <div key={item.id} className="grid gap-2 rounded-2xl border border-border/60 bg-muted/20 p-4 md:grid-cols-[1fr_auto] md:items-center">
                            <div>
                              <Label htmlFor={item.id}>{item.label}</Label>
                            </div>
                            <Select
                              value={values[item.id]}
                              onValueChange={(value) => setValue(item.id, value as YesNoUnsure, { shouldValidate: true })}
                            >
                              <SelectTrigger id={item.id} className="md:w-44">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {YES_NO_UNSURE_OPTIONS.map((option) => (
                                  <SelectItem key={option.id} value={option.id}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ))}
                      </div>
                    ) : null}

                    {currentStep === 5 ? (
                      <div className="space-y-6">
                        <div className="grid gap-3 sm:grid-cols-2">
                          {VIBE_OPTIONS.map((option) => {
                            const selected = (values.music_vibe_tags ?? []).includes(option.id);
                            return (
                              <button
                                key={option.id}
                                type="button"
                                onClick={() =>
                                  setValue("music_vibe_tags", toggleTag(values.music_vibe_tags ?? [], option.id), { shouldValidate: true })
                                }
                                className={cn(
                                  "flex items-center justify-between rounded-2xl border px-4 py-3 text-left text-sm transition-colors",
                                  selected ? "border-accent bg-accent/10 text-foreground" : "border-border/60 bg-card hover:border-accent/40",
                                )}
                              >
                                <span>{option.label}</span>
                                {selected ? <Check className="h-4 w-4 text-accent" /> : null}
                              </button>
                            );
                          })}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="music_vibe_other">Andet</Label>
                          <Textarea id="music_vibe_other" placeholder="Andre ønsker til stemningen" {...register("music_vibe_other")} />
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="must_play">Must-play sange</Label>
                            <Textarea id="must_play" placeholder="Numre, der gerne skal med" {...register("must_play")} />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="do_not_play">Do-not-play sange</Label>
                            <Textarea id="do_not_play" placeholder="Numre, der skal undgås" {...register("do_not_play")} />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label>Foretrukket sprog</Label>
                          <OptionCards
                            options={LANGUAGE_OPTIONS}
                            value={values.language_preference ?? DEFAULT_VALUES.language_preference}
                            onChange={(value) => setValue("language_preference", value as LanguagePreference, { shouldValidate: true })}
                          />
                        </div>
                      </div>
                    ) : null}

                    {currentStep === 6 ? (
                      <div className="space-y-4">
                        <RadioGroup value={values.budget_band ?? DEFAULT_VALUES.budget_band} onValueChange={(value) => setValue("budget_band", value as BudgetBand, { shouldValidate: true })}>
                          {BUDGET_BAND_OPTIONS.map((option) => (
                            <label key={option.id} className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm">
                              <RadioGroupItem value={option.id} />
                              <span className="text-sm font-medium">{option.label}</span>
                            </label>
                          ))}
                        </RadioGroup>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Vi bruger budgettet til at anbefale en realistisk løsning. Prisen låses først, når tekniske behov og transport er bekræftet.
                        </p>
                      </div>
                    ) : null}

                    {currentStep === 7 ? (
                      <div className="space-y-2">
                        <Label htmlFor="success_description">Hvad skal være lykkedes, for at I bagefter siger: det fungerede virkelig godt?</Label>
                        <Textarea
                          id="success_description"
                          placeholder="Fx at middagen føles professionel, at dansegulvet kommer i gang efter talerne, og at musikken passer til både unge og ældre medarbejdere."
                          className="min-h-40"
                          {...register("success_description")}
                        />
                        {formState.errors.success_description ? (
                          <p className="text-sm text-destructive">{formState.errors.success_description.message}</p>
                        ) : null}
                      </div>
                    ) : null}

                    {currentStep === 8 ? (
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-2">
                          <Label htmlFor="contact_name">Navn</Label>
                          <Input id="contact_name" {...register("contact_name")} />
                          {formState.errors.contact_name ? <p className="text-sm text-destructive">{formState.errors.contact_name.message}</p> : null}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="company_name">Firmanavn</Label>
                          <Input id="company_name" {...register("company_name")} />
                          {formState.errors.company_name ? <p className="text-sm text-destructive">{formState.errors.company_name.message}</p> : null}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact_email">Arbejdsmail</Label>
                          <Input id="contact_email" type="email" {...register("contact_email")} />
                          {formState.errors.contact_email ? <p className="text-sm text-destructive">{formState.errors.contact_email.message}</p> : null}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="contact_phone">Telefon (valgfrit)</Label>
                          <Input id="contact_phone" {...register("contact_phone")} />
                        </div>
                        <div className="space-y-2 md:col-span-2">
                          <Label>Rolle</Label>
                          <OptionCards
                            options={BRIEF_CONTACT_ROLE_OPTIONS.map((option) => option.label)}
                            value={BRIEF_CONTACT_ROLE_OPTIONS.find((option) => option.value === (values.contact_role ?? DEFAULT_VALUES.contact_role))?.label ?? DEFAULT_VALUES.contact_role}
                            onChange={(value) => {
                              const selected = BRIEF_CONTACT_ROLE_OPTIONS.find((option) => option.label === value);
                              if (selected) {
                                setValue("contact_role", selected.value, { shouldValidate: true });
                              }
                            }}
                          />
                          {formState.errors.contact_role ? <p className="text-sm text-destructive">{formState.errors.contact_role.message}</p> : null}
                        </div>
                      </div>
                    ) : null}
                  </motion.div>
                </AnimatePresence>

                <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <Button type="button" variant="outline" onClick={goBack} disabled={currentStep === 0} className="sm:w-auto">
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Tilbage
                  </Button>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    {isFinalStep ? (
                      <Button type="submit" variant="accent" className="sm:w-auto">
                        Se anbefalet løsning
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    ) : (
                      <Button type="button" variant="accent" onClick={goNext} className="sm:w-auto">
                        Næste
                        <ChevronRight className="ml-2 h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="hidden lg:block">
            <BriefSummaryCard values={values} />
          </div>
        </div>
      </Container>
    </FlowLayout>
  );
}
