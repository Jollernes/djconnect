import { useDJProfileEditor } from "./profileEditor/useEditorState";
import { VariantA } from "./profileEditor/VariantA";
import { VariantB } from "./profileEditor/VariantB";
import { VariantC } from "./profileEditor/VariantC";
import { VariantSwitcher, useEditorVariant } from "./profileEditor/VariantSwitcher";

/**
 * DJ profile editor entry point. Hosts three dummy design variants
 * (Variants A / B / C) so the user can compare and pick. Variant is read
 * from the `?v=A|B|C` query param and a floating pill at the bottom of
 * the page lets the user flip between them on the same data.
 */
export function DJProfileEditorPage() {
  const state = useDJProfileEditor();
  const [variant, setVariant] = useEditorVariant();

  return (
    <div className="max-w-6xl">
      {variant === "A" && <VariantA state={state} />}
      {variant === "B" && <VariantB state={state} />}
      {variant === "C" && <VariantC state={state} />}
      <VariantSwitcher value={variant} onChange={setVariant} />
    </div>
  );
}
