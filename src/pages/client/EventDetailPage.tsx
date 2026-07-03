import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { PencilLine, Send } from "lucide-react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { PackageCard } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn, formatDanishDate, formatDKK } from "@/lib/utils";
import {
  addMessage,
  submitQuestionnaire,
  useStore,
} from "@/lib/store";
import { BOOKING_STATUS_META } from "@/types/domain";
import { useDanishPageSeo } from "@/lib/seo";
import { useAuth } from "@/hooks/useAuth";

const questionnaireSchema = z.object({
  venue_contact_name: z.string().optional().or(z.literal("")),
  venue_contact_phone: z.string().optional().or(z.literal("")),
  load_in_time: z.string().optional().or(z.literal("")),
  parking_info: z.string().optional().or(z.literal("")),
  access_notes: z.string().optional().or(z.literal("")),
  final_start_time: z.string().optional().or(z.literal("")),
  final_end_time: z.string().optional().or(z.literal("")),
  speech_times: z.string().optional().or(z.literal("")),
  microphone_notes: z.string().optional().or(z.literal("")),
  must_play_final: z.string().optional().or(z.literal("")),
  do_not_play_final: z.string().optional().or(z.literal("")),
  dress_code: z.string().optional().or(z.literal("")),
  onsite_contact_name: z.string().optional().or(z.literal("")),
  onsite_contact_phone: z.string().optional().or(z.literal("")),
  special_notes: z.string().optional().or(z.literal("")),
});

type QuestionnaireValues = z.infer<typeof questionnaireSchema>;

const messageSchema = z.object({
  body: z.string().min(2, "Skriv en besked."),
});

type MessageValues = z.infer<typeof messageSchema>;

export function EventDetailPage() {
  const { bookingId } = useParams();
  const navigate = useNavigate();
  const { profile } = useAuth();
  const booking = useStore((snapshot) => (bookingId ? snapshot.bookings.find((item) => item.id === bookingId) ?? null : null));
  const brief = useStore((snapshot) => (booking ? snapshot.eventBriefs.find((item) => item.id === booking.event_brief_id) ?? null : null));
  const proposal = useStore((snapshot) => (booking ? snapshot.proposals.find((item) => item.id === booking.proposal_id) ?? null : null));
  const pkg = useStore((snapshot) => (booking ? snapshot.packages.find((item) => item.id === booking.recommended_package_id) ?? null : null));
  const selectedDj = useStore((snapshot) => (booking?.selected_dj_id ? snapshot.djs.find((item) => item.id === booking.selected_dj_id) ?? null : null));
  const questionnaire = useStore((snapshot) => (booking ? snapshot.questionnaires.find((item) => item.booking_id === booking.id) ?? null : null));
  const messages = useStore((snapshot) => (booking ? snapshot.messages.filter((message) => message.booking_id === booking.id) : []));

  useDanishPageSeo({
    title: "Eventdetaljer",
    description: "Overblik over reservation, status, spørgeskema og beskeder.",
    canonical: bookingId ? `/client/event/${bookingId}` : "/client/event",
  });

  const timeline = useMemo(
    () =>
      (Object.entries(BOOKING_STATUS_META) as Array<[keyof typeof BOOKING_STATUS_META, (typeof BOOKING_STATUS_META)[keyof typeof BOOKING_STATUS_META]]>)
        .sort((a, b) => a[1].displayOrder - b[1].displayOrder),
    [],
  );

  const questionnaireForm = useForm<QuestionnaireValues>({
    resolver: zodResolver(questionnaireSchema),
    defaultValues: questionnaire ? questionnaireToValues(questionnaire) : {
      venue_contact_name: "",
      venue_contact_phone: "",
      load_in_time: "",
      parking_info: "",
      access_notes: "",
      final_start_time: "",
      final_end_time: "",
      speech_times: "",
      microphone_notes: "",
      must_play_final: "",
      do_not_play_final: "",
      dress_code: "",
      onsite_contact_name: "",
      onsite_contact_phone: "",
      special_notes: "",
    },
  });

  const messageForm = useForm<MessageValues>({
    resolver: zodResolver(messageSchema),
    defaultValues: { body: "" },
  });

  const [editingQuestionnaire, setEditingQuestionnaire] = useState(!questionnaire);

function questionnaireToValues(questionnaireRow: NonNullable<typeof questionnaire>) {
  return {
    venue_contact_name: questionnaireRow.venue_contact_name ?? "",
    venue_contact_phone: questionnaireRow.venue_contact_phone ?? "",
    load_in_time: questionnaireRow.load_in_time ?? "",
    parking_info: questionnaireRow.parking_info ?? "",
    access_notes: questionnaireRow.access_notes ?? "",
    final_start_time: questionnaireRow.final_start_time ?? "",
    final_end_time: questionnaireRow.final_end_time ?? "",
    speech_times: questionnaireRow.speech_times ?? "",
    microphone_notes: questionnaireRow.microphone_notes ?? "",
    must_play_final: questionnaireRow.must_play_final ?? "",
    do_not_play_final: questionnaireRow.do_not_play_final ?? "",
    dress_code: questionnaireRow.dress_code ?? "",
    onsite_contact_name: questionnaireRow.onsite_contact_name ?? "",
    onsite_contact_phone: questionnaireRow.onsite_contact_phone ?? "",
    special_notes: questionnaireRow.special_notes ?? "",
  };
}

  if (!booking || !brief || !proposal || !pkg) {
    return (
      <Container className="py-10">
        <EmptyState
          title="Eventet blev ikke fundet"
          description="Vi kunne ikke indlæse reservationen."
          action={
            <Button asChild>
              <Link to="/client">Tilbage til kundeportalen</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const selectedPathLabel = booking!.client_choice_mode === "client_selected_dj" && selectedDj ? `Valgt DJ: ${selectedDj.public_display_name}` : "Valgt: Vi vælger det bedste match";
  const selectedDjLabel = selectedDj?.public_display_name ?? "DJ bekræftes af platformen";
  const statusMeta = BOOKING_STATUS_META[booking!.status];

  const questionnaireValues = questionnaire ?? questionnaireForm.getValues();

  function onQuestionnaireSubmit(values: QuestionnaireValues) {
    submitQuestionnaire(booking!.id, {
      venue_contact_name: values.venue_contact_name?.trim() ? values.venue_contact_name.trim() : null,
      venue_contact_phone: values.venue_contact_phone?.trim() ? values.venue_contact_phone.trim() : null,
      load_in_time: values.load_in_time?.trim() ? values.load_in_time.trim() : null,
      parking_info: values.parking_info?.trim() ? values.parking_info.trim() : null,
      access_notes: values.access_notes?.trim() ? values.access_notes.trim() : null,
      final_start_time: values.final_start_time?.trim() ? values.final_start_time.trim() : null,
      final_end_time: values.final_end_time?.trim() ? values.final_end_time.trim() : null,
      speech_times: values.speech_times?.trim() ? values.speech_times.trim() : null,
      microphone_notes: values.microphone_notes?.trim() ? values.microphone_notes.trim() : null,
      must_play_final: values.must_play_final?.trim() ? values.must_play_final.trim() : null,
      do_not_play_final: values.do_not_play_final?.trim() ? values.do_not_play_final.trim() : null,
      dress_code: values.dress_code?.trim() ? values.dress_code.trim() : null,
      onsite_contact_name: values.onsite_contact_name?.trim() ? values.onsite_contact_name.trim() : null,
      onsite_contact_phone: values.onsite_contact_phone?.trim() ? values.onsite_contact_phone.trim() : null,
      special_notes: values.special_notes?.trim() ? values.special_notes.trim() : null,
      submitted_by_name: profile?.full_name ?? brief!.contact_name,
      submitted_by_email: profile?.email ?? brief!.contact_email,
      submitted_at: new Date().toISOString(),
      completed_at: new Date().toISOString(),
      status: "completed",
    });
    setEditingQuestionnaire(false);
  }

  function onMessageSubmit(values: MessageValues) {
    addMessage({
      sender_role: "client",
      booking_id: booking!.id,
      sender_name: profile?.full_name ?? brief!.contact_name,
      body: values.body.trim(),
    });
    messageForm.reset();
  }

  return (
    <Container className="py-8 lg:py-10">
      <div className="space-y-8">
        <SectionHeading eyebrow="Eventdetaljer" title={`${brief.company_name} · ${brief.event_type}`} description="Her er jeres booking, spørgeskema og beskeder samlet." />

        <div className="grid gap-4 lg:grid-cols-3">
          <Card className="border-border/60 shadow-sm lg:col-span-2">
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle>Eventoverblik</CardTitle>
                  <CardDescription>{formatDanishDate(brief.event_date)} · {brief.city}</CardDescription>
                </div>
                <BookingStatusBadge status={booking.status} />
              </div>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <InfoRow label="Pakke" value={pkg.name} />
              <InfoRow label="Valgt løsning" value={selectedPathLabel} />
              <InfoRow label="DJ" value={selectedDjLabel} />
              <InfoRow label="Prisestimat" value={`${formatDKK(booking.final_price)} ekskl. moms`} />
              <InfoRow label="Moms" value={`${formatDKK(booking.vat_amount)}`} />
              <InfoRow label="Kontraktstatus" value={booking.contract_status} />
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Statusforløb</CardTitle>
              <CardDescription>De vigtigste trin i bookingprocessen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {timeline.map(([key, meta], index) => {
                const active = meta.displayOrder <= statusMeta.displayOrder;
                return (
                  <div key={key} className={cn("flex items-center gap-3 rounded-2xl border p-3", active ? "border-accent/30 bg-accent/5" : "border-border/50 bg-muted/10")}>
                    <div className={cn("flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold", active ? "bg-accent text-accent-foreground" : "bg-muted text-muted-foreground")}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{meta.label}</p>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Pakke og teknik</CardTitle>
              <CardDescription>Det, der er inkluderet i jeres løsning.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <PackageCard pkg={pkg} recommended />
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                <p>{proposal.recommendation_reason}</p>
                <p className="mt-2">Transport og tekniske tillæg aftales tydeligt før bekræftelse.</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Teknik og næste skridt</CardTitle>
              <CardDescription>Run sheet, teknik og backup kommer her.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <p className="font-medium text-foreground">Backup</p>
                <p className="text-muted-foreground">Vi står for en plan B, hvis der opstår sygdom eller andre udfordringer.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <p className="font-medium text-foreground">Run-sheet status</p>
                <p className="text-muted-foreground">Run sheet og teknisk bekræftelse er endnu ikke låst i demoen.</p>
              </div>
              <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                <p className="font-medium text-foreground">Rådgivning</p>
                <p className="text-muted-foreground">Hvis der er spørgsmål, kan I altid skrive direkte til teamet herunder.</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="flex-row items-center justify-between">
            <div>
              <CardTitle>Eventspørgeskema</CardTitle>
              <CardDescription>Udfyld eller opdater de sidste detaljer til aftenen.</CardDescription>
            </div>
            {questionnaire ? (
              <Button variant="outline" size="sm" onClick={() => setEditingQuestionnaire((current) => !current)}>
                <PencilLine className="mr-2 h-4 w-4" />
                {editingQuestionnaire ? "Vis svar" : "Redigér"}
              </Button>
            ) : null}
          </CardHeader>
          <CardContent>
            {booking.status !== "confirmed" ? (
              <div className="mb-4 rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm text-muted-foreground">
                Spørgeskemaet bliver normalt tilgængeligt efter bekræftelse, men I kan godt udfylde det allerede nu i demoen.
              </div>
            ) : null}

            {!questionnaire || editingQuestionnaire ? (
              <form className="grid gap-4 md:grid-cols-2" onSubmit={questionnaireForm.handleSubmit(onQuestionnaireSubmit)}>
                {[
                  ["venue_contact_name", "Venue-kontakt"],
                  ["venue_contact_phone", "Venue-kontakt telefon"],
                  ["load_in_time", "Load-in tidspunkt"],
                  ["parking_info", "Parkering og adgang"],
                  ["access_notes", "Adgangsnoter"],
                  ["final_start_time", "Præcis starttidspunkt for DJ"],
                  ["final_end_time", "Forventet sluttid"],
                  ["speech_times", "Tider for taler"],
                  ["microphone_notes", "Mikrofonbehov"],
                  ["must_play_final", "Must-play sange"],
                  ["do_not_play_final", "Do-not-play sange"],
                  ["dress_code", "Dresscode"],
                  ["onsite_contact_name", "Kontaktperson på aftenen"],
                  ["onsite_contact_phone", "Telefon på aftenen"],
                ].map(([field, label]) => (
                  <div key={field} className={field.includes("notes") || field.includes("play") ? "md:col-span-2" : ""}>
                    <Label htmlFor={field}>{label}</Label>
                    <Input id={field} {...questionnaireForm.register(field as keyof QuestionnaireValues)} />
                  </div>
                ))}
                <div className="md:col-span-2">
                  <Label htmlFor="special_notes">Særlige bemærkninger</Label>
                  <Textarea id="special_notes" className="min-h-28" {...questionnaireForm.register("special_notes")} />
                </div>
                <div className="md:col-span-2 flex justify-end">
                  <Button type="submit" variant="accent">
                    Gem spørgeskema
                  </Button>
                </div>
              </form>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {Object.entries(questionnaireValues).map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-border/60 bg-muted/20 p-4">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{key}</p>
                    <p className="mt-2 text-sm text-foreground">{String(value ?? "—")}</p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Beskeder</CardTitle>
              <CardDescription>Skriv til teamet om ændringer eller spørgsmål.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {messages.length ? messages.map((message) => (
                  <div key={message.id} className={cn("rounded-2xl border p-4 text-sm", message.sender_role === "client" ? "border-accent/20 bg-accent/5" : "border-border/60 bg-muted/20")}>
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{message.sender_name}</p>
                    <p className="mt-2 leading-6 text-foreground">{message.body}</p>
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">Ingen beskeder endnu.</div>
                )}
              </div>
              <form className="space-y-3" onSubmit={messageForm.handleSubmit(onMessageSubmit)}>
                <div className="space-y-2">
                  <Label htmlFor="message_body">Ny besked</Label>
                  <Textarea id="message_body" className="min-h-24" {...messageForm.register("body")} />
                </div>
                <Button type="submit" variant="accent">
                  <Send className="mr-2 h-4 w-4" />
                  Send besked
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Gentag booking</CardTitle>
              <CardDescription>Brug denne løsning som udgangspunkt for næste event.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm leading-6 text-muted-foreground">Vi forudfylder den næste brief med eventtype, dato, by, gæsteantal og stemning fra denne booking.</p>
              <Button
                variant="outline"
                className="w-full"
                onClick={() =>
                  navigate("/brief", {
                    state: {
                      prefill: {
                        event_date: brief.event_date,
                        city: brief.city,
                        guest_count_range: brief.guest_count_range,
                        event_type: brief.event_type,
                      },
                    },
                  })
                }
              >
                Book næste event
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-2 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
