import { useEffect, useRef, useState } from "react";
import { Monitor, Smartphone, RotateCcw, X } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Dev tool: lets the user view the entire app inside a 390x844 iPhone-ish
 * frame so they can inspect the mobile layout without resizing their
 * browser window. The mobile viewport is rendered inside an iframe so
 * Tailwind's responsive breakpoints (which read `window.innerWidth`)
 * actually trigger.
 *
 * Activated via the floating toggle in the bottom-right; the choice is
 * persisted in localStorage. Inside the iframe the toggle is hidden via
 * the `?vp=skip` query param so we never recurse.
 */

const STORAGE_KEY = "dj.viewportPreview";
const SKIP_PARAM = "vp";

type Orientation = "portrait" | "landscape";
const PHONE_W = 390;
const PHONE_H = 844;

export function ViewportPreview({ children }: { children: React.ReactNode }) {
  // Captured once on mount so that client-side navigation inside the
  // iframe (which strips the ?vp=skip param) doesn't flip this back to
  // false and (a) leak the toggle button into the iframe view or (b)
  // wipe the parent window's localStorage preference.
  const [skip] = useState(
    () =>
      typeof window !== "undefined" &&
      new URLSearchParams(window.location.search).get(SKIP_PARAM) === "skip",
  );

  const [mobile, setMobile] = useState<boolean>(() => {
    if (skip || typeof window === "undefined") return false;
    return window.localStorage.getItem(STORAGE_KEY) === "mobile";
  });
  const [orientation, setOrientation] = useState<Orientation>("portrait");
  const [iframeKey, setIframeKey] = useState(0);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (skip) return;
    if (mobile) {
      window.localStorage.setItem(STORAGE_KEY, "mobile");
    } else {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, [mobile, skip]);

  // Inside the iframe: just render the app, no toggle, no frame.
  if (skip) return <>{children}</>;

  // Desktop mode: render normally with the toggle button.
  if (!mobile) {
    return (
      <>
        {children}
        <ToggleButton onClick={() => setMobile(true)} mobile={false} />
      </>
    );
  }

  // Mobile mode: render the iframe-based phone frame on top of a dimmed
  // backdrop. The original app is replaced.
  const w = orientation === "portrait" ? PHONE_W : PHONE_H;
  const h = orientation === "portrait" ? PHONE_H : PHONE_W;
  const src = currentUrlWithSkip();

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-4 bg-slate-950/90 p-6">
      {/* Top toolbar */}
      <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur">
        <Smartphone className="h-3.5 w-3.5" />
        Mobile preview · {w}×{h}
        <button
          type="button"
          onClick={() =>
            setOrientation((o) => (o === "portrait" ? "landscape" : "portrait"))
          }
          className="ml-2 inline-flex items-center gap-1 rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium hover:bg-white/20"
          aria-label="Toggle orientation"
        >
          <RotateCcw className="h-3 w-3" />
          {orientation === "portrait" ? "Landscape" : "Portrait"}
        </button>
        <button
          type="button"
          onClick={() => setIframeKey((k) => k + 1)}
          className="rounded-full bg-white/10 px-2 py-1 text-[11px] font-medium hover:bg-white/20"
        >
          Reload
        </button>
      </div>

      {/* Phone bezel */}
      <div
        className={cn(
          "relative rounded-[44px] border border-white/15 bg-slate-900 p-3 shadow-2xl",
          "max-h-[calc(100vh-7rem)] max-w-[calc(100vw-3rem)]",
        )}
      >
        <div
          className="relative overflow-hidden rounded-[32px] bg-white"
          style={{
            width: w,
            height: h,
            maxHeight: "calc(100vh - 8rem)",
            maxWidth: "calc(100vw - 4rem)",
          }}
        >
          {/* Notch */}
          {orientation === "portrait" && (
            <div className="pointer-events-none absolute left-1/2 top-2 z-10 h-5 w-24 -translate-x-1/2 rounded-full bg-slate-900" />
          )}
          <iframe
            key={iframeKey}
            ref={iframeRef}
            title="Mobile preview"
            src={src}
            className="block h-full w-full"
            style={{ border: 0 }}
          />
        </div>
      </div>

      {/* Hint */}
      <p className="text-xs text-white/60">
        Frame reflects iPhone 14 dimensions. Click outside the frame to
        interact; press Esc or the × to exit mobile preview.
      </p>

      {/* Close */}
      <button
        type="button"
        onClick={() => setMobile(false)}
        className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium text-white shadow-lg backdrop-blur transition-colors hover:bg-white/20"
        aria-label="Exit mobile preview"
      >
        <X className="h-3.5 w-3.5" />
        Exit mobile preview
      </button>

      <EscapeHandler onEscape={() => setMobile(false)} />
    </div>
  );
}

function ToggleButton({
  onClick,
  mobile,
}: {
  onClick: () => void;
  mobile: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="fixed bottom-4 right-4 z-[90] hidden items-center gap-1.5 rounded-full border bg-background/95 px-3 py-2 text-xs font-medium text-foreground shadow-lg backdrop-blur transition-colors hover:bg-muted sm:inline-flex"
      aria-label={mobile ? "Exit mobile preview" : "View as mobile"}
    >
      {mobile ? (
        <>
          <Monitor className="h-3.5 w-3.5" />
          Desktop
        </>
      ) : (
        <>
          <Smartphone className="h-3.5 w-3.5" />
          Mobile preview
        </>
      )}
    </button>
  );
}

function EscapeHandler({ onEscape }: { onEscape: () => void }) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onEscape();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEscape]);
  return null;
}

function currentUrlWithSkip(): string {
  const url = new URL(window.location.href);
  url.searchParams.set(SKIP_PARAM, "skip");
  return url.toString();
}
