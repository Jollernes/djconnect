import { useRef, type ChangeEvent } from "react";
import { Image as ImageIcon, Plus, Video, X } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DemoDJMediaItem, DemoDJSubProfileKey } from "@/lib/demoDJProfile";

/**
 * Featured-photo picker. Big square slot — empty state has a clear "Upload"
 * call-to-action, filled state shows the photo with a hover overlay to
 * replace or remove. Used as the primary visual entry point on each
 * sub-profile editor.
 */
export function FeaturedPhotoSlot({
  value,
  onChange,
  eventLabel,
  size = "lg",
}: {
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  eventLabel: string;
  size?: "sm" | "md" | "lg";
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") onChange(reader.result);
    };
    reader.readAsDataURL(f);
    // Reset so re-picking the same file fires onChange
    e.target.value = "";
  }

  const aspectClass =
    size === "sm" ? "aspect-square w-24" : size === "md" ? "aspect-[4/3] w-full max-w-xs" : "aspect-[4/3] w-full";

  return (
    <div className={cn("relative overflow-hidden rounded-xl ring-1 ring-border", aspectClass)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
      {value ? (
        <>
          <img src={value} alt={`Featured ${eventLabel}`} className="h-full w-full object-cover" />
          <div className="absolute inset-0 flex items-end justify-between gap-2 bg-gradient-to-t from-black/60 via-transparent to-transparent p-3 opacity-0 transition-opacity hover:opacity-100">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-foreground shadow-sm"
            >
              Erstat
            </button>
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="grid h-8 w-8 place-items-center rounded-full bg-white text-foreground shadow-sm"
              aria-label="Fjern fremhævet billede"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-full w-full flex-col items-center justify-center gap-2 bg-muted/40 px-4 text-center transition-colors hover:bg-muted"
        >
          <ImageIcon className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm font-semibold text-foreground">
            Upload fremhævet billede til {eventLabel}
          </p>
          <p className="text-xs text-muted-foreground">
            Dette er det foto, kunder ser på dit DJ-kort, når de søger efter {eventLabel.toLowerCase()}.
          </p>
        </button>
      )}
    </div>
  );
}

/**
 * Gallery uploader: horizontally-scrolling row of photo / video thumbnails
 * plus an "+ Add" tile on the end. Customers scroll through this on the
 * public profile for the matching event type.
 */
export function GalleryRow({
  items,
  onAppend,
  onRemove,
  onCaption,
  eventLabel,
}: {
  items: DemoDJMediaItem[];
  onAppend: (next: DemoDJMediaItem[]) => void;
  onRemove: (id: string) => void;
  onCaption?: (id: string, caption: string) => void;
  eventLabel: string;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFiles(e: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? []);
    if (!files.length) return;
    const readers = files.map(
      (f) =>
        new Promise<DemoDJMediaItem | null>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result !== "string") return resolve(null);
            resolve({
              id: crypto.randomUUID(),
              type: f.type.startsWith("video") ? "video" : "photo",
              dataUrl: reader.result,
            });
          };
          reader.onerror = () => resolve(null);
          reader.readAsDataURL(f);
        }),
    );
    Promise.all(readers).then((results) => {
      const valid = results.filter((r): r is DemoDJMediaItem => Boolean(r));
      if (valid.length) onAppend(valid);
    });
    e.target.value = "";
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        className="hidden"
        onChange={handleFiles}
      />
      <div className="flex gap-2 overflow-x-auto pb-2">
        {items.map((item) => (
          <GalleryThumb
            key={item.id}
            item={item}
            onRemove={() => onRemove(item.id)}
            onCaption={onCaption ? (c) => onCaption(item.id, c) : undefined}
          />
        ))}
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="flex h-32 w-32 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border border-dashed bg-muted/30 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted"
        >
          <Plus className="h-5 w-5" />
          Tilføj foto / video
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        {items.length === 0
          ? `Tilføj mindst 3 ${eventLabel.toLowerCase()}-fotos eller korte klip. Kunder bladrer igennem disse på din offentlige profil.`
          : items.length < 3
          ? `${3 - items.length} mere anbefales for et komplet ${eventLabel.toLowerCase()}-galleri.`
          : `${items.length} element${items.length === 1 ? "" : "er"} · galleriet ser komplet ud.`}
      </p>
    </div>
  );
}

function GalleryThumb({
  item,
  onRemove,
  onCaption,
}: {
  item: DemoDJMediaItem;
  onRemove: () => void;
  onCaption?: (caption: string) => void;
}) {
  return (
    <div className="group relative h-32 w-32 shrink-0 overflow-hidden rounded-lg ring-1 ring-border">
      {item.type === "video" ? (
        <>
          <video src={item.dataUrl} className="h-full w-full object-cover" muted playsInline />
          <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
            <Video className="h-3 w-3" /> Video
          </span>
        </>
      ) : (
        <img src={item.dataUrl} alt={item.caption ?? ""} className="h-full w-full object-cover" />
      )}
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1.5 top-1.5 grid h-6 w-6 place-items-center rounded-full bg-white text-foreground opacity-0 shadow-sm transition-opacity group-hover:opacity-100"
        aria-label="Fjern medie"
      >
        <X className="h-3.5 w-3.5" />
      </button>
      {onCaption && (
        <input
          value={item.caption ?? ""}
          placeholder="Billedtekst (valgfrit)"
          onChange={(e) => onCaption(e.target.value)}
          className="absolute inset-x-1 bottom-1 rounded bg-black/60 px-2 py-1 text-[11px] text-white placeholder:text-white/60 outline-none"
        />
      )}
    </div>
  );
}

/**
 * Tiny progress ring used on Variant C cards & the global progress strip.
 */
export function ProgressRing({
  ratio,
  size = 36,
  strokeWidth = 3,
  className,
}: {
  ratio: number;
  size?: number;
  strokeWidth?: number;
  className?: string;
}) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.max(0, Math.min(1, ratio)));
  const pct = Math.round(ratio * 100);
  return (
    <div className={cn("relative inline-block", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          className="text-border"
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke="currentColor"
          className="text-foreground"
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 grid place-items-center text-[10px] font-semibold tabular-nums">
        {pct}
      </span>
    </div>
  );
}

/**
 * Helper hook used by some variants to measure how many gallery items + a
 * featured photo a sub-profile has. Cheap derived values for headers.
 */
export function describeMedia(item: { featuredPhotoDataUrl?: string; gallery: DemoDJMediaItem[] }) {
  const photos = item.gallery.filter((g) => g.type === "photo").length;
  const videos = item.gallery.filter((g) => g.type === "video").length;
  return { hasFeatured: Boolean(item.featuredPhotoDataUrl), photos, videos };
}

/**
 * Stub helper to keep the unused import warnings down for variants that
 * pull just the type. Trust the bundler to tree-shake.
 */
export type { DemoDJMediaItem, DemoDJSubProfileKey };
