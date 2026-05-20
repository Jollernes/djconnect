import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  User2,
  Sparkles,
  Speaker,
  Trophy,
  CreditCard,
  Rocket,
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
} from "lucide-react";
import confetti from "canvas-confetti";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { EXPERIENCE_YEARS, EVENTS_PERFORMED, SETUP_SIZES } from "@/lib/constants";
import { Stepper, type Step } from "@/components/dj-signup/Stepper";
import { FilePicker, type FileWithPreview } from "@/components/dj-signup/FilePicker";
import { OptionCards } from "@/components/dj-signup/OptionCards";
import { LivePreview } from "@/components/dj-signup/LivePreview";
import { cn } from "@/lib/utils";
import { fileToDataUrl, writeDemoDJProfile } from "@/lib/demoDJProfile";

type Draft = {
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  country: string;
  stageName: string;
  bio: string;
  yearsExperience: string;
  eventTypes: string[];
  equipmentOwned: boolean;
  equipmentPresets: string[];
  equipmentDescription: string;
  setupSize: string;
  eventsPerformed: string;
  notableClients: string;
};

const EMPTY_DRAFT: Draft = {
  fullName: "",
  email: "",
  password: "",
  phone: "",
  city: "",
  country: "Denmark",
  stageName: "",
  bio: "",
  yearsExperience: "",
  eventTypes: [],
  equipmentOwned: false,
  equipmentPresets: [],
  equipmentDescription: "",
  setupSize: "",
  eventsPerformed: "",
  notableClients: "",
};

const STEPS: Step[] = [
  { id: "account", title: "Account", description: "Name, email, password", icon: User2, est: "1 min" },
  { id: "profile", title: "Your vibe", description: "Stage name, bio, event types", icon: Sparkles, est: "3 min" },
  { id: "equipment", title: "Equipment", description: "Gear & photos of your rig", icon: Speaker, est: "4 min" },
  { id: "experience", title: "Experience", description: "Track record & credentials", icon: Trophy, est: "2 min" },
  { id: "payout", title: "Get paid", description: "Stripe Connect setup", icon: CreditCard, est: "3 min" },
  { id: "submit", title: "Submit", description: "Review & go live", icon: Rocket, est: "1 min" },
];

const EVENT_TYPE_CARDS = [
  { id: "wedding", label: "Wedding", description: "First dance, ceremonies", icon: Heart },
  { id: "birthday", label: "Birthday", description: "Milestone parties", icon: Cake },
  { id: "corporate_event", label: "Corporate", description: "Conferences, launches", icon: Briefcase },
  { id: "corporate_party", label: "Corporate party", description: "Summer & Christmas", icon: Wine },
  { id: "private_party", label: "Private party", description: "Intimate gatherings", icon: Crown },
  { id: "other", label: "Other", description: "Clubs, festivals…", icon: Sparkles },
];

const EQUIPMENT_PRESETS = [
  "Pioneer CDJ-2000",
  "Pioneer CDJ-3000",
  "Pioneer DJM-900",
  "Pioneer DDJ-FLX6",
  "Allen & Heath Xone",
  "Denon Prime 4",
  "QSC K12.2 speakers",
  "JBL EON speakers",
  "RCF subwoofers",
  "Shure SM58 mic",
  "Sennheiser wireless mic",
  "Chauvet LED wash",
  "Smoke machine",
  "Moving head lights",
  "Confetti cannon",
  "DMX controller",
];

const DRAFT_KEY = "djconnect.djsignup.draft";

export function DJSignupPage() {
  const { signUpWithPassword, isConfigured, mockLogin } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [profilePhoto, setProfilePhoto] = useState<FileWithPreview[]>([]);
  const [equipmentPhotos, setEquipmentPhotos] = useState<FileWithPreview[]>([]);
  const [credentials, setCredentials] = useState<FileWithPreview[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [completed, setCompleted] = useState<Set<number>>(new Set());
  const [restored, setRestored] = useState(false);
  const [stageNameState, setStageNameState] = useState<"idle" | "checking" | "available" | "taken">("idle");
  const [direction, setDirection] = useState<1 | -1>(1);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { draft: Draft; step: number; completed: number[] };
        setDraft({ ...EMPTY_DRAFT, ...parsed.draft, password: "" });
        setStep(parsed.step ?? 0);
        setCompleted(new Set(parsed.completed ?? []));
        setRestored(true);
      }
    } catch {
      /* ignore corrupt draft */
    }
  }, []);

  useEffect(() => {
    const { password: _password, ...rest } = draft;
    void _password;
    localStorage.setItem(
      DRAFT_KEY,
      JSON.stringify({ draft: { ...rest, password: "" }, step, completed: Array.from(completed) }),
    );
  }, [draft, step, completed]);

  useEffect(() => {
    if (!draft.stageName) {
      setStageNameState("idle");
      return;
    }
    setStageNameState("checking");
    const t = setTimeout(() => {
      const taken = ["dj snake", "tiesto", "calvin harris", "dj khaled"];
      setStageNameState(taken.includes(draft.stageName.toLowerCase()) ? "taken" : "available");
    }, 600);
    return () => clearTimeout(t);
  }, [draft.stageName]);

  const profilePhotoUrl = profilePhoto[0]?.preview ?? null;

  const bioMin = 100;
  const bioPct = Math.min(100, Math.round((draft.bio.length / bioMin) * 100));

  const pwStrength = passwordStrength(draft.password);

  const passesStep = useMemo(() => validateStep(step, draft, profilePhoto, equipmentPhotos, stageNameState), [step, draft, profilePhoto, equipmentPhotos, stageNameState]);

  const overallPct = Math.round((completed.size / STEPS.length) * 100);

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((d) => ({ ...d, [key]: value }));
  }

  function goTo(next: number) {
    setDirection(next > step ? 1 : -1);
    setStep(next);
  }

  function advance() {
    if (!passesStep.ok) {
      toast.error(passesStep.reason ?? "Please complete this step");
      return;
    }
    setCompleted((c) => new Set(c).add(step));
    if (step < STEPS.length - 1) goTo(step + 1);
  }

  async function submitApplication() {
    if (!passesStep.ok) {
      toast.error(passesStep.reason ?? "Please complete this step");
      return;
    }
    setLoading(true);
    try {
      if (isConfigured) {
        await signUpWithPassword({
          fullName: draft.fullName,
          email: draft.email,
          password: draft.password,
          role: "dj",
        });
      }

      // Persist everything the user just entered as a "demo DJ profile" so
      // the new DJ panel can render their data straight away. Photos are
      // converted to data URLs so they survive a page reload.
      const profilePhotoDataUrl = profilePhoto[0]
        ? (await fileToDataUrl(profilePhoto[0])) ?? undefined
        : undefined;
      const equipmentPhotoDataUrls = (
        await Promise.all(equipmentPhotos.map((p) => fileToDataUrl(p)))
      ).filter((u): u is string => typeof u === "string");

      writeDemoDJProfile({
        createdAt: new Date().toISOString(),
        fullName: draft.fullName,
        email: draft.email,
        phone: draft.phone || undefined,
        city: draft.city,
        country: draft.country,
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

      // In demo mode (no Supabase) we drop the user straight into the new
      // DJ panel so they can see the profile they just built. With a real
      // backend they still go to pending-verification first.
      if (isConfigured) {
        setTimeout(() => navigate("/dj/pending-verification"), 2800);
      } else {
        setTimeout(() => {
          let loggedIn = false;
          try {
            mockLogin("dj");
            loggedIn = true;
          } catch {
            // localStorage may be full or blocked — fall through and send
            // the user to /login so they're not stranded on /dj/dashboard,
            // which is auth-gated and would just bounce them to /login
            // anyway, losing the toast context.
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
      toast.error(err instanceof Error ? err.message : "Submission failed");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-muted/30">
      <div className="border-b bg-background">
        <div className="container flex items-center justify-between gap-4 py-3">
          <div className="flex items-center gap-3 text-sm">
            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">DJ onboarding</span>
            <span className="text-muted-foreground">Step {step + 1} of {STEPS.length} · {STEPS[step]!.title}</span>
          </div>
          <div className="flex items-center gap-3">
            {restored && (
              <motion.span initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="hidden items-center gap-1 text-xs text-muted-foreground sm:inline-flex">
                <Check className="h-3 w-3 text-accent" /> Draft restored
              </motion.span>
            )}
            <div className="hidden w-40 items-center gap-2 sm:flex">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
                <motion.div
                  className="h-full bg-accent"
                  animate={{ width: `${overallPct}%` }}
                  transition={{ duration: 0.4 }}
                />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{overallPct}%</span>
            </div>
            <Link to="/login" className="text-xs text-muted-foreground underline-offset-4 hover:underline">
              Already a DJ? Log in
            </Link>
          </div>
        </div>
      </div>

      {/* Horizontal stepper. Sits between the page header and the
          main onboarding card so users can read all 6 steps at a
          glance instead of scanning a column on the left. Hidden on
          narrow widths since the page header already shows
          "Step X of Y · <title>". */}
      <div className="border-b bg-background">
        <div className="container hidden py-5 md:block">
          <Stepper
            steps={STEPS}
            current={step}
            completed={completed}
            onJump={(i) => {
              if (completed.has(i) || i <= step) goTo(i);
            }}
            orientation="horizontal"
          />
        </div>
      </div>

      <div className="container grid gap-6 py-8 lg:grid-cols-[260px_minmax(0,1fr)_320px] lg:gap-10">
        <aside className="hidden lg:block">
          <div className="rounded-xl border bg-background p-4">
            <h4 className="text-sm font-semibold">Why join DJConnect?</h4>
            <ul className="mt-3 space-y-2.5 text-xs text-muted-foreground">
              <li className="flex items-start gap-2"><Shield className="mt-0.5 h-3.5 w-3.5 text-accent" />Verified DJs rank higher in search</li>
              <li className="flex items-start gap-2"><HeartHandshake className="mt-0.5 h-3.5 w-3.5 text-accent" />Payouts 24h after event, no chasing</li>
              <li className="flex items-start gap-2"><BadgeCheck className="mt-0.5 h-3.5 w-3.5 text-accent" />10% platform fee, no exclusivity</li>
            </ul>
          </div>
        </aside>

        <main className="min-w-0">
          <div className="rounded-2xl border bg-background shadow-sm">
            <div className="relative overflow-hidden">
              <AnimatePresence mode="wait" initial={false}>
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: direction * 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: direction * -30 }}
                  transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
                  className="p-6 md:p-8"
                >
                  {step === 0 && (
                    <StepAccount
                      draft={draft}
                      update={update}
                      showPassword={showPassword}
                      setShowPassword={setShowPassword}
                      pwStrength={pwStrength}
                    />
                  )}
                  {step === 1 && (
                    <StepProfile
                      draft={draft}
                      update={update}
                      stageNameState={stageNameState}
                      bioPct={bioPct}
                      bioMin={bioMin}
                      profilePhoto={profilePhoto}
                      setProfilePhoto={setProfilePhoto}
                    />
                  )}
                  {step === 2 && (
                    <StepEquipment
                      draft={draft}
                      update={update}
                      equipmentPhotos={equipmentPhotos}
                      setEquipmentPhotos={setEquipmentPhotos}
                    />
                  )}
                  {step === 3 && (
                    <StepExperience
                      draft={draft}
                      update={update}
                      credentials={credentials}
                      setCredentials={setCredentials}
                    />
                  )}
                  {step === 4 && <StepPayout />}
                  {step === 5 && (
                    <StepSubmit
                      draft={draft}
                      profilePhotoUrl={profilePhotoUrl}
                      equipmentPhotos={equipmentPhotos}
                      submitted={submitted}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 px-6 py-4 backdrop-blur md:px-8">
              <Button
                type="button"
                variant="ghost"
                onClick={() => { if (step > 0) goTo(step - 1); }}
                disabled={step === 0 || loading}
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Lock className="h-3.5 w-3.5" /> Your data is encrypted. Draft auto-saves.
              </div>

              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  variant="accent"
                  size="lg"
                  onClick={advance}
                  disabled={loading}
                  className={cn("min-w-[140px]", passesStep.ok && "shadow-lg shadow-accent/30")}
                >
                  Continue <ChevronRight className="h-4 w-4" />
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
                    <><PartyPopper className="h-4 w-4" /> Submitted!</>
                  ) : loading ? (
                    <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                  ) : (
                    <>Submit application <Rocket className="h-4 w-4" /></>
                  )}
                </Button>
              )}
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
            <span>Need a hand? <a href="mailto:support@djconnect.example" className="underline-offset-4 hover:underline">support@djconnect.example</a></span>
            <span>Join <b className="text-foreground">124</b> verified DJs already on the platform.</span>
          </div>
        </main>

        <aside className="hidden xl:block">
          <LivePreview
            stageName={draft.stageName}
            city={draft.city}
            country={draft.country}
            bio={draft.bio}
            yearsExperience={draft.yearsExperience}
            eventTypes={draft.eventTypes}
            setupSize={draft.setupSize}
            profilePhotoUrl={profilePhotoUrl}
          />
        </aside>
      </div>

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
              <h3 className="mt-5 text-2xl font-semibold">You're on the list!</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                We'll review your application within 2 business days and email you at <b>{draft.email}</b>.
              </p>
              <p className="mt-5 text-xs text-muted-foreground">Redirecting…</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type AccountProps = {
  draft: Draft;
  update: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  pwStrength: { score: number; label: string; color: string };
};

function StepAccount({ draft, update, showPassword, setShowPassword, pwStrength }: AccountProps) {
  return (
    <div className="space-y-6">
      <Header
        icon={User2}
        eyebrow="Step 1"
        title="Let's get you an account"
        subtitle="We'll use this to sign you in and reach you about bookings. You can edit everything later."
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Full legal name" hint="As it appears on your ID">
          <Input value={draft.fullName} onChange={(e) => update("fullName", e.target.value)} placeholder="e.g. Alex Morgan" />
        </Field>
        <Field label="Email" hint="We'll send a verification link">
          <Input type="email" autoComplete="email" value={draft.email} onChange={(e) => update("email", e.target.value)} placeholder="you@domain.com" />
        </Field>

        <Field label="Password" hint="8+ characters, mix letters, numbers, symbols">
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
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {draft.password && (
            <div className="mt-2">
              <div className="grid grid-cols-4 gap-1">
                {[0, 1, 2, 3].map((i) => (
                  <motion.div
                    key={i}
                    initial={false}
                    animate={{ backgroundColor: i < pwStrength.score ? pwStrength.color : "hsl(214, 32%, 91%)" }}
                    className="h-1 rounded-full"
                  />
                ))}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{pwStrength.label}</p>
            </div>
          )}
        </Field>

        <Field label="Phone" hint="For urgent booking-day contact only">
          <Input type="tel" value={draft.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+45 …" />
        </Field>

        <Field label="City / region" hint="Where are you based?">
          <Input value={draft.city} onChange={(e) => update("city", e.target.value)} placeholder="Copenhagen" />
        </Field>
        <Field label="Country">
          <Input value={draft.country} onChange={(e) => update("country", e.target.value)} />
        </Field>
      </div>
    </div>
  );
}

type ProfileProps = {
  draft: Draft;
  update: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  stageNameState: "idle" | "checking" | "available" | "taken";
  bioPct: number;
  bioMin: number;
  profilePhoto: FileWithPreview[];
  setProfilePhoto: (f: FileWithPreview[]) => void;
};

function StepProfile({ draft, update, stageNameState, bioPct, bioMin, profilePhoto, setProfilePhoto }: ProfileProps) {
  return (
    <div className="space-y-6">
      <Header
        icon={Sparkles}
        eyebrow="Step 2"
        title="Show customers your vibe"
        subtitle="Your profile is the first impression. The preview on the right updates as you type."
      />

      <Field label="Stage name" hint="How you'll appear across the site">
        <div className="relative">
          <Input
            value={draft.stageName}
            onChange={(e) => update("stageName", e.target.value)}
            placeholder="e.g. DJ Nova"
            className={cn(
              "pr-32",
              stageNameState === "taken" && "border-destructive",
              stageNameState === "available" && "border-emerald-500",
            )}
          />
          <div className="absolute inset-y-0 right-3 flex items-center gap-1 text-xs">
            {stageNameState === "checking" && <span className="flex items-center gap-1 text-muted-foreground"><Loader2 className="h-3 w-3 animate-spin" /> checking…</span>}
            {stageNameState === "available" && <span className="flex items-center gap-1 text-emerald-600"><Check className="h-3 w-3" /> available</span>}
            {stageNameState === "taken" && <span className="flex items-center gap-1 text-destructive"><X className="h-3 w-3" /> taken</span>}
          </div>
        </div>
      </Field>

      <FilePicker
        label="Profile photo"
        hint="Pick one high-quality photo of you or your setup"
        accept="image/*"
        max={1}
        value={profilePhoto}
        onChange={setProfilePhoto}
      />

      <Field label="Bio" hint={`Tell your story — genre, vibe, what makes you unforgettable (minimum ${bioMin} characters)`}>
        <Textarea
          rows={5}
          value={draft.bio}
          onChange={(e) => update("bio", e.target.value)}
          placeholder="I've been DJing weddings, corporate parties, and summer festivals across Denmark for the past 8 years…"
        />
        <div className="mt-2 flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
            <motion.div
              animate={{ width: `${bioPct}%`, backgroundColor: bioPct >= 100 ? "hsl(142,71%,45%)" : "hsl(21,90%,53%)" }}
              className="h-full"
            />
          </div>
          <span className={cn("text-xs", bioPct >= 100 ? "text-emerald-600" : "text-muted-foreground")}>
            {draft.bio.length} / {bioMin}
          </span>
        </div>
      </Field>

      <div>
        <div className="mb-2 text-sm font-medium">Years of professional experience</div>
        <OptionCards
          options={EXPERIENCE_YEARS.map((y) => ({ id: y.id, label: y.label }))}
          value={draft.yearsExperience}
          onChange={(v) => update("yearsExperience", v as string)}
          columns={4}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">Event types you cover</div>
          <div className="text-xs text-muted-foreground">{draft.eventTypes.length} selected</div>
        </div>
        <OptionCards
          options={EVENT_TYPE_CARDS}
          value={draft.eventTypes}
          multiple
          onChange={(v) => update("eventTypes", v as string[])}
        />
      </div>
    </div>
  );
}

type EquipmentProps = {
  draft: Draft;
  update: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  equipmentPhotos: FileWithPreview[];
  setEquipmentPhotos: (f: FileWithPreview[]) => void;
};

function StepEquipment({ draft, update, equipmentPhotos, setEquipmentPhotos }: EquipmentProps) {
  function togglePreset(id: string) {
    const next = draft.equipmentPresets.includes(id)
      ? draft.equipmentPresets.filter((p) => p !== id)
      : [...draft.equipmentPresets, id];
    update("equipmentPresets", next);
  }
  return (
    <div className="space-y-6">
      <Header
        icon={Speaker}
        eyebrow="Step 3"
        title="Your mobile disco setup"
        subtitle="We verify every DJ's gear so customers know exactly what they're getting. The more detail the better."
      />

      <div
        className={cn(
          "flex items-start gap-3 rounded-xl border p-4 transition-colors cursor-pointer",
          draft.equipmentOwned ? "border-accent bg-accent/5" : "border-border hover:border-accent/40",
        )}
        onClick={() => update("equipmentOwned", !draft.equipmentOwned)}
      >
        <Checkbox
          checked={draft.equipmentOwned}
          onCheckedChange={(v) => update("equipmentOwned", !!v)}
          className="mt-0.5"
          onClick={(e) => e.stopPropagation()}
        />
        <div>
          <div className="text-sm font-medium">I own and operate a complete mobile disco setup</div>
          <div className="text-xs text-muted-foreground">Decks, mixer, speakers, cables, basic lighting — everything needed to run an event.</div>
        </div>
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <div className="text-sm font-medium">Quick-pick your gear</div>
          <div className="text-xs text-muted-foreground">{draft.equipmentPresets.length} selected</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {EQUIPMENT_PRESETS.map((preset) => {
            const selected = draft.equipmentPresets.includes(preset);
            return (
              <motion.button
                key={preset}
                type="button"
                whileTap={{ scale: 0.96 }}
                onClick={() => togglePreset(preset)}
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                  selected
                    ? "border-accent bg-accent text-accent-foreground"
                    : "border-border bg-background hover:border-accent/40",
                )}
              >
                {selected ? <Check className="h-3 w-3" /> : <Plus className="h-3 w-3" />}
                {preset}
              </motion.button>
            );
          })}
        </div>
      </div>

      <Field label="Describe anything unique (min 50 characters)" hint="Lighting rigs, custom DMX, photo-booth add-ons, etc.">
        <Textarea
          rows={4}
          value={draft.equipmentDescription}
          onChange={(e) => update("equipmentDescription", e.target.value)}
          placeholder="Full wedding package with uplighters, wireless mic, moving head lights, and a 15kW subwoofer rig…"
        />
        <div className="mt-1 text-xs text-muted-foreground">{draft.equipmentDescription.length} / 50</div>
      </Field>

      <FilePicker
        label="Photos of your rig"
        hint="1–5 clear photos. The first is used as cover."
        accept="image/*"
        max={5}
        value={equipmentPhotos}
        onChange={setEquipmentPhotos}
      />

      <div>
        <div className="mb-2 text-sm font-medium">Setup size</div>
        <OptionCards
          options={SETUP_SIZES.map((s) => ({ id: s.id, label: s.label, description: s.description }))}
          value={draft.setupSize}
          onChange={(v) => update("setupSize", v as string)}
          columns={3}
        />
      </div>
    </div>
  );
}

type ExperienceProps = {
  draft: Draft;
  update: <K extends keyof Draft>(k: K, v: Draft[K]) => void;
  credentials: FileWithPreview[];
  setCredentials: (f: FileWithPreview[]) => void;
};

function StepExperience({ draft, update, credentials, setCredentials }: ExperienceProps) {
  return (
    <div className="space-y-6">
      <Header
        icon={Trophy}
        eyebrow="Step 4"
        title="Your track record"
        subtitle="Verification is about trust — the more context you provide, the faster we can approve you."
      />

      <div>
        <div className="mb-2 text-sm font-medium">Events performed</div>
        <OptionCards
          options={EVENTS_PERFORMED.map((e) => ({ id: e.id, label: e.label }))}
          value={draft.eventsPerformed}
          onChange={(v) => update("eventsPerformed", v as string)}
          columns={4}
        />
      </div>

      <Field label="Notable clients or events (optional)" hint="Venues, agencies, festivals, corporate clients">
        <Textarea
          rows={3}
          value={draft.notableClients}
          onChange={(e) => update("notableClients", e.target.value)}
          placeholder="Copenhagen Opera staff Christmas party, Tivoli summer series, Acme A/S annual kickoff…"
        />
      </Field>

      <FilePicker
        label="References or certificates (optional)"
        hint="PDFs or images of testimonials, certifications, awards"
        accept="application/pdf,image/*"
        max={3}
        value={credentials}
        onChange={setCredentials}
        variant="document"
      />
    </div>
  );
}

function StepPayout() {
  return (
    <div className="space-y-6">
      <Header
        icon={CreditCard}
        eyebrow="Step 5"
        title="Get paid securely with Stripe"
        subtitle="We use Stripe Connect so funds go straight to your bank account. DJConnect never holds or sees your banking details."
      />

      <div className="grid gap-4 md:grid-cols-3">
        {[
          { icon: Shield, title: "Escrow-protected", body: "Customers pay upfront. Funds are held safely until 24h after the event." },
          { icon: HeartHandshake, title: "Fast payouts", body: "Money lands in your bank account within 2–5 business days of release." },
          { icon: BadgeCheck, title: "Automated invoices", body: "Every booking generates a receipt & payout summary for your accounting." },
        ].map((f, i) => (
          <motion.div
            key={f.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 * i }}
            className="rounded-xl border bg-card p-4"
          >
            <f.icon className="mb-2 h-5 w-5 text-accent" />
            <div className="text-sm font-semibold">{f.title}</div>
            <div className="mt-1 text-xs text-muted-foreground">{f.body}</div>
          </motion.div>
        ))}
      </div>

      <div className="rounded-xl border bg-gradient-to-br from-muted/40 via-background to-background p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">Connect Stripe now (recommended)</div>
            <p className="mt-1 text-xs text-muted-foreground">
              This opens Stripe in a new tab. It takes ~3 minutes — you'll need your ID and a bank account.
              If you'd rather do it later, you can still submit your application and connect before your first booking.
            </p>
          </div>
          <Button
            type="button"
            variant="default"
            onClick={() => toast.info("Stripe Connect opens once your account is created. We'll redirect you here after onboarding.")}
          >
            Connect Stripe <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

type SubmitProps = {
  draft: Draft;
  profilePhotoUrl: string | null;
  equipmentPhotos: FileWithPreview[];
  submitted: boolean;
};

function StepSubmit({ draft, profilePhotoUrl, equipmentPhotos, submitted }: SubmitProps) {
  const summary: Array<{ label: string; value: string }> = [
    { label: "Name", value: draft.fullName || "—" },
    { label: "Email", value: draft.email || "—" },
    { label: "Location", value: [draft.city, draft.country].filter(Boolean).join(", ") || "—" },
    { label: "Stage name", value: draft.stageName || "—" },
    { label: "Experience", value: draft.yearsExperience || "—" },
    { label: "Event types", value: draft.eventTypes.length ? `${draft.eventTypes.length} selected` : "—" },
    { label: "Gear items", value: draft.equipmentPresets.length ? `${draft.equipmentPresets.length} items` : "—" },
    { label: "Setup size", value: draft.setupSize || "—" },
    { label: "Events performed", value: draft.eventsPerformed || "—" },
    { label: "Photos", value: `${equipmentPhotos.length} uploaded` },
  ];

  return (
    <div className="space-y-6">
      <Header
        icon={Rocket}
        eyebrow="Step 6"
        title="Final check — ready to launch?"
        subtitle="This is exactly what our verification team will review. You can go back and edit anything before submitting."
      />

      <div className="grid gap-5 md:grid-cols-[1fr_1.4fr]">
        <div className="overflow-hidden rounded-2xl border bg-card">
          <div className="relative aspect-square bg-gradient-to-br from-primary to-accent/50">
            {profilePhotoUrl ? (
              <img src={profilePhotoUrl} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-primary-foreground/60">
                <Sparkles className="h-10 w-10" />
              </div>
            )}
          </div>
          <div className="p-4">
            <div className="text-lg font-semibold">{draft.stageName || "Your stage name"}</div>
            <div className="text-xs text-muted-foreground">{[draft.city, draft.country].filter(Boolean).join(", ")}</div>
          </div>
        </div>
        <dl className="grid grid-cols-2 gap-3 self-start">
          {summary.map((row) => (
            <div key={row.label} className="rounded-lg border bg-card p-3">
              <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{row.label}</dt>
              <dd className="mt-0.5 truncate text-sm font-medium">{row.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="rounded-xl border bg-accent/5 p-4 text-sm">
        <div className="flex items-start gap-2">
          <BadgeCheck className="mt-0.5 h-4 w-4 text-accent" />
          <div>
            <div className="font-medium">What happens next</div>
            <p className="mt-1 text-xs text-muted-foreground">
              We'll review your application within 2 business days. You'll receive an email at{" "}
              <b>{draft.email || "your email"}</b> once verified, and your profile goes live instantly.
            </p>
          </div>
        </div>
      </div>

      {submitted && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-sm text-emerald-600">
          <Check className="h-4 w-4" /> Application received — redirecting…
        </motion.div>
      )}
    </div>
  );
}

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
        <div className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">{eyebrow}</div>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted-foreground">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <Label className="text-sm font-medium">{label}</Label>
      {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
      <div className="mt-2">{children}</div>
    </div>
  );
}

function validateStep(
  step: number,
  draft: Draft,
  profilePhoto: FileWithPreview[],
  equipmentPhotos: FileWithPreview[],
  stageNameState: "idle" | "checking" | "available" | "taken",
): { ok: boolean; reason?: string } {
  switch (step) {
    case 0:
      if (draft.fullName.trim().length < 2) return { ok: false, reason: "Full name is required" };
      if (!/^\S+@\S+\.\S+$/.test(draft.email)) return { ok: false, reason: "Enter a valid email" };
      if (draft.password.length < 8) return { ok: false, reason: "Password must be at least 8 characters" };
      if (!draft.phone.trim()) return { ok: false, reason: "Phone is required" };
      if (!draft.city.trim() || !draft.country.trim()) return { ok: false, reason: "City and country are required" };
      return { ok: true };
    case 1:
      if (!draft.stageName.trim()) return { ok: false, reason: "Stage name is required" };
      if (stageNameState === "taken") return { ok: false, reason: "That stage name is taken" };
      if (profilePhoto.length === 0) return { ok: false, reason: "Add a profile photo" };
      if (draft.bio.length < 100) return { ok: false, reason: "Bio must be at least 100 characters" };
      if (!draft.yearsExperience) return { ok: false, reason: "Select years of experience" };
      if (draft.eventTypes.length === 0) return { ok: false, reason: "Pick at least one event type" };
      return { ok: true };
    case 2:
      if (!draft.equipmentOwned) return { ok: false, reason: "Confirm you own a complete mobile disco setup" };
      if (draft.equipmentDescription.length < 50) return { ok: false, reason: "Equipment description must be at least 50 characters" };
      if (equipmentPhotos.length < 1) return { ok: false, reason: "Upload at least 1 equipment photo" };
      if (!draft.setupSize) return { ok: false, reason: "Select a setup size" };
      return { ok: true };
    case 3:
      if (!draft.eventsPerformed) return { ok: false, reason: "Select number of events performed" };
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
  const labels = ["Too short", "Weak", "Okay", "Strong", "Excellent"];
  const colors = ["hsl(0,84%,60%)", "hsl(21,90%,53%)", "hsl(38,92%,50%)", "hsl(142,71%,45%)", "hsl(142,71%,35%)"];
  return { score, label: labels[score] ?? "Weak", color: colors[score] ?? colors[1]! };
}

function fireConfetti() {
  const end = Date.now() + 1400;
  const colors = ["#F97316", "#FBBF24", "#38BDF8", "#A855F7", "#F472B6"];
  (function frame() {
    confetti({ particleCount: 3, angle: 60, spread: 60, origin: { x: 0 }, colors });
    confetti({ particleCount: 3, angle: 120, spread: 60, origin: { x: 1 }, colors });
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}
