import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { z } from "zod";
import { useForm, useWatch, type SubmitHandler, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { FlowLayout } from "@/components/layout/FlowLayout";
import { Container } from "@/components/common/Container";
import { MobileDiscoBuilder } from "@/components/flow/MobileDiscoBuilder";
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
import { BRIEF_CONTACT_ROLE_OPTIONS, BUDGET_BAND_OPTIONS, GUEST_COUNT_RANGE_OPTIONS, REGION_OPTIONS, VIBE_OPTIONS, YES_NO_UNSURE_OPTIONS } from "@/lib/constants";
import {
  BRIEF_EVENT_TYPE_CONFIGS,
  BRIEF_EVENT_TYPE_OPTIONS,
  type BriefEventType,
  getBriefEventTypeConfig,
  getBriefGuestTier,
  normalizeBriefEventType,
} from "@/lib/eventTypes";
import { createEventBrief, createProposalForBrief } from "@/lib/store";
import { useDanishPageSeo } from "@/lib/seo";
import { cn, formatDanishDateShort } from "@/lib/utils";
import type {
  BriefContactRole,
  BriefDateFlexibility,
  BriefVenueStatus,
  BudgetBand,
  GuestCountRange,
  GuestTier,
  LanguagePreference,
  Region,
  ServiceScope,
  VibeTag,
  YesNoUnsure,
} from "@/types/domain";

const DATE_FLEXIBILITY_OPTIONS = ["Fast dato", "Muligvis fleksibel", "Ikke besluttet endnu"] as const satisfies readonly [BriefDateFlexibility, ...BriefDateFlexibility[]];
const SERVICE_SCOPE_OPTIONS = [
  {
    value: "Kun fest",
    description: "DJ til selve festen og dansegulvet.",
    windowHint: "Typisk 21:00–01:00",
  },
  {
    value: "Middag og fest",
    description: "DJ fra middagen til festens slutning.",
    windowHint: "Typisk 18:00–01:00",
  },
  {
    value: "Velkomst, middag og fest",
    description: "Fuld dækning fra velkomst/ankomst gennem middag til fest.",
    windowHint: "Typisk 16:00–01:00",
  },
] as const satisfies readonly {
  value: ServiceScope;
  description: string;
  windowHint: string;
}[];
const VENUE_STATUS_OPTIONS = [
  "Vi har booket venue",
  "Vi er tæt på at booke venue",
  "Vi mangler stadig venue",
  "Det holdes hos os selv (eget kontor eller lokale)",
] as const satisfies readonly [BriefVenueStatus, ...BriefVenueStatus[]];
const LANGUAGE_OPTIONS = ["Dansk", "Engelsk", "Begge"] as const satisfies readonly [LanguagePreference, ...LanguagePreference[]];
const TECHNICAL_FIELD_OPTIONS = [
  { field: "needs_sound", label: "Behov for yderligere lyd" },
  { field: "needs_lighting", label: "Behov for yderligere dansegulvslys" },
  { field: "needs_microphone", label: "Mikrofon til taler" },
] as const satisfies readonly { field: "needs_sound" | "needs_lighting" | "needs_microphone"; label: string }[];
const SETUP_SIZE_OPTIONS = [
  { value: "compact", label: "Kompakt", description: "Mindre arrangementer" },
  { value: "medium", label: "Mellem", description: "Balanceret løsning" },
  { value: "large", label: "Stor", description: "Mere rækkevidde" },
] as const satisfies readonly { value: GuestTier; label: string; description: string }[];
const HALF_HOUR_TIMES = Array.from({ length: 48 }, (_, index) => {
  const totalMinutes = index * 30;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
});

const STORAGE_KEY = "djconnect.flow.briefDraft.v1";
const TEST_MODE_STORAGE_KEY = "djconnect.flow.briefTestMode.v1";

const briefSchema = z.object({
  event_type: z.enum(BRIEF_EVENT_TYPE_OPTIONS.map((option) => option.id) as [BriefEventType, ...BriefEventType[]], { message: "Vælg en eventtype." }),
  event_date: z.string().min(1, "Vælg en eventdato."),
  start_time: z.string().min(1, "Angiv starttidspunkt."),
  end_time: z.string().min(1, "Angiv sluttidspunkt."),
  date_flexibility: z.enum(DATE_FLEXIBILITY_OPTIONS, { message: "Vælg om datoen er fast eller fleksibel." }),
  city: z.string().min(2, "Skriv en by."),
  venue_status: z.enum(VENUE_STATUS_OPTIONS, { message: "Vælg venue-status." }),
  service_scope: z.enum(SERVICE_SCOPE_OPTIONS.map((option) => option.value) as [ServiceScope, ...ServiceScope[]], { message: "Vælg service-omfang." }),
  setup_size: z.enum(["compact", "medium", "large"] as const),
  region: z.enum(REGION_OPTIONS.map((option) => option.id) as [Region, ...Region[]], { message: "Vælg region." }),
  guest_count_range: z.enum(GUEST_COUNT_RANGE_OPTIONS.map((option) => option.id) as [GuestCountRange, ...GuestCountRange[]], { message: "Vælg gæsteinterval." }),
  needs_sound: z.enum(["Ja", "Nej", "Ikke sikker"] as const),
  needs_lighting: z.enum(["Ja", "Nej", "Ikke sikker"] as const),
  needs_microphone: z.enum(["Ja", "Nej", "Ikke sikker"] as const),
  needs_dinner_music: z.enum(["Ja", "Nej", "Ikke sikker"] as const),
  early_setup_requested: z.boolean(),
  dj_start_time: z.string().nullable().optional(),
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
  event_type: "Julefrokost",
  event_date: "",
  start_time: "",
  end_time: "",
  date_flexibility: "Fast dato",
  city: "",
  venue_status: "Vi mangler stadig venue",
  service_scope: "Middag og fest",
  setup_size: "compact",
  region: "København / Sjælland",
  guest_count_range: "Under 50",
  needs_sound: "Ikke sikker",
  needs_lighting: "Ikke sikker",
  needs_microphone: "Ikke sikker",
  needs_dinner_music: "Ikke sikker",
  early_setup_requested: false,
  dj_start_time: null,
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
  ["event_date", "date_flexibility", "service_scope", "start_time", "end_time", "early_setup_requested", "dj_start_time"],
  ["city", "venue_status", "region"],
  ["guest_count_range"],
  ["setup_size", "needs_sound", "needs_lighting", "needs_microphone"],
  ["music_vibe_tags", "music_vibe_other", "must_play", "do_not_play", "language_preference", "needs_dinner_music"],
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

function normalizeTime(value: string | undefined | null) {
  if (!value) {
    return "";
  }
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return "";
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (Number.isNaN(hours) || Number.isNaN(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return "";
  }
  const roundedMinutes = Math.min(23 * 60 + 30, Math.round((hours * 60 + minutes) / 30) * 30);
  return `${String(Math.floor(roundedMinutes / 60)).padStart(2, "0")}:${String(roundedMinutes % 60).padStart(2, "0")}`;
}

function getEventTypeValue(value: string | undefined | null) {
  return normalizeBriefEventType(value);
}

function getServiceScopePreset(scope: ServiceScope) {
  switch (scope) {
    case "Kun fest":
      return { start_time: "21:00", end_time: "01:00" };
    case "Velkomst, middag og fest":
      return { start_time: "16:00", end_time: "01:00" };
    case "Middag og fest":
    default:
      return { start_time: "18:00", end_time: "01:00" };
  }
}

function getPrefillValue(source: Record<string, unknown>, key: string) {
  return typeof source[key] === "string" ? (source[key] as string) : "";
}

function normalizeBriefPrefill(state: unknown): Partial<BriefFormValues> {
  const source = (state as { prefill?: Record<string, unknown> } | null)?.prefill;
  if (!source) {
    return {};
  }

  const eventType = getPrefillValue(source, "event_type") || getPrefillValue(source, "eventType");
  const eventDate = getPrefillValue(source, "event_date") || getPrefillValue(source, "eventDate");
  const guestCountRange = getPrefillValue(source, "guest_count_range") || getPrefillValue(source, "guestCountRange");
  const city = getPrefillValue(source, "city");
  const startTime = getPrefillValue(source, "start_time") || getPrefillValue(source, "startTime");
  const endTime = getPrefillValue(source, "end_time") || getPrefillValue(source, "endTime");

  return {
    ...(eventType ? { event_type: normalizeBriefEventType(eventType) } : {}),
    ...(eventDate ? { event_date: eventDate } : {}),
    ...(guestCountRange ? { guest_count_range: guestCountRange as GuestCountRange } : {}),
    ...(city ? { city } : {}),
    ...(startTime ? { start_time: normalizeTime(startTime) } : {}),
    ...(endTime ? { end_time: normalizeTime(endTime) } : {}),
  };
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
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    containerRef.current?.querySelector('[data-active="true"]')?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [currentStep]);

  return (
    <div
      ref={containerRef}
      className="flex gap-2 overflow-x-auto flex-nowrap pb-2 -mx-1 px-1 sm:mx-0 sm:px-0 sm:pb-0 sm:flex-wrap sm:overflow-visible [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {steps.map((label, index) => (
        testMode ? (
          <button
            key={label}
            type="button"
            onClick={() => onSelectStep(index)}
            data-active={index === currentStep}
            className={cn(
              "inline-flex shrink-0 items-center whitespace-nowrap rounded-full px-3 py-1 text-sm font-medium transition-colors",
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
            data-active={index === currentStep}
            className={cn("shrink-0 whitespace-nowrap rounded-full px-3 py-1", index === currentStep ? "shadow-sm" : "")}
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
    event_type: normalizeBriefEventType(values.event_type),
    event_date: isNonEmpty(values.event_date) ? values.event_date : `${year}-${month}-${day}`,
    start_time: normalizeTime(values.start_time) || "18:00",
    end_time: normalizeTime(values.end_time) || "23:30",
    service_scope: values.service_scope ?? DEFAULT_VALUES.service_scope,
    setup_size: values.setup_size ?? getBriefGuestTier(values.guest_count_range ?? DEFAULT_VALUES.guest_count_range),
    early_setup_requested: false,
    dj_start_time: null,
    city: isNonEmpty(values.city) ? values.city : "København",
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

function EventTypeCards({
  value,
  onChange,
}: {
  value: BriefFormValues["event_type"];
  onChange: (value: BriefFormValues["event_type"]) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {BRIEF_EVENT_TYPE_OPTIONS.map((option) => {
        const config = BRIEF_EVENT_TYPE_CONFIGS[option.id];
        const Icon = config.icon;
        const selected = value === option.id;
        return (
          <button
            key={option.id}
            type="button"
            onClick={() => onChange(option.id)}
            className={cn(
              "group flex items-center gap-4 rounded-3xl border p-4 text-left shadow-sm transition-all",
              selected ? "border-accent bg-accent/5 ring-1 ring-accent/20" : config.cardToneClassName,
            )}
          >
            <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl border", config.iconToneClassName)}>
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold text-foreground">{option.label}</span>
                {selected ? <Check className="h-4 w-4 text-accent" /> : null}
              </div>
              <p className="mt-1 text-xs leading-5 text-muted-foreground">{config.expectationCopy}</p>
            </div>
          </button>
        );
      })}
    </div>
  );
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

function TimeSelect({
  id,
  label,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  value: string | null | undefined;
  onChange: (value: string) => void;
  error?: string;
}) {
  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Select value={value ?? ""} onValueChange={onChange}>
        <SelectTrigger id={id}>
          <SelectValue placeholder="Vælg tidspunkt" />
        </SelectTrigger>
        <SelectContent>
          {HALF_HOUR_TIMES.map((time) => (
            <SelectItem key={time} value={time}>
              {time}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {error ? <p className="text-sm text-destructive">{error}</p> : null}
    </div>
  );
}

function ServiceScopeCards({
  value,
  onChange,
}: {
  value: ServiceScope;
  onChange: (value: ServiceScope) => void;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {SERVICE_SCOPE_OPTIONS.map((option) => {
        const selected = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              "rounded-3xl border p-4 text-left shadow-sm transition-all",
              selected ? "border-accent bg-accent/5 ring-1 ring-accent/20" : "border-border/60 bg-card hover:border-accent/40",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-foreground">{option.value}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{option.description}</p>
              </div>
              {selected ? <Check className="h-4 w-4 shrink-0 text-accent" /> : null}
            </div>
            <p className="mt-4 text-xs font-medium uppercase tracking-[0.18em] text-accent">{option.windowHint}</p>
          </button>
        );
      })}
    </div>
  );
}

function ExpectationCard({ eventType }: { eventType: BriefEventType }) {
  const config = getBriefEventTypeConfig(eventType);
  return (
    <div className="rounded-3xl border border-border/60 bg-muted/20 p-4">
      <p className="text-sm font-semibold text-foreground">Hvad I kan forvente af os</p>
      <p className="mt-2 text-sm leading-6 text-muted-foreground">{config.expectationCopy}</p>
    </div>
  );
}

function TechnicalSetupCard({
  eventType,
  guestCountRange,
  setupSize,
  onSetupSizeChange,
  extraSound,
  extraLighting,
  microphone,
  serviceScope,
}: {
  eventType: BriefEventType;
  guestCountRange: GuestCountRange;
  setupSize: GuestTier;
  onSetupSizeChange: (value: GuestTier) => void;
  extraSound: boolean;
  extraLighting: boolean;
  microphone: boolean;
  serviceScope: ServiceScope;
}) {
  const eventConfig = getBriefEventTypeConfig(eventType);
  const recommendedTier = getBriefGuestTier(guestCountRange);
  const selectedTierLabel = setupSize === "compact" ? "Kompakt setup" : setupSize === "medium" ? "Balanceret setup" : "Større setup";
  const recommendedLabel = recommendedTier === "compact" ? "Kompakt" : recommendedTier === "medium" ? "Mellem" : "Stor";

  return (
    <Card className="overflow-hidden border-border/60 shadow-sm">
      <CardContent className="space-y-5 p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary" className="rounded-full px-3 py-1">
            {selectedTierLabel}
          </Badge>
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">Live visualisering</span>
        </div>
        <MobileDiscoBuilder
          eventType={eventType}
          sizeTier={setupSize}
          extraSound={extraSound}
          extraLighting={extraLighting}
          microphone={microphone}
          serviceScope={serviceScope}
        />
        <div className="space-y-3">
          <p className="text-sm leading-6 text-muted-foreground">{eventConfig.setupCopy[setupSize]}</p>
          <p className="text-sm font-medium text-foreground">
            Vores anbefaling til {guestCountRange.toLowerCase()} gæster: {recommendedLabel}.
          </p>
          <div className="grid gap-2 sm:grid-cols-3">
            {SETUP_SIZE_OPTIONS.map((option) => {
              const selected = setupSize === option.value;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => onSetupSizeChange(option.value)}
                  className={cn(
                    "rounded-2xl border p-3 text-left transition-all",
                    selected ? "border-accent bg-accent/5 ring-1 ring-accent/20" : "border-border/60 bg-card hover:border-accent/40",
                  )}
                >
                  <span className="block text-sm font-semibold text-foreground">{option.label}</span>
                  <span className="mt-1 block text-xs text-muted-foreground">{option.description}</span>
                </button>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function BriefSummaryRows({ values }: { values: Partial<BriefFormValues> }) {
  const selectedVibesTags = values.music_vibe_tags ?? [];
  const selectedVibes = selectedVibesTags.length ? selectedVibesTags.join(", ") : "Ikke valgt endnu";

  return (
    <CardContent className="divide-y divide-border/60 pt-0">
      <SummaryRow label="Eventtype" value={values.event_type ?? "—"} />
      <SummaryRow label="Dato" value={values.event_date ? formatDanishDateShort(values.event_date) : "—"} />
      <SummaryRow label="Tid" value={values.start_time && values.end_time ? `${values.start_time} – ${values.end_time}` : "—"} />
      <SummaryRow label="Serviceomfang" value={values.service_scope ?? "—"} />
      <SummaryRow label="By" value={values.city ?? "—"} />
      <SummaryRow label="Region" value={values.region ?? "—"} />
      <SummaryRow label="Gæster" value={values.guest_count_range ?? "—"} />
      <SummaryRow
        label="Størrelse på mobildiskotek"
        value={values.setup_size === "compact" ? "Kompakt" : values.setup_size === "medium" ? "Mellem" : values.setup_size === "large" ? "Stor" : "—"}
      />
      <SummaryRow label="Budget" value={values.budget_band ?? "—"} />
      <SummaryRow label="Venue-status" value={values.venue_status ?? "—"} />
      <SummaryRow label="Tidlig opsætning" value={values.early_setup_requested ? `Ja${values.dj_start_time ? ` · DJ starter kl. ${values.dj_start_time}` : ""}` : "Nej"} />
      <SummaryRow label="Stemning" value={selectedVibes} />
    </CardContent>
  );
}

function BriefSummaryCard({ values }: { values: Partial<BriefFormValues> }) {
  return (
    <Card className="sticky top-24 border-border/60 shadow-sm">
      <CardHeader>
        <CardTitle>Din brief</CardTitle>
        <CardDescription>Det her bruger vi til at finde et realistisk match.</CardDescription>
      </CardHeader>
      <BriefSummaryRows values={values} />
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
  const prefill = useMemo<Partial<BriefFormValues>>(() => normalizeBriefPrefill(location.state), [location.state]);
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
    const nextValues = { ...DEFAULT_VALUES, ...getDraft(), ...prefill } as BriefFormValues;
    reset({
      ...nextValues,
      event_type: normalizeBriefEventType(nextValues.event_type),
      start_time: normalizeTime(nextValues.start_time),
      end_time: normalizeTime(nextValues.end_time),
      service_scope: nextValues.service_scope ?? DEFAULT_VALUES.service_scope,
      setup_size: nextValues.setup_size ?? getBriefGuestTier(nextValues.guest_count_range ?? DEFAULT_VALUES.guest_count_range),
      early_setup_requested: Boolean(nextValues.early_setup_requested),
      dj_start_time: nextValues.dj_start_time ?? null,
    });
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
      venue_name: null,
      venue_status: values.venue_status,
      service_scope: values.service_scope,
      setup_size: values.setup_size,
      guest_count_range: values.guest_count_range,
      needs_sound: values.needs_sound,
      needs_lighting: values.needs_lighting,
      needs_microphone: values.needs_microphone,
      needs_dinner_music: values.needs_dinner_music,
      early_setup_requested: values.early_setup_requested,
      dj_start_time: values.early_setup_requested ? values.dj_start_time ?? null : null,
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
            <p className="text-sm font-medium text-muted-foreground sm:hidden">
              Trin {currentStep + 1} af {steps.length} · {steps[currentStep]}
            </p>
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
                          ? "Vælg den tekniske løsning, der passer til jeres arrangement."
                          : currentStep === 5
                            ? "Beskriv stemningen og vælg musikønsker til aftenen."
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
                        <EventTypeCards
                          value={values.event_type ?? DEFAULT_VALUES.event_type}
                          onChange={(value) => setValue("event_type", value, { shouldValidate: true })}
                        />
                        {formState.errors.event_type ? <p className="text-sm text-destructive">{formState.errors.event_type.message}</p> : null}
                      </div>
                    ) : null}

                    {currentStep === 1 ? (
                      <div className="space-y-4">
                        <ExpectationCard eventType={getEventTypeValue(values.event_type)} />
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
                        </div>
                        <div className="space-y-3">
                          <Label>Serviceomfang</Label>
                          <ServiceScopeCards
                            value={values.service_scope ?? DEFAULT_VALUES.service_scope}
                            onChange={(value) => {
                              const preset = getServiceScopePreset(value);
                              setValue("service_scope", value, { shouldValidate: true });
                              setValue("start_time", preset.start_time, { shouldValidate: true });
                              setValue("end_time", preset.end_time, { shouldValidate: true });
                            }}
                          />
                          {formState.errors.service_scope ? <p className="text-sm text-destructive">{formState.errors.service_scope.message}</p> : null}
                        </div>
                        <div className="grid gap-4 md:grid-cols-2">
                          <TimeSelect
                            id="start_time"
                            label="Starttid"
                            value={values.start_time}
                            onChange={(value) => setValue("start_time", value, { shouldValidate: true })}
                            error={formState.errors.start_time?.message}
                          />
                          <TimeSelect
                            id="end_time"
                            label="Sluttid"
                            value={values.end_time}
                            onChange={(value) => setValue("end_time", value, { shouldValidate: true })}
                            error={formState.errors.end_time?.message}
                          />
                        </div>
                        <div className="rounded-3xl border border-border/60 bg-muted/20 p-4 space-y-4">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <Label className="text-sm font-semibold text-foreground">Tidlig opsætning</Label>
                              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                Vi sætter udstyret op i god tid, så I selv kan bruge lyd og mikrofon (fx til taler eller egen playliste), før DJ&apos;en tager over.
                              </p>
                            </div>
                            <Switch
                              checked={values.early_setup_requested}
                              onCheckedChange={(checked) => {
                                setValue("early_setup_requested", checked, { shouldValidate: true });
                                if (!checked) {
                                  setValue("dj_start_time", null, { shouldValidate: true });
                                }
                              }}
                              aria-label="Tidlig opsætning"
                            />
                          </div>
                          {values.early_setup_requested ? (
                            <div className="max-w-sm space-y-2">
                              <TimeSelect
                                id="dj_start_time"
                                label="DJ starter kl."
                                value={values.dj_start_time}
                                onChange={(value) => setValue("dj_start_time", value, { shouldValidate: true })}
                              />
                            </div>
                          ) : null}
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
                          <Label>Status på spillested</Label>
                          <RadioGroup
                            value={values.venue_status ?? DEFAULT_VALUES.venue_status}
                            onValueChange={(value) => setValue("venue_status", value as BriefVenueStatus, { shouldValidate: true })}
                            className="grid gap-3 md:grid-cols-2"
                          >
                            {VENUE_STATUS_OPTIONS.map((option) => (
                              <Label
                                key={option}
                                className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-colors hover:border-accent/40"
                              >
                                <RadioGroupItem value={option} />
                                <span className="text-sm font-medium text-foreground">{option}</span>
                              </Label>
                            ))}
                          </RadioGroup>
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
                      <div className="space-y-6">
                        <TechnicalSetupCard
                          eventType={getEventTypeValue(values.event_type)}
                          guestCountRange={values.guest_count_range ?? DEFAULT_VALUES.guest_count_range}
                          setupSize={values.setup_size ?? getBriefGuestTier(values.guest_count_range ?? DEFAULT_VALUES.guest_count_range)}
                          onSetupSizeChange={(value) => setValue("setup_size", value, { shouldValidate: true })}
                          extraSound={values.needs_sound === "Ja"}
                          extraLighting={values.needs_lighting === "Ja"}
                          microphone={values.needs_microphone === "Ja"}
                          serviceScope={values.service_scope ?? DEFAULT_VALUES.service_scope}
                        />
                        <div className="grid gap-4">
                          {TECHNICAL_FIELD_OPTIONS.map(({ field, label }) => (
                            <div key={field} className="grid gap-2 rounded-2xl border border-border/60 bg-muted/20 p-4 md:grid-cols-[1fr_auto] md:items-center">
                              <div>
                                <Label htmlFor={field}>{label}</Label>
                              </div>
                              <Select
                                value={values[field]}
                                onValueChange={(value) => setValue(field, value as YesNoUnsure, { shouldValidate: true })}
                              >
                                <SelectTrigger id={field} className="md:w-44">
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
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label>Brug for middag-/baggrundsmusik</Label>
                            <RadioGroup
                              value={values.needs_dinner_music ?? DEFAULT_VALUES.needs_dinner_music}
                              onValueChange={(value) => setValue("needs_dinner_music", value as YesNoUnsure, { shouldValidate: true })}
                              className="grid gap-3 sm:grid-cols-3"
                            >
                              {YES_NO_UNSURE_OPTIONS.map((option) => (
                                <Label
                                  key={option.id}
                                  className="flex cursor-pointer items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 shadow-sm transition-colors hover:border-accent/40"
                                >
                                  <RadioGroupItem value={option.id} />
                                  <span className="text-sm font-medium text-foreground">{option.label}</span>
                                </Label>
                              ))}
                            </RadioGroup>
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

          <details className="group rounded-3xl border border-border/60 bg-card shadow-sm lg:hidden">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-6 py-4 text-base font-semibold text-foreground [&::-webkit-details-marker]:hidden">
              Din brief
              <ChevronDown className="h-4 w-4 text-muted-foreground transition-transform group-open:rotate-180" />
            </summary>
            <BriefSummaryRows values={values} />
          </details>

          <div className="hidden lg:block">
            <BriefSummaryCard values={values} />
          </div>
        </div>
      </Container>
    </FlowLayout>
  );
}
