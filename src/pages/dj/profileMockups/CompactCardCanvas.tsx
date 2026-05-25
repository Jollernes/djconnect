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
  scope: "sub-profile" | "shared";
};

const CARDS: CanvasCard[] = [
  { id: "hero", label: "Hero", icon: Camera, scope: "sub-profile" },
  { id: "voice", label: "Tagline & bio", icon: Sparkles, scope: "sub-profile" },
  { id: "gallery", label: "Galleri", icon: ImageIcon, scope: "sub-profile" },
  { id: "music", label: "Musik", icon: Music, scope: "sub-profile" },
  { id: "services", label: "Ydelser", icon: Tag, scope: "sub-profile" },
  { id: "price", label: "Pris", icon: Wallet, scope: "sub-profile" },
  { id: "social-proof", label: "Anmeldelser", icon: MessageSquareQuote, scope: "shared" },
  { id: "equipment", label: "Udstyr", icon: Speaker, scope: "shared" },
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
 * Mockup 6 — Compact Card Canvas + Inspector.
 *
 * Tighter variant of Mockup 3 with:
 * - Smaller card previews (h-28 instead of h-44)
 * - Reduced padding and font sizes
 * - 4-column grid for better density
 * - Narrower inspector panel
 * - Appropriately-sized images in preview cards
 */
export function CompactCardCanvasMockup() {
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
    <div className="max-w-[1400px] space-y-3 pb-20">
      <CompactCanvasHeader state={state} />
      <EventTypeTabs active={activeKey} onChange={setActiveKey} className="text-xs" />
      <CompletionBars
        entries={completionEntries}
        activeKey={activeKey}
        onJump={setActiveKey}
        heading="Profiler"
        subheading={`Klik et kort for at redigere. Viser: ${meta.tabLabel.toLowerCase()}.`}
      />

      <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,340px)]">
        {/* Canvas */}
        <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {CARDS.map((card) => {
            const status = statusFor(card.id);
            const isActive = activeCard === card.id;
            return (
              <button
                key={card.id}
                type="button"
                onClick={() => setActiveCard(card.id)}
                className={cn(
                  "group relative overflow-hidden rounded-xl border bg-card text-left shadow-sm transition-all hover:shadow-md focus:outline-none focus:ring-2 focus:ring-foreground/20",
                  isActive && "ring-2 ring-foreground/40",
                )}
              >
                <div className="flex items-center justify-between gap-1.5 border-b border-border/60 px-3 py-1.5">
                  <span className="flex items-center gap-1.5 text-[10px] font-semibold">
                    <card.icon className="h-3 w-3 text-muted-foreground" />
                    {card.label}
                  </span>
                  <StatusDot status={status} />
                </div>
                <div className="relative h-28 bg-muted/20">
                  <CardPreview
                    cardId={card.id}
                    activeKey={activeKey}
                    state={state}
                    previewDJ={previewDJ}
                  />
                  {card.scope === "shared" && (
                    <span className="absolute right-1.5 top-1.5 rounded-full bg-card/95 px-1.5 py-px text-[8px] font-medium uppercase tracking-wide text-muted-foreground shadow-sm">
                      Delt
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Inspector */}
        <aside className="lg:sticky lg:top-4 lg:self-start">
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
          <EmptyMini icon={Camera} label="Upload hero" />
        )}
      </div>
    );
  }
  if (cardId === "voice") {
    return (
      <div className="flex h-full flex-col justify-center gap-1 p-3">
        <p className="text-xs font-semibold leading-tight line-clamp-1">
          {previewDJ.stage_name}
        </p>
        <p className="text-[10px] leading-snug text-muted-foreground line-clamp-1">
          {sub.tagline || "Tilføj tagline"}
        </p>
        <p className="line-clamp-3 text-[9px] leading-relaxed text-muted-foreground/80">
          {sub.bio || "Tilføj bio"}
        </p>
      </div>
    );
  }
  if (cardId === "gallery") {
    const items = sub.gallery.slice(0, 4);
    if (items.length === 0) return <EmptyMini icon={ImageIcon} label="Tilføj billeder" />;
    return (
      <div className="grid h-full grid-cols-2 gap-0.5 p-0.5">
        {items.map((g) => (
          <div key={g.id} className="overflow-hidden rounded-sm">
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
      <div className="flex h-full flex-col justify-center gap-1.5 p-3">
        <div className="flex flex-wrap gap-0.5">
          {styles.length === 0 ? (
            <span className="text-[10px] text-muted-foreground">Vælg stilarter</span>
          ) : (
            styles.slice(0, 4).map((s) => (
              <span
                key={s}
                className="rounded-full border bg-card px-1.5 py-px text-[9px] font-medium"
              >
                {s}
              </span>
            ))
          )}
          {styles.length > 4 && (
            <span className="text-[9px] text-muted-foreground">+{styles.length - 4}</span>
          )}
        </div>
        <p className="line-clamp-2 text-[9px] leading-relaxed text-muted-foreground">
          {sub.approach || "Beskriv din tilgang"}
        </p>
      </div>
    );
  }
  if (cardId === "services") {
    const items = sub.signatureTracks
      ? sub.signatureTracks.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    return (
      <div className="flex h-full flex-col gap-1.5 p-3">
        {items.length === 0 ? (
          <EmptyMini icon={Tag} label="Vælg ydelser" />
        ) : (
          <ul className="space-y-0.5 text-[9px]">
            {items.slice(0, 4).map((s) => (
              <li key={s} className="flex items-center gap-1">
                <span className="h-0.5 w-0.5 rounded-full bg-foreground/60" /> {s}
              </li>
            ))}
            {items.length > 4 && (
              <li className="text-muted-foreground">+{items.length - 4} mere</li>
            )}
          </ul>
        )}
      </div>
    );
  }
  if (cardId === "price") {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-0.5">
        <p className="text-[8px] uppercase tracking-wider text-muted-foreground">Fra</p>
        <p className="text-lg font-semibold">
          {sub.priceFromMajor
            ? `${sub.priceFromMajor.toLocaleString("da-DK")} kr.`
            : `${state.priceFrom.toLocaleString("da-DK")} kr.`}
        </p>
        <p className="text-[8px] text-muted-foreground">
          {sub.priceFromMajor ? "Profil-pris" : "Standardpris"}
        </p>
      </div>
    );
  }
  if (cardId === "social-proof") {
    return (
      <div className="flex h-full flex-col justify-center gap-1 p-3">
        <div className="flex items-center gap-1.5">
          <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
          <p className="text-xs font-semibold">4.9 · 87</p>
        </div>
        <p className="text-[9px] leading-relaxed text-muted-foreground line-clamp-2">
          "Energien på dansegulvet var fantastisk fra første til sidste sang."
        </p>
      </div>
    );
  }
  if (cardId === "equipment") {
    return (
      <div className="flex h-full flex-col justify-center gap-1 p-3">
        <p className="text-[10px] font-semibold">Mobildiskotek</p>
        <p className="line-clamp-3 text-[9px] leading-relaxed text-muted-foreground">
          {state.equipment || "Beskriv dit setup"}
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
    <div className="flex h-full w-full flex-col items-center justify-center gap-0.5 text-muted-foreground">
      <Icon className="h-4 w-4" />
      <p className="text-[9px]">{label}</p>
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
      <div className="rounded-xl border bg-card p-4 shadow-sm">
        <p className="text-xs font-semibold">Inspector</p>
        <p className="mt-1.5 text-[10px] text-muted-foreground">
          Klik et kort for at redigere.
        </p>
      </div>
    );
  }
  const card = CARDS.find((c) => c.id === cardId)!;

  return (
    <div className="rounded-xl border bg-card shadow-sm">
      <header className="flex items-start justify-between gap-2 border-b border-border/60 px-4 py-3">
        <div>
          <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
            Inspector
          </p>
          <p className="mt-px text-xs font-semibold">{card.label}</p>
          <p className="text-[10px] text-muted-foreground">
            {card.scope === "shared"
              ? "Delt på alle sub-profiler."
              : `For ${meta.tabLabel.toLowerCase()}.`}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          aria-label="Luk"
        >
          <X className="h-3 w-3" />
        </button>
      </header>
      <div className="p-4">
        {cardId === "hero" && (
          <DottedUploadSlot
            value={sub.featuredPhotoDataUrl}
            onChange={(v) => state.setFeaturedPhoto(activeKey, v)}
            hint="16:9"
          />
        )}
        {cardId === "voice" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Tagline</Label>
              <Input
                value={sub.tagline}
                onChange={(e) => state.updateSubProfile(activeKey, "tagline", e.target.value)}
                maxLength={80}
                className="h-8 text-xs"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Profiltekst</Label>
              <Textarea
                value={sub.bio}
                onChange={(e) => state.updateSubProfile(activeKey, "bio", e.target.value)}
                rows={4}
                maxLength={1500}
                className="text-xs"
              />
              <p className="text-[9px] tabular-nums text-muted-foreground">
                {sub.bio.length} / 1500
              </p>
            </div>
          </div>
        )}
        {cardId === "gallery" && (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-1.5">
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
                    className="absolute right-0.5 top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-white/95 text-[10px] text-foreground shadow-sm ring-1 ring-border"
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
                hint="+"
                aspectClassName="aspect-square"
              />
            </div>
            <p className="text-[9px] text-muted-foreground">Min. 3 billeder anbefales.</p>
          </div>
        )}
        {cardId === "music" && (
          <div className="space-y-3">
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Musikstilarter</Label>
              <ChipMultiSelect
                value={sub.musicStyle ? sub.musicStyle.split(",").map((s) => s.trim()).filter(Boolean) : []}
                options={MUSIC_STYLE_OPTIONS}
                onChange={(next) => state.updateSubProfile(activeKey, "musicStyle", next.join(", "))}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-[11px] font-medium text-muted-foreground">Tilgang</Label>
              <Textarea
                value={sub.approach}
                onChange={(e) => state.updateSubProfile(activeKey, "approach", e.target.value)}
                rows={3}
                className="text-xs"
              />
            </div>
          </div>
        )}
        {cardId === "services" && (
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">Ydelser</Label>
            <ChipMultiSelect
              value={sub.signatureTracks ? sub.signatureTracks.split(",").map((s) => s.trim()).filter(Boolean) : []}
              options={SPECIAL_SERVICES_OPTIONS}
              onChange={(next) => state.updateSubProfile(activeKey, "signatureTracks", next.join(", "))}
            />
          </div>
        )}
        {cardId === "price" && (
          <div className="space-y-1">
            <Label className="text-[11px] font-medium text-muted-foreground">
              Startpris (DKK)
            </Label>
            <Input
              type="number"
              value={sub.priceFromMajor || ""}
              onChange={(e) =>
                state.updateSubProfile(activeKey, "priceFromMajor", Number(e.target.value) || 0)
              }
              className="h-8 text-xs"
            />
            <p className="text-[9px] text-muted-foreground">
              Standard: {state.priceFrom.toLocaleString("da-DK")} kr.
            </p>
          </div>
        )}
        {cardId === "equipment" && (
          <div className="space-y-1.5">
            <p className="rounded-md border border-dashed bg-muted/30 px-2 py-1 text-[9px] text-muted-foreground">
              Ét mobildiskotek — deles på alle profiler.
            </p>
            <Label className="text-[11px] font-medium text-muted-foreground">Beskrivelse</Label>
            <Textarea
              value={state.equipment}
              onChange={(e) => state.setEquipment(e.target.value)}
              rows={4}
              className="text-xs"
            />
          </div>
        )}
        {cardId === "social-proof" && (
          <p className="text-[10px] text-muted-foreground">
            Anmeldelser hentes automatisk. Du kan svare via dit dashboard.
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
  return <span className={cn("h-1.5 w-1.5 rounded-full", color)} aria-hidden="true" />;
}

function CompactCanvasHeader({
  state,
}: {
  state: ReturnType<typeof useMockupState>["state"];
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-2">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Mockup 6
        </p>
        <h1 className="text-lg font-semibold leading-tight">Compact Card Canvas</h1>
        <p className="text-xs text-muted-foreground">
          WYSIWYG-kort i tæt 4-kolonne-grid. Kompakt inspector.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <AutosaveIndicator value={state.subProfiles} />
        <a
          href="/djs/alex-holm"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Åbn profil
          <ExternalLink className="h-3 w-3" />
        </a>
      </div>
    </div>
  );
}
