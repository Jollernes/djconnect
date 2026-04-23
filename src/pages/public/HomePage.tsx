import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, CalendarCheck2, Sparkles, Shield, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DJCard } from "@/components/common/DJCard";
import { useDJs } from "@/hooks/useDJs";
import { EVENT_TYPES } from "@/lib/constants";

export function HomePage() {
  const navigate = useNavigate();
  const { djs } = useDJs({ sortBy: "relevance" });
  const featured = djs.filter((d) => d.is_featured).slice(0, 3);

  const [eventType, setEventType] = useState<string>("");
  const [city, setCity] = useState("");
  const [date, setDate] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (eventType) params.set("eventType", eventType);
    if (city) params.set("city", city);
    if (date) params.set("date", date);
    navigate(`/search?${params.toString()}`);
  }

  return (
    <>
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            background:
              "radial-gradient(circle at 80% 20%, hsla(21,90%,53%,.35), transparent 50%), radial-gradient(circle at 20% 80%, hsla(269,85%,60%,.25), transparent 50%)",
          }}
        />
        <div className="container relative py-16 md:py-24">
          <div className="max-w-3xl">
            <h1 className="text-4xl font-semibold text-balance sm:text-5xl md:text-6xl">
              Book a verified DJ with a full mobile disco setup.
            </h1>
            <p className="mt-4 max-w-2xl text-lg text-primary-foreground/80">
              Every DJ on DJConnect is interviewed and verified. They bring the sound, lights, and energy —
              you just bring the guests.
            </p>
          </div>

          <form onSubmit={submit} className="mt-10 grid gap-3 rounded-xl bg-background p-4 text-foreground shadow-lg md:grid-cols-[1fr_1fr_1fr_auto]">
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Event type</label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger><SelectValue placeholder="Any event type" /></SelectTrigger>
                <SelectContent>
                  {EVENT_TYPES.map((et) => (
                    <SelectItem key={et.id} value={et.id}>
                      {et.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Location</label>
              <Input placeholder="City or region" value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-muted-foreground">Date</label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="flex items-end">
              <Button type="submit" variant="accent" size="lg" className="w-full">
                <Search className="h-4 w-4" />
                Search
              </Button>
            </div>
          </form>

          <div className="mt-8 flex flex-wrap gap-x-8 gap-y-2 text-sm text-primary-foreground/80">
            <span className="flex items-center gap-2"><Shield className="h-4 w-4" /> All DJs verified</span>
            <span className="flex items-center gap-2"><CalendarCheck2 className="h-4 w-4" /> Real-time availability</span>
            <span className="flex items-center gap-2"><Sparkles className="h-4 w-4" /> Secure Stripe payments</span>
          </div>
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container py-16">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-semibold sm:text-3xl">Featured DJs</h2>
              <p className="mt-1 text-muted-foreground">Top-rated, most-booked professionals this month.</p>
            </div>
            <Button asChild variant="link">
              <Link to="/search">View all DJs →</Link>
            </Button>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {featured.map((dj) => (
              <DJCard key={dj.id} dj={dj} />
            ))}
          </div>
        </section>
      )}

      <section className="bg-muted/40 py-16">
        <div className="container">
          <div className="text-center">
            <h2 className="text-2xl font-semibold sm:text-3xl">How it works</h2>
            <p className="mt-2 text-muted-foreground">Three steps from browsing to the dancefloor.</p>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                icon: Search,
                title: "Search",
                body: "Browse verified DJs in your area. Filter by event type, date, setup size, and budget.",
              },
              {
                icon: CalendarCheck2,
                title: "Book",
                body: "Send a booking request with event details and pay securely. Funds held in escrow until 24h after your event.",
              },
              {
                icon: Sparkles,
                title: "Celebrate",
                body: "Your DJ arrives with a full mobile disco setup ready to make your event unforgettable.",
              },
            ].map(({ icon: Icon, title, body }) => (
              <Card key={title}>
                <CardContent className="p-6">
                  <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-semibold">{title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{body}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="container py-16">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { label: "Verified DJs", value: "120+" },
            { label: "Events booked", value: "3,400+" },
            { label: "Average rating", value: "4.8 ★" },
          ].map((stat) => (
            <Card key={stat.label}>
              <CardContent className="p-6 text-center">
                <div className="text-4xl font-semibold">{stat.value}</div>
                <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {[
            {
              quote:
                "Booked Alex for our wedding — the whole dancefloor was packed all night. Setup looked incredibly professional and the booking was seamless.",
              author: "Sara, wedding in Copenhagen",
            },
            {
              quote:
                "Organising the annual corporate party used to be a nightmare. DJConnect made it 5 minutes of work and the DJ was incredible.",
              author: "Tom, CFO, Acme A/S",
            },
          ].map((t) => (
            <Card key={t.author}>
              <CardContent className="p-6">
                <p className="text-lg">“{t.quote}”</p>
                <p className="mt-4 text-sm text-muted-foreground">— {t.author}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="bg-primary text-primary-foreground">
        <div className="container py-16 text-center">
          <div className="mx-auto max-w-2xl">
            <Users className="mx-auto h-10 w-10 text-accent" />
            <h2 className="mt-4 text-3xl font-semibold">Are you a professional DJ?</h2>
            <p className="mt-2 text-primary-foreground/80">
              Join verified DJs earning steady income from bookings. We handle payments, contracts, and marketing — you focus on the music.
            </p>
            <Button asChild variant="accent" size="lg" className="mt-6">
              <Link to="/signup/dj">Become a DJ →</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
