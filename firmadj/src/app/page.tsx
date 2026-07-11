import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { CheckCircle, Shield, Headphones, Package, Users, Mic, Music2, Calendar, MapPin, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import { getPackages, getDJs, getReviewsForDJ, getStore } from "@/lib/data";
import { formatCurrency } from "@/lib/format";
import { redirect } from "next/navigation";

export default function HomePage() {
  const packages = getPackages();
  const djs = getDJs();
  const reviews = getStore().reviews.filter((r) => r.approved);

  async function quickBrief(formData: FormData) {
    "use server";
    const date = formData.get("date") as string;
    const city = formData.get("city") as string;
    const guests = formData.get("guests") as string;
    const eventType = formData.get("event_type") as string;
    const params = new URLSearchParams();
    if (date) params.set("date", date);
    if (city) params.set("city", city);
    if (guests) params.set("guests", guests);
    if (eventType) params.set("event_type", eventType);
    redirect(`/brief?${params.toString()}`);
  }

  return (
    <PublicLayout>
      <section className="relative gradient-hero text-white overflow-hidden">
        <div className="absolute inset-0 hero-pattern opacity-30" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-6">Danmarks tryggeste firma-DJ booking</Badge>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
                Book en professionel DJ til firmafesten uden usikkerhed
              </h1>
              <p className="text-lg sm:text-xl text-slate-300 mb-8 max-w-xl">
                Få en kurateret løsning med DJ, lyd, lys, faktura og backup. Udfyld jeres eventdetaljer og få et anbefalet match.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
                  <Link href="/brief">Tjek dato og få match</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="border-slate-400 text-white hover:bg-slate-800">
                  <Link href="/pakker">Se pakker</Link>
                </Button>
              </div>
            </div>

            <Card className="bg-white/95 backdrop-blur text-slate-900 shadow-2xl">
              <CardContent className="p-6 sm:p-8">
                <h2 className="text-xl font-bold mb-4">Start dit eventmatch</h2>
                <form action={quickBrief} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="date">Dato</Label>
                      <Input id="date" name="date" type="date" />
                    </div>
                    <div>
                      <Label htmlFor="city">By</Label>
                      <Input id="city" name="city" placeholder="F.eks. København" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="guests">Antal gæster</Label>
                    <Select name="guests">
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg antal gæster" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Under 50">Under 50</SelectItem>
                        <SelectItem value="50 to 80">50 - 80</SelectItem>
                        <SelectItem value="80 to 150">80 - 150</SelectItem>
                        <SelectItem value="150 to 200">150 - 200</SelectItem>
                        <SelectItem value="200+">200+</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="event_type">Eventtype</Label>
                    <Select name="event_type">
                      <SelectTrigger>
                        <SelectValue placeholder="Vælg eventtype" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Firmafest">Firmafest</SelectItem>
                        <SelectItem value="Julefrokost">Julefrokost</SelectItem>
                        <SelectItem value="Sommerfest">Sommerfest</SelectItem>
                        <SelectItem value="Middag og efterfest">Middag og efterfest</SelectItem>
                        <SelectItem value="Kick-off">Kick-off</SelectItem>
                        <SelectItem value="Jubilæum">Jubilæum</SelectItem>
                        <SelectItem value="Reception">Reception</SelectItem>
                        <SelectItem value="Andet firmaarrangement">Andet firmaarrangement</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full bg-slate-900 hover:bg-slate-800 text-white">
                    Find løsning <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="bg-slate-900 border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center text-sm text-slate-300">
            {[
              'Kontrakt og faktura samlet ét sted',
              'Backup-garanti',
              'Professionel lyd og lys',
              'Kuraterede firmafest-DJs',
              'Svar samme dag',
            ].map((t, i) => (
              <div key={i} className="flex items-center justify-center gap-2">
                <CheckCircle className="w-4 h-4 text-amber-500" /> {t}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Så nemt er det</h2>
            <p className="text-slate-600">Vi fjerner usikkerheden fra bookingprocessen og giver jer ét ansvarligt kontaktpunkt.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Fortæl om arrangementet', text: 'Udfyld den korte eventbrief. Ingen konto nødvendig.' },
              { step: '2', title: 'Få anbefalet pakke og 2-3 DJ-match', text: 'Platformen matcher jer med kuraterede DJs og den rette pakke.' },
              { step: '3', title: 'Reservér trygt med kontrakt, teknik og backup', text: 'Vi står for koordinering, kontrakt og en plan B.' },
            ].map((item, i) => (
              <div key={i} className="relative">
                <div className="text-6xl font-bold text-slate-100 absolute -top-4 -left-2">{item.step}</div>
                <div className="relative bg-white p-6 rounded-2xl border border-slate-200 h-full">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-slate-600">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Book DJ til din type firmaevent</h2>
            <p className="text-slate-600">Hver eventype har sin egen dynamik. Vi sørger for det rigtige match.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { href: '/dj-til-firmafest', title: 'DJ til firmafest', desc: 'Den klassiske firmafest med middag og dansegulv.' },
              { href: '/dj-til-julefrokost', title: 'DJ til julefrokost', desc: 'Styr på middag, taler og julefest for alle aldre.' },
              { href: '/dj-til-sommerfest', title: 'DJ til sommerfest', desc: 'Udendørs eller inde – energi og sommerstemning.' },
              { href: '/dj-til-firmaarrangement', title: 'DJ til firmaarrangement', desc: 'Reception, konference eller networking event.' },
              { href: '/dj-til-middag-og-fest', title: 'DJ til middag og efterfølgende fest', desc: 'Elegant middag, der glider over i dansegulv.' },
              { href: '/mobildiskotek-firmafest', title: 'DJ til kick-off', desc: 'High-energy start på året eller projekt.' },
            ].map((card, i) => (
              <Link key={i} href={card.href} className="group">
                <Card className="h-full hover:shadow-lg transition border-slate-200 group-hover:border-amber-300">
                  <CardContent className="p-6">
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition">{card.title}</h3>
                    <p className="text-slate-600 text-sm">{card.desc}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Vores pakker</h2>
            <p className="text-slate-600">Standardiserede løsninger gør booking nemt og trygt. Endelig anbefaling afhænger af eventdetaljer.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {packages.filter((p) => p.slug !== 'custom-enterprise').map((pkg) => (
              <Card key={pkg.id} className={`h-full ${pkg.slug === 'dinner-party' ? 'ring-2 ring-amber-400 relative' : ''}`}>
                {pkg.slug === 'dinner-party' && <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-900">Mest populær</Badge>}
                <CardContent className="p-6 flex flex-col h-full">
                  <h3 className="text-xl font-bold text-slate-900 mb-2">{pkg.name}</h3>
                  <p className="text-slate-600 text-sm mb-4">{pkg.best_for}</p>
                  <div className="text-3xl font-bold text-slate-900 mb-4">{formatCurrency(pkg.price_from)}</div>
                  <p className="text-sm text-slate-600 mb-6 flex-1">{pkg.description}</p>
                  <ul className="text-sm space-y-2 mb-6">
                    {pkg.sound_included && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Lyd inkluderet</li>}
                    {pkg.lighting_included && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Lys inkluderet</li>}
                    {pkg.microphone_included && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Mikrofon inkluderet</li>}
                    {pkg.technical_coordination_included && <li className="flex items-center gap-2"><CheckCircle className="w-4 h-4 text-green-600" /> Teknisk koordinering</li>}
                  </ul>
                  <Button asChild variant="outline" className="w-full border-slate-300 hover:bg-slate-50">
                    <Link href="/brief">Få anbefalet pakke</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
          <p className="text-center text-sm text-slate-500 mt-6">{packages[0].vat_note}</p>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold mb-4">Én ansvarlig partner fra booking til sidste sang</h2>
            <p className="text-slate-300">Vi sælger et trygt eventforløb – ikke bare en liste af DJs.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { title: 'Kurateret DJ match', text: '2-3 DJs udvalgt til jeres eventtype, gæster og region.' },
              { title: 'Backup ved sygdom eller nødsituation', text: 'Vi har altid en plan B klar uden ekstra omkostninger.' },
              { title: 'Tydelig pakke og pris', text: 'Ingen skjulte gebyrer. Transport beregnes før bekræftelse.' },
              { title: 'Professionel lyd og lys', text: 'Kvalitetsudstyr tilpasset gæsteantallet og lokalet.' },
              { title: 'Struktureret event spørgeskema', text: 'Sikrer at DJ, venue og teknik er afstemt inden event.' },
              { title: 'Endelig køreplan', text: 'Tidsplan, taler, must-play og kontaktpunkter samlet ét sted.' },
              { title: 'Menneskelig opfølgning', text: 'Admin følger op, når det giver mening.' },
              { title: 'Kontrakt og faktura samlet', text: 'Én faktura, én kontrakt, én ansvarlig partner.' },
              { title: 'Kvalitetsgaranti', text: 'Hvis noget går galt, løser vi det. Det er vores ansvar.' },
            ].map((item, i) => (
              <div key={i} className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700">
                <h3 className="font-bold text-lg mb-2">{item.title}</h3>
                <p className="text-slate-400 text-sm">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Færre valg. Bedre match. Tryggere firmafest.</h2>
          <p className="text-slate-600 text-lg mb-8">
            I behøver ikke gennemgå 20 DJ-profiler. Vi filtrerer for tilgængelighed, eventtype, region, gæsteantal, musikprofil, 
            firmaerfaring, sprog og tekniske behov. Herefter ser I en kortliste på 2-3 DJs, eller lader os vælge det bedste match.
          </p>
          <div className="flex justify-center gap-4">
            <Button asChild className="bg-slate-900 hover:bg-slate-800 text-white">
              <Link href="/saadan-fungerer-det">Se hvordan det virker</Link>
            </Button>
            <Button asChild variant="outline" className="border-slate-300">
              <Link href="/tryghed-og-kvalitet">Tryghed og kvalitet</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Det siger kunderne</h2>
            <p className="text-slate-600">Fiktive men realistiske erfaringer fra danske virksomheder.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {reviews.slice(0, 3).map((review, i) => (
              <Card key={i} className="border-slate-200">
                <CardContent className="p-6">
                  <div className="flex gap-1 mb-3">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-slate-700 italic mb-4">&ldquo;{review.quote}&rdquo;</p>
                  <p className="text-sm font-semibold text-slate-900">{review.reviewer_label}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-slate-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-8 text-center">Ofte stillede spørgsmål</h2>
          <Accordion className="bg-white rounded-2xl border border-slate-200 p-4">
            {[
              { q: 'Kan vi selv vælge DJ?', a: 'Ja. Efter eventbrieven får I en kortliste med 2-3 DJs. I kan vælge én, eller lade os vælge det bedste match.' },
              { q: 'Hvorfor kan vi ikke browse alle DJs?', a: 'Vi arbejder som et kurateret bureau. De fleste firmaevents kræver sikkerhed, ikke mere researcharbejde.' },
              { q: 'Hvad sker der, hvis DJ bliver syg?', a: 'Vi har altid en backup-DJ klar. Det er vores ansvar at finde en lige så kvalificeret afløser.' },
              { q: 'Er lyd og lys inkluderet?', a: 'Ja, i vores standardpakker er professionel lyd og lys inkluderet. Større events kan kræve tilpasning.' },
              { q: 'Kan DJ spille både middag og fest?', a: 'Ja. Dinner & Party og Stor Firmafest er designet til netop den overgang.' },
              { q: 'Er priserne inklusive eller eksklusive moms?', a: 'Alle priser vises eksklusiv moms. Moms fremgår tydeligt på kontrakten og fakturaen.' },
              { q: 'Hvornår skal vi booke?', a: 'Jo før, jo bedre. Særligt julefrokosten er populær. Vi svarer samme dag på briefen.' },
            ].map((item, i) => (
              <AccordionItem key={i} value={`item-${i}`}>
                <AccordionTrigger className="text-left font-semibold text-slate-900">{item.q}</AccordionTrigger>
                <AccordionContent className="text-slate-600">{item.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      <section className="py-16 sm:py-24 bg-slate-900 text-white text-center">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">Klar til at finde den rette løsning?</h2>
          <p className="text-slate-300 mb-8">Udfyld eventbrieven og få en anbefalet pakke og 2-3 DJ-match.</p>
          <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold">
            <Link href="/brief">Tjek dato og få match</Link>
          </Button>
        </div>
      </section>
    </PublicLayout>
  );
}
