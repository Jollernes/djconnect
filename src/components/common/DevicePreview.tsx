import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Smartphone, Tablet, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type DevicePresetId = "iphone" | "tablet";

type DevicePreset = {
  id: DevicePresetId;
  label: string;
  dimensions: string;
  width: number;
  height: number;
  icon: typeof Smartphone;
};

const DEVICE_PREVIEW_OPEN_KEY = "djconnect.devicePreview.open";
const DEVICE_PREVIEW_DEVICE_KEY = "djconnect.devicePreview.device";
const FRAME_WINDOW_NAME = "djconnect-device-preview-frame";

export const DEVICE_PRESETS: DevicePreset[] = [
  { id: "iphone", label: "iPhone", dimensions: "390 × 844", width: 390, height: 844, icon: Smartphone },
  { id: "tablet", label: "Tablet", dimensions: "768 × 1024", width: 768, height: 1024, icon: Tablet },
];

function isFramePreview() {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("devicePreview") === "frame" || window.name === FRAME_WINDOW_NAME;
}

function readStoredOpen() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(DEVICE_PREVIEW_OPEN_KEY) === "1";
}

function readStoredDevice(): DevicePresetId {
  if (typeof window === "undefined") return "iphone";
  const stored = window.localStorage.getItem(DEVICE_PREVIEW_DEVICE_KEY);
  return stored === "tablet" ? "tablet" : "iphone";
}

function buildPreviewUrl(pathname: string, search: string, hash: string) {
  const url = new URL(window.location.origin + pathname + search + hash);
  url.searchParams.set("devicePreview", "frame");
  return url.toString();
}

export function DevicePreview() {
  const location = useLocation();
  const navigate = useNavigate();
  const frameMode = isFramePreview();
  const [isOpen, setIsOpen] = useState(() => !frameMode && readStoredOpen());
  const [deviceId, setDeviceId] = useState<DevicePresetId>(() => readStoredDevice());
  const [previewSrc, setPreviewSrc] = useState<string | null>(() =>
    !frameMode && readStoredOpen() ? buildPreviewUrl(location.pathname, location.search, location.hash) : null,
  );
  const preset = useMemo(() => DEVICE_PRESETS.find((item) => item.id === deviceId) ?? DEVICE_PRESETS[0], [deviceId]);

  useEffect(() => {
    if (frameMode) return;
    window.localStorage.setItem(DEVICE_PREVIEW_OPEN_KEY, isOpen ? "1" : "0");
  }, [frameMode, isOpen]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (frameMode) {
      window.name = FRAME_WINDOW_NAME;
      if (new URLSearchParams(location.search).get("devicePreview") !== "frame") {
        const params = new URLSearchParams(location.search);
        params.set("devicePreview", "frame");
        navigate({ pathname: location.pathname, search: `?${params.toString()}`, hash: location.hash }, { replace: true });
      }
      return;
    }
    if (window.name === FRAME_WINDOW_NAME) {
      window.name = "";
    }
  }, [frameMode, location.hash, location.pathname, location.search, navigate]);

  useEffect(() => {
    if (frameMode) return;
    window.localStorage.setItem(DEVICE_PREVIEW_DEVICE_KEY, deviceId);
  }, [deviceId, frameMode]);

  useEffect(() => {
    if (frameMode || !isOpen) return;
    const body = document.body;
    const previousOverflow = body.style.overflow;
    body.style.overflow = "hidden";
    return () => {
      body.style.overflow = previousOverflow;
    };
  }, [frameMode, isOpen]);

  useEffect(() => {
    if (frameMode) return;
    if (isOpen && !previewSrc) {
      setPreviewSrc(buildPreviewUrl(location.pathname, location.search, location.hash));
    }
  }, [frameMode, isOpen, location.hash, location.pathname, location.search, previewSrc]);

  const shellWidth = preset.width + 32;
  const shellHeight = preset.height + 140;
  const scale = useMemo(() => {
    if (!isOpen) return 1;
    if (typeof window === "undefined") return 1;
    const maxWidth = Math.max(320, window.innerWidth - 32);
    const maxHeight = Math.max(420, window.innerHeight - 32);
    return Math.min(1, maxWidth / shellWidth, maxHeight / shellHeight);
  }, [isOpen, shellHeight, shellWidth]);

  if (frameMode) {
    return null;
  }

  const openPreview = () => {
    setPreviewSrc(buildPreviewUrl(location.pathname, location.search, location.hash));
    setIsOpen(true);
  };

  const closePreview = () => {
    setIsOpen(false);
  };

  return (
    <>
      <div className={cn("fixed right-4 z-[90] transition-all md:right-6", isOpen ? "top-4 md:top-6" : "bottom-20 md:bottom-6")}>
        <Button
          type="button"
          variant="accent"
          className="h-12 rounded-full px-4 shadow-xl shadow-slate-950/20"
          onClick={isOpen ? closePreview : openPreview}
        >
          {isOpen ? <X className="h-4 w-4" /> : <Smartphone className="h-4 w-4" />}
          <span>{isOpen ? "Luk mobilvisning" : "Vis mobil"}</span>
        </Button>
      </div>

      {isOpen ? (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-auto bg-slate-950/70 p-4 backdrop-blur-sm" onClick={closePreview}>
          <div
            className="w-full max-w-[calc(100vw-2rem)]"
            style={{
              width: shellWidth,
              height: shellHeight,
              transform: `scale(${scale})`,
              transformOrigin: "center center",
            }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-full flex-col rounded-[2rem] border border-white/10 bg-slate-950/95 p-3 shadow-[0_30px_90px_rgba(15,23,42,0.45)]">
              <div className="mb-3 flex items-center justify-between gap-3 px-1">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="border-white/20 bg-white/5 text-white">
                      Mobilvisning
                    </Badge>
                    <span className="text-sm font-medium text-white">{preset.label}</span>
                    <span className="text-sm text-slate-300">{preset.dimensions}</span>
                  </div>
                  <p className="text-xs text-slate-400">Navigér i rammen som på en rigtig enhed.</p>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10 rounded-full border border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
                  onClick={closePreview}
                  aria-label="Luk mobilvisning"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="mb-3 flex flex-wrap gap-2">
                {DEVICE_PRESETS.map((item) => {
                  const Icon = item.icon;
                  const active = item.id === deviceId;
                  return (
                    <Button
                      key={item.id}
                      type="button"
                      variant={active ? "accent" : "outline"}
                      size="sm"
                      className={cn(
                        "rounded-full",
                        active ? "shadow-lg shadow-gold/20" : "border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white",
                      )}
                      onClick={() => setDeviceId(item.id)}
                    >
                      <Icon className="h-4 w-4" />
                      <span>
                        {item.label} · {item.dimensions}
                      </span>
                    </Button>
                  );
                })}
              </div>

              <div className="flex-1 rounded-[1.8rem] border border-white/10 bg-black p-3">
                <div className="flex h-full items-center justify-center">
                  <div className="overflow-hidden rounded-[2rem] border-8 border-slate-900 bg-white shadow-2xl">
                    {previewSrc ? (
                      <iframe
                        key={previewSrc}
                        title="Mobilvisning"
                        src={previewSrc}
                        width={preset.width}
                        height={preset.height}
                        className="block bg-white"
                      />
                    ) : null}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
