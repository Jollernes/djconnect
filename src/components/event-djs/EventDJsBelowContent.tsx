import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Heart,
  Star,
  Shield,
  CheckCircle2,
  Sparkles,
  Music4,
  ChevronRight,
  Users,
} from "lucide-react";
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
import { formatCurrency, cn } from "@/lib/utils";
import type { EventListingConfig } from "@/lib/eventDJsContent";
import { djCountForEvent, pricingForEvent } from "@/lib/eventDJsContent";
import {
  runOfShow,
  playlistArc,
  equipmentChecklist,
  weddingReviews,
} from "@/lib/weddingDJsContent";

type Props = { config: EventListingConfig };

export function EventDJsBelowContent({ config }: Props) {
  const pricing = pricingForEvent(config.id);
  const total = djCountForEvent(config.id);
  const isWedding = config.id === "wedding";
  const { theme, label } = config;
  const labelLower = label.toLowerCase();

  return (
    <>
      {/* Value props */}
      <section className="container py-12">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {config.valueProps.map((vp, i) => (
            <motion.div
              key={vp.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <Card className="h-full">
                <CardContent className="p-4">
                  <span
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br",
                      theme.iconGradFrom,
                      theme.iconGradTo,
                      theme.iconText,
                    )}
                  >
                    <vp.Icon className="h-4 w-4" />
                  </span>
                  <h3 className="mt-2.5 text-sm font-semibold">{vp.title}</h3>
                  <p className="mt-1 text-xs leading-snug text-muted-foreground">
                    {vp.body}
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {isWedding && (
        <>
          <Separator />
          {/* Sample run-of-show */}
          <section className="container py-14 sm:py-16">
            <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr] lg:items-start">
              <div>
                <Badge
                  variant="outline"
                  className={cn("rounded-full", theme.accentBorder, theme.accentBg, theme.accentText)}
                >
                  <Heart className="h-3 w-3 fill-current" /> Eksempel på aftenplan
                </Badge>
                <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  En bryllupsaften, time for time.
                </h2>
                <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
                  Den rytme de fleste DJConnect-par følger. Når du har booket, bygger din DJ din
                  præcise aftenplan sammen med dig i dashboardet — redigerbar helt frem til dagen.
                </p>
                <Button asChild variant="link" className={cn("-ml-3 mt-2", theme.accentText)}>
                  <Link to="/how-it-works">
                    Se planlægningsforløbet <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
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
                      <span className="font-mono text-sm font-semibold text-rose-700">
                        {s.time}
                      </span>
                      <span className="text-base font-semibold">{s.label}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted-foreground">{s.body}</p>
                  </motion.li>
                ))}
              </ol>
            </div>
          </section>

          {/* Energy curve */}
          <section
            className={cn("bg-gradient-to-b", theme.sectionBgGradient)}
          >
            <div className="container py-14 sm:py-16">
              <div className="mx-auto max-w-2xl text-center">
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full",
                    theme.accentBorder,
                    theme.accentBg,
                    theme.accentText,
                  )}
                >
                  <Music4 className="h-3 w-3" /> Energikurve
                </Badge>
                <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  Sådan bygger en bryllups-DJ aftenen op.
                </h2>
                <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
                  Den kurve de fleste bryllups-DJs arbejder efter — blød start, opvarmning, peak og til sidst en afslutning,
                  alle synger med på.
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
                      transition={{
                        delay: i * 0.04,
                        duration: 0.5,
                        ease: [0.22, 1, 0.36, 1],
                      }}
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
                      <div className="text-[10px] leading-tight text-muted-foreground">
                        {seg.hint}
                      </div>
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
                <Badge
                  variant="outline"
                  className={cn(
                    "rounded-full",
                    theme.accentBorder,
                    theme.accentBg,
                    theme.accentText,
                  )}
                >
                  <Sparkles className="h-3 w-3" /> Hvad er inkluderet
                </Badge>
                <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                  Det fulde mobile diskotek — alt inklusive.
                </h2>
                <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
                  Ingen skjulte lejegebyrer, ingen overraskelser. Prisen, du ser, dækker PA, lys,
                  mikrofon og transport inden for DJ'ens region.
                </p>
                {pricing && (
                  <div className="mt-5 rounded-2xl border bg-card p-5">
                    <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      Priser for bryllups-DJs i Danmark
                    </div>
                    <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                      <span className="text-2xl font-semibold tabular-nums sm:text-3xl">
                        {formatCurrency(pricing.min, "DKK")}
                      </span>
                      <span className="text-muted-foreground">til</span>
                      <span className="text-xl font-semibold tabular-nums sm:text-2xl">
                        {formatCurrency(pricing.max, "DKK")}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      I gennemsnit omkring {formatCurrency(pricing.avg, "DKK")} for en hel aften inkl.
                      PA, lys, mikrofon og transport.
                    </p>
                  </div>
                )}
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {equipmentChecklist.map((it) => (
                  <div
                    key={it.label}
                    className="flex items-start gap-3 rounded-xl border bg-card p-4"
                  >
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
              <Badge
                variant="outline"
                className={cn(
                  "rounded-full",
                  theme.accentBorder,
                  theme.accentBg,
                  theme.accentText,
                )}
              >
                <Star className="h-3 w-3 fill-current" /> Rigtige bryllupsanmeldelser
              </Badge>
              <h2 className="mt-2 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
Hvad par siger efter deres bryllup.
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
                      <p className="mt-3 text-pretty text-[15px] leading-relaxed">
                        "{review.body}"
                      </p>
                      {dj && (
                        <div className="mt-4 flex items-center justify-between gap-3 border-t pt-3 text-sm">
                          <span className="text-muted-foreground">
                            Bookede{" "}
                            <Link
                              to={`/djs/${dj.username}?eventType=wedding`}
                              className="font-semibold text-foreground underline-offset-4 hover:underline"
                            >
                              {dj.stage_name}
                            </Link>
                          </span>
                          <Badge variant="secondary" className="rounded-full">
                            <Heart className="h-3 w-3 fill-rose-500 text-rose-500" /> Bryllup
                          </Badge>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </section>
        </>
      )}

      {!isWedding && pricing && (
        <section className={cn("bg-gradient-to-b", theme.sectionBgGradient)}>
          <div className="container py-12 sm:py-14">
            <div className="mx-auto max-w-3xl rounded-2xl border bg-card p-6 sm:p-8">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
Priser for {label}-DJs i Danmark
              </div>
              <div className="mt-1 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="text-2xl font-semibold tabular-nums sm:text-3xl">
                  {formatCurrency(pricing.min, "DKK")}
                </span>
                <span className="text-muted-foreground">til</span>
                <span className="text-xl font-semibold tabular-nums sm:text-2xl">
                  {formatCurrency(pricing.max, "DKK")}
                </span>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                I gennemsnit omkring {formatCurrency(pricing.avg, "DKK")} for et 4–6 timers event inkl. PA,
                lys, mikrofon og transport inden for DJ'ens region.
              </p>
            </div>
          </div>
        </section>
      )}

      <Separator />

      {/* FAQ */}
      <section className="container py-14 sm:py-16">
        <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <Badge
              variant="outline"
              className={cn(
                "rounded-full",
                theme.accentBorder,
                theme.accentBg,
                theme.accentText,
              )}
            >
              FAQ
            </Badge>
            <h2 className="mt-3 text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
              {isWedding ? "Spørgsmål om bryllups-DJs, besvaret." : `Spørgsmål om ${label}-DJs, besvaret.`}
            </h2>
            <p className="mt-2 text-pretty text-sm text-muted-foreground sm:text-base">
              Stadig i tvivl? Skriv en besked i bookingtråden, når du har udvalgt en DJ —
              hver DJ svarer inden for 2 timer.
            </p>
          </div>
          <Accordion type="single" collapsible className="rounded-2xl border bg-card px-5">
            {config.faq.map((item, i) => (
              <AccordionItem key={item.q} value={`item-${i}`}>
                <AccordionTrigger className="text-left text-base font-semibold">
                  {item.q}
                </AccordionTrigger>
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
            style={{ background: theme.ctaGradient }}
          />
          <div aria-hidden className="absolute inset-0 bg-grid opacity-25" />
          <div className="relative flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-balance text-2xl font-semibold tracking-tight sm:text-3xl">
                {config.finalCta.title}
              </h2>
              <p className="mt-1.5 max-w-xl text-pretty text-sm text-white/80 sm:text-base">
                {total > 0
                  ? config.finalCta.body(total)
                  : `Sammenlign profiler, skriv til hvem som helst, og book med escrow og en skriftlig kontrakt.`}
              </p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-white/70">
                <span className="inline-flex items-center gap-1.5">
                  <Users className="h-3.5 w-3.5" /> 100% verificeret
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Shield className="h-3.5 w-3.5" /> Stripe-beskyttet
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Gratis afbestilling op til 14 dage
                </span>
              </div>
            </div>
            <Button asChild variant="accent" size="lg" className="rounded-full shadow-xl">
              <a href="#top">{config.finalCta.buttonLabel}</a>
            </Button>
          </div>
          <span className="sr-only">{labelLower}</span>
        </div>
      </section>
    </>
  );
}
