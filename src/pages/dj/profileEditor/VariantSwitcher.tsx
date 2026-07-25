import { useSearchParams } from "react-router-dom";
import { cn } from "@/lib/utils";

export type EditorVariant = "A" | "B" | "C" | "D" | "E";

const VARIANT_META: Record<EditorVariant, { label: string; helper: string }> = {
  A: { label: "A · Faner", helper: "Indlejrede faner med medier + tekst pr. event" },
  B: { label: "B · Live forhåndsvisning", helper: "Editor til venstre, kundeforhåndsvisning til højre" },
  C: { label: "C · Kortlærred", helper: "Pinterest-lignende kort åbner i en fuldskærms-editor" },
  D: { label: "D · Guidet wizard", helper: "Trin-for-trin rejse med nedarvning + benchmarks" },
  E: { label: "E · B + stille vejledning", helper: "Variant B-base med diskret kapitelbånd, indlejrede tips, kopiér-fra-Generel-links og lille fejringsbanner" },
};

export function useEditorVariant(): [EditorVariant, (next: EditorVariant) => void] {
  const [params, setParams] = useSearchParams();
  const raw = params.get("v");
  const variant: EditorVariant =
    raw === "B" || raw === "C" || raw === "D" || raw === "E" ? raw : "A";
  function setVariant(next: EditorVariant) {
    const p = new URLSearchParams(params);
    p.set("v", next);
    setParams(p, { replace: true });
  }
  return [variant, setVariant];
}

/**
 * Floating switcher pill so the DJ (and reviewer) can flip between the 3
 * dummy designs without losing their place. Hidden after a final design is
 * picked — for now it stays so feedback is fast.
 */
export function VariantSwitcher({
  value,
  onChange,
}: {
  value: EditorVariant;
  onChange: (next: EditorVariant) => void;
}) {
  return (
    <div className="pointer-events-none fixed bottom-4 left-1/2 z-30 -translate-x-1/2">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border bg-background/95 p-1 shadow-lg backdrop-blur">
        <span className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Demo-variant
        </span>
        {(["A", "B", "C", "D", "E"] as const).map((v) => (
          <button
            key={v}
            type="button"
            onClick={() => onChange(v)}
            className={cn(
              "rounded-full px-3 py-1.5 text-xs font-medium transition-colors",
              v === value ? "bg-foreground text-background" : "text-foreground hover:bg-muted",
            )}
            title={VARIANT_META[v].helper}
          >
            {VARIANT_META[v].label}
          </button>
        ))}
      </div>
    </div>
  );
}
