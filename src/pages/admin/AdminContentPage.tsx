import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useStore } from "@/lib/store";
import { useDanishPageSeo } from "@/lib/seo";
import { formatDanishDateShort } from "@/lib/utils";

export function AdminContentPage() {
  useDanishPageSeo({
    title: "Indhold",
    description: "Inbox for kontakt og callback-forespørgsler samt platform copy.",
    canonical: "/admin/indhold",
  });

  const contactRequests = useStore((snapshot) => snapshot.contactRequests);
  const callbackRequests = useStore((snapshot) => snapshot.callbackRequests);

  return (
    <Container className="space-y-8">
      <SectionHeading eyebrow="Admin" title="Indhold" description="Her samler vi indgående forespørgsler og fremtidig CMS-copy." />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <h2 className="text-lg font-semibold">Kontaktforespørgsler</h2>
            {contactRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <p className="font-medium">{request.full_name}</p>
                  <Badge variant="secondary">{request.role}</Badge>
                </div>
                <p className="text-muted-foreground">{request.email} · {request.phone ?? "Ingen telefon"}</p>
                <p className="text-muted-foreground">{request.company_name ?? "Ingen virksomhed"} · {formatDanishDateShort(request.created_at)}</p>
                <p className="mt-2">{request.message}</p>
              </div>
            ))}
            {contactRequests.length === 0 ? <p className="text-sm text-muted-foreground">Ingen kontaktforespørgsler endnu.</p> : null}
          </CardContent>
        </Card>

        <Card className="border-border/60 shadow-sm">
          <CardContent className="space-y-3 p-5">
            <h2 className="text-lg font-semibold">Callback-forespørgsler</h2>
            {callbackRequests.map((request) => (
              <div key={request.id} className="rounded-2xl border border-border/60 bg-muted/20 p-4 text-sm">
                <p className="font-medium">{request.full_name}</p>
                <p className="text-muted-foreground">{request.phone} · {formatDanishDateShort(request.created_at)}</p>
                {request.preferred_time ? <p className="text-muted-foreground">Foretrukken tid: {request.preferred_time}</p> : null}
                <p className="mt-2">{request.message}</p>
              </div>
            ))}
            {callbackRequests.length === 0 ? <p className="text-sm text-muted-foreground">Ingen callback-forespørgsler endnu.</p> : null}
          </CardContent>
        </Card>
      </div>

      <Card className="border-border/60 shadow-sm">
        <CardContent className="space-y-2 p-5 text-sm text-muted-foreground">
          <p>Fremtidig CMS-managed marketing copy kan administreres her.</p>
          <p>For nu viser demoen de vigtigste indkomne forespørgsler og operational copy-noter.</p>
        </CardContent>
      </Card>
    </Container>
  );
}
