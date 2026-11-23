import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { mockPendingVerifications } from "@/data/mock";
import { formatDate } from "@/lib/utils";
import { PhotoGallery } from "@/components/common/PhotoGallery";

export function VerificationQueuePage() {
  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold">DJ-verificeringskø</h1>
      <p className="text-sm text-muted-foreground">Gennemgå nye DJ-ansøgninger og godkend eller afvis.</p>
      {mockPendingVerifications.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-sm text-muted-foreground">Køen er tom 🎉</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {mockPendingVerifications.map((d) => (
            <Link key={d.id} to={`/admin/verification/${d.id}`}>
              <Card className="transition-shadow hover:shadow-md">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <img src={d.profile.avatar_url ?? ""} alt="" className="h-12 w-12 rounded-full object-cover" />
                    <div>
                      <div className="font-medium">{d.stage_name}</div>
                      <div className="text-xs text-muted-foreground">{d.base_location} · Indsendt {formatDate(d.submitted_at ?? d.created_at)}</div>
                    </div>
                  </div>
                  <Badge variant="warning">Afventer</Badge>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

export function VerificationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const dj = mockPendingVerifications.find((d) => d.id === id);
  const [rejectionReason, setRejectionReason] = useState("");

  if (!dj) {
    return (
      <div className="py-8 text-center">
        <p>Ansøgning ikke fundet.</p>
        <Button asChild variant="link"><Link to="/admin/verification">Tilbage til køen</Link></Button>
      </div>
    );
  }

  const stageName = dj.stage_name;
  function approve() {
    toast.success(`${stageName} godkendt. Profilen er nu aktiv.`);
    navigate("/admin/verification");
  }
  function reject() {
    if (rejectionReason.length < 10) { toast.error("Angiv en begrundelse for afvisning (min. 10 tegn)"); return; }
    toast.success(`${stageName} afvist. E-mail sendt med begrundelse.`);
    navigate("/admin/verification");
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate(-1)}>← Tilbage til køen</Button>

      <div className="flex items-center gap-4">
        <img src={dj.profile.avatar_url ?? ""} alt="" className="h-16 w-16 rounded-full object-cover" />
        <div>
          <h1 className="text-2xl font-semibold">{dj.stage_name}</h1>
          <p className="text-sm text-muted-foreground">{dj.profile.full_name} · {dj.profile.email}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          <Card><CardContent className="p-6"><h2 className="mb-2 font-semibold">Bio</h2><p className="text-sm whitespace-pre-line">{dj.bio}</p></CardContent></Card>
          <Card><CardContent className="p-6"><h2 className="mb-2 font-semibold">Udstyr</h2><p className="text-sm">{dj.equipment_description}</p></CardContent></Card>
          {dj.equipment_photos.length > 0 && (
            <Card><CardContent className="p-6"><h2 className="mb-2 font-semibold">Udstyrsbilleder</h2><PhotoGallery images={dj.equipment_photos.map((p) => ({ id: p.id, url: p.url }))} /></CardContent></Card>
          )}
          <Card>
            <CardContent className="space-y-2 p-6 text-sm">
              <Row label="Erfaring">{dj.years_experience} år</Row>
              <Row label="Events udført">{dj.events_performed}</Row>
              <Row label="Opsætningsstørrelse" className="capitalize">{dj.setup_size}</Row>
              <Row label="Rejseradius">{dj.travel_radius_km}km</Row>
              <Row label="Markante kunder">{dj.notable_clients ?? "—"}</Row>
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4">
          <Button onClick={approve} variant="accent" className="w-full">
            <CheckCircle2 className="h-4 w-4" /> Godkend ansøgning
          </Button>
          <Card>
            <CardContent className="space-y-3 p-6">
              <h3 className="font-semibold">Afvis med begrundelse</h3>
              <Textarea
                rows={4}
                placeholder="Forklar hvad der skal rettes — DJ'en kan indsende igen."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
              <Button variant="destructive" className="w-full" onClick={reject}>
                <XCircle className="h-4 w-4" /> Afvis
              </Button>
            </CardContent>
          </Card>
        </aside>
      </div>
    </div>
  );
}

function Row({ label, children, className }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={className}>{children}</span>
    </div>
  );
}
