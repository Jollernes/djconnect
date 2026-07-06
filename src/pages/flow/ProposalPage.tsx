import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useNavigate, useParams, Link, useLocation } from "react-router-dom";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { FlowLayout } from "@/components/layout/FlowLayout";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { DJShortlistCard, PackageCard, PricingNote } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useStore, createCallbackRequest, getDJ } from "@/lib/store";
import { useDanishPageSeo } from "@/lib/seo";
import { formatDanishDateShort } from "@/lib/utils";

const callbackSchema = z.object({
  full_name: z.string().min(2, "Skriv navn."),
  phone: z.string().min(6, "Skriv et telefonnummer."),
  preferred_time: z.string().optional(),
  message: z.string().optional(),
});

type CallbackValues = z.infer<typeof callbackSchema>;

function SummaryChip({ children }: { children: ReactNode }) {
  return <Badge variant="secondary" className="rounded-full px-3 py-1">{children}</Badge>;
}

function CallbackDialog({ proposalId }: { proposalId: string }) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState, reset } = useForm<CallbackValues>({
    resolver: zodResolver(callbackSchema),
    defaultValues: { full_name: "", phone: "", preferred_time: "", message: "" },
  });

  function onSubmit(values: CallbackValues) {
    createCallbackRequest({
      proposal_id: proposalId,
      full_name: values.full_name,
      phone: values.phone,
      preferred_time: values.preferred_time?.trim() ? values.preferred_time.trim() : null,
      message: values.message?.trim() ? values.message.trim() : "",
    });
    toast.success("Vi kontakter jer hurtigst muligt.");
    reset();
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Book kort rådgivning</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vil du hellere tale med os først?</DialogTitle>
          <DialogDescription>Vi ringer tilbage med en kort, konkret afklaring på jeres brief.</DialogDescription>
        </DialogHeader>
        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-2">
            <Label htmlFor="callback-name">Navn</Label>
            <Input id="callback-name" {...register("full_name")} />
            {formState.errors.full_name ? <p className="text-sm text-destructive">{formState.errors.full_name.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="callback-phone">Telefon</Label>
            <Input id="callback-phone" {...register("phone")} />
            {formState.errors.phone ? <p className="text-sm text-destructive">{formState.errors.phone.message}</p> : null}
          </div>
          <div className="space-y-2">
            <Label htmlFor="callback-time">Foretrukken tid</Label>
            <Input id="callback-time" placeholder="Fx i dag mellem 13 og 15" {...register("preferred_time")} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="callback-message">Besked</Label>
            <Textarea id="callback-message" placeholder="Fortæl kort hvad I gerne vil have afklaret" {...register("message")} />
          </div>
          <DialogFooter>
            <Button type="submit" variant="accent">
              Send tilbagekald
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function NotFoundState() {
  return (
    <Container className="py-12">
      <Card className="mx-auto max-w-2xl border-border/60 shadow-sm">
        <CardHeader>
          <CardTitle>Tilbuddet blev ikke fundet</CardTitle>
          <CardDescription>Vi kunne ikke finde den proposal, du forsøgte at åbne.</CardDescription>
        </CardHeader>
        <CardContent>
          <Button asChild>
            <Link to="/brief">Tilbage til briefen</Link>
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
}

export function ProposalPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const proposal = useStore((snapshot) => (id ? snapshot.proposals.find((item) => item.id === id) ?? null : null));
  const brief = useStore((snapshot) => (proposal ? snapshot.eventBriefs.find((item) => item.id === proposal.event_brief_id) ?? null : null));
  const recommendedPackage = useStore((snapshot) =>
    proposal ? snapshot.packages.find((item) => item.id === proposal.recommended_package_id) ?? null : null,
  );
  const reviews = useStore((snapshot) => snapshot.reviews);
  const [selectedDjId, setSelectedDjId] = useState<string | null>((location.state as { selectedDjId?: string } | null)?.selectedDjId ?? null);

  useEffect(() => {
    if (proposal?.proposal_djs.length && !selectedDjId) {
      setSelectedDjId(proposal.proposal_djs.find((item) => item.is_platform_recommended)?.dj_id ?? proposal.proposal_djs[0]?.dj_id ?? null);
    }
  }, [proposal, selectedDjId]);

  useDanishPageSeo({
    title: "Anbefalet løsning",
    description: "Se den anbefalede pakke og den kuraterede shortlist til jeres firmaevent.",
    canonical: id ? `/proposal/${id}` : "/proposal",
  });

  const shortlist = useMemo(() => {
    if (!proposal) return [];
    return proposal.proposal_djs.slice(0, 3).map((proposalDj) => ({
      proposalDj,
      dj: getDJ(proposalDj.dj_id),
      reviews: reviews.filter((review) => review.approved && review.dj_id === proposalDj.dj_id).slice(0, 2),
    }));
  }, [proposal, reviews]);

  if (!proposal || !brief || !recommendedPackage) {
    return (
      <FlowLayout>
        <NotFoundState />
      </FlowLayout>
    );
  }

  const selectedDj = selectedDjId ? getDJ(selectedDjId) : null;
  const fallbackMode = proposal.proposal_djs.length < 2;
  const eventSummary = [
    brief.event_type,
    formatDanishDateShort(brief.event_date),
    brief.city,
    brief.guest_count_range,
    brief.region,
  ];
  const reasonChips = proposal.proposal_djs[0]?.match_reasons ?? [];
  const technicalChips = [
    brief.needs_sound === "Ja" ? "Lyd er inkluderet" : null,
    brief.needs_lighting === "Ja" ? "Lys er inkluderet" : null,
    brief.needs_microphone === "Ja" ? "Mikrofon til taler" : null,
    brief.needs_dinner_music === "Ja" ? "Middag og baggrundsmusik" : null,
  ].filter((item): item is string => Boolean(item));

  return (
    <FlowLayout>
      <section className="border-b border-border/60 bg-background">
        <Container className="py-8">
          <SectionHeading
            eyebrow="Anbefalet løsning"
            title="Vi har matchet jeres arrangement med en anbefalet løsning"
            description="Her ser du den pakke og den korte shortlist, som passer bedst til jeres brief."
          />
        </Container>
      </section>

      <Container className="py-8 lg:py-10">
        <div className="space-y-8">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Eventoversigt</CardTitle>
              <CardDescription>Et hurtigt overblik over de vigtigste detaljer i briefen.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              {eventSummary.map((item) => (
                <SummaryChip key={item}>{item}</SummaryChip>
              ))}
              {brief.date_flexibility ? <SummaryChip>{brief.date_flexibility}</SummaryChip> : null}
              {brief.music_vibe_tags.map((tag) => (
                <SummaryChip key={tag}>{tag}</SummaryChip>
              ))}
              {technicalChips.map((item) => (
                <SummaryChip key={item}>{item}</SummaryChip>
              ))}
            </CardContent>
          </Card>

          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-4">
              <SectionHeading eyebrow="1. Anbefalet pakke" title="Den anbefalede løsning" description={proposal.recommendation_reason} />
              <PackageCard pkg={recommendedPackage} recommended />
              <Card className="border-border/60 shadow-sm">
                <CardHeader>
                  <CardTitle className="text-lg">Pris og forbehold</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm leading-6 text-muted-foreground">
                    {proposal.price_estimate_from > 0 ? `Prisestimat starter ved ${proposal.price_estimate_from.toLocaleString("da-DK")} kr.` : "Prisestimat aftales ud fra briefen."}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Transport og eventuelle tekniske tillæg på {proposal.travel_fee_estimate + proposal.technical_surcharge_estimate} kr. beregnes før bekræftelse.
                  </p>
                  <PricingNote />
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <SectionHeading eyebrow="2. Hvorfor dette match" title="Matchen er valgt ud fra briefen" />
              <div className="flex flex-wrap gap-2">
                {reasonChips.slice(0, 5).map((reason) => (
                  <Badge key={reason} variant="outline">
                    {reason}
                  </Badge>
                ))}
              </div>
              {fallbackMode ? (
                <Card className="border-amber-200 bg-amber-50 shadow-sm">
                  <CardContent className="p-5 text-sm text-amber-950">
                    Vi har modtaget briefen og bekræfter de bedste muligheder manuelt samme dag.
                  </CardContent>
                </Card>
              ) : null}

              <SectionHeading eyebrow="3. Kontrolleret shortlist" title="Vælg selv blandt de matchede DJs" />
              <div className="grid gap-4">
                {shortlist.map(({ proposalDj, dj, reviews: djReviews }) =>
                  dj ? (
                    <DJShortlistCard
                      key={proposalDj.dj_id}
                      dj={dj}
                      matchScore={proposalDj.match_score}
                      reasons={proposalDj.match_reasons}
                      reviews={djReviews}
                      selectable
                      selected={selectedDjId === proposalDj.dj_id}
                      recommended={proposalDj.is_platform_recommended}
                      onSelect={() => setSelectedDjId(proposalDj.dj_id)}
                    />
                  ) : null,
                )}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Lad os vælge det bedste match</CardTitle>
                <CardDescription>
                  Vi reserverer den bedst egnede DJ ud fra jeres brief, tilgængelighed og erfaring med lignende firmaevents.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  Uanset om I vælger selv eller lader os vælge, står vi for kontrakt, teknik, koordinering og backup.
                </p>
                <Button
                  variant="accent"
                  className="w-full"
                  onClick={() => navigate(`/reserve/${proposal.id}`, { state: { choiceMode: "platform_selects" } })}
                >
                  Reservér anbefalet løsning
                </Button>
              </CardContent>
            </Card>

            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Vælg selv blandt de matchede DJs</CardTitle>
                <CardDescription>Vælg en af de shortlistede DJs, og reserver med den løsning.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm leading-6 text-muted-foreground">
                  Du kan vælge det konkrete match, der passer bedst til jeres personale, stil og eventflow.
                </p>
                <Button
                  variant="accent"
                  className="w-full"
                  disabled={!selectedDj}
                  onClick={() =>
                    navigate(`/reserve/${proposal.id}`, {
                      state: {
                        choiceMode: "client_selected_dj",
                        selectedDjId: selectedDjId,
                      },
                    })
                  }
                >
                  Reservér med denne DJ
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card className="border-border/60 bg-muted/20 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-6 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-accent">Rådgivning</p>
                <h3 className="mt-2 text-xl font-semibold tracking-tight">Vil du hellere tale med os først?</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Vi hjælper gerne med en kort afklaring, hvis der er noget i briefen, der skal justeres.</p>
              </div>
              <CallbackDialog proposalId={proposal.id} />
            </CardContent>
          </Card>
        </div>
      </Container>
    </FlowLayout>
  );
}
