import { Link } from "react-router-dom";
import { Search, CalendarCheck2, Sparkles, UserPlus, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function HowItWorksPage() {
  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16">
          <h1 className="text-4xl font-semibold">Sådan fungerer DJConnect</h1>
          <p className="mt-2 max-w-2xl text-primary-foreground/80">
            Book verificerede DJs i tre trin — eller tjen en stabil indkomst som DJ på vores platform.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-2xl font-semibold">For kunder</h2>
        <p className="mt-1 text-muted-foreground">Private og firmaarrangementer gjort nemt.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Search,
              title: "1. Søg",
              body:
                "Find verificerede DJs i dit område, filtrer efter eventtype, dato, setup-størrelse og budget. Se udstyr, anmeldelser og tilgængelighed.",
            },
            {
              icon: CalendarCheck2,
              title: "2. Book",
              body:
                "Send en bookingforespørgsel med eventdetaljer og betal sikkert via Stripe. Pengene holdes i escrow — din DJ får først betaling 24 timer efter eventet.",
            },
            {
              icon: Sparkles,
              title: "3. Fejr",
              body:
                "Din DJ ankommer med det aftalte mobile diskotek klar. Skriv en anmeldelse bagefter for at hjælpe fællesskabet.",
            },
          ].map(({ icon: Icon, title, body }) => (
            <Card key={title}>
              <CardContent className="p-6">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section id="djs" className="bg-muted/40 py-16">
        <div className="container">
          <h2 className="text-2xl font-semibold">For DJs</h2>
          <p className="mt-1 text-muted-foreground">Bliv en del af vores hold af verificerede professionelle.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: UserPlus,
                title: "1. Opret din profil",
                body:
                  "Del din bio, dit udstyr, erfaring og priser. Upload billeder af dit setup, så kunderne kan se, hvad de booker.",
              },
              {
                icon: ShieldCheck,
                title: "2. Bliv verificeret",
                body:
                  "Vores team gennemgår dit udstyr og din erfaring. Verificerede DJs får et mærke på deres profil, som kunderne stoler på.",
              },
              {
                icon: Wallet,
                title: "3. Tjen",
                body:
                  "Acceptér bookingforespørgsler og få betaling direkte til din bankkonto via Stripe Connect — 24 timer efter hvert event.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <Card key={title}>
                <CardContent className="p-6">
                  <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Button asChild variant="accent" size="lg">
              <Link to="/signup/dj">Start din DJ-ansøgning</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
