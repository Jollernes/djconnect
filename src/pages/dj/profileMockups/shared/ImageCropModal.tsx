import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ZoomIn, ZoomOut, Move } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
/** Longest edge of the exported (cropped) image, in pixels. */
const OUTPUT_MAX_EDGE = 1600;

/**
 * Modal that lets the DJ pan & zoom an uploaded image inside a fixed
 * aspect-ratio frame so it sits nicely in the profile photo grid. The
 * visible region is rendered to a canvas on confirm and returned as a
 * cropped data URL. Works with mouse, touch and the zoom slider.
 */
export function ImageCropModal({
  open,
  src,
  aspect,
  title = "Tilpas billede",
  onCancel,
  onConfirm,
}: {
  open: boolean;
  /** Source image to crop. */
  src: string | undefined;
  /** Target aspect ratio (width / height) of the crop frame. */
  aspect: number;
  title?: string;
  onCancel: () => void;
  onConfirm: (croppedDataUrl: string) => void;
}) {
  const frameRef = useRef<HTMLDivElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    ox: number;
    oy: number;
  } | null>(null);

  const [natural, setNatural] = useState<{ w: number; h: number } | null>(null);
  const [frameW, setFrameW] = useState(0);
  const [zoom, setZoom] = useState(MIN_ZOOM);
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const frameH = frameW > 0 ? frameW / aspect : 0;

  const baseScale =
    natural && frameW > 0
      ? Math.max(frameW / natural.w, frameH / natural.h)
      : 0;
  const scale = baseScale * zoom;
  const dispW = natural ? natural.w * scale : 0;
  const dispH = natural ? natural.h * scale : 0;

  const clamp = useCallback(
    (x: number, y: number) => {
      const minX = frameW - dispW;
      const minY = frameH - dispH;
      return {
        x: Math.min(0, Math.max(minX, x)),
        y: Math.min(0, Math.max(minY, y)),
      };
    },
    [frameW, frameH, dispW, dispH],
  );

  /* Measure the frame width whenever the modal opens or the window resizes. */
  useLayoutEffect(() => {
    if (!open) return;
    function measure() {
      if (frameRef.current) setFrameW(frameRef.current.clientWidth);
    }
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [open, natural, aspect]);

  /* Reset transform when a new image is loaded / modal re-opens. */
  useEffect(() => {
    if (!open) {
      setNatural(null);
      setZoom(MIN_ZOOM);
      setOffset({ x: 0, y: 0 });
    }
  }, [open]);

  /* Center the image once we know its size and the frame size. */
  useEffect(() => {
    if (!natural || frameW <= 0 || baseScale <= 0) return;
    const w = natural.w * baseScale * zoom;
    const h = natural.h * baseScale * zoom;
    setOffset((prev) => {
      // Only re-center on the very first layout (offset still at origin).
      if (prev.x === 0 && prev.y === 0) {
        return { x: (frameW - w) / 2, y: (frameH - h) / 2 };
      }
      return prev;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [natural, frameW]);

  function handleImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const el = e.currentTarget;
    setNatural({ w: el.naturalWidth, h: el.naturalHeight });
  }

  function applyZoom(nextZoom: number) {
    const z = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, nextZoom));
    if (!natural || baseScale <= 0) {
      setZoom(z);
      return;
    }
    // Keep the frame-center focal point stable while zooming.
    const oldScale = baseScale * zoom;
    const newScale = baseScale * z;
    const cx = frameW / 2;
    const cy = frameH / 2;
    const imgX = (cx - offset.x) / oldScale;
    const imgY = (cy - offset.y) / oldScale;
    const nextX = cx - imgX * newScale;
    const nextY = cy - imgY * newScale;
    setZoom(z);
    // clamp with the new displayed size
    const w = natural.w * newScale;
    const h = natural.h * newScale;
    const minX = frameW - w;
    const minY = frameH - h;
    setOffset({
      x: Math.min(0, Math.max(minX, nextX)),
      y: Math.min(0, Math.max(minY, nextY)),
    });
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!natural) return;
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    dragRef.current = {
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      ox: offset.x,
      oy: offset.y,
    };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    const d = dragRef.current;
    if (!d || d.pointerId !== e.pointerId) return;
    const next = clamp(
      d.ox + (e.clientX - d.startX),
      d.oy + (e.clientY - d.startY),
    );
    setOffset(next);
  }

  function onPointerUp(e: ReactPointerEvent<HTMLDivElement>) {
    if (dragRef.current?.pointerId === e.pointerId) dragRef.current = null;
  }

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    applyZoom(zoom - e.deltaY * 0.0015);
  }

  function handleConfirm() {
    if (!natural || scale <= 0) return;
    // Crop region expressed in source-image pixels.
    const sx = -offset.x / scale;
    const sy = -offset.y / scale;
    const sWidth = frameW / scale;
    const sHeight = frameH / scale;

    let outW = Math.round(sWidth);
    let outH = Math.round(sHeight);
    const longest = Math.max(outW, outH);
    if (longest > OUTPUT_MAX_EDGE) {
      const k = OUTPUT_MAX_EDGE / longest;
      outW = Math.round(outW * k);
      outH = Math.round(outH * k);
    }

    const canvas = document.createElement("canvas");
    canvas.width = outW;
    canvas.height = outH;
    const ctx = canvas.getContext("2d");
    if (!ctx || !imgRef.current) return;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(
      imgRef.current,
      sx,
      sy,
      sWidth,
      sHeight,
      0,
      0,
      outW,
      outH,
    );
    onConfirm(canvas.toDataURL("image/jpeg", 0.92));
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-md gap-4">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Træk billedet for at flytte det og brug zoom, så det sidder pænt i
            gridet.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div
            ref={frameRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            onWheel={onWheel}
            style={{ height: frameH || undefined, aspectRatio: String(aspect) }}
            className="relative w-full touch-none select-none overflow-hidden rounded-xl bg-muted ring-1 ring-border"
          >
            {src && (
              <img
                ref={imgRef}
                src={src}
                alt=""
                onLoad={handleImageLoad}
                draggable={false}
                style={{
                  position: "absolute",
                  left: offset.x,
                  top: offset.y,
                  width: dispW || undefined,
                  height: dispH || undefined,
                  maxWidth: "none",
                  cursor: "grab",
                }}
              />
            )}
            {/* Grid overlay to aid centering */}
            <div className="pointer-events-none absolute inset-0 grid grid-cols-3 grid-rows-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="border border-white/20" />
              ))}
            </div>
            <div className="pointer-events-none absolute bottom-2 left-1/2 flex -translate-x-1/2 items-center gap-1 rounded-full bg-black/50 px-2.5 py-1 text-[11px] font-medium text-white">
              <Move className="h-3 w-3" /> Træk for at flytte
            </div>
          </div>

          {/* Zoom control */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => applyZoom(zoom - 0.25)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Zoom ud"
            >
              <ZoomOut className="h-4 w-4" />
            </button>
            <input
              type="range"
              min={MIN_ZOOM}
              max={MAX_ZOOM}
              step={0.01}
              value={zoom}
              onChange={(e) => applyZoom(Number(e.target.value))}
              className="h-1.5 flex-1 cursor-pointer appearance-none rounded-full bg-muted accent-accent"
              aria-label="Zoom"
            />
            <button
              type="button"
              onClick={() => applyZoom(zoom + 0.25)}
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md border text-muted-foreground transition-colors hover:text-foreground"
              aria-label="Zoom ind"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Annullér
          </Button>
          <Button type="button" onClick={handleConfirm} disabled={!natural}>
            Gem billede
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
