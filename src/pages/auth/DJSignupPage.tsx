import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  User2,
  Compass,
  Speaker,
  Coins,
  Camera,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  Loader2,
  Eye,
  EyeOff,
  PartyPopper,
  BadgeCheck,
  Shield,
  HeartHandshake,
  Lock,
  Plus,
  Heart,
  Briefcase,
  Cake,
  Crown,
  Wine,
  Sparkles,
  Lightbulb,
  Rocket,
  Trophy,
  Info,
  PhoneCall,
  Mail,
  Star,
  ArrowRight,
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { EXPERIENCE_YEARS } from "@/lib/constants";
import { FilePicker, type FileWithPreview } from "@/components/dj-signup/FilePicker";
import { OptionCards } from "@/components/dj-signup/OptionCards";
import { LivePreview } from "@/components/dj-signup/LivePreview";
import { BrandMark } from "@/components/common/BrandMark";
import { cn } from "@/lib/utils";
import { fileToDataUrl, writeDemoDJProfile } from "@/lib/demoDJProfile";

/**
 * DJ signup wizard — redesigned to a 5-step Danish flow that owns its
 * own full-screen layout (same chrome pattern as the customer-facing
 * /get-offers wizard: minimal brand-mark + close + thin progress bar in
 * the top menu, no site header/footer).
 *
 * Steps:
 *   1. Opret konto                  — name, email, password, contact
 *   2. Sådan fungerer det           — informational explainer (no form)
 *   3. DJ Erfaring & Mobildiskotek  — experience + gear merged
 *   4. Pris & ydelser               — pricing + payout setup
 *   5. Profil & billeder            — public-facing profile (DJ card)
 *
 * Right rail behaviour:
 *   • Steps 1-4 show a "Sådan hjælper det dig" tips panel that explains
 *     *why* we ask for that step's information so the form doesn't feel
 *     transactional.
 *   • Step 5 (Profil & billeder) swaps the tips panel for the
 *     `LivePreview` DJ-card so the applicant can see exactly how their
 *     profile will appear to customers as they fill it in. This is the
 *     only step where the live card is shown.
 */

type DJPackage = {
  id: string;
  guestsFrom: string;
  guestsTo: string;
  packagePrice: string;
  included: string;
  image: string;
};

function makePackage(): DJPackage {
  const id =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return {
    id,
    guestsFrom: "",
    guestsTo: "",
    packagePrice: "",
    included: "",
    image: "",
  };
}

type Draft = {
  // Step 1 — Opret konto
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  city: string;
  // Step 3 — DJ Erfaring & Mobildiskotek
  yearsExperience: string;
  eventsPerformed: string;
  notableClients: string;
  eventsWeddings: string;
  eventsPrivateAdult: string;
  eventsCorporate: string;
  eventsYouth: string;
  // Step 3b — Links
  linkInstagram: string;
  linkFacebook: string;
  linkWebsite: string;
  linkEventzonen: string;
  linkTrustpilot: string;
  linkGoogle: string;
  // Step 3c — Mobildiskotek
  equipmentOwned: boolean;
  equipmentTransport: boolean;
  equipmentCapacity: string;
  equipmentPresets: string[];
  equipmentDescription: string;
  setupSize: string;
  // Step 4 — Pris & ydelser
  hourlyRate: string;
  packages: DJPackage[];
  addOns: string[];
  // Step 5 — Profil & billeder
  stageName: string;
  bio: string;
  eventTypes: string[];
};

const EMPTY_DRAFT: Draft = {
  firstName: "",
  lastName: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  city: "",
  yearsExperience: "",
  eventsPerformed: "",
  notableClients: "",
  eventsWeddings: "",
  eventsPrivateAdult: "",
  eventsCorporate: "",
  eventsYouth: "",
  linkInstagram: "",
  linkFacebook: "",
  linkWebsite: "",
  linkEventzonen: "",
  linkTrustpilot: "",
  linkGoogle: "",
  equipmentOwned: false,
  equipmentTransport: false,
  equipmentCapacity: "",
  equipmentPresets: [],
  equipmentDescription: "",
  setupSize: "",
  hourlyRate: "",
  packages: [makePackage()],
  addOns: [],
  stageName: "",
  bio: "",
  eventTypes: [],
};

type StepDef = {
  id: string;
  title: string;
  shortTitle: string;
  icon: typeof User2;
};

const STEPS: StepDef[] = [
  { id: "account", title: "Opret konto", shortTitle: "Konto", icon: User2 },
  {
    id: "how-it-works",
    title: "Sådan fungerer det",
    shortTitle: "Sådan",
    icon: Compass,
  },
  {
    id: "experience",
    title: "DJ Erfaring & Mobildiskotek",
    shortTitle: "Erfaring & udstyr",
    icon: Speaker,
  },
  { id: "pricing", title: "Pris & ydelser", shortTitle: "Pris", icon: Coins },
  {
    id: "profile",
    title: "Profil & billeder",
    shortTitle: "Profil",
    icon: Camera,
  },
];

const EVENT_TYPE_CARDS = [
  { id: "wedding", label: "Bryllup", description: "Første dans & ceremoni", icon: Heart },
  { id: "birthday", label: "Fødselsdag", description: "Runde dage & jubilæum", icon: Cake },
  { id: "corporate_event", label: "Firmaevent", description: "Konference & launch", icon: Briefcase },
  { id: "corporate_party", label: "Firmafest", description: "Sommer- & julefest", icon: Wine },
  { id: "private_party", label: "Privatfest", description: "Mindre selskaber", icon: Crown },
  { id: "other", label: "Andet", description: "Klubber, festivaler…", icon: Sparkles },
];



const ADDON_PRESETS = [
  "Ekstra time",
  "Ekstra højtaler",
  "Uplights",
  "Trådløs mikrofon",
  "Røgmaskine",
  "Moving heads",
  "Fotobooth",
  "Konfetti-kanon",
  "MC / vært",
  "Pakketransport > 50 km",
];

const DRAFT_KEY = "djconnect.djsignup.draft";

export function DJSignupPage() {
  const { signUpWithPassword, isConfigured, mockLogin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [profilePhoto, setProfilePhoto] = useState<FileWithPreview[]>([]);
  const [galleryPhotos, setGalleryPhotos] = useState<FileWithPreview[]>([]);

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [restored, setRestored] = useState(false);
  const [stageNameState, setStageNameState] = useState<
    "idle" | "checking" | "available" | "taken"
  >("idle");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [accountSubStep, setAccountSubStep] = useState<0 | 1>(0);
  const [experienceSubStep, setExperienceSubStep] = useState<0 | 1 | 2>(0);
  const [pricingSubStep, setPricingSubStep] = useState<0 | 1>(0);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as {
          draft: Partial<Draft>;
          step: number;
          completed: number[];
        };
        // Spread EMPTY_DRAFT first so any new fields added since the
        // draft was saved get sensible defaults.
        setDraft({ ...EMPTY_DRAFT, ...parsed.draft, password: "" });
        const restoredStep = Math.min(
          STEPS.length - 1,
          Math.max(0, parsed.step ?? 0),
        );
        setStep(restoredStep);
        setCompleted(
          new Set((parsed.completed ?? []).filter((i) => i < STEPS.length)),
        );
        setRestored(true);
      }
    } catch {
      /* ignore corrupt draft */
    }
  }, []);

  useEffect(() => {
    const { password: _password, ...rest } = draft;
    void _password;
    try {
      localStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          // Strip package images (data URLs) so a large upload can't blow
          // the localStorage quota and crash the draft autosave.
          draft: {
            ...rest,
            password: "",
            packages: rest.packages.map((p) => ({ ...p, image: "" })),
          },
          step,
          completed: Array.from(completed),
        }),
      );
    } catch {
      /* storage full or blocked — autosave is best-effort */
    }
  }, [draft, step, completed]);

  useEffect(() => {
    if (!draft.stageName) {
      setStageNameState("idle");
      return;
    }
    setStageNameState("checking");
    const t = setTimeout(() => {
      const taken = ["dj snake", "tiesto", "calvin harris", "dj khaled"];
      setStageNameState(
        taken.includes(draft.stageName.toLowerCase()) ? "taken" : "available",
      );
    }, 600);
    return () => clearTimeout(t);
  }, [draft.stageName]);

  const profilePhotoUrl = profilePhoto[0]?.preview ?? null;
  const bioMin = 100;
  const bioPct = Math.min(100, Math.round((draft.bio.length / bioMin) * 100));
  const pwStrength = passwordStrength(draft.password);

  const passesStep = useMemo(
    () =>
      validateStep(
        step,
        draft,
        profilePhoto,
        [],
        stageNameState,
      ),
    [step, draft, profilePhoto, stageNameState],
  );

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
    if (typeof window !== "undefined")
      window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function advance() {
    // Handle sub-steps within step 0 (account)
    if (step === 0 && accountSubStep === 0) {
      if (draft.firstName.trim().length < 2) {
        toast.error("Fornavn er påkrævet");
        return;
      }
      if (draft.lastName.trim().length < 2) {
        toast.error("Efternavn er påkrævet");
        return;
      }
      if (!draft.stageName.trim()) {
        toast.error("DJ-navn er påkrævet");
        return;
      }
      if (!draft.city.trim()) {
        toast.error("By er påkrævet");
        return;
      }
      setAccountSubStep(1);
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Handle sub-steps within step 2 (experience)
    if (step === 2 && experienceSubStep === 0) {
      if (!draft.yearsExperience) {
        toast.error("Vælg antal års erfaring");
        return;
      }
      setExperienceSubStep(1);
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    if (step === 2 && experienceSubStep === 1) {
      // Links sub-step — no mandatory fields, just advance
      setExperienceSubStep(2);
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    // Handle sub-steps within step 3 (pricing)
    if (step === 3 && pricingSubStep === 0) {
      // Explainer sub-step — no mandatory fields, just advance
      setPricingSubStep(1);
      if (typeof window !== "undefined")
        window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    if (!passesStep.ok) {
      toast.error(passesStep.reason ?? "Udfyld venligst dette trin");
      return;
    }
    setCompleted((c) => new Set(c).add(step));
    if (step < STEPS.length - 1) goTo(step + 1);
  }

  async function submitApplication() {
    if (!passesStep.ok) {
      toast.error(passesStep.reason ?? "Udfyld venligst dette trin");
      return;
    }
    setLoading(true);
    try {
      if (isConfigured) {
        await signUpWithPassword({
          fullName: `${draft.firstName} ${draft.lastName}`.trim(),
          email: draft.email,
          password: draft.password,
          role: "dj",
        });
      }

      const profilePhotoDataUrl = profilePhoto[0]
        ? ((await fileToDataUrl(profilePhoto[0])) ?? undefined)
        : undefined;
      const equipmentPhotoDataUrls: string[] = [];

      writeDemoDJProfile({
        createdAt: new Date().toISOString(),
        fullName: `${draft.firstName} ${draft.lastName}`.trim(),
        email: draft.email,
        phone: draft.phone || undefined,
        city: draft.city,
        country: "Denmark",
        stageName: draft.stageName,
        bio: draft.bio,
        yearsExperience: draft.yearsExperience,
        eventTypes: draft.eventTypes,
        equipmentOwned: draft.equipmentOwned,
        equipmentPresets: draft.equipmentPresets,
        equipmentDescription: draft.equipmentDescription,
        setupSize: draft.setupSize,
        eventsPerformed: draft.eventsPerformed,
        notableClients: draft.notableClients,
        profilePhotoDataUrl,
        equipmentPhotoDataUrls,
      });

      setCompleted((c) => new Set(c).add(step));
      setSubmitted(true);
      fireConfetti();
      localStorage.removeItem(DRAFT_KEY);

      if (isConfigured) {
        setTimeout(() => navigate("/dj/pending-verification"), 2800);
      } else {
        setTimeout(() => {
          let loggedIn = false;
          try {
            mockLogin("dj");
            loggedIn = true;
          } catch {
            // localStorage may be full or blocked — fall back to /login.
          }
          if (loggedIn) {
            navigate("/dj/dashboard");
          } else {
            toast.error(
              "Din profil er oprettet, men vi kunne ikke automatisk logge dig ind i denne browser. Log venligst manuelt ind.",
            );
            navigate("/login");
          }
        }, 1800);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Indsendelse fejlede");
      setLoading(false);
    }
  }

  const isLastStep = step === STEPS.length - 1;
  const currentStep = STEPS[step]!;
  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="flex min-h-[100dvh] flex-col bg-gradient-to-b from-amber-50/30 via-background to-background">
      {/* Top bar — mirrors the /get-offers wizard chrome: brand on the
          left, centred step counter + progress bar, secondary actions on
          the right. The page owns the full screen (no site header/footer)
          so the funnel reads as a guided flow rather than a generic page. */}
      <header className="sticky top-0 z-30 border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-2 font-semibold">
            <BrandMark size="sm" />
            <span className="hidden text-base tracking-tight sm:inline">
              DJConnect
            </span>
            <span className="ml-1 hidden rounded-full bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent sm:inline">
              DJ-onboarding
            </span>
          </Link>

          <div className="flex flex-1 items-center justify-center gap-3 px-2">
            <span className="hidden text-xs font-medium text-muted-foreground sm:inline">
              Trin {step + 1} af {STEPS.length}
            </span>
            <div className="relative h-1.5 w-full max-w-md overflow-hidden rounded-full bg-amber-100/60">
              <motion.div
                className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-accent to-amber-400"
                initial={false}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
            <span className="text-xs font-medium tabular-nums text-muted-foreground">
              {pct}%
            </span>
          </div>

          <div className="flex items-center gap-2">
            {restored && (
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="hidden items-center gap-1 text-xs text-muted-foreground md:inline-flex"
              >
                <Check className="h-3 w-3 text-accent" /> Kladde gendannet
              </motion.span>
            )}
            <Link
              to="/login"
              className="hidden text-xs text-muted-foreground underline-offset-4 hover:underline sm:inline"
            >
              Log ind
            </Link>
            <Button asChild variant="ghost" size="icon" aria-label="Luk">
              <Link to="/">
                <X className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Body — main content on the left, contextual right rail. The
          right rail shows the live DJ card preview ONLY on the final
          step (Profil & billeder); every earlier step shows a tip card
          that explains why we're asking for that step's information so
          the form feels less transactional. */}
      <main className="flex-1">
        <div className="container grid gap-6 py-8 md:py-10 xl:grid-cols-[minmax(0,1fr)_320px] xl:gap-10">
          <section className="min-w-0">
            <div className="rounded-2xl border bg-background shadow-sm">
              <div className="relative overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={step}
                    initial={{ opacity: 0, x: direction * 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: direction * -30 }}
                    transition={{
                      duration: 0.32,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="p-6 md:p-8"
                  >
                    {step === 0 && (
                      <StepAccount
                        draft={draft}
                        update={update}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        pwStrength={pwStrength}
                        subStep={accountSubStep}
                        stageNameState={stageNameState}
                      />
                    )}
                    {step === 1 && <StepHowItWorks />}
                    {step === 2 && (
                      <StepExperience
                        draft={draft}
                        update={update}
                        subStep={experienceSubStep}
                      />
                    )}
                    {step === 3 && (
                      <StepPricing
                        draft={draft}
                        update={update}
                        subStep={pricingSubStep}
                      />
                    )}
                    {step === 4 && (
                      <StepProfile
                        draft={draft}
                        update={update}
                        stageNameState={stageNameState}
                        bioPct={bioPct}
                        bioMin={bioMin}
                        profilePhoto={profilePhoto}
                        setProfilePhoto={setProfilePhoto}
                        galleryPhotos={galleryPhotos}
                        setGalleryPhotos={setGalleryPhotos}
                      />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>

              <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur md:px-8">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    if (step === 0 && accountSubStep === 1) {
                      setAccountSubStep(0);
                    } else if (step === 2 && experienceSubStep > 0) {
                      setExperienceSubStep((experienceSubStep - 1) as 0 | 1 | 2);
                    } else if (step === 3 && pricingSubStep === 1) {
                      setPricingSubStep(0);
                    } else if (step > 0) {
                      goTo(step - 1);
                    }
                  }}
                  disabled={step === 0 && accountSubStep === 0}
                >
                  <ChevronLeft className="h-4 w-4" /> Tilbage
                </Button>

                <div className="hidden items-center gap-2 text-xs text-muted-foreground md:flex">
                  <Lock className="h-3.5 w-3.5" /> Data krypteret · Kladde
                  gemmes
                </div>

                {!isLastStep ? (
                  <Button
                    type="button"
                    variant="accent"
                    size="lg"
                    onClick={advance}
                    disabled={loading}
                    className={cn(
                      "min-w-[140px]",
                      passesStep.ok && "shadow-lg shadow-accent/30",
                    )}
                  >
                    Næste <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    type="button"
                    variant="accent"
                    size="lg"
                    onClick={submitApplication}
                    disabled={loading || submitted}
                    className="min-w-[180px] shadow-lg shadow-accent/40"
                  >
                    {submitted ? (
                      <>
                        <PartyPopper className="h-4 w-4" /> Sendt!
                      </>
                    ) : loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" /> Sender…
                      </>
                    ) : (
                      <>
                        Send ansøgning <Rocket className="h-4 w-4" />
                      </>
                    )}
                  </Button>
                )}
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
              <span>
                Brug for hjælp?{" "}
                <a
                  href="mailto:support@djconnect.example"
                  className="underline-offset-4 hover:underline"
                >
                  support@djconnect.example
                </a>
              </span>
              <span>
                Bliv en del af <b className="text-foreground">124</b>{" "}
                verificerede DJs.
              </span>
            </div>
          </section>

          <aside className="hidden xl:block">
            {isLastStep ? (
              <LivePreview
                stageName={draft.stageName}
                city={draft.city}
                country="Denmark"
                bio={draft.bio}
                yearsExperience={draft.yearsExperience}
                eventTypes={draft.eventTypes}
                setupSize={draft.setupSize}
                profilePhotoUrl={profilePhotoUrl}
              />
            ) : (
              <TipsPanel stepId={currentStep.id} />
            )}
          </aside>
        </div>
      </main>

      <AnimatePresence>
        {submitted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-primary/70 backdrop-blur"
          >
            <motion.div
              initial={{ scale: 0.85, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="mx-4 max-w-md rounded-2xl border border-white/10 bg-background p-8 text-center shadow-2xl"
            >
              <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-accent/15 text-accent">
                <Rocket className="h-8 w-8" />
              </span>
              <h3 className="mt-5 text-2xl font-semibold">Du er på listen!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Vi gennemgår din ansøgning inden for 2 hverdage og sender en
                mail til <b>{draft.email}</b>.
              </p>
              <p className="mt-5 text-xs text-muted-foreground">
                Sender dig videre…
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 1 — Opret konto                                                */
/* ------------------------------------------------------------------ */

type AccountProps = {
  draft: Draft;
  update: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  pwStrength: { score: number; label: string; color: string };
  subStep: 0 | 1;
  stageNameState: "idle" | "checking" | "available" | "taken";
};

function StepAccount({
  draft,
  update,
  showPassword,
  setShowPassword,
  pwStrength,
  subStep,
  stageNameState,
}: AccountProps) {
  if (subStep === 0) {
    return (
      <div className="space-y-6">
        <Header
          icon={User2}
          eyebrow="Trin 1a"
          title="Om dig"
          subtitle="Fortæl os lidt om dig selv, så kunder kan finde dig."
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Fornavn" hint="Dit fornavn">
            <Input
              value={draft.firstName}
              onChange={(e) => update("firstName", e.target.value)}
              placeholder="fx Alex"
            />
          </Field>
          <Field label="Efternavn" hint="Dit efternavn">
            <Input
              value={draft.lastName}
              onChange={(e) => update("lastName", e.target.value)}
              placeholder="fx Morgan"
            />
          </Field>
          <Field label="DJ-navn" hint="Dit kunstnernavn som DJ">
            <div className="relative">
              <Input
                value={draft.stageName}
                onChange={(e) => update("stageName", e.target.value)}
                placeholder="fx DJ Flash"
                className={cn(
                  stageNameState === "taken" && "border-destructive",
                  stageNameState === "available" && "border-green-500",
                )}
              />
              {stageNameState === "checking" && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
              )}
              {stageNameState === "available" && (
                <Check className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-green-500" />
              )}
              {stageNameState === "taken" && (
                <X className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-destructive" />
              )}
            </div>
            {stageNameState === "taken" && (
              <p className="text-xs text-destructive">Navnet er allerede taget</p>
            )}
          </Field>
          <Field label="By" hint="Hvilken by bor du i?">
            <Input
              value={draft.city}
              onChange={(e) => update("city", e.target.value)}
              placeholder="København"
            />
          </Field>
        </div>
      </div>
    );
  }

  // subStep === 1
  return (
    <div className="space-y-6">
      <Header
        icon={User2}
        eyebrow="Trin 1b"
        title="Login & kontakt"
        subtitle="Vi bruger oplysningerne til at logge dig ind og kontakte dig om bookinger."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Email" hint="Vi sender et bekræftelseslink">
          <Input
            type="email"
            autoComplete="email"
            value={draft.email}
            onChange={(e) => update("email", e.target.value)}
            placeholder="dig@domæne.dk"
          />
        </Field>

        <Field label="Telefon" hint="Kun til akut kontakt på eventdagen">
          <Input
            type="tel"
            value={draft.phone}
            onChange={(e) => update("phone", e.target.value)}
            placeholder="+45 …"
          />
        </Field>

        <Field
          label="Adgangskode"
          hint="Mindst 8 tegn — gerne med tal og symboler"
        >
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              autoComplete="new-password"
              value={draft.password}
              onChange={(e) => update("password", e.target.value)}
              className="pr-10"
            />
            <button
              type="button"
              className="absolute inset-y-0 right-0 flex items-center px-3 text-muted-foreground hover:text-foreground"
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Skjul adgangskode" : "Vis adgangskode"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {draft.password && (
            <div className="mt-2">
              <div className="grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={{
                      backgroundColor:
                        i < pwStrength.score
                          ? pwStrength.color
                          : "hsl(214, 32%, 91%)",
                    }}
                    className="h-1 rounded-full"
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                {pwStrength.label}
              </p>
            </div>
          )}
        </Field>

        <Field label="Gentag adgangskode" hint="Bekræft din adgangskode">
          <Input
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            value={draft.confirmPassword}
            onChange={(e) => update("confirmPassword", e.target.value)}
            className={cn(
              draft.confirmPassword &&
                draft.confirmPassword !== draft.password &&
                "border-destructive",
            )}
          />
          {draft.confirmPassword && draft.confirmPassword !== draft.password && (
            <p className="text-xs text-destructive">Adgangskoderne matcher ikke</p>
          )}
        </Field>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 2 — Sådan fungerer det                                         */
/* ------------------------------------------------------------------ */

function StepHowItWorks() {
  const points: Array<{
    icon: typeof Shield;
    title: string;
    body: string;
  }> = [
    {
      icon: Shield,
      title: "Escrow-beskyttet betaling",
      body: "Kunden betaler op front. Pengene står sikkert hos os indtil 24 timer efter eventet — så bliver de frigivet til dig.",
    },
    {
      icon: HeartHandshake,
      title: "Hurtige udbetalinger",
      body: "Pengene lander på din bankkonto inden for 2-5 hverdage efter eventet, via Stripe Connect.",
    },
    {
      icon: BadgeCheck,
      title: "Verificeret profil",
      body: "Vi tjekker dit udstyr og dine referencer — så kunderne ved præcis hvad de booker, og du får et 'Verified'-badge.",
    },
    {
      icon: Trophy,
      title: "Ingen provision på de første 5",
      body: "Dine første 5 bookinger er provisionsfrie. Du beholder 100% af din pris. Derefter 8% i serviceafgift.",
    },
  ];

  const flow: Array<{ n: number; title: string; body: string }> = [
    {
      n: 1,
      title: "Kunden sender en forespørgsel",
      body: "Kunden vælger dato, by og eventtype — du modtager forespørgslen direkte i dit DJ-panel.",
    },
    {
      n: 2,
      title: "Du sender et personligt tilbud",
      body: "Du svarer inden for 24 timer med din pris og pakke. Ingen budrunde, intet spam.",
    },
    {
      n: 3,
      title: "Kunden booker & betaler",
      body: "Når kunden accepterer, går pengene i escrow. Booking-detaljerne lander automatisk i din kalender.",
    },
    {
      n: 4,
      title: "Du spiller — vi udbetaler",
      body: "Spil dit set. 24 timer efter eventet udbetales pengene til din konto.",
    },
  ];

  return (
    <div className="space-y-8">
      <Header
        icon={Compass}
        eyebrow="Trin 2"
        title="Sådan fungerer det"
        subtitle="Vi har bygget DJConnect, så du kan fokusere på det du er god til — spille for fyldte gulve. Her er hvordan platformen fungerer for dig:"
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {points.map((p, i) => (
          <motion.div
            key={p.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="flex items-start gap-3 rounded-xl border bg-card p-4"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
              <p.icon className="h-4 w-4" />
            </span>
            <div>
              <div className="text-sm font-semibold">{p.title}</div>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                {p.body}
              </p>
            </div>
          </motion.div>
        ))}
      </div>

      <div>
        <div className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Fra forespørgsel til udbetaling
        </div>
        <ol className="space-y-3">
          {flow.map((s, i) => (
            <motion.li
              key={s.n}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i }}
              className="flex items-start gap-3 rounded-xl border bg-background p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border bg-accent/10 text-xs font-semibold text-accent">
                {s.n}
              </span>
              <div>
                <div className="text-sm font-semibold">{s.title}</div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                  {s.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>

      <div className="rounded-xl border border-accent/30 bg-accent/5 p-4 text-sm">
        <div className="flex items-start gap-2">
          <Info className="mt-0.5 h-4 w-4 text-accent" />
          <p className="text-xs leading-relaxed text-foreground/80">
            <b className="text-foreground">Næste:</b> fortæl os om din erfaring
            og dit mobildiskotek. Det tager 3-4 minutter og giver dig et
            bedre match i søgeresultaterne.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 3 — DJ Erfaring & Mobildiskotek                                */
/* ------------------------------------------------------------------ */

const EVENT_COUNT_OPTIONS = [
  { id: "none", label: "Ingen erfaring" },
  { id: "1-5", label: "1–5" },
  { id: "5+", label: "+5" },
  { id: "10+", label: "+10" },
  { id: "20+", label: "+20" },
  { id: "50+", label: "+50" },
];

const CAPACITY_OPTIONS = [
  { id: "small", label: "Op til 50" },
  { id: "medium", label: "50–100" },
  { id: "large", label: "100–200" },
  { id: "xlarge", label: "200+" },
];

type ExperienceProps = {
  draft: Draft;
  update: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  subStep: 0 | 1 | 2;
};

function StepExperience({
  draft,
  update,
  subStep,
}: ExperienceProps) {
  if (subStep === 0) {
    return (
      <div className="space-y-8">
        <Header
          icon={Speaker}
          eyebrow="Trin 3a"
          title="DJ Erfaring"
          subtitle="Fortæl os om din erfaring som DJ, så vi kan matche dig med de rette kunder."
        />

        <section className="space-y-5">
          <div>
            <div className="mb-2 text-sm font-medium">
              Antal år som DJ
            </div>
            <OptionCards
              options={EXPERIENCE_YEARS.map((y) => ({ id: y.id, label: y.label }))}
              value={draft.yearsExperience}
              onChange={(v) => update("yearsExperience", v as string)}
              columns={4}
            />
          </div>

          <SectionDivider icon={Trophy} label="Antal events spillet pr. kategori" />

          <div className="space-y-4">
            <div>
              <div className="mb-2 text-sm font-medium">Bryllupper</div>
              <OptionCards
                options={EVENT_COUNT_OPTIONS}
                value={draft.eventsWeddings}
                onChange={(v) => update("eventsWeddings", v as string)}
                columns={3}
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">Privat voksen fester</div>
              <p className="mb-2 text-xs text-muted-foreground">Fødselsdage, jubilæumer etc.</p>
              <OptionCards
                options={EVENT_COUNT_OPTIONS}
                value={draft.eventsPrivateAdult}
                onChange={(v) => update("eventsPrivateAdult", v as string)}
                columns={3}
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">Firmafester</div>
              <p className="mb-2 text-xs text-muted-foreground">Firma-events, julefrokoster etc.</p>
              <OptionCards
                options={EVENT_COUNT_OPTIONS}
                value={draft.eventsCorporate}
                onChange={(v) => update("eventsCorporate", v as string)}
                columns={3}
              />
            </div>
            <div>
              <div className="mb-2 text-sm font-medium">Ungdomsfester</div>
              <p className="mb-2 text-xs text-muted-foreground">Konfirmationer, studenterfester etc.</p>
              <OptionCards
                options={EVENT_COUNT_OPTIONS}
                value={draft.eventsYouth}
                onChange={(v) => update("eventsYouth", v as string)}
                columns={3}
              />
            </div>
          </div>
        </section>
      </div>
    );
  }

  if (subStep === 1) {
    return (
      <div className="space-y-8">
        <Header
          icon={Speaker}
          eyebrow="Trin 3b"
          title="Hvor kan vi se dit DJ arbejde?"
          subtitle="Tilføj links til dine profiler så kunder kan se dit arbejde. Alle felter er valgfrie."
        />

        <section className="space-y-5">
          <SectionDivider icon={Speaker} label="Sociale medier" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Instagram" hint="Link til din Instagram-profil">
              <Input
                value={draft.linkInstagram}
                onChange={(e) => update("linkInstagram", e.target.value)}
                placeholder="https://instagram.com/dit-dj-navn"
              />
            </Field>
            <Field label="Facebook Page" hint="Link til din Facebook-side">
              <Input
                value={draft.linkFacebook}
                onChange={(e) => update("linkFacebook", e.target.value)}
                placeholder="https://facebook.com/dit-dj-navn"
              />
            </Field>
          </div>

          <SectionDivider icon={Speaker} label="Hjemmesider & platforme" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hjemmeside" hint="Din egen hjemmeside">
              <Input
                value={draft.linkWebsite}
                onChange={(e) => update("linkWebsite", e.target.value)}
                placeholder="https://dit-dj-navn.dk"
              />
            </Field>
            <Field label="Eventzonen" hint="Din Eventzonen-profil">
              <Input
                value={draft.linkEventzonen}
                onChange={(e) => update("linkEventzonen", e.target.value)}
                placeholder="https://eventzonen.dk/dit-dj-navn"
              />
            </Field>
          </div>

          <SectionDivider icon={Star} label="Reviews" />
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Trustpilot" hint="Din Trustpilot-side">
              <Input
                value={draft.linkTrustpilot}
                onChange={(e) => update("linkTrustpilot", e.target.value)}
                placeholder="https://trustpilot.com/review/dit-firma"
              />
            </Field>
            <Field label="Google Reviews" hint="Link til dine Google-anmeldelser">
              <Input
                value={draft.linkGoogle}
                onChange={(e) => update("linkGoogle", e.target.value)}
                placeholder="https://g.page/dit-dj-navn"
              />
            </Field>
          </div>
        </section>
      </div>
    );
  }

  // subStep === 2 — Mobildiskotek
  return (
    <div className="space-y-8">
      <Header
        icon={Speaker}
        eyebrow="Trin 3c"
        title="Mobildiskotek"
        subtitle="Bekræft dit udstyr og dine ydelser som mobildiskotek-DJ."
      />

      <section className="space-y-5">
        <div
          className={cn(
            "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
            draft.equipmentOwned
              ? "border-accent bg-accent/5"
              : "border-border hover:border-accent/40",
          )}
          onClick={() => {
            const next = !draft.equipmentOwned;
            update("equipmentOwned", next);
            if (!next) update("equipmentTransport", false);
          }}
        >
          <Checkbox
            checked={draft.equipmentOwned}
            onCheckedChange={(v) => {
              update("equipmentOwned", !!v);
              if (!v) update("equipmentTransport", false);
            }}
            className="mt-0.5"
            onClick={(e) => e.stopPropagation()}
          />
          <div>
            <div className="text-sm font-medium">
              Jeg ejer eller har adgang til eget mobildiskotek
            </div>
            <div className="text-xs text-muted-foreground">
              Decks, mixer, højtalere, kabler, basis-lys — alt der skal til for at køre et event.
            </div>
          </div>
        </div>

        {draft.equipmentOwned && (
          <div
            className={cn(
              "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
              draft.equipmentTransport
                ? "border-accent bg-accent/5"
                : "border-border hover:border-accent/40",
            )}
            onClick={() => update("equipmentTransport", !draft.equipmentTransport)}
          >
            <Checkbox
              checked={draft.equipmentTransport}
              onCheckedChange={(v) => update("equipmentTransport", !!v)}
              className="mt-0.5"
              onClick={(e) => e.stopPropagation()}
            />
            <div>
              <div className="text-sm font-medium">
                Jeg er indforstået med, at de fleste events kræver, at jeg selv
                står for transport, opsætning og nedpakning af alt udstyret
              </div>
              <div className="text-xs text-muted-foreground">
                Du møder op i god tid, gør klar inden gæsterne ankommer og pakker
                ned igen efter eventet.
              </div>
            </div>
          </div>
        )}

        <div>
          <div className="mb-2 text-sm font-medium">
            Hvor mange mennesker kan dit mobildiskotek håndtere?
          </div>
          <OptionCards
            options={CAPACITY_OPTIONS}
            value={draft.equipmentCapacity}
            onChange={(v) => update("equipmentCapacity", v as string)}
            columns={4}
          />
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 4 — Pris & ydelser                                             */
/* ------------------------------------------------------------------ */

type PricingProps = {
  draft: Draft;
  update: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  subStep: 0 | 1;
};

const PACKAGE_EXAMPLES = [
  {
    title: "Lille pakke",
    guests: "Op til 75 gæster",
    example: "Lyd + basis-lys til en mindre fest, fx en rund fødselsdag.",
  },
  {
    title: "Mellem pakke",
    guests: "Omkring 75–125 gæster",
    example:
      "Kraftigere anlæg, festbelysning og trådløs mikrofon til en firmafest.",
  },
  {
    title: "Stor pakke",
    guests: "100–200 gæster",
    example:
      "Stort lydanlæg, moving heads og røgmaskine til en stor fest eller galla.",
  },
];

const EXAMPLE_HOURS = 5;

function formatDKK(n: number) {
  return new Intl.NumberFormat("da-DK").format(n);
}

function StepPricing({ draft, update, subStep }: PricingProps) {
  function toggleAddOn(id: string) {
    const next = draft.addOns.includes(id)
      ? draft.addOns.filter((a) => a !== id)
      : [...draft.addOns, id];
    update("addOns", next);
  }

  function updatePackage<K extends keyof DJPackage>(
    id: string,
    field: K,
    value: DJPackage[K],
  ) {
    update(
      "packages",
      draft.packages.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  }

  function addPackage() {
    if (draft.packages.length >= 3) return;
    update("packages", [...draft.packages, makePackage()]);
  }

  function removePackage(id: string) {
    update(
      "packages",
      draft.packages.filter((p) => p.id !== id),
    );
  }

  async function setPackageImage(id: string, file: File | undefined) {
    if (!file) {
      updatePackage(id, "image", "");
      return;
    }
    const dataUrl = await fileToDataUrl(file);
    if (dataUrl) updatePackage(id, "image", dataUrl);
  }

  if (subStep === 0) {
    return (
      <div className="space-y-8">
        <Header
          icon={Coins}
          eyebrow="Trin 4"
          title="Pris & ydelser"
          subtitle="Sådan fungerer pakke-modellen på DJConnect. Læs den igennem — på næste side sætter du din pris og vælger dine tilkøb."
        />

        <section className="space-y-4">
          <SectionDivider icon={Speaker} label="Dine egne pakkeløsninger" />
          <p className="text-sm leading-relaxed text-muted-foreground">
            Du specificerer selv dine mobildiskotek-pakkeløsninger — du kan
            oprette op til 3. Hver pakkeløsning skal altid defineres ud fra hvor
            mange gæster den passer til.
          </p>

          <div className="space-y-3">
            {PACKAGE_EXAMPLES.map((pkg, i) => (
              <div
                key={pkg.title}
                className="flex items-start gap-3 rounded-xl border border-dashed border-border p-4"
              >
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-medium">{pkg.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {pkg.guests}
                  </div>
                  <div className="mt-1 text-xs text-muted-foreground/80">
                    <span className="font-medium text-foreground/70">
                      Eksempel:
                    </span>{" "}
                    {pkg.example}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground/80">
            Eksemplerne er kun til inspiration — du sætter selv gæsteantal,
            indhold og pris for hver pakke.
          </p>
        </section>

        <section className="space-y-3">
          <SectionDivider icon={Sparkles} label="Event-specifikke pakker" />
          <div className="rounded-xl border border-accent/40 bg-accent/5 p-4">
            <div className="text-sm font-medium">
              Pakker målrettet bestemte events
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Udover dine generelle pakkeløsninger kan du også lave specifikke
              mobildiskotek-pakker til bestemte events — fx bryllupper — og andre
              specifikke event-typer.
            </p>
            <div className="mt-2 text-xs leading-relaxed text-muted-foreground/80">
              <span className="font-medium text-foreground/70">Eksempel:</span>{" "}
              <b>Bryllupspakke</b> (op til 120 gæster) — ceremoni-lyd, trådløs
              mikrofon til talerne, festbelysning og DJ til natten.
            </div>
          </div>
        </section>

        <div className="flex items-start gap-3 rounded-xl border border-border bg-muted/30 p-4">
          <Info className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <p className="text-xs leading-relaxed text-foreground/80">
            <b className="text-foreground">Vigtigt:</b> Alle pakkeløsninger skal
            altid angives i forhold til antal gæster.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <Header
        icon={Coins}
        eyebrow="Trin 4"
        title="Pris & ydelser"
        subtitle="Sæt din pris og dine pakker. Du kan ændre alt senere fra dit DJ-panel — det her er bare en start."
      />

      <section className="space-y-4">
        <SectionDivider icon={Coins} label="Din timepris" />
        <p className="text-xs text-muted-foreground">
          Din timepris er den samme for alle dine pakkeløsninger. Pakkeprisen
          dækker selve mobildiskotek-setuppet, og timeprisen lægges oveni for
          hver time du spiller.
        </p>
        <div className="sm:max-w-xs">
          <Field label="Timepris (DKK)" hint="Gælder alle pakkeløsninger">
            <Input
              type="number"
              min={0}
              value={draft.hourlyRate}
              onChange={(e) => update("hourlyRate", e.target.value)}
              placeholder="1200"
            />
          </Field>
        </div>
      </section>

      <section className="space-y-4">
        <SectionDivider icon={Speaker} label="Dine pakkeløsninger" />
        <p className="text-xs text-muted-foreground">
          Opret op til 3 pakkeløsninger (mobildiskotek-størrelser). For hver
          pakke angiver du gæsteantal (ca. fra–til) og en pakkepris for
          setuppet.
        </p>

        <div className="space-y-4">
          <AnimatePresence initial={false}>
            {draft.packages.map((pkg, i) => {
              const pkgPrice = Number(pkg.packagePrice) || 0;
              const hourly = Number(draft.hourlyRate) || 0;
              const hourlyTotal = hourly * EXAMPLE_HOURS;
              const total = pkgPrice + hourlyTotal;
              return (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="rounded-xl border border-border p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <div className="text-sm font-semibold">
                      Pakkeløsning {i + 1}
                    </div>
                    {draft.packages.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePackage(pkg.id)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" /> Fjern
                      </button>
                    )}
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <Field label="Gæster fra (ca.)" hint="Mindste antal gæster">
                      <Input
                        type="number"
                        min={0}
                        value={pkg.guestsFrom}
                        onChange={(e) =>
                          updatePackage(pkg.id, "guestsFrom", e.target.value)
                        }
                        placeholder="20"
                      />
                    </Field>
                    <Field label="Gæster til (ca.)" hint="Største antal gæster">
                      <Input
                        type="number"
                        min={0}
                        value={pkg.guestsTo}
                        onChange={(e) =>
                          updatePackage(pkg.id, "guestsTo", e.target.value)
                        }
                        placeholder="75"
                      />
                    </Field>
                    <Field
                      label="Pakkepris (DKK)"
                      hint="Setup-pris for mobildiskoteket"
                    >
                      <Input
                        type="number"
                        min={0}
                        value={pkg.packagePrice}
                        onChange={(e) =>
                          updatePackage(pkg.id, "packagePrice", e.target.value)
                        }
                        placeholder="6500"
                      />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <Field
                      label="Hvad er inkluderet?"
                      hint="Kort beskrivelse af hvad pakken indeholder"
                    >
                      <Textarea
                        rows={2}
                        value={pkg.included}
                        onChange={(e) =>
                          updatePackage(pkg.id, "included", e.target.value)
                        }
                        placeholder="fx lydanlæg, basis-lys, trådløs mikrofon og DJ til hele aftenen"
                      />
                    </Field>
                  </div>

                  <div className="mt-4">
                    <PackageImageField
                      value={pkg.image}
                      onSelect={(file) => setPackageImage(pkg.id, file)}
                      onClear={() => setPackageImage(pkg.id, undefined)}
                    />
                  </div>

                  {(pkgPrice > 0 || hourly > 0) && (
                    <div className="mt-3 rounded-lg border border-accent/30 bg-accent/5 p-3">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                        <Info className="h-3.5 w-3.5 text-accent" />
                        Eksempel · event på {EXAMPLE_HOURS} timer
                      </div>
                      <div className="mt-1.5 space-y-1 text-xs text-muted-foreground">
                        <div className="flex justify-between">
                          <span>Pakkepris (setup)</span>
                          <span className="text-foreground">
                            {formatDKK(pkgPrice)} kr
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            Timepris ({EXAMPLE_HOURS} t × {formatDKK(hourly)} kr)
                          </span>
                          <span className="text-foreground">
                            {formatDKK(hourlyTotal)} kr
                          </span>
                        </div>
                        <div className="mt-1 flex justify-between border-t border-border pt-1.5">
                          <span className="font-medium text-foreground">
                            Total for {EXAMPLE_HOURS} timer
                          </span>
                          <span className="font-semibold text-foreground">
                            {formatDKK(total)} kr
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>

          {draft.packages.length < 3 && (
            <button
              type="button"
              onClick={addPackage}
              className="inline-flex w-full items-center justify-center gap-1.5 rounded-xl border border-dashed border-border px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:border-accent/40 hover:text-foreground"
            >
              <Plus className="h-4 w-4" /> Tilføj pakkeløsning ({draft.packages.length}/3)
            </button>
          )}

          <p className="flex items-start gap-1.5 text-xs text-muted-foreground">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-accent" />
            Du kan også oprette eller redigere dine pakkeløsninger på et senere
            tidspunkt fra dit DJ-panel.
          </p>
        </div>
      </section>

      <section className="space-y-3">
        <SectionDivider icon={Plus} label="Tilkøb du tilbyder" />
        <p className="text-xs text-muted-foreground">
          Vælg de tilkøb du tilbyder. Du sætter prisen pr. tilkøb i dit
          DJ-panel når du er kommet ind.
        </p>
        <div className="flex flex-wrap gap-2">
          {ADDON_PRESETS.map((addon) => {
            const selected = draft.addOns.includes(addon);
            return (
              <motion.button
                key={addon}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => toggleAddOn(addon)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selected
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background hover:border-accent/40",
                )}
              >
                {selected ? (
                  <Check className="h-3 w-3" />
                ) : (
                  <Plus className="h-3 w-3" />
                )}
                {addon}
              </motion.button>
            );
          })}
        </div>
      </section>

      <section className="rounded-xl border bg-gradient-to-br from-muted/40 via-background to-background p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-md">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Shield className="h-4 w-4 text-accent" /> Sådan får du betalt
            </div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Vi bruger Stripe Connect, så pengene går direkte til din
              bankkonto. DJConnect ser eller holder aldrig dine
              bank-detaljer. Du kan koble Stripe på nu eller efter første
              booking — det tager ~3 minutter.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() =>
              toast.info(
                "Stripe Connect åbner når din konto er oprettet. Vi sender dig tilbage hertil bagefter.",
              )
            }
          >
            Forbind Stripe <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Step 5 — Profil & billeder                                          */
/* ------------------------------------------------------------------ */

type ProfileProps = {
  draft: Draft;
  update: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  stageNameState: "idle" | "checking" | "available" | "taken";
  bioPct: number;
  bioMin: number;
  profilePhoto: FileWithPreview[];
  setProfilePhoto: (f: FileWithPreview[]) => void;
  galleryPhotos: FileWithPreview[];
  setGalleryPhotos: (f: FileWithPreview[]) => void;
};

function StepProfile({
  draft,
  update,
  stageNameState,
  bioPct,
  bioMin,
  profilePhoto,
  setProfilePhoto,
  galleryPhotos,
  setGalleryPhotos,
}: ProfileProps) {
  return (
    <div className="space-y-6">
      <Header
        icon={Camera}
        eyebrow="Trin 5"
        title="Profil & billeder"
        subtitle="Dette er hvad kunder ser når de browser efter DJs. Preview-kortet til højre opdaterer sig live."
      />

      <Field
        label="Kunstnernavn"
        hint="Sådan vil du fremstå på platformen"
      >
        <div className="relative">
          <Input
            value={draft.stageName}
            onChange={(e) => update("stageName", e.target.value)}
            placeholder="fx DJ Nova"
            className={cn(
              "pr-32",
              stageNameState === "taken" && "border-destructive",
              stageNameState === "available" && "border-emerald-500",
            )}
          />
          <div className="absolute inset-y-0 right-3 flex items-center gap-1 text-xs">
            {stageNameState === "checking" && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" /> tjekker…
              </span>
            )}
            {stageNameState === "available" && (
              <span className="flex items-center gap-1 text-emerald-600">
                <Check className="h-3 w-3" /> ledigt
              </span>
            )}
            {stageNameState === "taken" && (
              <span className="flex items-center gap-1 text-destructive">
                <X className="h-3 w-3" /> optaget
              </span>
            )}
          </div>
        </div>
      </Field>

      <FilePicker
        label="Profilbillede"
        hint="Vælg ét skarpt billede af dig eller dit setup"
        accept="image/*"
        max={1}
        value={profilePhoto}
        onChange={setProfilePhoto}
      />

      <FilePicker
        label="Galleri (valgfri)"
        hint="Op til 6 billeder fra dine sets — de vises på din profil"
        accept="image/*"
        max={6}
        value={galleryPhotos}
        onChange={setGalleryPhotos}
      />

      <Field
        label="Bio"
        hint={`Fortæl din historie — genre, vibe, det der gør dig uforglemmelig (mindst ${bioMin} tegn)`}
      >
        <Textarea
          rows={5}
          value={draft.bio}
          onChange={(e) => update("bio", e.target.value)}
          placeholder="Jeg har spillet bryllupper, firmafester og sommerfestivaler over hele Danmark i 8 år…"
        />
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              animate={{
                width: `${bioPct}%`,
                backgroundColor:
                  bioPct >= 100 ? "hsl(142,71%,45%)" : "hsl(21,90%,53%)",
              }}
              className="h-full"
            />
          </div>
          <span
            className={cn(
              "text-xs",
              bioPct >= 100 ? "text-emerald-600" : "text-muted-foreground",
            )}
          >
            {draft.bio.length} / {bioMin}
          </span>
        </div>
      </Field>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">Eventtyper du spiller</div>
          <div className="text-xs text-muted-foreground">
            {draft.eventTypes.length} valgt
          </div>
        </div>
        <OptionCards
          options={EVENT_TYPE_CARDS}
          value={draft.eventTypes}
          multiple
          onChange={(v) => update("eventTypes", v as string[])}
        />
      </div>

      <div className="rounded-xl border bg-accent/5 p-4 text-sm">
        <div className="flex items-start gap-2">
          <BadgeCheck className="mt-0.5 h-4 w-4 text-accent" />
          <div>
            <div className="font-medium">Hvad sker der nu?</div>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              Når du sender din ansøgning gennemgår vi den inden for 2
              hverdage. Du får en mail på <b>{draft.email || "din mail"}</b>{" "}
              når du er verificeret — og din profil går live med det
              samme.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* TipsPanel — right-rail "why we ask" content for steps 1-4           */
/* ------------------------------------------------------------------ */

type Tip = {
  icon: typeof Mail;
  title: string;
  body: string;
};

const TIPS: Record<string, { eyebrow: string; title: string; tips: Tip[] }> = {
  account: {
    eyebrow: "Hvorfor vi spørger",
    title: "Vi bruger kun det vi har brug for",
    tips: [
      {
        icon: Mail,
        title: "Din email",
        body: "Til booking-notifikationer og verificering. Vi sælger eller deler aldrig din mail.",
      },
      {
        icon: PhoneCall,
        title: "Dit telefonnummer",
        body: "Kun synligt for kunder efter de har booket dig — så de kan nå dig akut på selve dagen.",
      },
      {
        icon: Lock,
        title: "Sikker adgangskode",
        body: "Mindst 8 tegn. Vi gemmer adgangskoder krypteret og ser dem aldrig i klartekst.",
      },
    ],
  },
  "how-it-works": {
    eyebrow: "Det gode at vide",
    title: "Hvad gør DJConnect anderledes?",
    tips: [
      {
        icon: Shield,
        title: "Ingen forudbetaling",
        body: "Du betaler intet for at være på platformen. Vi tjener kun penge når du gør (8% efter dine første 5 bookinger).",
      },
      {
        icon: Star,
        title: "Verificerede kunder",
        body: "Alle bookinger går gennem escrow, så du ved at pengene er der inden du spiller.",
      },
      {
        icon: Lightbulb,
        title: "Læs på",
        body: "Tag et minut på dette trin — det er gratis indsigt i hvordan du får mest ud af platformen.",
      },
    ],
  },
  experience: {
    eyebrow: "Hvorfor det betyder noget",
    title: "Detaljerede profiler booker bedst",
    tips: [
      {
        icon: Trophy,
        title: "Mere erfaring = højere placering",
        body: "DJs med en udfyldt track record ranker højere i søgeresultater og får flere forespørgsler.",
      },
      {
        icon: Camera,
        title: "Udstyrsfotos øger konvertering",
        body: "Profiler med rig-fotos får op til 3× flere booking-forespørgsler end profiler uden.",
      },
      {
        icon: BadgeCheck,
        title: "Vi verificerer dit udstyr",
        body: "Når dit udstyr er bekræftet får du et 'Verified Gear'-badge der vises tydeligt på din profil.",
      },
    ],
  },
  pricing: {
    eyebrow: "Sæt prisen med selvtillid",
    title: "Du bestemmer — vi sikrer betalingen",
    tips: [
      {
        icon: Coins,
        title: "Din pris er din egen",
        body: "Ingen provision på dine første 5 bookinger. Du beholder 100% af det du tager.",
      },
      {
        icon: BadgeCheck,
        title: "Pakker booker hurtigere",
        body: "Faste pakkepriser booker 2× hurtigere end timepriser — kunder ved præcis hvad de får.",
      },
      {
        icon: Info,
        title: "Du kan ændre alt senere",
        body: "Justér dine takster, pakker og tilkøb når som helst fra dit DJ-panel.",
      },
    ],
  },
};

function TipsPanel({ stepId }: { stepId: string }) {
  const data = TIPS[stepId];
  if (!data) return null;
  return (
    <div className="sticky top-24">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground">
        <Lightbulb className="h-3.5 w-3.5 text-accent" />
        {data.eyebrow}
      </div>
      <div className="space-y-3 rounded-2xl border bg-card p-5 shadow-sm">
        <h3 className="text-base font-semibold leading-tight">{data.title}</h3>
        <ul className="space-y-3">
          {data.tips.map((tip, i) => (
            <motion.li
              key={tip.title}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 * i }}
              className="flex items-start gap-2.5"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-accent">
                <tip.icon className="h-3.5 w-3.5" />
              </span>
              <div>
                <div className="text-sm font-medium">{tip.title}</div>
                <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                  {tip.body}
                </p>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <ArrowRight className="h-3 w-3" />
        DJ-kortet vises på sidste trin
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

function Header({
  icon: Icon,
  eyebrow,
  title,
  subtitle,
}: {
  icon: React.ComponentType<{ className?: string }>;
  eyebrow: string;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
        <Icon className="h-5 w-5" />
      </span>
      <div>
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          {eyebrow}
        </div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
          {subtitle}
        </p>
      </div>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function PackageImageField({
  value,
  onSelect,
  onClear,
}: {
  value: string;
  onSelect: (file: File | undefined) => void;
  onClear: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <Label className="text-sm font-medium">Billede af opsætningen</Label>
      <p className="mt-0.5 text-xs text-muted-foreground">
        Vælg et billede der bedst visualiserer mobildiskotekets opsætning og
        størrelse
      </p>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => onSelect(e.target.files?.[0])}
      />
      {value ? (
        <div className="mt-2 flex items-center gap-3">
          <img
            src={value}
            alt="Pakke-opsætning"
            className="h-20 w-28 rounded-lg border border-border object-cover"
          />
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs font-medium transition-colors hover:border-accent/40"
            >
              <Camera className="h-3.5 w-3.5" /> Skift billede
            </button>
            <button
              type="button"
              onClick={onClear}
              className="inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:text-destructive"
            >
              <X className="h-3.5 w-3.5" /> Fjern
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 flex w-full flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-muted-foreground/25 bg-muted/20 px-4 py-6 text-center transition-colors hover:border-accent/40"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-accent/10 text-accent">
            <Camera className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium">Upload billede</span>
          <span className="text-xs text-muted-foreground">
            PNG eller JPG · valgfrit
          </span>
        </button>
      )}
    </div>
  );
}

function SectionDivider({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent/10 text-accent">
        <Icon className="h-3.5 w-3.5" />
      </span>
      <div className="text-sm font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </div>
      <div className="h-px flex-1 bg-border" />
    </div>
  );
}

function validateStep(
  step: number,
  draft: Draft,
  profilePhoto: FileWithPreview[],
  _equipmentPhotos: FileWithPreview[],
  stageNameState: "idle" | "checking" | "available" | "taken",
): { ok: boolean; reason?: string } {
  switch (step) {
    case 0:
      // Sub-step 1b validation (1a is validated in advance())
      if (draft.firstName.trim().length < 2)
        return { ok: false, reason: "Fornavn er påkrævet" };
      if (draft.lastName.trim().length < 2)
        return { ok: false, reason: "Efternavn er påkrævet" };
      if (!draft.stageName.trim())
        return { ok: false, reason: "DJ-navn er påkrævet" };
      if (!draft.city.trim())
        return { ok: false, reason: "By er påkrævet" };
      if (!/^\S+@\S+\.\S+$/.test(draft.email))
        return { ok: false, reason: "Indtast en gyldig email" };
      if (draft.password.length < 8)
        return { ok: false, reason: "Adgangskoden skal være mindst 8 tegn" };
      if (draft.confirmPassword !== draft.password)
        return { ok: false, reason: "Adgangskoderne matcher ikke" };
      if (!draft.phone.trim())
        return { ok: false, reason: "Telefonnummer er påkrævet" };
      return { ok: true };
    case 1:
      // Sådan fungerer det — purely informational
      return { ok: true };
    case 2:
      if (!draft.yearsExperience)
        return { ok: false, reason: "Vælg års erfaring" };
      if (!draft.equipmentOwned)
        return {
          ok: false,
          reason: "Bekræft at du ejer eller har adgang til mobildiskotek",
        };
      if (!draft.equipmentTransport)
        return {
          ok: false,
          reason: "Bekræft at du ankommer med mobildiskoteket og sætter det op",
        };
      if (!draft.equipmentCapacity)
        return { ok: false, reason: "Vælg kapacitet for dit mobildiskotek" };
      return { ok: true };
    case 3:
      if (!draft.hourlyRate)
        return { ok: false, reason: "Indtast din timepris" };
      if (draft.packages.length === 0)
        return { ok: false, reason: "Tilføj mindst én pakkeløsning" };
      for (const p of draft.packages) {
        if (!p.guestsFrom || !p.guestsTo)
          return {
            ok: false,
            reason: "Angiv gæsteantal (fra og til) for hver pakke",
          };
        if (!p.packagePrice)
          return { ok: false, reason: "Indtast en pakkepris for hver pakke" };
        if (!p.included.trim())
          return {
            ok: false,
            reason: "Beskriv kort hvad der er inkluderet i hver pakke",
          };
      }
      return { ok: true };
    case 4:
      if (!draft.stageName.trim())
        return { ok: false, reason: "Kunstnernavn er påkrævet" };
      if (stageNameState === "taken")
        return { ok: false, reason: "Det kunstnernavn er optaget" };
      if (profilePhoto.length === 0)
        return { ok: false, reason: "Tilføj et profilbillede" };
      if (draft.bio.length < 100)
        return { ok: false, reason: "Bio skal være mindst 100 tegn" };
      if (draft.eventTypes.length === 0)
        return { ok: false, reason: "Vælg mindst én eventtype" };
      return { ok: true };
    default:
      return { ok: true };
  }
}

function passwordStrength(pw: string) {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  const labels = ["For kort", "Svag", "Okay", "Stærk", "Fremragende"];
  const colors = [
    "hsl(0,84%,60%)",
    "hsl(21,90%,53%)",
    "hsl(38,92%,50%)",
    "hsl(142,71%,45%)",
    "hsl(142,71%,35%)",
  ];
  return {
    score,
    label: labels[score] ?? "Svag",
    color: colors[score] ?? colors[1]!,
  };
}

function fireConfetti() {
  const end = Date.now() + 1400;
  const colors = ["#F97316", "#FBBF24", "#38BDF8", "#A855F7", "#F472B6"];
  (function frame() {
    confetti({
      particleCount: 3,
      angle: 60,
      spread: 60,
      origin: { x: 0 },
      colors,
    });
    confetti({
      particleCount: 3,
      angle: 120,
      spread: 60,
      origin: { x: 1 },
      colors,
    });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
