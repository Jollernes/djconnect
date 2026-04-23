import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { toast } from "sonner";
import { ChevronLeft, ChevronRight, Upload, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { EVENT_TYPES, EXPERIENCE_YEARS, EVENTS_PERFORMED, SETUP_SIZES } from "@/lib/constants";

interface DJSignupState {
  // step 1
  fullName: string;
  email: string;
  password: string;
  phone: string;
  city: string;
  country: string;
  // step 2
  stageName: string;
  profilePhoto: File | null;
  bio: string;
  yearsExperience: string;
  eventTypes: string[];
  // step 3
  equipmentOwned: boolean;
  equipmentDescription: string;
  equipmentPhotos: File[];
  setupSize: string;
  // step 4
  eventsPerformed: string;
  notableClients: string;
  credentials: File[];
}

const STEPS = [
  { title: "Basic account" },
  { title: "DJ profile" },
  { title: "Equipment" },
  { title: "Experience" },
  { title: "Payment setup" },
  { title: "Submit" },
];

export function DJSignupPage() {
  const { signUpWithPassword, isConfigured } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [state, setState] = useState<DJSignupState>({
    fullName: "",
    email: "",
    password: "",
    phone: "",
    city: "",
    country: "Denmark",
    stageName: "",
    profilePhoto: null,
    bio: "",
    yearsExperience: "",
    eventTypes: [],
    equipmentOwned: false,
    equipmentDescription: "",
    equipmentPhotos: [],
    setupSize: "",
    eventsPerformed: "",
    notableClients: "",
    credentials: [],
  });

  function update<K extends keyof DJSignupState>(key: K, value: DJSignupState[K]) {
    setState((s) => ({ ...s, [key]: value }));
  }

  function validateStep(): string | null {
    switch (step) {
      case 0:
        if (!state.fullName || state.fullName.length < 2) return "Full name is required";
        if (!/^\S+@\S+\.\S+$/.test(state.email)) return "Valid email is required";
        if (state.password.length < 8) return "Password must be at least 8 characters";
        if (!state.phone) return "Phone is required";
        if (!state.city || !state.country) return "City and country are required";
        return null;
      case 1:
        if (!state.stageName) return "Stage name is required";
        if (state.bio.length < 100) return "Bio must be at least 100 characters";
        if (!state.yearsExperience) return "Select years of experience";
        if (state.eventTypes.length === 0) return "Select at least one event type";
        return null;
      case 2:
        if (!state.equipmentOwned) return "Confirm you own a complete mobile disco setup";
        if (state.equipmentDescription.length < 50) return "Equipment description must be at least 50 characters";
        if (state.equipmentPhotos.length < 1) return "Upload at least 1 equipment photo";
        if (state.equipmentPhotos.length > 5) return "Upload no more than 5 equipment photos";
        if (!state.setupSize) return "Select a setup size";
        return null;
      case 3:
        if (!state.eventsPerformed) return "Select number of events performed";
        return null;
      default:
        return null;
    }
  }

  function nextStep() {
    const error = validateStep();
    if (error) {
      toast.error(error);
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  async function submit() {
    setLoading(true);
    try {
      if (isConfigured) {
        await signUpWithPassword({
          fullName: state.fullName,
          email: state.email,
          password: state.password,
          role: "dj",
        });
        // NB: DJ profile details, photos, event types, and credentials are persisted by the
        // client (or an Edge Function) after the user confirms email. For brevity this demo
        // hands the user to the pending-verification screen; actual upload wiring lives in
        // supabase/functions/dj-finalize-profile.
      }
      toast.success("Application submitted! We'll review within 2 business days.");
      navigate("/dj/pending-verification");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setLoading(false);
    }
  }

  const pct = Math.round(((step + 1) / STEPS.length) * 100);

  return (
    <div className="container max-w-3xl py-8 md:py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length}: {STEPS[step]!.title}</span>
          <span>{pct}% complete</span>
        </div>
        <Progress value={pct} className="mt-2" />
      </div>

      <Card>
        <CardContent className="space-y-5 p-6 md:p-8">
          {step === 0 && <Step1Basic state={state} update={update} />}
          {step === 1 && <Step2Profile state={state} update={update} />}
          {step === 2 && <Step3Equipment state={state} update={update} />}
          {step === 3 && <Step4Experience state={state} update={update} />}
          {step === 4 && <Step5Payment />}
          {step === 5 && <Step6Review state={state} />}

          <div className="flex items-center justify-between pt-4">
            <Button variant="outline" onClick={() => setStep((s) => Math.max(s - 1, 0))} disabled={step === 0}>
              <ChevronLeft className="h-4 w-4" /> Back
            </Button>
            {step < STEPS.length - 1 ? (
              <Button onClick={nextStep}>
                Continue <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button variant="accent" onClick={submit} disabled={loading}>
                {loading ? "Submitting…" : "Submit application"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-4 text-center text-sm text-muted-foreground">
        Already applied? <Link to="/login" className="text-accent underline">Log in</Link>
      </p>
    </div>
  );
}

type StepProps = {
  state: DJSignupState;
  update: <K extends keyof DJSignupState>(key: K, value: DJSignupState[K]) => void;
};

function Step1Basic({ state, update }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Basic account</h2>
        <p className="text-sm text-muted-foreground">The essentials to create your account.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="fullName">Full legal name</Label>
          <Input id="fullName" value={state.fullName} onChange={(e) => update("fullName", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={state.email} onChange={(e) => update("email", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" value={state.password} onChange={(e) => update("password", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={state.phone} onChange={(e) => update("phone", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="city">City / region</Label>
          <Input id="city" value={state.city} onChange={(e) => update("city", e.target.value)} />
        </div>
        <div>
          <Label htmlFor="country">Country</Label>
          <Input id="country" value={state.country} onChange={(e) => update("country", e.target.value)} />
        </div>
      </div>
    </div>
  );
}

function Step2Profile({ state, update }: StepProps) {
  function toggleEventType(id: string) {
    update("eventTypes", state.eventTypes.includes(id) ? state.eventTypes.filter((x) => x !== id) : [...state.eventTypes, id]);
  }
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">DJ profile</h2>
        <p className="text-sm text-muted-foreground">How customers will see you.</p>
      </div>
      <div>
        <Label htmlFor="stageName">DJ name / stage name</Label>
        <Input id="stageName" value={state.stageName} onChange={(e) => update("stageName", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="photo">Profile photo</Label>
        <Input
          id="photo"
          type="file"
          accept="image/*"
          onChange={(e) => update("profilePhoto", e.target.files?.[0] ?? null)}
        />
      </div>
      <div>
        <Label htmlFor="bio">Bio / about (min 100 characters)</Label>
        <Textarea id="bio" rows={5} value={state.bio} onChange={(e) => update("bio", e.target.value)} />
        <p className="mt-1 text-xs text-muted-foreground">{state.bio.length} / 100 minimum</p>
      </div>
      <div>
        <Label>Years of professional experience</Label>
        <Select value={state.yearsExperience} onValueChange={(v) => update("yearsExperience", v)}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {EXPERIENCE_YEARS.map((y) => (
              <SelectItem key={y.id} value={y.id}>{y.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Types of events you cover</Label>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {EVENT_TYPES.map((et) => (
            <label key={et.id} className="flex items-center gap-2 rounded-md border p-2 text-sm">
              <Checkbox checked={state.eventTypes.includes(et.id)} onCheckedChange={() => toggleEventType(et.id)} />
              {et.label}
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3Equipment({ state, update }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Equipment verification</h2>
        <p className="text-sm text-muted-foreground">Customers book you for your full mobile setup — show them what they're getting.</p>
      </div>
      <label className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 text-sm">
        <Checkbox checked={state.equipmentOwned} onCheckedChange={(v) => update("equipmentOwned", Boolean(v))} />
        <span>I own and operate a complete mobile disco setup (decks, mixer, speakers, lighting).</span>
      </label>
      <div>
        <Label htmlFor="eqDesc">Describe your equipment (min 50 characters)</Label>
        <Textarea
          id="eqDesc"
          rows={4}
          placeholder="e.g. Pioneer CDJ-2000s, Allen & Heath mixer, 2x QSC K12.2 speakers, full LED lighting rig"
          value={state.equipmentDescription}
          onChange={(e) => update("equipmentDescription", e.target.value)}
        />
        <p className="mt-1 text-xs text-muted-foreground">{state.equipmentDescription.length} / 50 minimum</p>
      </div>
      <div>
        <Label htmlFor="eqPhotos">Equipment photos (1–5)</Label>
        <Input
          id="eqPhotos"
          type="file"
          accept="image/*"
          multiple
          onChange={(e) => update("equipmentPhotos", Array.from(e.target.files ?? []).slice(0, 5))}
        />
        {state.equipmentPhotos.length > 0 && (
          <p className="mt-1 text-xs text-muted-foreground">
            {state.equipmentPhotos.length} photo{state.equipmentPhotos.length === 1 ? "" : "s"} selected
          </p>
        )}
      </div>
      <div>
        <Label>Approximate setup size</Label>
        <RadioGroup value={state.setupSize} onValueChange={(v) => update("setupSize", v)} className="mt-2">
          {SETUP_SIZES.map((s) => (
            <label key={s.id} className="flex items-start gap-3 rounded-md border p-3 text-sm">
              <RadioGroupItem value={s.id} className="mt-0.5" />
              <div>
                <div className="font-medium">{s.label}</div>
                <div className="text-muted-foreground">{s.description}</div>
              </div>
            </label>
          ))}
        </RadioGroup>
      </div>
    </div>
  );
}

function Step4Experience({ state, update }: StepProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Experience & credentials</h2>
        <p className="text-sm text-muted-foreground">Optional details help customers trust you.</p>
      </div>
      <div>
        <Label>Events performed</Label>
        <Select value={state.eventsPerformed} onValueChange={(v) => update("eventsPerformed", v)}>
          <SelectTrigger className="mt-1"><SelectValue placeholder="Select" /></SelectTrigger>
          <SelectContent>
            {EVENTS_PERFORMED.map((y) => (
              <SelectItem key={y.id} value={y.id}>{y.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="notableClients">Notable event types or clients (optional)</Label>
        <Textarea id="notableClients" rows={3} value={state.notableClients} onChange={(e) => update("notableClients", e.target.value)} />
      </div>
      <div>
        <Label htmlFor="credentials">References or certificates (optional, up to 3 files, PDF or image)</Label>
        <Input
          id="credentials"
          type="file"
          accept="image/*,application/pdf"
          multiple
          onChange={(e) => update("credentials", Array.from(e.target.files ?? []).slice(0, 3))}
        />
      </div>
    </div>
  );
}

function Step5Payment() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Payment setup</h2>
        <p className="text-sm text-muted-foreground">
          Connect a Stripe account so we can pay you out after each event.
        </p>
      </div>
      <div className="rounded-lg border bg-muted/30 p-4 text-sm">
        <div className="flex items-start gap-3">
          <Upload className="h-5 w-5 shrink-0 text-accent" />
          <div>
            <p>
              You'll complete this step after submitting your application. Once approved, we'll send you a
              Stripe onboarding link. Stripe handles your banking details securely — we never see them.
            </p>
            <p className="mt-2 text-muted-foreground">
              Until Stripe onboarding is complete, you can still receive booking requests but payouts will be
              held until your account is verified.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step6Review({ state }: { state: DJSignupState }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">Review and submit</h2>
        <p className="text-sm text-muted-foreground">A quick look before you send — you can edit later.</p>
      </div>
      <div className="space-y-3 rounded-lg border p-4 text-sm">
        <Row label="Name" value={state.fullName} />
        <Row label="Email" value={state.email} />
        <Row label="Stage name" value={state.stageName} />
        <Row label="Location" value={`${state.city}, ${state.country}`} />
        <Row label="Experience" value={state.yearsExperience} />
        <Row label="Event types" value={state.eventTypes.join(", ")} />
        <Row label="Setup size" value={state.setupSize} />
        <Row label="Equipment photos" value={`${state.equipmentPhotos.length} uploaded`} />
        <Row label="Events performed" value={state.eventsPerformed} />
      </div>
      <div className="flex items-start gap-2 rounded-md bg-success/10 p-3 text-sm">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
        <div>
          <p className="font-medium">Ready to submit</p>
          <p className="text-muted-foreground">
            We'll email you within 2 business days. After approval you'll complete Stripe onboarding to
            receive payouts.
          </p>
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[60%] text-right font-medium capitalize">{value || "—"}</span>
    </div>
  );
}
