import { useMemo, useState } from "react";
import { Monitor, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";
import { buildPreviewDJ } from "@/pages/dj/profileEditor/LiveProfilePreview";
import type { DJProfileEditorState } from "@/pages/dj/profileEditor/useEditorState";
import { DJProfileView } from "@/pages/public/DJProfileView";
import { mockReviews } from "@/data/mock";

type Device = "desktop" | "mobile";

/**
 * Live preview pane used across all three redesign mockups. Wraps
 * {@link DJProfileView} (the same component that renders the public
 * /djs/<username> route) and exposes a Desktop / Mobile device toggle.
 *
 * The preview DJ is rebuilt from the editor state on every render via
 * {@link buildPreviewDJ}, so any change made in the editor form on the
 * left propagates into the preview instantly.
 *
 * Set `showSideBySide` to render a desktop *and* a phone-shaped preview
 * at the same time — used in mockup 1 where space allows it.
 */
export function DesktopMobilePreview({
  state,
  heading = "Live preview",
  subheading,
  showSideBySide = false,
  className,
  innerClassName,
  maxHeightClass = "max-h-[78vh]",
}: {
  state: DJProfileEditorState;
  heading?: string;
  subheading?: string;
  showSideBySide?: boolean;
  className?: string;
  innerClassName?: string;
  maxHeightClass?: string;
}) {
  const [device, setDevice] = useState<Device>("desktop");
  const previewDJ = useMemo(() => buildPreviewDJ(state), [state]);
  const previewReviews = useMemo(
    () => mockReviews.filter((r) => r.dj_profile_id === state.seed.id),
    [state.seed.id],
  );

  return (
    <div className={cn("rounded-2xl border bg-card shadow-sm", className)}>
      <header className="flex items-start justify-between gap-3 border-b border-border/60 px-5 py-4">
        <div>
          <p className="text-sm font-semibold">{heading}</p>
          {subheading && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subheading}</p>
          )}
        </div>
        {!showSideBySide && (
          <div className="flex items-center gap-1 rounded-lg border bg-muted/30 p-1">
            <button
              type="button"
              onClick={() => setDevice("desktop")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                device === "desktop"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Monitor className="h-3.5 w-3.5" /> Desktop
            </button>
            <button
              type="button"
              onClick={() => setDevice("mobile")}
              className={cn(
                "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-medium transition-colors",
                device === "mobile"
                  ? "bg-card text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <Smartphone className="h-3.5 w-3.5" /> Mobil
            </button>
          </div>
        )}
      </header>

      <div className={cn("p-4", innerClassName)}>
        {showSideBySide ? (
          <div className="flex items-start gap-4">
            <div className="min-w-0 flex-1">
              <PreviewFrame device="desktop" maxHeightClass={maxHeightClass}>
                <DJProfileView
                  dj={previewDJ}
                  reviews={previewReviews}
                  similarDJs={[]}
                  mode="preview"
                />
              </PreviewFrame>
            </div>
            <div className="hidden w-[220px] shrink-0 md:block">
              <PreviewFrame device="mobile" maxHeightClass={maxHeightClass}>
                <DJProfileView
                  dj={previewDJ}
                  reviews={previewReviews}
                  similarDJs={[]}
                  mode="preview"
                />
              </PreviewFrame>
            </div>
          </div>
        ) : (
          <PreviewFrame device={device} maxHeightClass={maxHeightClass}>
            <DJProfileView
              dj={previewDJ}
              reviews={previewReviews}
              similarDJs={[]}
              mode="preview"
            />
          </PreviewFrame>
        )}
      </div>
    </div>
  );
}

/**
 * Scale factor applied to the preview content. The profile is rendered at
 * its natural width inside a wider virtual viewport and then CSS-scaled
 * down so images, text, and spacing appear at their real proportions —
 * like a zoomed-out browser window rather than a squeezed layout.
 */
const DESKTOP_SCALE = 0.55;
const MOBILE_SCALE = 0.5;

function PreviewFrame({
  device,
  children,
  maxHeightClass,
}: {
  device: Device;
  children: React.ReactNode;
  maxHeightClass: string;
}) {
  if (device === "mobile") {
    const scale = MOBILE_SCALE;
    return (
      <div
        className={cn(
          "mx-auto max-w-[260px] overflow-hidden rounded-[20px] border-4 border-foreground/10 bg-background shadow-sm",
        )}
      >
        <div className={cn("overflow-y-auto", maxHeightClass)}>
          <div
            style={{
              width: `${100 / scale}%`,
              transform: `scale(${scale})`,
              transformOrigin: "top left",
            }}
          >
            {children}
          </div>
        </div>
      </div>
    );
  }

  const scale = DESKTOP_SCALE;
  return (
    <div className="overflow-hidden rounded-xl border bg-background shadow-inner">
      <div className={cn("overflow-y-auto", maxHeightClass)}>
        <div
          style={{
            width: `${100 / scale}%`,
            transform: `scale(${scale})`,
            transformOrigin: "top left",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
