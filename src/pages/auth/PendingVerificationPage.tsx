import { Link } from "react-router-dom";
import { Clock, CheckCircle2, Upload, GraduationCap, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function PendingVerificationPage() {
  return (
    <div className="container max-w-2xl py-16">
      <Card>
        <CardContent className="space-y-5 p-8">
          <div className="text-center">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-warning/20 text-warning">
              <Clock className="h-6 w-6" />
            </div>
            <h1 className="mt-4 text-2xl font-semibold">Ansøgning modtaget</h1>
            <p className="mt-1 text-muted-foreground">
              Tak fordi du ansøgte hos DJConnect. Vores team gennemgår hver DJ personligt — vi sender dig en e-mail inden for 2
              hverdage.
            </p>
          </div>

          <div className="rounded-xl border-2 border-accent/40 bg-accent/5 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">Start din obligatoriske introguide nu</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  Mens vi gennemgår din ansøgning, kan du gennemføre vores 15-minutters interaktive guide. Den er påkrævet, før
                  du kan acceptere din første booking — så få den overstået.
                </p>
                <Button asChild variant="accent" className="mt-3">
                  <Link to="/dj/onboarding">Start guide <ArrowRight className="h-4 w-4" /></Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-3 rounded-lg border bg-muted/30 p-5 text-sm">
            <div className="flex items-start gap-3">
              <CheckCircle2 className="h-5 w-5 shrink-0 text-success" />
              <div>
                <div className="font-medium">Ansøgning indsendt</div>
                <div className="text-muted-foreground">Vi har alt, hvad vi skal bruge for at starte gennemgangen.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 shrink-0 text-warning" />
              <div>
                <div className="font-medium">Under gennemgang</div>
                <div className="text-muted-foreground">Vores team tjekker dit udstyr og din erfaring.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Upload className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-medium">Stripe-opsætning</div>
                <div className="text-muted-foreground">Når du er godkendt, kobl en Stripe-konto på for at modtage udbetalinger.</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Tilbage til forsiden</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
