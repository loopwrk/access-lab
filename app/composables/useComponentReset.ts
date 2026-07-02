import type { Ref } from "vue";
import { controlPanelValuesEqual } from "~/utils/controlPanelValuesEqual";

const PRESERVED_KEYS = ["renderAs", "wrappers"];

/**
 * Full-panel reset to `defaults`, plus the `dirty` flag behind the Reset
 * control. `renderAs` and `wrappers` are toolbar-owned (variant + wrapper
 * chips), so they neither flag dirty nor revert. The comparison is deep
 * because the props mix CssLength objects, arrays, and primitives, and a
 * missing key must count as equal to its undefined default.
 */
export function useComponentReset(
  model: Ref<Record<string, unknown>>,
  defaults: Readonly<Record<string, unknown>>,
) {
  const dirty = computed(() => {
    const keys = new Set([...Object.keys(defaults), ...Object.keys(model.value)]);
    for (const key of keys) {
      if (PRESERVED_KEYS.includes(key)) continue;
      if (!controlPanelValuesEqual(model.value[key], defaults[key])) return true;
    }
    return false;
  });

  function reset() {
    const preserved: Record<string, unknown> = {};
    for (const key of PRESERVED_KEYS) preserved[key] = model.value[key];
    model.value = { ...defaults, ...preserved };
  }

  return { dirty, reset };
}
