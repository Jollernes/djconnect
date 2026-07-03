import { Link, useParams } from "react-router-dom";
import { useMemo, type ReactNode } from "react";
import type { Resolver } from "react-hook-form";
import { ArrowRight, Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { PackageCard } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { addAdminNote, getDJ, setBookingFinancials, updateBooking, updateBookingStatus, useStore } from "@/lib/store";
import { formatDanishDate, formatDKK } from "@/lib/utils";
import { useDanishPageSeo } from "@/lib/seo";
import { BOOKING_STATUS_META, type BookingStatus } from "@/types/domain";

const financialSchema = z.object({
  final_price: z.coerce.number().min(0),
  vat_amount: z.coerce.number().min(0),
  travel_fee: z.coerce.number().min(0),
  technical_surcharge: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
});

const noteSchema = z.object({
  note: z.string().min(2, "Skriv en intern note."),
});

type FinancialValues = z.infer<typeof financialSchema>;
type NoteValues = z.infer<typeof noteSchema>;

export function AdminBookingDetailPage() {
  const { id } = useParams();
  const bookings = useStore((snapshot) => snapshot.bookings);
  const briefs = useStore((snapshot) => snapshot.eventBriefs);
  const proposals = useStore((snapshot) => snapshot.proposals);
  const packages = useStore((snapshot) => snapshot.packages);
  const djs = useStore((snapshot) => snapshot.djs);
  const questionnaire = useStore((snapshot) => snapshot.questionnaires.find((item) => item.booking_id === id) ?? null);
  const messages = useStore((snapshot) => snapshot.messages.filter((item) => item.booking_id === id));
  const notes = useStore((snapshot) => snapshot.adminNotes.filter((item) => item.related_type === "booking" && item.related_id === id));
  const booking = bookings.find((item) => item.id === id) ?? null;
  const brief = booking ? briefs.find((item) => item.id === booking.event_brief_id) ?? null : null;
  const proposal = booking ? proposals.find((item) => item.id === booking.proposal_id) ?? null : null;
  const pkg = booking ? packages.find((item) => item.id === booking.recommended_package_id) ?? null : null;
  const selectedDj = booking?.selected_dj_id ? getDJ(booking.selected_dj_id) : null;
  const backupDj = booking?.backup_dj_id ? getDJ(booking.backup_dj_id) : null;

  useDanishPageSeo({
    title: booking ? `Booking: ${booking.company_name}` : "Booking",
    description: "Detaljer for en booking i pipeline.",
    canonical: id ? `/admin/bookings/${id}` : "/admin/bookings",
  });

  const timeline = useMemo(
    () => (Object.entries(BOOKING_STATUS_META) as Array<[BookingStatus, (typeof BOOKING_STATUS_META)[BookingStatus]]>).sort((a, b) => a[1].displayOrder - b[1].displayOrder),
    [],
  );

  const financialForm = useForm<FinancialValues>({
    resolver: zodResolver(financialSchema) as Resolver<FinancialValues>,
    defaultValues: booking
      ? {
          final_price: booking.final_price,
          vat_amount: booking.vat_amount,
          travel_fee: booking.travel_fee,
          technical_surcharge: booking.technical_surcharge,
          discount: booking.discount,
        }
      : {
          final_price: 0,
          vat_amount: 0,
          travel_fee: 0,
          technical_surcharge: 0,
          discount: 0,
        },
  });

  const noteForm = useForm<NoteValues>({ resolver: zodResolver(noteSchema), defaultValues: { note: "" } });

  if (!booking || !brief || !pkg) {
    return (
      <Container className="py-10">
        <EmptyState
          title="Bookingen blev ikke fundet"
          description="Den ønskede booking kunne ikke findes."
          action={
            <Button asChild>
              <Link to="/admin/bookings">Tilbage til bookinger</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const currentBooking = booking;
  const currentBrief = brief;
  const currentPackage = pkg;
  const nextStatus = nextBookingStatus(currentBooking.status);

  function onFinancialSubmit(values: FinancialValues) {
    setBookingFinancials(currentBooking.id, {
      final_price: values.final_price,
      vat_amount: values.vat_amount,
      travel_fee: values.travel_fee,
      technical_surcharge: values.technical_surcharge,
      discount: values.discount,
    });
  }

  function onNoteSubmit(values: NoteValues) {
    addAdminNote({
      related_type: "booking",
      related_id: currentBooking.id,
      note: values.note,
    });
    noteForm.reset();
  }

  return (
    <Container className="space-y-8">
      <SectionHeading eyebrow="Admin" title={currentBooking.company_name} description={`${currentBrief.event_type} · ${formatDanishDate(currentBrief.event_date)} · ${currentBrief.city}`} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Booking</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">{currentBooking.contact_name} · {currentBooking.contact_email} · {currentBooking.contact_phone ?? "Ingen telefon"}</p>
            </div>
            <BookingStatusBadge status={currentBooking.status} />
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Kontakt" value={`${currentBooking.contact_name} · ${currentBooking.contact_email}`} />
            <InfoRow label="Faktura" value={currentBooking.invoice_email ?? "Ikke angivet"} />
            <InfoRow label="CVR" value={currentBooking.cvr_number ?? "Ikke angivet"} />
            <InfoRow label="Valgt DJ" value={selectedDj ? `${selectedDj.public_display_name} · ${selectedDj.phone ?? "Ingen telefon"}` : "Ikke tildelt"} />
            <InfoRow label="Backup DJ" value={backupDj ? `${backupDj.public_display_name} · ${backupDj.phone ?? "Ingen telefon"}` : "Ikke tildelt"} />
            <InfoRow label="Valgt pakke" value={currentPackage.name} />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Fremdrift</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {timeline.map(([status, meta]) => (
              <div key={status} className={`rounded-2xl border p-3 text-sm ${meta.displayOrder <= BOOKING_STATUS_META[currentBooking.status].displayOrder ? "border-accent/30 bg-accent/5" : "border-border/60 bg-muted/10"}`}>
                {meta.label}
              </div>
            ))}
            <Button className="w-full" variant="outline" onClick={() => nextStatus && updateBookingStatus(currentBooking.id, nextStatus)}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Næste status: {nextStatus ? BOOKING_STATUS_META[nextStatus].label : "—"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Økonomi og assignment</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="grid gap-4 md:grid-cols-2" onSubmit={financialForm.handleSubmit(onFinancialSubmit)}>
              <Field label="Final pris">
                <Input type="number" {...financialForm.register("final_price")} />
              </Field>
              <Field label="Moms">
                <Input type="number" {...financialForm.register("vat_amount")} />
              </Field>
              <Field label="Transport">
                <Input type="number" {...financialForm.register("travel_fee")} />
              </Field>
              <Field label="Teknisk tillæg">
                <Input type="number" {...financialForm.register("technical_surcharge")} />
              </Field>
              <Field label="Rabat">
                <Input type="number" {...financialForm.register("discount")} />
              </Field>
              <div className="flex items-end">
                <Button type="submit" variant="accent" className="w-full">
                  <Save className="mr-2 h-4 w-4" />
                  Gem finansielle felter
                </Button>
              </div>
            </form>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <Field label="Tildelt DJ">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={currentBooking.selected_dj_id ?? ""}
                  onChange={(event) => updateBooking(currentBooking.id, { selected_dj_id: event.target.value || null })}
                >
                  <option value="">Ikke tildelt</option>
                  {djs.map((dj) => (
                    <option key={dj.id} value={dj.id}>
                      {dj.public_display_name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Backup DJ">
                <select
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  value={currentBooking.backup_dj_id ?? ""}
                  onChange={(event) => updateBooking(currentBooking.id, { backup_dj_id: event.target.value || null })}
                >
                  <option value="">Ikke tildelt</option>
                  {djs.map((dj) => (
                    <option key={dj.id} value={dj.id}>
                      {dj.public_display_name}
                    </option>
                  ))}
                </select>
              </Field>
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Brief og pakke</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <PackageCard pkg={currentPackage} recommended />
            {proposal ? <p className="text-sm text-muted-foreground">{proposal.recommendation_reason}</p> : null}
            <div className="grid gap-3 md:grid-cols-2">
              <InfoRow label="Event" value={`${currentBrief.event_type} · ${currentBrief.guest_count_range}`} />
              <InfoRow label="Budget" value={currentBrief.budget_band} />
              <InfoRow label="Valgt path" value={currentBooking.client_choice_mode === "client_selected_dj" ? "Kunden valgte DJ" : "Platform selects"} />
              <InfoRow label="Total" value={`${formatDKK(currentBooking.final_price)} ekskl. moms`} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Questionnaire</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            {questionnaire ? (
              Object.entries(questionnaire)
                .filter(([key]) => key !== "id" && key !== "booking_id" && key !== "submitted_at" && key !== "completed_at" && key !== "status" && key !== "submitted_by_name" && key !== "submitted_by_email")
                .map(([key, value]) => (
                  <div key={key} className="rounded-2xl border border-border/60 bg-muted/20 p-3">
                    <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{key}</p>
                    <p className="mt-1">{String(value ?? "—")}</p>
                  </div>
                ))
            ) : (
              <p className="text-muted-foreground">Intet spørgeskema endnu.</p>
            )}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Interne noter og beskeder</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form className="space-y-3" onSubmit={noteForm.handleSubmit(onNoteSubmit)}>
              <Textarea className="min-h-24" placeholder="Tilføj intern note" {...noteForm.register("note")} />
              <div className="flex justify-end">
                <Button type="submit" variant="accent">Gem note</Button>
              </div>
            </form>
            <div className="space-y-2">
              {messages.map((message) => (
                <div key={message.id} className="rounded-2xl border border-border/60 bg-muted/20 p-3 text-sm">
                  <p className="font-medium">{message.sender_name}</p>
                  <p className="text-muted-foreground">{message.body}</p>
                </div>
              ))}
              {notes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-border/60 p-3 text-sm">
                  {note.note}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}

function nextBookingStatus(current: BookingStatus) {
  const order = Object.keys(BOOKING_STATUS_META) as BookingStatus[];
  const index = order.indexOf(current);
  return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
}
