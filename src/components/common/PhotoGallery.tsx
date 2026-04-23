import { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface Props {
  images: Array<{ id: string; url: string }>;
  className?: string;
}

export function PhotoGallery({ images, className }: Props) {
  const [open, setOpen] = useState<number | null>(null);
  if (images.length === 0) return null;

  function next() {
    if (open === null) return;
    setOpen((open + 1) % images.length);
  }
  function prev() {
    if (open === null) return;
    setOpen((open - 1 + images.length) % images.length);
  }

  return (
    <>
      <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4", className)}>
        {images.map((img, idx) => (
          <button
            key={img.id}
            type="button"
            onClick={() => setOpen(idx)}
            className="group aspect-square overflow-hidden rounded-md bg-muted"
          >
            <img
              src={img.url}
              alt=""
              className="h-full w-full object-cover transition-transform group-hover:scale-105"
              loading="lazy"
            />
          </button>
        ))}
      </div>
      <Dialog open={open !== null} onOpenChange={(o) => !o && setOpen(null)}>
        <DialogContent className="max-w-4xl border-0 bg-transparent p-0 shadow-none">
          {open !== null && (
            <div className="relative">
              <img src={images[open]!.url} alt="" className="max-h-[80vh] w-full rounded-lg object-contain" />
              <button
                onClick={prev}
                className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow"
                type="button"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                onClick={next}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-background/90 p-2 shadow"
                type="button"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              <button
                onClick={() => setOpen(null)}
                className="absolute right-2 top-2 rounded-full bg-background/90 p-2 shadow"
                type="button"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
