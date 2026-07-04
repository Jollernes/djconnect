import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BrandMark } from "@/firmadj/components/BrandMark";
import { packages } from "@/firmadj/data/mock";
import { calcPrice, formatDkk, recommendPackage } from "@/firmadj/data/pricing";
import { useEvents } from "@/firmadj/store/EventStore";
import type { GuestBand } from "@/firmadj/types";

const eventTypes = ["Julefrokost", "Sommerfest", "Firmajubilæum", "Kickoff/Kundeevent", "Gallamiddag"];
const guestOptions: Array<{ value: GuestBand; label: string }> = [
  { value: "<80", label: "Under 80" },
  { value: "80-150", label: "80-150" },
  { value: "150-300", label: "150-300" },
];

export function BookingFlowPage() {
  const navigate = useNavigate();
  const { createEvent } = useEvents();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [date, setDate] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [eventType, setEventType] = useState("");
  const [guests, setGuests] = useState<GuestBand | "">("");
  const [decibelLimiter, setDecibelLimiter] = useState(false);
  const [email, setEmail] = useState("");
  const isStep1Valid = Boolean(date && postalCode.trim() && eventType && guests);

  const recommendedPackageId = useMemo(
    () => (eventType && guests ? recommendPackage(eventType, guests as GuestBand) : "after-dinner"),
    [eventType, guests],
  );

  const recommendedPackage = packages.find((item) => item.id === recommendedPackageId) ?? packages[0];
  const price = useMemo(
    () => calcPrice(recommendedPackageId, (guests || "<80") as GuestBand, decibelLimiter),
    [decibelLimiter, guests, recommendedPackageId],
  );

  const handleCreateEvent = () => {
    if (!email.includes("@")) {
      toast.error("Indtast venligst en gyldig arbejds-mail.");
      return;
    }

    const id = createEvent({
      date,
      guests: guests as GuestBand,
      postalCode,
      eventType,
      decibelLimiter,
      packageId: recommendedPackageId,
      email,
      price,
      status: "Draft",
    });

    toast.success("Tak — jeres ledighedslink er klar.");
    navigate(`/event/${id}`);
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container max-w-4xl py-6">
        <div className="mb-8 flex items-center justify-between gap-4">
          <BrandMark compact />
          <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-muted-foreground">
            Trin {step} af 3
          </div>
        </div>

        {step === 1 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="font-display text-3xl">Fortæl os om jeres event</CardTitle>
                <CardDescription>Vi bruger det til at beregne den rigtige pakke og den præcise pris.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-5 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="date">Dato</Label>
                    <Input id="date" type="date" value={date} onChange={(event) => setDate(event.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postalCode">Postnummer</Label>
                    <Input
                      id="postalCode"
                      inputMode="numeric"
                      placeholder="2200"
                      value={postalCode}
                      onChange={(event) => setPostalCode(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Event type</Label>
                    <Select value={eventType} onValueChange={setEventType}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg event type" />
                      </SelectTrigger>
                      <SelectContent>
                        {eventTypes.map((type) => (
                          <SelectItem key={type} value={type}>
                            {type}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Gæster</Label>
                    <Select value={guests} onValueChange={(value) => setGuests(value as GuestBand)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg antal gæster" />
                      </SelectTrigger>
                      <SelectContent>
                        {guestOptions.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <label className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                  <Checkbox checked={decibelLimiter} onCheckedChange={(checked) => setDecibelLimiter(checked === true)} />
                  <span className="text-sm leading-6">
                    Er der en decibel-/støjgrænse (decibel limiter) på lokationen?
                  </span>
                </label>

                <Button className="w-full md:w-auto" size="lg" disabled={!isStep1Valid} onClick={() => setStep(2)}>
                  Beregn pris
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        {step === 2 ? (
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="font-display text-3xl">Vi anbefaler denne pakke</CardTitle>
                <CardDescription>
                  Valgt ud fra jeres eventtype, gæstetal og eventuelle lydkrav.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="rounded-3xl border border-white/10 bg-background/30 p-6">
                  <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Anbefaling</div>
                  <h2 className="font-display mt-2 text-3xl font-bold">{recommendedPackage.name}</h2>
                  <p className="mt-3 text-muted-foreground">{recommendedPackage.description}</p>
                  <div className="mt-6 text-5xl font-extrabold text-accent">{formatDkk(price)}</div>
                  <div className="mt-2 text-sm text-muted-foreground">Fra-pris inklusive jeres tilvalg og gæstetillæg.</div>
                </div>

                <div>
                  <div className="mb-3 text-sm uppercase tracking-[0.2em] text-muted-foreground">Inkluderet</div>
                  <div className="grid gap-3 md:grid-cols-2">
                    {recommendedPackage.inclusions.map((item) => (
                      <div key={item} className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Button className="gap-2" size="lg" onClick={() => setStep(3)}>
                    Se ledige DJs til denne pakke
                  </Button>
                  <Button variant="outline" size="lg" onClick={() => setStep(1)}>
                    Ret oplysninger
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : null}

        <Dialog open={step === 3} onOpenChange={(open) => setStep(open ? 3 : 2)}>
          <DialogContent className="glass max-w-xl border-white/10 bg-background/95 text-foreground">
            <DialogHeader>
              <DialogTitle className="font-display text-3xl">Se ledige DJs</DialogTitle>
              <DialogDescription>
                Indtast din arbejds-mail for at låse op for ledige profiler. Vi opretter et unikt link, du kan dele med festudvalget.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="navn@firma.dk"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <Button className="w-full" size="lg" onClick={handleCreateEvent}>
                Vis DJs
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
