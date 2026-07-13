import { Link, useParams } from "react-router-dom";
import { useMemo } from "react";
import { ArrowRight, RefreshCw, Send } from "lucide-react";
import { Container } from "@/components/common/Container";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { DJShortlistCard, PackageCard } from "@/components/marketing";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { addAdminNote, createProposalForBrief, getDJ, listAdminNotes, updateEventBrief, useStore } from "@/lib/store";
import { formatDanishDate, formatDanishDateShort } from "@/lib/utils";
import { useDanishPageSeo } from "@/lib/seo";
import { BOOKING_STATUS_META, type BookingStatus } from "@/types/domain";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const noteSchema = z.object({
  note: z.string().min(2, "Skriv en note."),
});

type NoteValues = z.infer<typeof noteSchema>;

export function AdminLeadDetailPage() {
  const { id } = useParams();
  const briefs = useStore((snapshot) => snapshot.eventBriefs);
  const proposals = useStore((snapshot) => snapshot.proposals);
  const packages = useStore((snapshot) => snapshot.packages);
  const brief = briefs.find((item) => item.id === id) ?? null;
  const proposal = useMemo(() => (brief ? proposals.filter((item) => item.event_brief_id === brief.id).sort((a, b) => b.created_at.localeCompare(a.created_at))[0] ?? null : null), [brief, proposals]);
  const notes = useStore(() => listAdminNotes("lead", id));
  const noteForm = useForm<NoteValues>({ resolver: zodResolver(noteSchema), defaultValues: { note: "" } });

  useDanishPageSeo({
    title: brief ? `Lead: ${brief.company_name}` : "Lead",
    description: "Detaljer og interne handlinger for et event brief.",
    canonical: id ? `/admin/leads/${id}` : "/admin/leads",
  });

  if (!brief) {
    return (
      <Container className="py-10">
        <EmptyState
          title="Leadet blev ikke fundet"
          description="Vi kunne ikke finde det ønskede brief."
          action={
            <Button asChild>
              <Link to="/admin/leads">Tilbage til leads</Link>
            </Button>
          }
        />
      </Container>
    );
  }

  const currentBrief = brief!;
  const shortlisted = proposal?.proposal_djs.slice(0, 3) ?? [];
  const selectedPackage = proposal ? packages.find((pkg) => pkg.id === proposal.recommended_package_id) ?? null : null;
  const nextStatus = nextLeadStatus(currentBrief.status);

  function regenerateProposal() {
    createProposalForBrief(currentBrief.id);
  }

  function advanceStatus() {
    if (!nextStatus) {
      return;
    }
    updateEventBrief(currentBrief.id, { status: nextStatus });
  }

  function onNoteSubmit(values: NoteValues) {
    addAdminNote({
      related_type: "lead",
      related_id: currentBrief.id,
      note: values.note,
    });
    noteForm.reset();
  }

  return (
    <Container className="space-y-8">
      <SectionHeading eyebrow="Admin" title={currentBrief.company_name} description={`${currentBrief.event_type} · ${currentBrief.city} · ${formatDanishDate(currentBrief.event_date)}`} />

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="border-border/60 shadow-sm lg:col-span-2">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle>Brief</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">Kontakt: {currentBrief.contact_name} · {currentBrief.contact_email}</p>
            </div>
            {currentBrief.status === "archived" ? <Badge variant="outline">Arkiveret</Badge> : <BookingStatusBadge status={currentBrief.status as BookingStatus} />}
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            <InfoRow label="Region" value={currentBrief.region} />
            <InfoRow label="By" value={currentBrief.city} />
            <InfoRow label="Gæster" value={currentBrief.guest_count_range} />
            <InfoRow
              label="Størrelse på mobildiskotek"
              value={currentBrief.setup_size === "compact" ? "Kompakt" : currentBrief.setup_size === "medium" ? "Mellem" : currentBrief.setup_size === "large" ? "Stor" : "—"}
            />
            <InfoRow label="Budget" value={currentBrief.budget_band} />
            <InfoRow label="Tidsrum" value={`${currentBrief.start_time} – ${currentBrief.end_time}`} />
            <InfoRow label="Serviceomfang" value={currentBrief.service_scope} />
            <InfoRow label="Rolle" value={currentBrief.contact_role} />
            <InfoRow label="Venue" value={currentBrief.venue_name ?? "Ikke udfyldt"} />
            <InfoRow label="Venue-status" value={currentBrief.venue_status} />
            <InfoRow label="Tidlig opsætning" value={currentBrief.early_setup_requested ? `Ja${currentBrief.dj_start_time ? ` · DJ starter kl. ${currentBrief.dj_start_time}` : ""}` : "Nej"} />
            <InfoRow label="Teknisk behov" value={[currentBrief.needs_sound, currentBrief.needs_lighting, currentBrief.needs_microphone, currentBrief.needs_dinner_music].join(" · ")} />
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Handlinger</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button className="w-full" variant="accent" onClick={regenerateProposal}>
              <RefreshCw className="mr-2 h-4 w-4" />
              {proposal ? "Genopret proposal" : "Opret proposal"}
            </Button>
            <Button className="w-full" variant="outline" onClick={advanceStatus} disabled={!nextStatus}>
              <ArrowRight className="mr-2 h-4 w-4" />
              Næste status: {nextStatus ? BOOKING_STATUS_META[nextStatus].label : "—"}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Intern note</CardTitle>
          </CardHeader>
          <CardContent>
            <form className="space-y-3" onSubmit={noteForm.handleSubmit(onNoteSubmit)}>
              <Textarea className="min-h-28" placeholder="Skriv interne instruktioner eller follow-up" {...noteForm.register("note")} />
              <div className="flex justify-end">
                <Button type="submit" variant="accent">
                  <Send className="mr-2 h-4 w-4" />
                  Gem note
                </Button>
              </div>
            </form>
            <div className="mt-4 space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="rounded-2xl border border-border/60 bg-muted/20 p-3 text-sm">
                  <p>{note.note}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{formatDanishDateShort(note.created_at)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardHeader>
            <CardTitle>Proposal</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {proposal && selectedPackage ? (
              <>
                <PackageCard pkg={selectedPackage} recommended />
                <p className="text-sm text-muted-foreground">{proposal.recommendation_reason}</p>
                <div className="grid gap-3">
                  {shortlisted.map((proposalDj) => {
                    const dj = getDJ(proposalDj.dj_id);
                    return dj ? (
                      <DJShortlistCard
                        key={dj.id}
                        dj={dj}
                        matchScore={proposalDj.match_score}
                        reasons={proposalDj.match_reasons}
                        recommended={proposalDj.is_platform_recommended}
                      />
                    ) : null;
                  })}
                </div>
              </>
            ) : (
              <div className="rounded-2xl border border-dashed border-border/60 p-6 text-sm text-muted-foreground">
                Der er endnu ikke oprettet en proposal for dette lead.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

function nextLeadStatus(status: "archived" | keyof typeof BOOKING_STATUS_META) {
  if (status === "archived") {
    return null;
  }
  const order = Object.keys(BOOKING_STATUS_META) as Array<keyof typeof BOOKING_STATUS_META>;
  const index = order.indexOf(status);
  return index >= 0 && index < order.length - 1 ? order[index + 1] : null;
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border/60 bg-muted/20 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
