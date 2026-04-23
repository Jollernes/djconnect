import { Link } from "react-router-dom";
import { Search, CalendarCheck2, Sparkles, UserPlus, ShieldCheck, Wallet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function HowItWorksPage() {
  return (
    <div>
      <section className="bg-primary text-primary-foreground">
        <div className="container py-16">
          <h1 className="text-4xl font-semibold">How DJConnect works</h1>
          <p className="mt-2 max-w-2xl text-primary-foreground/80">
            Book verified DJs in three steps — or earn steady income as a DJ on our platform.
          </p>
        </div>
      </section>

      <section className="container py-16">
        <h2 className="text-2xl font-semibold">For customers</h2>
        <p className="mt-1 text-muted-foreground">Private and corporate events made easy.</p>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            {
              icon: Search,
              title: "1. Search",
              body:
                "Browse verified DJs in your area, filter by event type, date, setup size, and budget. View equipment, reviews, and availability.",
            },
            {
              icon: CalendarCheck2,
              title: "2. Book",
              body:
                "Send a booking request with event details and pay securely via Stripe. Funds are held in escrow — your DJ isn't paid until 24 hours after the event.",
            },
            {
              icon: Sparkles,
              title: "3. Celebrate",
              body:
                "Your DJ arrives with the agreed mobile disco setup ready. Leave a review afterwards to help the community.",
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
          <p className="mt-1 text-muted-foreground">Join our roster of verified professionals.</p>
          <div className="mt-8 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: UserPlus,
                title: "1. Create your profile",
                body:
                  "Share your bio, equipment, experience, and pricing. Upload photos of your setup so customers can see what they're booking.",
              },
              {
                icon: ShieldCheck,
                title: "2. Get verified",
                body:
                  "Our team reviews your equipment and experience. Verified DJs get a badge on their profile that customers trust.",
              },
              {
                icon: Wallet,
                title: "3. Earn",
                body:
                  "Accept booking requests and get paid directly to your bank account via Stripe Connect — 24 hours after each event.",
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
              <Link to="/signup/dj">Start your DJ application</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
