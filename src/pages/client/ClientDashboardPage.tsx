import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";
import { Container } from "@/components/common/Container";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeading } from "@/components/common/SectionHeading";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useDanishPageSeo } from "@/lib/seo";
import { formatDanishDateShort, formatDKK } from "@/lib/utils";

export function ClientDashboardPage() {
  useDanishPageSeo({
    title: "Kundeportal",
    description: "Følg jeres reservationer, status og næste skridt i kundeportalen.",
    canonical: "/client",
  });

  const bookings = useStore((snapshot) => [...snapshot.bookings].sort((a, b) => b.created_at.localeCompare(a.created_at)));
  const proposals = useStore((snapshot) => snapshot.proposals);
  const briefs = useStore((snapshot) => snapshot.eventBriefs);
  const packages = useStore((snapshot) => snapshot.packages);
  const djs = useStore((snapshot) => snapshot.djs);

  const activeProposal = proposals.find((proposal) => !bookings.some((booking) => booking.proposal_id === proposal.id));

  return (
    <Container className="py-8 lg:py-10">
      <div className="space-y-8">
        <SectionHeading
          eyebrow="Kundeportal"
          title="Jeres reservationer og næste skridt"
          description="Her kan I følge status på de events, vi allerede har i gang."
        />

        {activeProposal ? (
          <Card className="border-border/60 bg-muted/20 shadow-sm">
            <CardHeader>
              <CardTitle>Fortsæt din reservation</CardTitle>
              <CardDescription>Der ligger en anbefalet løsning klar til jer.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-muted-foreground">
                <p>Proposal er klar til næste skridt.</p>
              </div>
              <Button asChild variant="accent">
                <Link to={`/proposal/${activeProposal.id}`}>
                  Åbn løsning
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {bookings.length === 0 ? (
          <EmptyState
            icon={<Sparkles className="h-8 w-8" />}
            title="Ingen bookinger endnu"
            description="Start med at udfylde briefen, så matcher vi jer med en anbefalet løsning."
            action={
              <Button asChild variant="accent">
                <Link to="/brief">Udfyld brief</Link>
              </Button>
            }
          />
        ) : (
          <div className="grid gap-4 xl:grid-cols-2">
            {bookings.map((booking) => {
              const brief = briefs.find((item) => item.id === booking.event_brief_id);
              const pkg = packages.find((item) => item.id === booking.recommended_package_id);
              const selectedDj = booking.selected_dj_id ? djs.find((dj) => dj.id === booking.selected_dj_id) : null;
              return (
                <Card key={booking.id} className="border-border/60 shadow-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <CardTitle>{brief?.event_type ?? "Event"}</CardTitle>
                        <CardDescription>{brief ? `${formatDanishDateShort(brief.event_date)} · ${brief.city}` : "Detaljer mangler"}</CardDescription>
                      </div>
                      <BookingStatusBadge status={booking.status} />
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4 text-sm">
                    <div className="flex flex-wrap gap-2">
                      <Badge variant="secondary">{pkg?.name ?? "Pakke"}</Badge>
                      <Badge variant="outline">{booking.client_choice_mode === "client_selected_dj" && selectedDj ? `Valgt DJ: ${selectedDj.public_display_name}` : "Vi vælger det bedste match"}</Badge>
                    </div>
                    <p className="text-muted-foreground">Prisestimat: {formatDKK(booking.final_price)} ekskl. moms</p>
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-muted-foreground">Eventdetaljer og status</span>
                      <Button asChild variant="outline" size="sm">
                        <Link to={`/client/event/${booking.id}`}>Åbn event</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </Container>
  );
}
