import { Link, useParams } from "react-router-dom";
import { CheckCircle2, LayoutDashboard } from "lucide-react";
import { FlowLayout } from "@/components/layout/FlowLayout";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { useDanishPageSeo } from "@/lib/seo";
import { formatDanishDateShort, formatDKK } from "@/lib/utils";

const nextSteps = [
  "Vi gennemgår tilgængelighed og tekniske detaljer",
  "Du modtager endelig bekræftelse eller spørgsmål",
  "Kontrakt og faktura/depositum sendes",
  "Det endelige eventspørgeskema udfyldes",
  "Run sheet og teknik bekræftes før eventet",
  "Kundeportal",
] as const;

export function ReservationSuccessPage() {
  const { bookingId } = useParams();
  const booking = useStore((snapshot) => (bookingId ? snapshot.bookings.find((item) => item.id === bookingId) ?? null : null));
  const brief = useStore((snapshot) => (booking ? snapshot.eventBriefs.find((item) => item.id === booking.event_brief_id) ?? null : null));
  const pkg = useStore((snapshot) => (booking ? snapshot.packages.find((item) => item.id === booking.recommended_package_id) ?? null : null));

  useDanishPageSeo({
    title: "Reservation modtaget",
    description: "Tak. Vi har modtaget jeres reservationsanmodning.",
    canonical: bookingId ? `/reservation/${bookingId}/kvittering` : "/reservation/kvittering",
  });

  if (!booking || !brief || !pkg) {
    return (
      <FlowLayout>
        <Container className="py-12">
          <Card className="mx-auto max-w-2xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Reservationen blev ikke fundet</CardTitle>
              <CardDescription>Vi kunne ikke finde reservationen, der skulle vises.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <Link to="/">Til forsiden</Link>
              </Button>
            </CardContent>
          </Card>
        </Container>
      </FlowLayout>
    );
  }

  return (
    <FlowLayout exitLabel="Til forsiden">
      <section className="border-b border-border/60 bg-background">
        <Container className="py-8">
          <SectionHeading
            eyebrow="Reservation modtaget"
            title="Tak. Vi har modtaget jeres reservationsanmodning."
            description="Vi vender tilbage samme dag med næste skridt."
          />
        </Container>
      </section>

      <Container className="py-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr]">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle>Næste skridt</CardTitle>
              <CardDescription>Det her er, hvad der sker herefter.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {nextSteps.map((step, index) => (
                <div key={step} className="flex items-start gap-3 rounded-2xl border border-border/60 bg-muted/20 p-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-accent/10 text-sm font-semibold text-accent">
                    {index + 1}
                  </div>
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">{step}</p>
                    {index === 5 ? <p className="text-sm text-muted-foreground">Følg din reservation i kundeportalen.</p> : null}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="space-y-4">
            <Card className="border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle>Reservationsoversigt</CardTitle>
                <CardDescription>Et kort overblik over den modtagne anmodning.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{brief.company_name}</Badge>
                  <Badge variant="secondary">{formatDanishDateShort(brief.event_date)}</Badge>
                  <Badge variant="secondary">{brief.city}</Badge>
                </div>
                <p className="text-muted-foreground">{pkg.name}</p>
                <BookingStatusBadge status={booking.status} />
                <p className="text-muted-foreground">
                  Prisestimat: {formatDKK(booking.final_price)} ekskl. moms
                </p>
              </CardContent>
            </Card>

            <Card className="border-border/60 bg-muted/20 shadow-sm">
              <CardContent className="space-y-4 p-6">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-success" />
                  <p className="text-sm leading-6 text-foreground">Vi holder jer opdateret, og I får svar samme dag.</p>
                </div>
                <Button asChild variant="accent" className="w-full">
                  <Link to="/client">
                    <LayoutDashboard className="mr-2 h-4 w-4" />
                    Følg din reservation
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </FlowLayout>
  );
}
