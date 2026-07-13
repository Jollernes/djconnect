import { useEffect, useMemo } from "react";
import { useLocation, useNavigate, useParams, Link } from "react-router-dom";
import { z } from "zod";
import { useForm, useWatch, type Resolver, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ShieldCheck, Sparkles } from "lucide-react";
import { FlowLayout } from "@/components/layout/FlowLayout";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { PricingNote } from "@/components/marketing";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBooking, getDJ, useStore } from "@/lib/store";
import { useDanishPageSeo } from "@/lib/seo";
import { formatDanishDateShort, formatDKK } from "@/lib/utils";
import type { BookingClientChoiceMode } from "@/types/domain";

const reserveSchema = z.object({
  contact_name: z.string().min(2, "Skriv navn."),
  company_name: z.string().min(2, "Skriv firmanavn."),
  contact_email: z.string().email("Indtast en gyldig arbejdsmail."),
  contact_phone: z.string().optional(),
  invoice_email: z.string().email("Indtast en gyldig e-mail til fakturering.").optional().or(z.literal("")),
  cvr_number: z.string().optional(),
  extra_notes: z.string().optional(),
  confirm_provisional: z.boolean().refine((value) => value, "Du skal acceptere den midlertidige reservation."),
  accept_replacement: z.boolean().refine((value) => value, "Du skal acceptere backup-betingelsen."),
  confirm_vat: z.boolean().refine((value) => value, "Du skal bekræfte at priser vises ekskl. moms."),
});

type ReserveValues = z.infer<typeof reserveSchema>;

function PackageBullets({ pkgId }: { pkgId: string }) {
  const pkg = useStore((snapshot) => snapshot.packages.find((item) => item.id === pkgId) ?? null);
  if (!pkg) return null;
  const bullets = [
    `${pkg.hours_included} timers musik`,
    pkg.sound_included ? "Professionelt lydsetup" : null,
    pkg.lighting_included ? "Danselys inkluderet" : null,
    pkg.microphone_included ? "Trådløs mikrofon til taler" : null,
    pkg.technical_coordination_included ? "Teknisk koordinering" : null,
    pkg.setup_included ? "Opsætning inkluderet" : null,
    pkg.setup_teardown_included ? "Nedtagning inkluderet" : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <div className="space-y-2 text-sm">
      {bullets.slice(0, 5).map((item) => (
        <div key={item} className="flex items-start gap-2">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
          <span>{item}</span>
        </div>
      ))}
    </div>
  );
}

export function ReservePage() {
  const { proposalId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const proposal = useStore((snapshot) => (proposalId ? snapshot.proposals.find((item) => item.id === proposalId) ?? null : null));
  const brief = useStore((snapshot) => (proposal ? snapshot.eventBriefs.find((item) => item.id === proposal.event_brief_id) ?? null : null));
  const pkg = useStore((snapshot) => (proposal ? snapshot.packages.find((item) => item.id === proposal.recommended_package_id) ?? null : null));
  const routeState = (location.state as { choiceMode?: BookingClientChoiceMode; selectedDjId?: string } | null) ?? null;
  const choiceMode = routeState?.choiceMode ?? "platform_selects";
  const selectedDjId = choiceMode === "client_selected_dj" ? routeState?.selectedDjId ?? proposal?.proposal_djs.find((item) => item.is_platform_recommended)?.dj_id ?? null : null;
  const selectedDj = selectedDjId ? getDJ(selectedDjId) : null;

  useDanishPageSeo({
    title: "Reservér løsning",
    description: "Bekræft reservationen og send jeres reservationsanmodning.",
    canonical: proposalId ? `/reserve/${proposalId}` : "/reserve",
  });

  const { register, handleSubmit, setValue, formState, reset, control } = useForm<ReserveValues>({
    resolver: zodResolver(reserveSchema) as unknown as Resolver<ReserveValues>,
    defaultValues: {
      contact_name: "",
      company_name: "",
      contact_email: "",
      contact_phone: "",
      invoice_email: "",
      cvr_number: "",
      extra_notes: "",
      confirm_provisional: false,
      accept_replacement: false,
      confirm_vat: false,
    },
  });

  useEffect(() => {
    if (brief) {
      reset({
        contact_name: brief.contact_name,
        company_name: brief.company_name,
        contact_email: brief.contact_email,
        contact_phone: brief.contact_phone ?? "",
        invoice_email: "",
        cvr_number: "",
        extra_notes: "",
        confirm_provisional: false,
        accept_replacement: false,
        confirm_vat: false,
      });
    }
  }, [brief, reset]);

  const watchedValues = useWatch({ control }) as ReserveValues;

  const priceEstimate = useMemo(() => {
    if (!proposal) return 0;
    return proposal.price_estimate_from + proposal.travel_fee_estimate + proposal.technical_surcharge_estimate;
  }, [proposal]);

  if (!proposal || !brief || !pkg) {
    return (
      <FlowLayout>
        <Container className="py-12">
          <Card className="mx-auto max-w-2xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Reservationen blev ikke fundet</CardTitle>
              <CardDescription>Vi kunne ikke indlæse den proposal, som reservationen skulle bygges på.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/brief">Tilbage til briefen</Link>
              </Button>
            </CardContent>
          </Card>
        </Container>
      </FlowLayout>
    );
  }

  const activeProposal = proposal;
  const activeBrief = brief;
  const activePackage = pkg;

  const onSubmit: SubmitHandler<ReserveValues> = (data) => {
    const booking = createBooking({
      proposal_id: activeProposal.id,
      event_brief_id: activeBrief.id,
      selected_dj_id: selectedDjId,
      recommended_package_id: activePackage.id,
      client_choice_mode: choiceMode,
      company_name: data.company_name,
      contact_name: data.contact_name,
      contact_email: data.contact_email,
      contact_phone: data.contact_phone?.trim() ? data.contact_phone.trim() : null,
      invoice_email: data.invoice_email?.trim() ? data.invoice_email.trim() : null,
      cvr_number: data.cvr_number?.trim() ? data.cvr_number.trim() : null,
      extra_notes: data.extra_notes?.trim() ? data.extra_notes.trim() : null,
      backup_dj_id: null,
      final_price: priceEstimate,
      vat_amount: Math.round(priceEstimate * 0.25),
      travel_fee: activeProposal.travel_fee_estimate,
      technical_surcharge: activeProposal.technical_surcharge_estimate,
      discount: 0,
    });
    navigate(`/reservation/${booking.id}/kvittering`);
  };

  const selectedPathLabel = choiceMode === "client_selected_dj" && selectedDj ? `Valgt DJ: ${selectedDj.public_display_name}` : "Valgt: Vi vælger det bedste match";
  const nextSteps = [
    "Vi gennemgår tilgængelighed og tekniske detaljer",
    "Du modtager endelig bekræftelse eller spørgsmål",
    "Kontrakt og faktura/depositum sendes",
    "Det endelige eventspørgeskema udfyldes",
    "Run sheet og teknik bekræftes før eventet",
  ];

  return (
    <FlowLayout exitLabel="Tilbage til løsningen">
      <section className="border-b border-border/60 bg-background">
        <Container className="py-8">
          <SectionHeading
            eyebrow="Reservation"
            title="Send reservationsanmodning"
            description="Bekræft kontaktoplysninger og de vigtigste vilkår, så vi kan holde jeres løsning på plads."
          />
        </Container>
      </section>

      <Container className="py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Kontakt og bekræftelse</CardTitle>
              <CardDescription>Udfyld de sidste oplysninger og bekræft reservationsvilkårene.</CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="contact_name">Kontaktperson</Label>
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
                    <Label htmlFor="contact_phone">Telefon</Label>
                    <Input id="contact_phone" {...register("contact_phone")} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="invoice_email">Faktureringsmail (valgfrit)</Label>
                    <Input id="invoice_email" type="email" {...register("invoice_email")} />
                    {formState.errors.invoice_email ? <p className="text-sm text-destructive">{formState.errors.invoice_email.message}</p> : null}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvr_number">CVR (valgfrit)</Label>
                    <Input id="cvr_number" {...register("cvr_number")} />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="extra_notes">Ekstra noter</Label>
                    <Textarea id="extra_notes" className="min-h-32" {...register("extra_notes")} />
                  </div>
                </div>

                <div className="space-y-4 rounded-3xl border border-border/60 bg-muted/20 p-5">
                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="confirm_provisional"
                      checked={Boolean(watchedValues.confirm_provisional)}
                      onCheckedChange={(checked) => setValue("confirm_provisional", Boolean(checked), { shouldValidate: true })}
                    />
                    <Label htmlFor="confirm_provisional" className="text-sm leading-6 font-normal">
                      Jeg forstår, at dette er en midlertidig reservation, indtil den er endeligt bekræftet.
                    </Label>
                  </div>
                  {formState.errors.confirm_provisional ? <p className="text-sm text-destructive">{formState.errors.confirm_provisional.message}</p> : null}

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="accept_replacement"
                      checked={Boolean(watchedValues.accept_replacement)}
                      onCheckedChange={(checked) => setValue("accept_replacement", Boolean(checked), { shouldValidate: true })}
                    />
                    <Label htmlFor="accept_replacement" className="text-sm leading-6 font-normal">
                      Jeg accepterer, at platformen kan erstatte DJ'en med en tilsvarende eller bedre kvalificeret DJ ved sygdom eller nødsituation.
                    </Label>
                  </div>
                  {formState.errors.accept_replacement ? <p className="text-sm text-destructive">{formState.errors.accept_replacement.message}</p> : null}

                  <div className="flex items-start gap-3">
                    <Checkbox
                      id="confirm_vat"
                      checked={Boolean(watchedValues.confirm_vat)}
                      onCheckedChange={(checked) => setValue("confirm_vat", Boolean(checked), { shouldValidate: true })}
                    />
                    <Label htmlFor="confirm_vat" className="text-sm leading-6 font-normal">
                      Jeg forstår, at priser vises ekskl. moms.
                    </Label>
                  </div>
                  {formState.errors.confirm_vat ? <p className="text-sm text-destructive">{formState.errors.confirm_vat.message}</p> : null}
                </div>

                <div className="flex flex-col gap-3 border-t border-border/60 pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="text-sm text-muted-foreground">
                    <p>Du bekræfter ikke en betaling her — kun en reservationsanmodning.</p>
                  </div>
                  <Button type="submit" variant="accent">
                    Send reservationsanmodning
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Reservationsoverblik</CardTitle>
                <CardDescription>Det er denne løsning, du er ved at reservere.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{brief.company_name}</Badge>
                  <Badge variant="secondary">{formatDanishDateShort(brief.event_date)}</Badge>
                  <Badge variant="secondary">{brief.city}</Badge>
                </div>
                <div className="space-y-2 text-sm">
                  <p className="font-medium text-foreground">{pkg.name}</p>
                  <p className="text-muted-foreground">{brief.event_type}</p>
                  <p className="text-muted-foreground">{selectedPathLabel}</p>
                  <p className="text-muted-foreground">Prisestimat: {formatDKK(priceEstimate)} ekskl. moms</p>
                  <p className="text-muted-foreground">{pkg.vat_note}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Inkluderet i løsningen</CardTitle>
              </CardHeader>
              <CardContent>
                <PackageBullets pkgId={pkg.id} />
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Backup og næste skridt</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                  <p>Backup-politik: {pkg.backup_level === "premium" ? "Fuldt backup-setup" : "Erstatning eller tilsvarende løsning ved behov"}.</p>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-gold" />
                  <p>{proposal.recommendation_reason}</p>
                </div>
                <div className="space-y-2 border-t border-border/60 pt-4">
                  <p className="font-medium">Næste skridt</p>
                  {nextSteps.map((step) => (
                    <p key={step} className="flex items-start gap-2 text-muted-foreground">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
                      <span>{step}</span>
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>

            <PricingNote />
          </div>
        </div>
      </Container>
    </FlowLayout>
  );
}
