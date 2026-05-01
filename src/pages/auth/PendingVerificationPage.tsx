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
            <h1 className="mt-4 text-2xl font-semibold">Application received</h1>
            <p className="mt-1 text-muted-foreground">
              Thanks for applying to DJConnect. Our team reviews every DJ personally — we'll email you within 2
              business days.
            </p>
          </div>

          <div className="rounded-xl border-2 border-accent/40 bg-accent/5 p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-accent/15 text-accent">
                <GraduationCap className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <div className="text-sm font-semibold">Start your mandatory onboarding guide now</div>
                <p className="mt-1 text-xs text-muted-foreground">
                  While we review your application, complete our 15-minute interactive guide. It's required before
                  you can accept your first booking — so get it out of the way.
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
                <div className="font-medium">Application submitted</div>
                <div className="text-muted-foreground">We have everything we need to start the review.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 shrink-0 text-warning" />
              <div>
                <div className="font-medium">Under review</div>
                <div className="text-muted-foreground">Our team checks your equipment and experience.</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Upload className="h-5 w-5 shrink-0 text-muted-foreground" />
              <div>
                <div className="font-medium">Stripe onboarding</div>
                <div className="text-muted-foreground">Once approved, connect a Stripe account to receive payouts.</div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <Button asChild variant="ghost" size="sm">
              <Link to="/">Back to homepage</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
