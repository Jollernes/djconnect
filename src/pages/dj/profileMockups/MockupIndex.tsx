import { Link } from "react-router-dom";
import {
  ArrowRight, LayoutGrid, LayoutPanelLeft, ListChecks,
} from "lucide-react";

const MOCKUPS = [
  {
    slug: "split-studio",
    number: "1",
    title: "Split Studio",
    icon: LayoutPanelLeft,
    summary:
      "Editor til venstre, status og live preview til højre. Fokuseret arbejde med konstant oversigt.",
    bestFor:
      "DJs der vil se ændringer side-om-side med formularen og altid have overblik over de tre profilers progress.",
    matchScreenshot: true,
  },
  {
    slug: "guided-sections",
    number: "2",
    title: "Guided Sections",
    icon: ListChecks,
    summary:
      "Én bred kolonne med foldbare sektioner og status-badges. Pinbar preview-drawer til højre.",
    bestFor:
      "DJs der foretrækker at arbejde sig én sektion ad gangen og som bruger tablets / smallere skærme.",
    matchScreenshot: false,
  },
  {
    slug: "card-canvas",
    number: "3",
    title: "Card Canvas + Inspector",
    icon: LayoutGrid,
    summary:
      "WYSIWYG-canvas af preview-kort. Klik et kort, og en Inspector-rude til højre åbner editor-felterne for netop dét kort.",
    bestFor:
      "Visuelle DJs der lærer bedst ved at se hvad de redigerer — som Figma eller Notion.",
    matchScreenshot: false,
  },
];

/**
 * Landing page for the three Edit-Profile redesign mockups. Lists each
 * option with a short pitch / best-for note, plus a deep-link into the
 * mockup so the reviewer can click through and feel each design.
 */
export function ProfileMockupsIndexPage() {
  return (
    <div className="max-w-5xl space-y-8 pb-24">
      <header className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Edit Profile — design review
        </p>
        <h1 className="text-3xl font-semibold">Tre mockup-versioner</h1>
        <p className="max-w-3xl text-sm text-muted-foreground">
          Tre forskellige paradigmer for hvordan en DJ kan redigere sin
          DJConnect-profil. Alle tre er bygget på samme datakilde — kun layout
          og interaktionsmønster er forskellig. Klik hver mockup nedenfor for
          at prøve dem live, og vælg den der passer bedst til vores DJ-flow.
        </p>
      </header>

      <section className="rounded-2xl border bg-muted/30 p-5">
        <h2 className="text-sm font-semibold">Bag de tre designs ligger samme principper</h2>
        <ul className="mt-3 grid gap-2 text-sm md:grid-cols-2">
          <li>• Sub-profil-skifteren er øverst — altid synlig, aldrig gemt væk.</li>
          <li>• Live preview-rude med Desktop / Mobil-toggle og åbn-i-ny-fane.</li>
          <li>• "Delt på tværs af profiler"-felter tydeligt markeret.</li>
          <li>• Autosave med "Gemt kl. HH:MM" — ingen manuelle Save-knapper.</li>
          <li>• Indholdsgruppering: tekst, medier, pris, ydelser, mobildiskotek.</li>
          <li>• Status per sektion (Færdig / Mangler / Tom) for hurtigt overblik.</li>
        </ul>
      </section>

      <div className="grid gap-4 md:grid-cols-1">
        {MOCKUPS.map((m) => (
          <Link
            key={m.slug}
            to={`/dj/profile-mockups/${m.slug}`}
            className="group flex items-start gap-5 rounded-2xl border bg-card p-5 shadow-sm transition-all hover:-translate-y-px hover:shadow-md"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-muted/60">
              <m.icon className="h-5 w-5" />
            </span>
            <div className="flex-1 space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Mockup {m.number}
                </span>
                {m.matchScreenshot && (
                  <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 ring-1 ring-amber-200">
                    Matcher din reference
                  </span>
                )}
              </div>
              <h3 className="text-lg font-semibold">{m.title}</h3>
              <p className="text-sm text-muted-foreground">{m.summary}</p>
              <p className="pt-1 text-xs text-muted-foreground/80">
                <span className="font-semibold">Bedst for:</span> {m.bestFor}
              </p>
            </div>
            <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>

      <footer className="rounded-2xl border border-dashed bg-muted/20 p-5 text-sm text-muted-foreground">
        Vælg den du foretrækker, og giv besked — så samler jeg dén ind på den
        rigtige <code className="rounded bg-muted px-1 py-0.5">/dj/profile</code>-route
        og fjerner de gamle A-E varianter.
      </footer>
    </div>
  );
}
