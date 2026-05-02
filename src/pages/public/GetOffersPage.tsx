import { useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useDJs } from "@/hooks/useDJs";
import { useDocumentHead } from "@/hooks/useDocumentHead";
import { useOfferRequest, type OfferRequest } from "@/hooks/useOfferRequest";
import { TOTAL_QUESTION_STEPS } from "@/lib/offerRequestContent";
import { OfferWizardLayout } from "@/components/offers/OfferWizardLayout";
import {
  WelcomeIllustration,
  CalendarIllustration,
  CityIllustration,
  GuestsIllustration,
  VibeIllustration,
  ExtrasIllustration,
  ContactIllustration,
} from "@/components/offers/OfferIllustrations";
import { WelcomeStep } from "@/components/offers/steps/WelcomeStep";
import { EventTypeStep } from "@/components/offers/steps/EventTypeStep";
import { WhenWhereStep } from "@/components/offers/steps/WhenWhereStep";
import { SizeStep } from "@/components/offers/steps/SizeStep";
import { VibeStep } from "@/components/offers/steps/VibeStep";
import { ExtrasStep } from "@/components/offers/steps/ExtrasStep";
import { BudgetStep } from "@/components/offers/steps/BudgetStep";
import { ContactStep } from "@/components/offers/steps/ContactStep";
import { ReviewStep } from "@/components/offers/steps/ReviewStep";
import { mockDJs } from "@/data/mock";
import { createRequestRecord } from "@/lib/offerRequestOrchestrator";
import { useAuth } from "@/hooks/useAuth";
import { Heart } from "lucide-react";
import { motion } from "framer-motion";

/**
 * Get 3 Offers wizard.
 *
 * Step layout (URL ?step=0..10):
 *   0  Welcome
 *   1  Event type
 *   2  When & where (date + city)
 *   3  Size (guests + setup)
 *   4  Vibe (genres)
 *   5  Extras (special requests)
 *   6  Budget
 *   7  Contact
 *   8  Review
 *   9  Done (3 matched DJs animate in)
 *
 * The 8 in "Step X of 8" maps steps 1–8 to questions; step 0 is the welcome
 * and steps 9 / 10 are post-submit screens, so they hide the progress bar.
 */
export function GetOffersPage() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const { request, update, updateContact, toggleArrayValue, reset } = useOfferRequest();
  const { djs, loading } = useDJs();
  const [submitting, setSubmitting] = useState(false);

  const stepParam = parseInt(searchParams.get("step") ?? "0", 10);
  const step = Number.isFinite(stepParam) && stepParam >= 0 && stepParam <= 8 ? stepParam : 0;

  useDocumentHead({
    title: "Get 3 personal DJ offers in 24 hours · DJConnect",
    description:
      "Tell us about your event in ~2 minutes and we'll match you with 3 verified Danish DJs. Compare personal offers, pay through escrow, no spam.",
    canonical: "/get-offers",
  });

  function setStep(next: number) {
    setSearchParams({ step: String(next) }, { replace: false });
    if (typeof window !== "undefined") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  // Compute "next step disabled" guard per question step
  const nextDisabled = useMemo(() => {
    switch (step) {
      case 1:
        return !request.eventType;
      case 2:
        return !request.date || !(request.city || (request.customCity ?? "").trim().length > 0);
      case 3:
        return !request.guestBucket; // setupSize optional
      case 4:
        return false; // genres optional
      case 5:
        return false; // extras optional
      case 6:
        return !request.budget;
      case 7:
        return !request.contact.name.trim() || !/.+@.+\..+/.test(request.contact.email);
      default:
        return false;
    }
  }, [step, request]);

  function handleSubmit() {
    if (submitting) return;
    setSubmitting(true);
    const catalog = djs.length > 0 ? djs : mockDJs;
    const record = createRequestRecord(request, catalog, {
      customerId: profile?.role === "customer" ? profile.id : null,
    });
    // Wizard answers are no longer needed — the record now owns the brief.
    reset();
    // Logged-in customers land on the dashboard-embedded view; guests land on
    // the standalone public page (which itself redirects into the dashboard
    // once they sign in).
    const target =
      profile?.role === "customer"
        ? `/dashboard/requests/${record.id}`
        : `/my-requests/${record.id}`;
    navigate(target);
  }

  function handleStartOver() {
    reset();
    setStep(0);
  }

  // Step config: title, subtitle, illustration, content, navigation guards
  const config: StepConfig = (() => {
    switch (step) {
      case 0:
        return {
          stepNumber: 0,
          title: "Get 3 personal DJ offers in 24 hours.",
          subtitle:
            "Tell us about your event — we'll match you with 3 verified Danish DJs. Each one sends a personal offer, no spam, no fees.",
          illustration: <WelcomeIllustration size="lg" />,
          content: <WelcomeStep />,
          hideBack: true,
          showProgress: false,
          nextLabel: "Start — it's ~2 min",
          onNext: () => setStep(1),
          onBack: undefined,
        };
      case 1:
        return {
          stepNumber: 1,
          title: "What kind of event are you planning?",
          subtitle: "We'll tailor the brief and match DJs who specialise in this kind of event.",
          illustration: (
            <FloatingIcon>
              <Heart className="h-12 w-12 text-rose-500" />
            </FloatingIcon>
          ),
          content: (
            <EventTypeStep
              value={request.eventType}
              onChange={(id) => {
                update({ eventType: id });
                // auto-advance after a small beat so the rose ring is visible
                setTimeout(() => setStep(2), 250);
              }}
            />
          ),
          onNext: () => setStep(2),
          onBack: () => setStep(0),
        };
      case 2:
        return {
          stepNumber: 2,
          title: "When and where?",
          subtitle: "DJs need the date and city to confirm availability.",
          illustration: (
            <div className="flex items-center gap-4">
              <CalendarIllustration size="sm" />
              <CityIllustration size="sm" />
            </div>
          ),
          content: (
            <WhenWhereStep
              date={request.date}
              city={request.city}
              customCity={request.customCity}
              onDateChange={(date) => update({ date })}
              onCityChange={(city) => update({ city })}
              onCustomCityChange={(c) => update({ customCity: c })}
            />
          ),
          onNext: () => setStep(3),
          onBack: () => setStep(1),
        };
      case 3:
        return {
          stepNumber: 3,
          title: "How big is your event?",
          subtitle: "Used to match DJs with the right rig and crowd-reading experience.",
          illustration: <GuestsIllustration size="md" />,
          content: (
            <SizeStep
              guestBucket={request.guestBucket}
              setupSize={request.setupSize}
              onGuestBucketChange={(id) => update({ guestBucket: id })}
              onSetupChange={(id) => update({ setupSize: id ?? undefined })}
            />
          ),
          onNext: () => setStep(4),
          onBack: () => setStep(2),
        };
      case 4:
        return {
          stepNumber: 4,
          title: "What's the vibe?",
          subtitle: "Tell us roughly — DJs build the actual playlist with you later.",
          illustration: <VibeIllustration size="md" />,
          content: (
            <VibeStep genres={request.genres} onToggle={(id) => toggleArrayValue("genres", id)} />
          ),
          onNext: () => setStep(5),
          onBack: () => setStep(3),
          nextLabel: request.genres.length === 0 ? "Skip" : "Continue",
        };
      case 5:
        return {
          stepNumber: 5,
          title: "Anything extra?",
          subtitle: "Mics, photo booths, branded booth — let us know what to ask for.",
          illustration: <ExtrasIllustration size="md" />,
          content: (
            <ExtrasStep extras={request.extras} onToggle={(id) => toggleArrayValue("extras", id)} />
          ),
          onNext: () => setStep(6),
          onBack: () => setStep(4),
          nextLabel: request.extras.length === 0 ? "Skip" : "Continue",
        };
      case 6:
        return {
          stepNumber: 6,
          title: "What's the budget?",
          subtitle:
            "Just a sanity check so we match the right DJs. The actual quote will be inside this range.",
          illustration: null,
          content: (
            <BudgetStep value={request.budget} onChange={(id) => update({ budget: id })} />
          ),
          onNext: () => setStep(7),
          onBack: () => setStep(5),
        };
      case 7:
        return {
          stepNumber: 7,
          title: "How can the DJs reach you?",
          subtitle: "We'll send you a copy of the brief and forward each DJ's offer when they reply.",
          illustration: <ContactIllustration size="md" />,
          content: (
            <ContactStep
              name={request.contact.name}
              email={request.contact.email}
              phone={request.contact.phone}
              onChange={(p) => updateContact(p)}
            />
          ),
          onNext: () => setStep(8),
          onBack: () => setStep(6),
        };
      case 8:
        return {
          stepNumber: 8,
          title: "Quick check before we send.",
          subtitle:
            "Tap any line to edit it. When it looks right, we'll contact up to 6 DJs who match — your live progress page opens immediately.",
          illustration: null,
          content: (
            <ReviewStep
              request={request}
              onEditStep={(s) => setStep(s)}
            />
          ),
          onNext: handleSubmit,
          onBack: () => setStep(7),
          nextLabel: submitting ? "Contacting DJs…" : "Send brief & track live",
        };
      default:
        return {
          stepNumber: 0,
          title: "Get 3 personal DJ offers in 24 hours.",
          subtitle: "",
          illustration: <WelcomeIllustration />,
          content: <WelcomeStep />,
          onNext: () => setStep(1),
          hideBack: true,
          showProgress: false,
        };
    }
  })();

  return (
    <OfferWizardLayout
      step={
        // For progress, we map question steps 1-8 → 1-8; welcome (0) shows 0 but hides bar; 9 hides bar
        config.stepNumber >= 1 && config.stepNumber <= 8 ? config.stepNumber : 0
      }
      totalSteps={TOTAL_QUESTION_STEPS}
      title={config.title}
      subtitle={config.subtitle}
      illustration={config.illustration}
      onBack={config.onBack}
      onNext={config.onNext}
      nextLabel={config.nextLabel}
      nextDisabled={nextDisabled || (step === 8 && loading)}
      hideBack={config.hideBack}
      hideNext={config.hideNext}
      showProgress={config.showProgress !== false}
    >
      {config.content}
      {step === 0 && (
        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              if (
                window.confirm(
                  "Reset the wizard? Your saved answers will be cleared and you'll start fresh.",
                )
              ) {
                handleStartOver();
              } else {
                setStep(1);
              }
            }}
            className="text-xs text-muted-foreground underline-offset-4 hover:underline"
          >
            {hasAnyAnswer(request) ? "Pick up where I left off · or start over" : ""}
          </button>
          <p className="text-xs text-muted-foreground">
            Want to browse instead?{" "}
            <button
              type="button"
              onClick={() => navigate("/search")}
              className="text-rose-700 underline-offset-2 hover:underline"
            >
              Browse all DJs →
            </button>
          </p>
        </div>
      )}
    </OfferWizardLayout>
  );
}

type StepConfig = {
  stepNumber: number;
  title: string;
  subtitle?: string;
  illustration: React.ReactNode;
  content: React.ReactNode;
  onBack?: () => void;
  onNext?: () => void;
  nextLabel?: string;
  hideBack?: boolean;
  hideNext?: boolean;
  showProgress?: boolean;
};

function FloatingIcon({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ y: 0 }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 2.4, repeat: Infinity }}
      className="grid h-32 w-32 place-items-center rounded-full bg-gradient-to-br from-rose-100 to-amber-100"
    >
      {children}
    </motion.div>
  );
}

function hasAnyAnswer(r: OfferRequest): boolean {
  return Boolean(
    r.eventType ||
      r.date ||
      r.city ||
      r.customCity ||
      r.guestBucket ||
      r.setupSize ||
      r.budget ||
      r.genres.length > 0 ||
      r.extras.length > 0 ||
      r.contact.name ||
      r.contact.email ||
      r.contact.phone,
  );
}



