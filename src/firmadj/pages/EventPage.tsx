import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import confetti from "canvas-confetti";
import { motion } from "framer-motion";
import { Check, Download, Mail, Phone, Printer, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BrandMark } from "@/firmadj/components/BrandMark";
import { DJCard } from "@/firmadj/components/DJCard";
import { DJModal } from "@/firmadj/components/DJModal";
import { packages, djs } from "@/firmadj/data/mock";
import { formatDkk } from "@/firmadj/data/pricing";
import { useEvents } from "@/firmadj/store/EventStore";
import type { FirmaDJ } from "@/firmadj/types";

function formatDate(date: string) {
  return new Intl.DateTimeFormat("da-DK", { dateStyle: "full" }).format(new Date(date));
}

function openInvoiceWindow({
  companyName,
  cvr,
  ean,
  eventDate,
  price,
  packageName,
  djName,
}: {
  companyName: string;
  cvr: string;
  ean: string;
  eventDate: string;
  price: number;
  packageName: string;
  djName: string;
}) {
  const invoiceWindow = window.open("", "_blank", "width=1000,height=1200");
  if (!invoiceWindow) {
    toast.error("Pop-up blev blokeret. Tillad vinduer og prøv igen.");
    return;
  }

  invoiceWindow.document.write(`
    <html>
      <head>
        <title>Faktura - FirmaDJ</title>
        <style>
          body { font-family: Inter, system-ui, sans-serif; margin: 0; background: #0b132b; color: #f8fafc; }
          .sheet { max-width: 900px; margin: 32px auto; padding: 40px; background: #1c2541; border-radius: 24px; }
          h1, h2 { font-family: Outfit, Inter, sans-serif; }
          .row { display: flex; justify-content: space-between; gap: 24px; margin: 16px 0; }
          .card { background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 18px; }
          .muted { color: rgba(255,255,255,0.7); }
          .price { font-size: 42px; font-weight: 800; color: #d4af37; }
        </style>
      </head>
      <body>
        <div class="sheet">
          <h1>Faktura · FirmaDJ</h1>
          <p class="muted">Professionel DJ-løsning til firmaevents</p>
          <div class="row">
            <div class="card">
              <h2>${companyName}</h2>
              <p class="muted">CVR: ${cvr}<br/>EAN: ${ean}</p>
            </div>
            <div class="card">
              <div class="muted">Eventdato</div>
              <h2>${eventDate}</h2>
            </div>
          </div>
          <div class="card">
            <div class="muted">Leverance</div>
            <h2>${packageName}</h2>
            <p class="muted">Booket DJ: ${djName}</p>
          </div>
          <div class="row" style="align-items:end;">
            <div class="card">
              <div class="muted">Beløb</div>
              <div class="price">${formatDkk(price)}</div>
            </div>
            <div class="card">
              <div class="muted">Udstedt af</div>
              <p>FirmaDJ · managed marketplace</p>
            </div>
          </div>
          <script>window.onload = () => { window.print(); };</script>
        </div>
      </body>
    </html>
  `);
  invoiceWindow.document.close();
  invoiceWindow.focus();
}

export function EventPage() {
  const { id } = useParams();
  const { getEvent, updateEvent, confirmEvent } = useEvents();
  const event = id ? getEvent(id) : undefined;
  const [profileOpen, setProfileOpen] = useState(false);
  const [modalDj, setModalDj] = useState<FirmaDJ | null>(null);
  const [timeline, setTimeline] = useState("");
  const [parking, setParking] = useState("");
  const [doNotPlay, setDoNotPlay] = useState("");
  const [wishes, setWishes] = useState("");
  const [cvr, setCvr] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [ean, setEan] = useState("");

  const packageInfo = useMemo(() => packages.find((item) => item.id === event?.packageId), [event?.packageId]);
  const matchedDJs = useMemo(() => event?.matchDJIds.map((djId) => djs.find((item) => item.id === djId)).filter(Boolean) as FirmaDJ[] | undefined, [event?.matchDJIds]);
  const bookedDj = useMemo(
    () => djs.find((dj) => dj.id === event?.selectedDJId) ?? null,
    [event?.selectedDJId],
  );

  useEffect(() => {
    if (event?.status === "Confirmed") {
      confetti({
        particleCount: 120,
        spread: 75,
        origin: { y: 0.6 },
        colors: ["#4338ca", "#d4af37", "#fb7185"],
      });
    }
  }, [event?.status]);

  useEffect(() => {
    if (event?.practicalInfo) {
      setTimeline(event.practicalInfo.timeline ?? "");
      setParking(event.practicalInfo.parking ?? "");
      setDoNotPlay(event.practicalInfo.doNotPlay ?? "");
      setWishes(event.practicalInfo.wishes ?? "");
    }
  }, [event?.practicalInfo]);

  if (!event) {
    return (
      <div className="container flex min-h-[70vh] items-center justify-center py-16">
        <Card className="glass max-w-xl border-white/10">
          <CardHeader>
            <CardTitle className="font-display text-3xl">Tilbudet kunne ikke findes</CardTitle>
            <CardDescription>Linket ser ud til at være ugyldigt eller udløbet.</CardDescription>
          </CardHeader>
          <CardFooter>
            <Button asChild>
              <a href="/">Tilbage til forsiden</a>
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  const activeModalDj = modalDj ?? (event.selectedDJId ? djs.find((dj) => dj.id === event.selectedDJId) ?? null : null);
  const activeSelectedDj = bookedDj ?? activeModalDj;

  const handleSavePractical = () => {
    updateEvent(event.id, {
      practicalInfo: {
        timeline,
        parking,
        doNotPlay,
        wishes,
      },
    });
    toast.success("Praktisk info er gemt.");
  };

  const handleConfirm = () => {
    if (!cvr.trim() || !companyName.trim() || !ean.trim()) {
      toast.error("Udfyld CVR, firmanavn og EAN-nummer.");
      return;
    }

    confirmEvent(event.id, { cvr, companyName, ean });
    toast.success("Booking bekræftet.");
  };

  const handleSelectDJ = (djId: string) => {
    updateEvent(event.id, { selectedDJId: djId });
    setProfileOpen(false);
    toast.success("DJ valgt.");
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="border-b border-white/10 bg-background/70 backdrop-blur-xl">
        <div className="container flex flex-col gap-3 py-5 md:flex-row md:items-center md:justify-between">
          <BrandMark compact />
          <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
            <span>{event.email}</span>
            <span className="hidden md:inline">·</span>
            <span>Magisk link: /event/{event.id}</span>
          </div>
        </div>
      </div>

      <div className="container space-y-8 py-10">
        {event.status === "Draft" ? (
          <>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <div className="space-y-2">
                <div className="text-sm uppercase tracking-[0.2em] text-muted-foreground">Tilbud på underholdning: {formatDate(event.date)}</div>
                <h1 className="font-display text-4xl font-bold md:text-5xl">Jeres kuraterede DJ-udvalg</h1>
              </div>
            </motion.div>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="font-display text-3xl">{packageInfo?.name ?? "Valgt pakke"}</CardTitle>
                <CardDescription>
                  {formatDkk(event.price)} · {event.guests === "<80" ? "Under 80 gæster" : event.guests === "80-150" ? "80-150 gæster" : "150-300 gæster"}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {packageInfo?.inclusions.map((item) => (
                    <div key={item} className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm">
                      <Check className="h-4 w-4 text-accent" />
                      {item}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2">
              {matchedDJs?.map((dj) => (
                <DJCard key={dj.id} dj={dj} actionLabel="Se profil & video" onAction={() => { setModalDj(dj); setProfileOpen(true); }} />
              ))}
            </div>

            <DJModal
              dj={activeModalDj ?? null}
              open={profileOpen}
              onOpenChange={setProfileOpen}
              onSelect={handleSelectDJ}
            />

            {activeSelectedDj ? (
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Bekræft næste skridt</CardTitle>
                  <CardDescription>Nu mangler vi blot jeres faktureringsoplysninger.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-5 md:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="cvr">CVR</Label>
                    <Input id="cvr" value={cvr} onChange={(event) => setCvr(event.target.value)} placeholder="12345678" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="companyName">Firmanavn</Label>
                    <Input id="companyName" value={companyName} onChange={(event) => setCompanyName(event.target.value)} placeholder="Firma A/S" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="ean">EAN-nummer</Label>
                    <Input id="ean" value={ean} onChange={(event) => setEan(event.target.value)} placeholder="579800..." />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button size="lg" onClick={handleConfirm}>
                    Bekræft Booking (Bindende)
                  </Button>
                </CardFooter>
              </Card>
            ) : null}
          </>
        ) : (
          <>
            <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}>
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-success/10 px-4 py-2 text-sm text-success">
                  <Sparkles className="h-4 w-4" />
                  Bekræftet! Vi glæder os til jeres fest.
                </div>
                <h1 className="font-display text-4xl font-bold md:text-5xl">Bekræftet! Vi glæder os til jeres fest.</h1>
              </div>
            </motion.div>

            {bookedDj ? <DJCard dj={bookedDj} /> : null}

            <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Download Faktura (PDF)</CardTitle>
                  <CardDescription>Åbn en printvenlig faktura i et nyt vindue.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button
                    className="gap-2"
                    size="lg"
                    onClick={() =>
                      openInvoiceWindow({
                        companyName: event.company?.companyName ?? "Firma",
                        cvr: event.company?.cvr ?? "-",
                        ean: event.company?.ean ?? "-",
                        eventDate: formatDate(event.date),
                        price: event.price,
                        packageName: packageInfo?.name ?? "Pakke",
                        djName: activeSelectedDj?.stageName ?? "DJ",
                      })
                    }
                  >
                    <Download className="h-4 w-4" />
                    Download Faktura (PDF)
                  </Button>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Printer className="h-4 w-4" />
                    Åbner en printvenlig faktura i et nyt vindue.
                  </div>
                </CardContent>
              </Card>

              <Card className="glass border-white/10">
                <CardHeader>
                  <CardTitle className="font-display text-2xl">Kontakt platformen</CardTitle>
                  <CardDescription>Vi hjælper gerne med ændringer og praktiske spørgsmål.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4" />
                    support@firmadj.dk
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    +45 70 11 22 33
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    Chatten er åben på hverdage 09–17.
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="glass border-white/10">
              <CardHeader>
                <CardTitle className="font-display text-2xl">Praktisk info & Musikønsker</CardTitle>
                <CardDescription>Gem tidsplan, parkering og de sidste detaljer til DJ’en.</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-5">
                <div className="space-y-2">
                  <Label htmlFor="timeline">Tidsplan</Label>
                  <Textarea id="timeline" value={timeline} onChange={(event) => setTimeline(event.target.value)} placeholder="18:00 ankomst, 19:00 middag, 21:30 dans ..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="parking">Parkering</Label>
                  <Input id="parking" value={parking} onChange={(event) => setParking(event.target.value)} placeholder="Levering via gård, parkering i P-kælder ..." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doNotPlay">Spil-ikke-liste</Label>
                  <Textarea id="doNotPlay" value={doNotPlay} onChange={(event) => setDoNotPlay(event.target.value)} placeholder="Tracks eller genrer, vi skal undgå" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="wishes">Generelle ønsker</Label>
                  <Textarea id="wishes" value={wishes} onChange={(event) => setWishes(event.target.value)} placeholder="Stemning, favoritgenrer, særlige ønsker ..." />
                </div>
              </CardContent>
              <CardFooter>
                <Button size="lg" onClick={handleSavePractical}>
                  Gem praktisk info
                </Button>
              </CardFooter>
            </Card>
          </>
        )}
      </div>
    </div>
  );
}
