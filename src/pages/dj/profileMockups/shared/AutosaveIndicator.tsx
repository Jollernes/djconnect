import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Always-visible autosave indicator. Listens for any edit (signalled via
 * the `value` prop changing) and briefly flashes a "Gemmer …" state
 * before settling on "Gemt kl. HH:MM".
 *
 * No real save happens here — the editor's underlying state persists
 * automatically via the existing `useDJProfileEditor` hook. This is
 * purely the UX surface that tells the DJ their work is safe.
 */
export function AutosaveIndicator({
  value,
  className,
}: {
  /** Any value that changes on each edit — used to trigger the flash. */
  value: unknown;
  className?: string;
}) {
  const [savedAt, setSavedAt] = useState<Date>(() => new Date());
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setBusy(true);
    const timeout = window.setTimeout(() => {
      setBusy(false);
      setSavedAt(new Date());
    }, 600);
    return () => window.clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(value)]);

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-xs text-muted-foreground",
        className,
      )}
    >
      {busy ? (
        <>
          <Loader2 className="h-3 w-3 animate-spin" />
          Gemmer …
        </>
      ) : (
        <>
          <Check className="h-3 w-3 text-emerald-600" />
          Gemt kl. {formatTime(savedAt)}
        </>
      )}
    </span>
  );
}

function formatTime(d: Date) {
  return d.toLocaleTimeString("da-DK", { hour: "2-digit", minute: "2-digit" });
}
