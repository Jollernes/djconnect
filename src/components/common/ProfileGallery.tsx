import { useEffect, useState } from "react";
import { Grid2X2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Image {
  id: string;
  url: string;
  alt?: string;
}

interface Props {
  images: Image[];
  className?: string;
}

export function ProfileGallery({ images, className }: Props) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [allOpen, setAllOpen] = useState(false);

  // Convert base64 data: URLs to Blob object URLs for sharper rendering.
  // Browsers can decode Blob URLs more efficiently than large inline base64.
  const displayImages = useBlobUrls(images);

  useEffect(() => {
    if (openIdx === null) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") setOpenIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length));
      if (e.key === "ArrowRight") setOpenIdx((i) => (i === null ? i : (i + 1) % images.length));
      if (e.key === "Escape") setOpenIdx(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openIdx, images.length]);

  if (images.length === 0) {
    return (
      <div className={cn("aspect-[16/8] w-full rounded-3xl bg-muted", className)} />
    );
  }

  const hero = displayImages[0];
  const grid = displayImages.slice(1, 7);
  const placeholders = Math.max(0, 6 - grid.length);

  return (
    <div className={cn("relative", className)}>
      {/* Desktop: hero (left, 2 rows) + 6 smaller images (3×2 grid, right) */}
      <div className="relative mx-auto hidden w-full md:block">
        <div className="grid h-[340px] grid-cols-[1fr_2fr] gap-1.5 lg:gap-2">
          {/* Hero: 33% width, full height */}
          <button
            type="button"
            onClick={() => setOpenIdx(0)}
            className="group relative overflow-hidden rounded-l-2xl bg-muted"
          >
            <img
              src={hero.url}
              alt={hero.alt ?? ""}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
          </button>
          {/* 6 smaller images: 3 cols × 2 rows, 66% width */}
          <div className="grid h-full grid-cols-3 grid-rows-2 gap-1.5 lg:gap-2">
            {grid.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => setOpenIdx(i + 1)}
                className={cn(
                  "group relative overflow-hidden bg-muted",
                  i === 2 && "rounded-tr-2xl",
                  i === 5 && "rounded-br-2xl",
                )}
              >
                <img
                  src={img.url}
                  alt={img.alt ?? ""}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/10" />
              </button>
            ))}
            {Array.from({ length: placeholders }).map((_, i) => (
              <div
                key={`ph-${i}`}
                className={cn(
                  "relative overflow-hidden bg-gradient-to-br from-primary/10 via-violet-200/40 to-amber-200/30",
                  grid.length + i === 2 && "rounded-tr-2xl",
                  grid.length + i === 5 && "rounded-br-2xl",
                )}
              >
                <div className="absolute inset-0 flex items-center justify-center text-xs font-medium uppercase tracking-widest text-primary/40">
                  DJConnect
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile: single hero */}
      <button
        type="button"
        onClick={() => setOpenIdx(0)}
        className="relative block aspect-[4/3] w-full max-h-[320px] overflow-hidden rounded-3xl bg-muted md:hidden"
      >
        <img src={hero.url} alt={hero.alt ?? ""} className="absolute inset-0 h-full w-full object-cover" />
      </button>

      {displayImages.length > 1 && (
        <button
          type="button"
          onClick={() => setAllOpen(true)}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-foreground shadow-lg ring-1 ring-black/5 transition hover:bg-white/95 hover:shadow-xl"
        >
          <Grid2X2 className="h-4 w-4" />
          Show all {displayImages.length} photos
        </button>
      )}

      {/* Single-photo lightbox */}
      <Dialog open={openIdx !== null} onOpenChange={(o) => !o && setOpenIdx(null)}>
        <DialogContent className="max-w-5xl border-0 bg-black/95 p-0 shadow-none sm:rounded-2xl">
          {openIdx !== null && (
            <div className="relative">
              <img
                src={displayImages[openIdx]!.url}
                alt={displayImages[openIdx]!.alt ?? ""}
                className="max-h-[85vh] w-full object-contain"
              />
              <button
                type="button"
                onClick={() => setOpenIdx((i) => (i === null ? i : (i - 1 + images.length) % images.length))}
                className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-3 text-foreground shadow-lg transition hover:scale-105"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setOpenIdx((i) => (i === null ? i : (i + 1) % images.length))}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-white/95 p-3 text-foreground shadow-lg transition hover:scale-105"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => setOpenIdx(null)}
                className="absolute right-3 top-3 rounded-full bg-white/95 p-2 text-foreground shadow-lg"
                aria-label="Close"
              >
                <X className="h-5 w-5" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-full bg-black/60 px-3 py-1 text-xs font-medium text-white">
                {openIdx + 1} / {displayImages.length}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* All-photos modal */}
      <Dialog open={allOpen} onOpenChange={setAllOpen}>
        <DialogContent className="max-h-[90vh] max-w-5xl overflow-y-auto p-0 sm:rounded-3xl">
          <div className="sticky top-0 z-10 flex items-center justify-between border-b bg-white px-6 py-4">
            <h3 className="text-base font-semibold">All photos</h3>
            <button
              type="button"
              onClick={() => setAllOpen(false)}
              className="rounded-full p-1.5 transition hover:bg-muted"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="space-y-2 p-4 sm:p-6">
            {displayImages.map((img, i) => (
              <button
                key={img.id}
                type="button"
                onClick={() => {
                  setAllOpen(false);
                  setTimeout(() => setOpenIdx(i), 50);
                }}
                className="block w-full overflow-hidden rounded-2xl bg-muted"
              >
                <img src={img.url} alt={img.alt ?? ""} className="h-auto w-full object-cover" />
              </button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Convert data: URLs → Blob object URLs for better browser rendering */
/* ------------------------------------------------------------------ */

function dataUrlToBlob(dataUrl: string): string | null {
  try {
    const [header, b64] = dataUrl.split(",");
    if (!header || !b64) return null;
    const mime = header.match(/:(.*?);/)?.[1] ?? "image/jpeg";
    const bin = atob(b64);
    const bytes = new Uint8Array(bin.length);
    for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
    return URL.createObjectURL(new Blob([bytes], { type: mime }));
  } catch {
    return null;
  }
}

function useBlobUrls(images: Image[]): Image[] {
  const [display, setDisplay] = useState<Image[]>(images);

  useEffect(() => {
    const blobUrls: string[] = [];
    const result = images.map((img) => {
      if (!img.url.startsWith("data:")) return img;
      const blob = dataUrlToBlob(img.url);
      if (blob) {
        blobUrls.push(blob);
        return { ...img, url: blob };
      }
      return img;
    });
    setDisplay(result);
    return () => {
      blobUrls.forEach((u) => URL.revokeObjectURL(u));
    };
  }, [images]);

  return display;
}
