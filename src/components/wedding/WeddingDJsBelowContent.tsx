import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Heart, Star, Shield, CheckCircle2, Sparkles, Music4, ChevronRight, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { formatCurrency } from "@/lib/utils";
import {
  valueProps,
  runOfShow,
  playlistArc,
  equipmentChecklist,
  faq,
  weddingReviews,
  weddingPricing,
  totalWeddingDJs,
} from "@/lib/weddingDJsContent";

export function WeddingDJsBelowContent() {
  const pricing = weddingPricing;
  return (
    <>
      {/* Why DJConnect for weddings — compact strip */}
      <section className="container py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {valueProps.map((vp, i) => (
            <motion.div
              key={vp.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Card className="h-full">
                <CardContent className="p-4">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-rose-500/5 text-rose-600">
                    <vp.Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-2.5 text-sm font-semibold">{vp.title}</h3>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">{vp.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator />

      {/* Sample wedding run-of-show */}
      <section className="container py-14 sm:py-16">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
          <div>
            <Badge variant="outline" className="rounded-full border-rose-200 bg-rose-50 text-rose-700">
              <Heart className="h-3 w-3 fill-current" /> Sample run-of-show
            </Badge>
            <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              A wedding night, hour by hour.
            </h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
              The rhythm most DJConnect couples follow. Once booked, your DJ builds your exact
              run-of-show with you in the dashboard — editable right up to the day.
            </p>
            <Button asChild variant="link" className="-ml-3 mt-2 text-rose-700">
              <Link to="/how-it-works">See the planning flow <ChevronRight className="h-3.5 w-3.5" /></Link>
            </Button>
          </div>
          <ol className="relative space-y-3 border-l-2 border-rose-100 pl-5">
            {runOfShow.map((s, i) => (
              <motion.li
                key={s.label}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.4 }}
                transition={{ delay: i * 0.04, duration: 0.4 }}
                className="relative"
              >
                <span className="absolute -left-[27px] top-1 grid h-4 w-4 place-items-center rounded-full border-2 border-rose-400 bg-white" />
                <div className="flex flex-wrap items-baseline gap-x-3">
                  <span className="font-mono text-sm font-semibold text-rose-700">{s.time}</span>
                  <span className="text-base font-semibold">{s.label}</span>
                </div>
                <p className="mt-0.5 text-sm text-muted-foreground">{s.body}</p>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* Energy curve */}
      <section className="bg-gradient-to-b from-rose-50/40 via-white to-white">
        <div className="container py-14 sm:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <Badge variant="outline" className="rounded-full border-rose-200 bg-rose-50 text-rose-700">
              <Music4 className="h-3 w-3" /> Energy curve
            </Badge>
            <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              How a wedding DJ builds the night.
            </h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
              The arc most wedding DJs work to — soft start, room-warming, peak, then a closer everyone sings.
            </p>
          </div>

          <div className="mx-auto mt-8 max-w-4xl rounded-3xl border bg-card p-5 shadow-sm sm:p-7">
            <div className="grid grid-cols-8 items-end gap-2 sm:gap-3">
              {playlistArc.map((seg, i) => (
                <motion.div
                  key={seg.label}
                  initial={{ opacity: 0, scaleY: 0 }}
                  whileInView={{ opacity: 1, scaleY: 1 }}
                  viewport={{ once: true, amount: 0.5 }}
                  transition={{ delay: i * 0.04, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  style={{ originY: 1 }}
                  className="flex flex-col items-center gap-1.5"
                >
                  <span
                    className="w-full rounded-t-md bg-gradient-to-t from-rose-500 via-orange-400 to-amber-300"
                    style={{ height: `${seg.energy * 1.4}px` }}
                  />
                </motion.div>
              ))}
            </div>
            <div className="mt-2 grid grid-cols-8 gap-2 text-center sm:gap-3">
              {playlistArc.map((seg) => (
                <div key={seg.label}>
                  <div className="text-[11px] font-semibold leading-tight">{seg.label}</div>
                  <div className="text-[10px] leading-tight text-muted-foreground">{seg.hint}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* What's included + pricing summary */}
      <section className="container py-14 sm:py-16">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <div>
            <Badge variant="outline" className="rounded-full border-rose-200 bg-rose-50 text-rose-700">
              <Sparkles className="h-3 w-3" /> What's included
            </Badge>
            <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              The full mobile disco — all in.
            </h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
              No hidden hire fees, no surprise add-ons. The price you see covers PA, lighting,
              mic, and travel within the DJ's region.
            </p>
            {pricing && (
              <div className="mt-5 rounded-2xl border bg-card p-5">
                <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Wedding DJ pricing in Denmark
                </div>
                <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="text-2xl font-semibold tabular-nums sm:text-3xl">
                    {formatCurrency(pricing.min, "DKK")}
                  </span>
                  <span className="text-muted-foreground">to</span>
                  <span className="text-xl font-semibold tabular-nums sm:text-2xl">
                    {formatCurrency(pricing.max, "DKK")}
                  </span>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Average around {formatCurrency(pricing.avg, "DKK")} for a full evening including PA, lighting, mic, and travel.
                </p>
              </div>
            )}
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {equipmentChecklist.map((it) => (
              <div key={it.label} className="flex items-start gap-3 rounded-xl border bg-card p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-amber-100 to-rose-100 text-amber-700">
                  <it.Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium leading-snug">{it.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Wedding-only testimonials */}
      <section className="container py-14 sm:py-16">
        <div className="mx-auto max-w-2xl text-center">
          <Badge variant="outline" className="rounded-full border-rose-200 bg-rose-50 text-rose-700">
            <Star className="h-3 w-3 fill-current" /> Real wedding reviews
          </Badge>
          <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
            What couples say after their wedding.
          </h2>
        </div>
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          {weddingReviews.map(({ review, dj }) => (
            <motion.div
              key={review.id}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 0.45 }}
            >
              <Card className="h-full">
                <CardContent className="p-5">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                  <p className="mt-3 text-pretty text-[15px] leading-relaxed">"{review.body}"</p>
                  {dj && (
                    <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3 text-sm">
                      <span className="text-muted-foreground">
                        Booked{" "}
                        <Link
                          to={`/djs/${dj.username}?eventType=wedding`}
                          className="font-semibold text-foreground underline-offset-4 hover:underline"
                        >
                          {dj.stage_name}
                        </Link>
                      </span>
                      <Badge variant="secondary" className="rounded-full">
                        <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> Wedding
                      </Badge>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      <Separator />

      {/* FAQ */}
      <section className="container py-14 sm:py-16">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Badge variant="outline" className="rounded-full border-rose-200 bg-rose-50 text-rose-700">
              FAQ
            </Badge>
            <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              Wedding DJ questions, answered.
            </h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
              Still wondering? Drop a message in the booking thread once you've shortlisted a DJ —
              every DJ replies within 2 hours.
            </p>
          </div>
          <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
            {faq.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">{item.q}</AccordionTrigger>
                <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Final CTA */}
      <section className="container pb-20">
        <div className="relative overflow-hidden rounded-3xl bg-[hsl(222_47%_10%)] p-8 text-white sm:p-12">
          <div
            aria-hidden
            className="absolute inset-0 opacity-80"
            style={{
              background:
                "linear-gradient(120deg, hsla(346,77%,50%,0.5) 0%, hsla(21,90%,53%,0.45) 50%, hsla(45,93%,58%,0.45) 100%)",
            }}
          />
          <div aria-hidden className="absolute inset-0 bg-grid opacity-25" />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                Ready to find your wedding DJ?
              </h2>
              <p className="mt-1.5 max-w-xl text-pretty text-sm text-white/80 sm:text-base">
                Browse {totalWeddingDJs} verified wedding DJs above, compare profiles, and message
                any of them before you decide. No payment until you book.
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> 100% verified
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Stripe-protected
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Free cancellation up to 14 days
                </span>
              </div>
            </div>
            <Button asChild variant="accent" size="lg" className="rounded-full shadow-xl">
              <a href="#top">Browse wedding DJs</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
