import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { addReview, approveReview, useStore } from "@/lib/store";
import type { EventType } from "@/types/domain";
import { useDanishPageSeo } from "@/lib/seo";
import { formatDanishDateShort } from "@/lib/utils";
import { useMemo, type ReactNode } from "react";

export function AdminReviewsPage() {
  useDanishPageSeo({
    title: "Anmeldelser",
    description: "Moderér og tilføj sociale beviser.",
    canonical: "/admin/anmeldelser",
  });

  const reviews = useStore((snapshot) => snapshot.reviews);
  const sorted = useMemo(() => [...reviews].sort((a, b) => b.created_at.localeCompare(a.created_at)), [reviews]);

  return (
    <Container className="space-y-8">
      <SectionHeading eyebrow="Admin" title="Anmeldelser" description="Godkendelse og oprettelse af nye anmeldelser." />

      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-5">
          <form
            className="grid gap-4 md:grid-cols-2"
            onSubmit={(event) => {
              event.preventDefault();
              const formData = new FormData(event.currentTarget);
              const eventType = String(formData.get("event_type") || "") as EventType | "";
              addReview({
                booking_id: null,
                dj_id: String(formData.get("dj_id") || "") || null,
                event_type: eventType ? (eventType as EventType) : null,
                reviewer_label: String(formData.get("reviewer_label") || ""),
                rating: Number(formData.get("rating") || 5),
                quote: String(formData.get("quote") || ""),
                approved: true,
              });
              event.currentTarget.reset();
            }}
          >
            <Field label="DJ id"><Input name="dj_id" placeholder="dj_mikkel" /></Field>
            <Field label="Eventtype"><Input name="event_type" placeholder="Firmafest" /></Field>
            <Field label="Anmelder"><Input name="reviewer_label" placeholder="HR Manager, ..." /></Field>
            <Field label="Rating"><Input name="rating" type="number" min={1} max={5} defaultValue={5} /></Field>
            <Field label="Citat" className="md:col-span-2"><Textarea name="quote" className="min-h-24" /></Field>
            <div className="md:col-span-2 flex justify-end">
              <Button type="submit" variant="accent">Tilføj anmeldelse</Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4">
        {sorted.map((review) => (
          <Card key={review.id} className="border-border/60 shadow-sm">
            <CardContent className="flex flex-col gap-4 p-5 md:flex-row md:items-center md:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{review.reviewer_label}</p>
                  <Badge variant={review.approved ? "secondary" : "outline"}>{review.approved ? "Publiceret" : "Afventer"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{review.quote}</p>
                <p className="text-xs text-muted-foreground">{review.event_type ?? "—"} · {formatDanishDateShort(review.created_at)}</p>
              </div>
              {!review.approved ? (
                <Button variant="accent" onClick={() => approveReview(review.id)}>Godkend</Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </Container>
  );
}

function Field({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <div className={`space-y-2 ${className ?? ""}`}>
      <label className="text-sm font-medium">{label}</label>
      {children}
    </div>
  );
}
