import { useEffect, useMemo, useState } from "react";
import {
  useDJProfileEditor,
  type DJProfileEditorState,
} from "@/pages/dj/profileEditor/useEditorState";
import {
  MOCKUP_SUB_PROFILE_KEYS,
  type MockupSubProfileKey,
} from "./types";
import type { CompletionEntry } from "./CompletionBars";

/**
 * Wraps the existing `useDJProfileEditor` hook with the mockup-specific
 * notion of an active sub-profile (the 3 mockup profile types — "general",
 * "wedding" and "corporate"; "birthday" is not shown in the redesigns).
 *
 * Returns a single `state` object plus a `completionEntries` array used
 * by the "Dine profiler" overview card. Any field edit the DJ makes in
 * a mockup flows straight back into the underlying shared state so the
 * live preview stays accurate.
 */
export function useMockupState(): {
  state: DJProfileEditorState;
  activeKey: MockupSubProfileKey;
  setActiveKey: (next: MockupSubProfileKey) => void;
  completionEntries: CompletionEntry[];
} {
  const state = useDJProfileEditor();

  /** Local view of the active sub-profile, scoped to mockup keys. */
  const [activeKey, setActiveKeyLocal] = useState<MockupSubProfileKey>(() => {
    return MOCKUP_SUB_PROFILE_KEYS.includes(
      state.activeKey as MockupSubProfileKey,
    )
      ? (state.activeKey as MockupSubProfileKey)
      : "general";
  });

  /** Keep the upstream editor state's `activeKey` in sync so the
   * shared LiveProfilePreview renders the same sub-profile the DJ is
   * editing. */
  useEffect(() => {
    if (state.activeKey !== activeKey) {
      state.setActiveKey(activeKey);
    }
  }, [activeKey, state]);

  function setActiveKey(next: MockupSubProfileKey) {
    setActiveKeyLocal(next);
    state.setActiveKey(next);
  }

  const completionEntries: CompletionEntry[] = useMemo(
    () =>
      MOCKUP_SUB_PROFILE_KEYS.map((k) => {
        const c = state.completion.find((x) => x.key === k);
        return { key: k, ratio: c?.ratio ?? 0 };
      }),
    [state.completion],
  );

  return { state, activeKey, setActiveKey, completionEntries };
}
