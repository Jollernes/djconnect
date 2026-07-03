import { Link } from "react-router-dom";
import type { ReactNode } from "react";
import { CalendarDays, FileText, Star, Users } from "lucide-react";
import { Container } from "@/components/common/Container";
import { BookingStatusBadge } from "@/components/common/BookingStatusBadge";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { formatDanishDateShort } from "@/lib/utils";
import { availabilityFreshness } from "@/lib/matching";
import { useDanishPageSeo } from "@/lib/seo";
import { BOOKING_STATUS_META } from "@/types/domain";

export function AdminOverviewPage() {
  useDanishPageSeo({
    title: "Adminoversigt",
    description: "Overblik over leads, bookinger, DJs, anmeldelser og indhold.",
    canonical: "/admin",
  });

  const briefs = useStore((snapshot) => snapshot.eventBriefs);
  const bookings = useStore((snapshot) => snapshot.bookings);
  const djs = useStore((snapshot) => snapshot.djs);
  const applications = useStore((snapshot) => snapshot.djApplications);
  const reviews = useStore((snapshot) => snapshot.reviews);
  const upcoming = bookings
    .filter((booking) => booking.status !== "completed" && booking.status !== "cancelled")
    .slice()
    .sort((a, b) => {
      const briefA = briefs.find((item) => item.id === a.event_brief_id);
      const briefB = briefs.find((item) => item.id === b.event_brief_id);
      return (briefA?.event_date ?? "").localeCompare(briefB?.event_date ?? "");
    })
    .slice(0, 5);

  const activeByStage = Object.entries(BOOKING_STATUS_META)
    .map(([status, meta]) => ({
      status,
      label: meta.label,
      count: bookings.filter((booking) => booking.status === status).length,
    }))
    .filter((item) => item.count > 0);

  const staleDjs = djs.filter((dj) => availabilityFreshness(dj).isStale);

  return (
    <Container className="space-y-8">
      <SectionHeading eyebrow="Admin" title="Operations console" description="Her holder teamet styr på pipeline, kvalitet og kapacitet." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Nye leads" value={`${briefs.filter((brief) => brief.status === "new_lead").length}`} icon={<FileText className="h-4 w-4" />} />
        <StatCard title="Aktive bookinger" value={`${bookings.filter((booking) => booking.status !== "completed" && booking.status !== "cancelled").length}`} icon={<CalendarDays className="h-4 w-4" />} />
        <StatCard title="DJ-ansøgninger" value={`${applications.filter((application) => application.status === "pending_review").length}`} icon={<Users className="h-4 w-4" />} />
        <StatCard title="Anmeldelser til godkendelse" value={`${reviews.filter((review) => !review.approved).length}`} icon={<Star className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between gap-4">
              <h2 className="text-lg font-semibold">Bookingpipeline</h2>
              <Button asChild variant="outline" size="sm">
                <Link to="/admin/bookings">Åbn bookinger</Link>
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeByStage.map((item) => (
                <div key={item.status} className="rounded-full border border-border/60 bg-muted/20 px-3 py-1 text-sm">
                  {item.label}: {item.count}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Kapacitetsadvarsel</h2>
              <Badge variant="secondary">{staleDjs.length} stale</Badge>
            </div>
            <div className="space-y-2">
              {staleDjs.slice(0, 4).map((dj) => (
                <div key={dj.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-3 text-sm">
                  <div>
                    <p className="font-medium">{dj.public_display_name}</p>
                    <p className="text-muted-foreground">Sidst opdateret {formatDanishDateShort(dj.last_availability_update)}</p>
                  </div>
                  <Button asChild size="sm" variant="outline">
                    <Link to={`/admin/djs/${dj.id}`}>Åbn</Link>
                  </Button>
                </div>
              ))}
              {staleDjs.length === 0 ? <p className="text-sm text-muted-foreground">Alle DJ'er har frisk tilgængelighed.</p> : null}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <h2 className="text-lg font-semibold">Nye leads</h2>
            {briefs.slice(0, 5).map((brief) => (
              <div key={brief.id} className="flex items-center justify-between gap-3 rounded-2xl border border-border/60 p-3 text-sm">
                <div>
                  <p className="font-medium">{brief.company_name}</p>
                  <p className="text-muted-foreground">{brief.event_type} · {brief.city} · {formatDanishDateShort(brief.event_date)}</p>
                </div>
                <Button asChild size="sm" variant="outline">
                  <Link to={`/admin/leads/${brief.id}`}>Detaljer</Link>
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <h2 className="text-lg font-semibold">Kommende events</h2>
            {upcoming.map((booking) => {
              const brief = briefs.find((item) => item.id === booking.event_brief_id);
              return (
                <div key={booking.id} className="flex items-start justify-between gap-3 rounded-2xl border border-border/60 p-3 text-sm">
                  <div>
                    <p className="font-medium">{brief?.company_name ?? booking.company_name}</p>
                    <p className="text-muted-foreground">
                      {brief ? `${formatDanishDateShort(brief.event_date)} · ${brief.city}` : "Ukendt dato"}
                    </p>
                  </div>
                  <BookingStatusBadge status={booking.status} />
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string; icon: ReactNode }) {
  return (
    <Card className="border-border/60 shadow-sm">
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 text-3xl font-semibold">{value}</p>
        </div>
        <div className="rounded-2xl border border-border/60 bg-muted/20 p-3 text-muted-foreground">{icon}</div>
      </CardContent>
    </Card>
  );
}
