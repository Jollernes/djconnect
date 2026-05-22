import { useMemo, useState } from "react";
import {
  Camera, ExternalLink, Image as ImageIcon, MessageSquareQuote,
  Music, Sparkles, Speaker, Star, Tag, Wallet, X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EventTypeTabs } from "./shared/EventTypeTabs";
import { ChipMultiSelect } from "./shared/ChipMultiSelect";
import { DottedUploadSlot } from "./shared/DottedUploadSlot";
import { AutosaveIndicator } from "./shared/AutosaveIndicator";
import { MockupSwitcher } from "./shared/MockupSwitcher";
import { CompletionBars } from "./shared/CompletionBars";
import { useMockupState } from "./shared/useMockupState";
import { buildPreviewDJ } from "@/pages/dj/profileEditor/LiveProfilePreview";
import {
  MOCKUP_SUB_PROFILE_META,
  type MockupSubProfileKey,
} from "./shared/types";

type CardId =
  | "hero"
  | "voice"
  | "gallery"
  | "music"
  | "services"
  | "price"
  | "social-proof"
  | "equipment";

type CanvasCard = {
  id: CardId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  /** Whether this card is per-sub-profile or shared. */
  scope: "sub-profile" | "shared";
};

const CARDS: CanvasCard[] = [
  { id: "hero", label: "Hero-billede", icon: Camera, scope: "sub-profile" },
  { id: "voice", label: "Tagline & bio", icon: Sparkles, scope: "sub-profile" },
  { id: "gallery", label: "Galleri", icon: ImageIcon, scope: "sub-profile" },
  { id: "music", label: "Musik & approach", icon: Music, scope: "sub-profile" },
  { id: "services", label: "Særlige ydelser", icon: Tag, scope: "sub-profile" },
  { id: "price", label: "Pris", icon: Wallet, scope: "sub-profile" },
  { id: "social-proof", label: "Anmeldelser", icon: MessageSquareQuote, scope: "shared" },
  { id: "equipment", label: "Mobildiskotek", icon: Speaker, scope: "shared" },
];

const MUSIC_STYLE_OPTIONS = [
  "Pop", "Dance", "R&B", "House", "Dansk hits", "Disco", "80'er", "90'er",
  "Latin", "Afrobeats", "Techno", "Schlager",
];
const SPECIAL_SERVICES_OPTIONS = [
  "Lys & stemningslys", "Trådløs mikrofon", "Røgmaskine", "Stemningsopsætning",
  "Konfettiskydere", "Karaoke", "Fotobooth", "DJ-assistent",
];

/**
 * Mockup 3 — Card Canvas + Inspector.
 *
 * Layout: a canvas of WYSIWYG "preview cards", one per block of the
 * public DJ profile. Each card renders a *mini live preview* of what
 * customers see for that block — clicking the card opens a right-hand
 * Inspector with editable fields scoped to just that block.
 *
 * Best-practice references:
 * - Notion: page + block → side inspector
 * - Figma: layer + Properties panel
 * - Shopify Theme Editor: section + section settings drawer
 */
export function CardCanvasMockup() {
  const { state, activeKey, setActiveKey, completionEntries } = useMockupState();
  const meta = MOCKUP_SUB_PROFILE_META[activeKey];
  const sub = state.subProfiles[activeKey];
  const previewDJ = useMemo(() => buildPreviewDJ(state), [state]);

  const [activeCard, setActiveCard] = useState<CardId | null>(null);

  function statusFor(id: CardId): "complete" | "needs-attention" | "empty" {
    if (id === "hero") return sub.featuredPhotoDataUrl ? "complete" : "empty";
    if (id === "voice")
      return sub.tagline && sub.bio.length >= 80
        ? "complete"
        : sub.tagline || sub.bio
        ? "needs-attention"
        : "empty";
    if (id === "gallery")
      return sub.gallery.length >= 3
        ? "complete"
        : sub.gallery.length > 0
        ? "needs-attention"
        : "empty";
    if (id === "music")
      return sub.musicStyle && sub.approach
        ? "complete"
        : sub.musicStyle || sub.approach
        ? "needs-attention"
        : "empty";
    if (id === "services") return sub.signatureTracks ? "complete" : "empty";
    if (id === "price") return sub.priceFromMajor > 0 ? "complete" : "empty";
    if (id === "equipment") return state.equipment ? "complete" : "empty";
    if (id === "social-proof") return "complete";
    return "empty";
  }

  return (
    <div className="max-w-[1600px] space-y-5 pb-24">
      <CardCanvasHeader state={state} />
      <EventTypeTabs active={activeKey} onChange={setActiveKey} />
      <CompletionBars
        entries={completionEntries}
        activeKey={activeKey}
        onJump={setActiveKey}
        subheading={`Klik på et kort nedenfor for at redigere det. Vises nu: din ${meta.tabLabel.toLowerCase()}.`}
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,420px)]">
        {/* Canvas */}
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {CARDS.map((card) => {
            const status = statusFor(card.id);
            const isActive = activeCard === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveCard(card.id)}
                className={cn(
                  "group relative overflow-hidden rounded-2xl border bg-card text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-foreground/20",
                  isActive && "ring-2 ring-foreground/40",
                )}
              >
                <div className="flex items-center justify-between gap-2 border-b border-border/60 px-4 py-2.5">
                  <span className="flex items-center gap-2 text-xs font-semibold">
                    <card.icon className="h-3.5 w-3.5 text-muted-foreground" />
                    {card.label}
                  </span>
                  <StatusDot status={status} />
                </div>
                <div className="relative h-44 bg-muted/20">
                  <CardPreview
                    cardId={card.id}
                    activeKey={activeKey}
                    state={state}
                    previewDJ={previewDJ}
                  />
                  {card.scope === "shared" && (
                    <span className="absolute right-2 top-2 rounded-full bg-card/95 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground shadow-sm">
                      Delt
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Inspector */}
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <Inspector
            cardId={activeCard}
            activeKey={activeKey}
            state={state}
            onClose={() => setActiveCard(null)}
          />
        </aside>
      </div>

      <MockupSwitcher />
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Card previews                                                          */
/* -------------------------------------------------------------------- */

function CardPreview({
  cardId,
  state,
  activeKey,
  previewDJ,
}: {
  cardId: CardId;
  state: ReturnType<typeof useMockupState>["state"];
  activeKey: MockupSubProfileKey;
  previewDJ: ReturnType<typeof buildPreviewDJ>;
}) {
  const sub = state.subProfiles[activeKey];

  if (cardId === "hero") {
    return (
      <div className="relative h-full w-full">
        {sub.featuredPhotoDataUrl ? (
          <img src={sub.featuredPhotoDataUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <EmptyMini icon={Camera} label="Upload hero-billede" />
        )}
      </div>
    );
  }
  if (cardId === "voice") {
    return (
      <div className="flex h-full flex-col justify-center gap-1.5 p-4">
        <p className="text-base font-semibold leading-tight">
          {previewDJ.stage_name}
        </p>
        <p className="text-xs leading-snug text-muted-foreground line-clamp-2">
          {sub.tagline || "Tilføj en tagline kunder vil huske."}
        </p>
        <p className="line-clamp-3 text-[11px] leading-relaxed text-muted-foreground/80">
          {sub.bio || "Tilføj en længere bio som passer til netop denne profil."}
        </p>
      </div>
    );
  }
  if (cardId === "gallery") {
    const items = sub.gallery.slice(0, 4);
    if (items.length === 0) return <EmptyMini icon={ImageIcon} label="Tilføj galleribilleder" />;
    return (
      <div className="grid h-full grid-cols-2 gap-1 p-1">
        {items.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-md">
            {g.type === "video" ? (
              <video src={g.dataUrl} className="h-full w-full object-cover" muted playsInline />
            ) : (
              <img src={g.dataUrl} alt="" className="h-full w-full object-cover" />
            )}
          </div>
        ))}
      </div>
    );
  }
  if (cardId === "music") {
    const styles = sub.musicStyle ? sub.musicStyle.split(",").map((s) => s.trim()).filter(Boolean) : [];
    return (
      <div className="flex h-full flex-col justify-center gap-2 p-4">
        <div className="flex flex-wrap gap-1">
          {styles.length === 0 ? (
            <span className="text-xs text-muted-foreground">Vælg dine musikstilarter</span>
          ) : (
            styles.slice(0, 6).map((s) => (
              <span
                key={s}
                className="rounded-full border bg-card px-2 py-0.5 text-[11px] font-medium"
              >
                {s}
              </span>
            ))
          )}
        </div>
        <p className="line-clamp-3 text-[11px] leading-relaxed text-muted-foreground">
          {sub.approach || "Beskriv hvordan du kører et event af denne type."}
        </p>
      </div>
    );
  }
  if (cardId === "services") {
    const items = sub.signatureTracks
      ? sub.signatureTracks.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    return (
      <div className="flex h-full flex-col gap-2 p-4">
        {items.length === 0 ? (
          <EmptyMini icon={Tag} label="Vælg ydelser inkluderet" />
        ) : (
          <ul className="space-y-1 text-[11px]">
            {items.slice(0, 5).map((s) => (
              <li key={s} className="flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-foreground/60" /> {s}
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  if (cardId === "price") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground">Fra</p>
        <p className="text-2xl font-semibold">
          {sub.priceFromMajor
            ? `${sub.priceFromMajor.toLocaleString("da-DK")} kr.`
            : `${state.priceFrom.toLocaleString("da-DK")} kr.`}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {sub.priceFromMajor ? "Pris for denne profil" : "Standardpris fra kontoen"}
        </p>
      </div>
    );
  }
  if (cardId === "social-proof") {
    return (
      <div className="flex h-full flex-col justify-center gap-2 p-4">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
          <p className="text-sm font-semibold">4.9 · 87 anmeldelser</p>
        </div>
        <p className="text-[11px] leading-relaxed text-muted-foreground line-clamp-3">
          "Energien på dansegulvet var fantastisk fra første til sidste sang.
          Vi blev anbefalet til vores venner med det samme."
        </p>
      </div>
    );
  }
  if (cardId === "equipment") {
    return (
      <div className="flex h-full flex-col justify-center gap-1.5 p-4">
        <p className="text-xs font-semibold">Mobildiskotek</p>
        <p className="line-clamp-4 text-[11px] leading-relaxed text-muted-foreground">
          {state.equipment || "Beskriv dit setup — højtalere, mikrofoner, lys, backup."}
        </p>
      </div>
    );
  }
  return null;
}

function EmptyMini({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-1 text-muted-foreground">
      <Icon className="h-5 w-5" />
      <p className="text-[11px]">{label}</p>
    </div>
  );
}

/* -------------------------------------------------------------------- */
/* Inspector                                                              */
/* -------------------------------------------------------------------- */

function Inspector({
  cardId,
  activeKey,
  state,
  onClose,
}: {
  cardId: CardId | null;
  activeKey: MockupSubProfileKey;
  state: ReturnType<typeof useMockupState>["state"];
  onClose: () => void;
}) {
  const sub = state.subProfiles[activeKey];
  const meta = MOCKUP_SUB_PROFILE_META[activeKey];

  if (!cardId) {
    return (
      <div className="rounded-2xl border bg-card p-6 shadow-sm">
        <p className="text-sm font-semibold">Inspector</p>
        <p className="mt-2 text-xs text-muted-foreground">
          Klik på et kort til venstre for at redigere det. Det aktive felt
          opdateres på din offentlige profil med det samme.
        </p>
      </div>
    );
  }
  const card = CARDS.find((c) => c.id === cardId)!;

  return (
    <div className="rounded-2xl border bg-card shadow-sm">
      <header className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Inspector
          </p>
          <p className="mt-0.5 text-sm font-semibold">{card.label}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {card.scope === "shared"
              ? "Delt på tværs af alle dine sub-profiler."
              : `Specifikt for ${meta.tabLabel.toLowerCase()}.`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Luk inspector"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </header>
      <div className="p-5">
        {cardId === "hero" && (
          <DottedUploadSlot
            value={sub.featuredPhotoDataUrl}
            onChange={(v) => state.setFeaturedPhoto(activeKey, v)}
            hint="16:9 anbefales"
          />
        )}
        {cardId === "voice" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Tagline</Label>
              <Input
                value={sub.tagline}
                onChange={(e) => state.updateSubProfile(activeKey, "tagline", e.target.value)}
                maxLength={80}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Profiltekst</Label>
              <Textarea
                value={sub.bio}
                onChange={(e) => state.updateSubProfile(activeKey, "bio", e.target.value)}
                rows={6}
                maxLength={1500}
              />
              <p className="text-[10px] tabular-nums text-muted-foreground">
                {sub.bio.length} / 1500
              </p>
            </div>
          </div>
        )}
        {cardId === "gallery" && (
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              {sub.gallery.map((g) => (
                <div key={g.id} className="group relative aspect-square overflow-hidden rounded-md ring-1 ring-border">
                  {g.type === "video" ? (
                    <video src={g.dataUrl} className="h-full w-full object-cover" muted playsInline />
                  ) : (
                    <img src={g.dataUrl} alt="" className="h-full w-full object-cover" />
                  )}
                  <button
                    type="button"
                    onClick={() => state.removeGalleryItem(activeKey, g.id)}
                    className="absolute right-1 top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm ring-1 ring-border"
                    aria-label="Fjern"
                  >
                    ×
                  </button>
                </div>
              ))}
              <DottedUploadSlot
                value={undefined}
                onChange={(next) => {
                  if (!next) return;
                  state.appendGalleryItems(activeKey, [
                    { id: `g-${Date.now()}`, type: "photo", dataUrl: next },
                  ]);
                }}
                hint="Tilføj"
                aspectClassName="aspect-square"
              />
            </div>
            <p className="text-[11px] text-muted-foreground">
              Mindst 3 billeder anbefales. Træk for at omarrangere (kommer snart).
            </p>
          </div>
        )}
        {cardId === "music" && (
          <div className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Musikstilarter</Label>
              <ChipMultiSelect
                value={sub.musicStyle ? sub.musicStyle.split(",").map((s) => s.trim()).filter(Boolean) : []}
                options={MUSIC_STYLE_OPTIONS}
                onChange={(next) => state.updateSubProfile(activeKey, "musicStyle", next.join(", "))}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-muted-foreground">Din tilgang</Label>
              <Textarea
                value={sub.approach}
                onChange={(e) => state.updateSubProfile(activeKey, "approach", e.target.value)}
                rows={4}
              />
            </div>
          </div>
        )}
        {cardId === "services" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">Særlige ydelser</Label>
            <ChipMultiSelect
              value={sub.signatureTracks ? sub.signatureTracks.split(",").map((s) => s.trim()).filter(Boolean) : []}
              options={SPECIAL_SERVICES_OPTIONS}
              onChange={(next) => state.updateSubProfile(activeKey, "signatureTracks", next.join(", "))}
            />
          </div>
        )}
        {cardId === "price" && (
          <div className="space-y-1.5">
            <Label className="text-xs font-medium text-muted-foreground">
              Startpris (DKK)
            </Label>
            <Input
              type="number"
              value={sub.priceFromMajor || ""}
              onChange={(e) =>
                state.updateSubProfile(activeKey, "priceFromMajor", Number(e.target.value) || 0)
              }
            />
            <p className="text-[11px] text-muted-foreground">
              Lad stå tom for at bruge din standardpris ({state.priceFrom.toLocaleString("da-DK")} kr.).
            </p>
          </div>
        )}
        {cardId === "equipment" && (
          <div className="space-y-1.5">
            <p className="rounded-lg border border-dashed bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              Ét mobildiskotek — deles på alle dine sub-profiler.
            </p>
            <Label className="text-xs font-medium text-muted-foreground">Beskrivelse</Label>
            <Textarea
              value={state.equipment}
              onChange={(e) => state.setEquipment(e.target.value)}
              rows={6}
            />
          </div>
        )}
        {cardId === "social-proof" && (
          <p className="text-xs text-muted-foreground">
            Anmeldelser hentes automatisk fra dine kunder. De vises i den
            rækkefølge DJConnect bedømmer mest relevant. Du kan ikke redigere
            dem direkte, men du kan svare på den enkelte anmeldelse fra dit
            dashboard.
          </p>
        )}
      </div>
    </div>
  );
}

function StatusDot({
  status,
}: {
  status: "complete" | "needs-attention" | "empty";
}) {
  const color =
    status === "complete"
      ? "bg-emerald-500"
      : status === "needs-attention"
      ? "bg-amber-500"
      : "bg-muted";
  return <span className={cn("h-2 w-2 rounded-full", color)} aria-hidden="true" />;
}

function CardCanvasHeader({
  state,
}: {
  state: ReturnType<typeof useMockupState>["state"];
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div className="space-y-0.5">
        <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Mockup 3
        </p>
        <h1 className="text-2xl font-semibold">Card Canvas + Inspector</h1>
        <p className="text-sm text-muted-foreground">
          WYSIWYG: hvert kort viser hvad kunden ser. Klik for at redigere i højre rude.
        </p>
      </div>
      <div className="flex items-center gap-3">
        <AutosaveIndicator value={state.subProfiles} />
        <a
          href="/djs/alex-holm"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Åbn offentlig profil
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
