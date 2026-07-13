import { Link } from "react-router-dom";
import { useMemo } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { approveDJApplication, rejectDJApplication, useStore } from "@/lib/store";
import { formatDanishDateShort } from "@/lib/utils";
import { availabilityFreshness } from "@/lib/matching";
import { useDanishPageSeo } from "@/lib/seo";

export function AdminDJsPage() {
  useDanishPageSeo({
    title: "DJ'er",
    description: "Overblik over DJ-kvalitet, tilgængelighed og ansøgninger.",
    canonical: "/admin/djs",
  });

  const djs = useStore((snapshot) => snapshot.djs);
  const applications = useStore((snapshot) => snapshot.djApplications);
  const pendingApps = useMemo(() => applications.filter((app) => app.status === "pending_review"), [applications]);

  return (
    <Container className="space-y-8">
      <SectionHeading eyebrow="Admin" title="DJ'er" description="Kvalitet, status og ansøgninger." />

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {djs.map((dj) => {
          const freshness = availabilityFreshness(dj);
          return (
            <Card key={dj.id} className="border-border/60 shadow-sm">
              <CardContent className="space-y-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{dj.public_display_name}</p>
                    <p className="text-sm text-muted-foreground">{dj.city} · {dj.regions[0]}</p>
                  </div>
                  <Badge variant="outline">{dj.status}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">Kvalitet {dj.profile_quality_score} · Pålidelighed {dj.reliability_score} · Tilgængelighed {freshness.score}%</p>
                <p className="text-sm text-muted-foreground">{freshness.isStale ? "Tilgængelighed bør opdateres" : "Tilgængelighed er frisk"}</p>
                <Button asChild variant="outline" className="w-full">
                  <Link to={`/admin/djs/${dj.id}`}>Åbn profil</Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="space-y-4 p-5">
          <div className="flex items-center justify-between gap-4">
            <h2 className="text-lg font-semibold">DJ-ansøgninger</h2>
            <Badge variant="secondary">{pendingApps.length} afventer</Badge>
          </div>
          {pendingApps.length ? (
            <div className="grid gap-3">
              {pendingApps.map((application) => (
                <div key={application.id} className="rounded-2xl border border-border/60 p-4">
                  <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                    <div>
                      <p className="font-medium">{application.stage_name}</p>
                      <p className="text-sm text-muted-foreground">{application.city} · {application.email} · {formatDanishDateShort(application.created_at)}</p>
                      <p className="text-xs text-muted-foreground">Regioner: {application.regions.join(", ")}</p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="accent" onClick={() => approveDJApplication(application.id)}>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Godkend
                      </Button>
                      <Button variant="outline" onClick={() => rejectDJApplication(application.id)}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Afvis
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Ingen ansøgninger til behandling.</p>
          )}
        </CardContent>
      </Card>
    </Container>
  );
}
