import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import Link from "next/link";

export default function ContactPage() {
  return (
    <PublicLayout>
      <div className="bg-slate-900 text-white py-16 sm:py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-3xl sm:text-5xl font-bold mb-4">Kontakt os</h1>
          <p className="text-slate-300">Har du spørgsmål? Skriv eller ring. For hurtigste svar: udfyld eventbriefen.</p>
        </div>
      </div>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12">
            <Card className="border-slate-200">
              <CardContent className="p-6">
                <form className="space-y-4">
                  <div>
                    <Label htmlFor="name">Navn</Label>
                    <Input id="name" name="name" placeholder="Dit navn" />
                  </div>
                  <div>
                    <Label htmlFor="company">Virksomhed</Label>
                    <Input id="company" name="company" placeholder="Virksomhed" />
                  </div>
                  <div>
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" name="email" type="email" placeholder="din@virksomhed.dk" />
                  </div>
                  <div>
                    <Label htmlFor="phone">Telefon</Label>
                    <Input id="phone" name="phone" placeholder="12345678" />
                  </div>
                  <div>
                    <Label htmlFor="message">Besked</Label>
                    <Textarea id="message" name="message" placeholder="Hvad kan vi hjælpe med?" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="event_date">Eventdato (valgfri)</Label>
                      <Input id="event_date" name="event_date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="event_type">Eventtype (valgfri)</Label>
                      <Input id="event_type" name="event_type" placeholder="F.eks. julefrokost" />
                    </div>
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white">Send besked</Button>
                </form>
              </CardContent>
            </Card>

            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Hurtigste vej til et match</h2>
              <p className="text-slate-600 mb-6">
                For hurtigste svar: udfyld eventbriefen og få et anbefalet match. Så har vi alle nødvendige detaljer til at give jer en præcis anbefaling.
              </p>
              <Button asChild className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
                <Link href="/brief">Tjek dato og få match</Link>
              </Button>

              <div className="mt-10 space-y-4 text-slate-700">
                <p><strong>FirmaDJ</strong></p>
                <p>Email: hello@firmadj.demo</p>
                <p>Telefon: +45 12 34 56 78</p>
                <p>Adresse: Demo Adresse 1, 1000 København</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
