import { PublicLayout } from "@/components/layout/PublicLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getProposalData } from "@/lib/server";
import { formatDate, formatRange, formatCurrency } from "@/lib/format";
import { CheckCircle, Star, Music, Mic, Lightbulb, Headphones } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function ProposalPage({ params }: { params: Promise<{ id: string }> } | { params: { id: string } }) {
  const id = typeof (params as any).then === 'function' ? (await params).id : (params as { id: string }).id;
  const data = await getProposalData(id);
  if (!data) notFound();
  const { proposal, brief, pkg, matches, matchReasons } = data;

  return (
    <PublicLayout>
      <div className="bg-slate-900 text-white py-12 sm:py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/30 mb-4">Anbefalet løsning</Badge>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Vi har matchet jeres arrangement med en anbefalet løsning</h1>
          <div className="flex flex-wrap gap-4 text-sm text-slate-300">
            <span>{brief?.event_type}</span>
            <span>•</span>
            <span>{formatDate(brief?.event_date)}</span>
            <span>•</span>
            <span>{brief?.city}</span>
            <span>•</span>
            <span>{brief?.guest_count_range} gæster</span>
            {brief?.needs_dinner_music === 'Ja' && <><span>•</span><span>Middagsmusik</span></>}
            {brief?.needs_microphone === 'Ja' && <><span>•</span><span>Mikrofon</span></>}
          </div>
        </div>
      </div>

      <section className="py-12 sm:py-16 bg-slate-50">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-6">
              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Anbefalet pakke</h2>
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-2xl font-bold text-slate-900">{pkg?.name}</div>
                      <div className="text-sm text-slate-500">{pkg?.best_for}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-amber-600">{formatRange(proposal?.price_estimate_from, proposal?.price_estimate_to)}</div>
                      <div className="text-xs text-slate-500">{proposal?.vat_note}</div>
                    </div>
                  </div>
                  <p className="text-slate-700 mb-4">{pkg?.description}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {matchReasons.map((r, i) => (
                      <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700">{r}</Badge>
                    ))}
                  </div>
                  <p className="text-sm text-slate-500">{pkg?.vat_note}</p>
                  {brief?.guest_count_range === '200+' && (
                    <p className="text-sm text-amber-700 bg-amber-50 p-3 rounded-lg mt-4">Større firmaevents kræver typisk en kort teknisk vurdering. I kan stadig reservere, og vi vender tilbage med den endelige løsning.</p>
                  )}
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-4">Hvorfor dette match</h2>
                  <div className="flex flex-wrap gap-2">
                    {matchReasons.map((r, i) => (
                      <Badge key={i} variant="outline" className="border-slate-300 text-slate-700">{r}</Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-4">Kurateret DJ kortliste</h2>
                {matches.length === 0 ? (
                  <Card className="border-slate-200"><CardContent className="p-6 text-slate-600">Vi har modtaget briefen og bekræfter de bedste muligheder manuelt samme dag.</CardContent></Card>
                ) : (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {matches.map((m: any) => (
                      <Card key={m.id} className={`border-slate-200 ${m.is_platform_recommended ? 'ring-2 ring-amber-400' : ''}`}>
                        <CardContent className="p-4">
                          {m.is_platform_recommended && <Badge className="mb-2 bg-amber-500 text-slate-900">Anbefalet match</Badge>}
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-12 h-12 rounded-full bg-slate-200 overflow-hidden">
                              {m.dj?.photo_url ? <img src={m.dj.photo_url} alt={m.dj.public_display_name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-slate-500 text-xs">{m.dj?.public_display_name.charAt(0)}</div>}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900">{m.dj?.public_display_name}</div>
                              <div className="text-xs text-slate-500">{m.dj?.city}</div>
                            </div>
                          </div>
                          <div className="text-2xl font-bold text-amber-600 mb-2">{m.match_score}% match</div>
                          <div className="flex flex-wrap gap-1 mb-3">
                            {m.match_reasons?.slice(0, 2).map((reason: string, i: number) => (
                              <Badge key={i} variant="secondary" className="text-xs">{reason}</Badge>
                            ))}
                          </div>
                          <div className="text-sm text-slate-600 mb-3">{m.dj?.bio_short}</div>
                          <div className="text-xs text-slate-500 mb-3">Foreløbigt ledig på datoen</div>
                          <Button asChild className="w-full bg-slate-900 hover:bg-slate-800 text-white" size="sm">
                            <Link href={`/reserve/${proposal?.id}?dj=${m.dj?.id}`}>Reservér med denne DJ</Link>
                          </Button>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              <Card className="border-slate-200 bg-slate-100">
                <CardContent className="p-6">
                  <h2 className="text-xl font-bold text-slate-900 mb-2">Vil du hellere tale med os først?</h2>
                  <p className="text-slate-600 mb-4">Book en kort rådgivning. Det opretter en callback-anmodning.</p>
                  <Button asChild variant="outline" className="border-slate-300">
                    <Link href={`/kontakt?proposal=${proposal?.id}`}>Book kort rådgivning</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="lg:col-span-1">
              <Card className="border-slate-200 sticky top-24">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-slate-900 mb-4">Reservér anbefalet løsning</h3>
                  <p className="text-sm text-slate-600 mb-4">Vi reserverer den bedst egnede DJ ud fra jeres brief, tilgængelighed og erfaring med lignende firmaevents.</p>
                  <Button asChild className="w-full bg-amber-500 hover:bg-amber-400 text-slate-900 font-semibold mb-3">
                    <Link href={`/reserve/${proposal?.id}`}>Reservér anbefalet løsning</Link>
                  </Button>
                  <p className="text-xs text-slate-500">Uanset om I vælger selv eller lader os vælge, står vi for kontrakt, teknik, koordinering og backup.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>
    </PublicLayout>
  );
}
