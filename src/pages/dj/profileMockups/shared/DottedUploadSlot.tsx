import { useRef, type ChangeEvent } from "react";
import { CloudUpload, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dashed-border upload slot used throughout the mockups for hero / profile
 * / gallery / video uploads. Matches the user's reference screenshot:
 *
 *   ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐
 *   │  ⤴︎ icon          │
 *   │  Træk & slip eller│
 *   │  klik for at      │
 *   │  uploade          │
 *   │  hint             │
 *   └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘
 *
 * When `value` is provided, renders the uploaded media (image or video
 * thumbnail) with a small × delete button instead of the empty drop zone.
 */
export function DottedUploadSlot({
  value,
  onChange,
  hint,
  accept = "image/*",
  shape = "rect",
  aspectClassName,
  isVideo = false,
}: {
  value: string | undefined;
  onChange: (next: string | undefined) => void;
  hint?: string;
  accept?: string;
  shape?: "rect" | "circle";
  aspectClassName?: string;
  isVideo?: boolean;
}) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function handleFile(e: ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    if (isVideo || !f.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") onChange(reader.result);
      };
      reader.readAsDataURL(f);
    } else {
      resizeImage(f, 1600).then((dataUrl) => {
        if (dataUrl) onChange(dataUrl);
      });
    }
    e.target.value = "";
  }

  const shapeCls =
    shape === "circle" ? "aspect-square rounded-full" : "rounded-xl";
  const aspect =
    aspectClassName ?? (shape === "circle" ? "" : "aspect-video");

  if (value) {
    return (
      <div
        className={cn(
          "group relative overflow-hidden ring-1 ring-border bg-muted/30",
          shapeCls,
          aspect,
        )}
      >
        {isVideo ? (
          <video
            src={value}
            muted
            loop
            playsInline
            className="h-full w-full object-cover"
          />
        ) : (
          <img
            src={value}
            alt=""
            className="h-full w-full object-cover"
          />
        )}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onChange(undefined);
          }}
          className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-white/95 text-foreground shadow-sm ring-1 ring-border hover:bg-white"
          aria-label="Fjern"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => inputRef.current?.click()}
      className={cn(
        "flex w-full flex-col items-center justify-center gap-1 border-2 border-dashed border-border bg-muted/20 px-3 py-4 text-center text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:bg-muted/40",
        shapeCls,
        aspect,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={handleFile}
      />
      <CloudUpload className="h-5 w-5" aria-hidden="true" />
      <span className="font-medium leading-tight">
        Træk &amp; slip eller klik
        <br />
        for at uploade
      </span>
      {hint && <span className="text-[10px] uppercase tracking-wide">{hint}</span>}
    </button>
  );
}

function resizeImage(file: Blob, maxWidth: number): Promise<string | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      let { width, height } = img;
      if (width > maxWidth) {
        height = Math.round(height * (maxWidth / width));
        width = maxWidth;
      }
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(null); return; }
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL("image/jpeg", 0.85));
      URL.revokeObjectURL(img.src);
    };
    img.onerror = () => resolve(null);
    img.src = URL.createObjectURL(file);
  });
}
