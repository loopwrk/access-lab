import type { ComputedRef } from "vue";
import { rgbToHex } from "~/utils/rgbToHex";

export interface ButtonStudioDefaults {
  width: number;
  height: number;
  fontSize: number;
  padding: number;
  borderWidth: number;
  bg: string;
  fgText: string;
  borderColor: string;
}

const HARDCODED: ButtonStudioDefaults = {
  width: 70,
  height: 21,
  fontSize: 14,
  padding: 0,
  borderWidth: 2,
  bg: "#EFEFEF",
  fgText: "#000000",
  borderColor: "#888888",
};

/**
 * Control-panel defaults for the button family: UA-probed values from
 * useBrowserDefaults where the probe can supply them, hardcoded fallbacks
 * where it cannot. One of three sizing composables - see also
 * useNaturalSize (intrinsic size of the rendered content).
 */
export function useButtonStudioDefaults(
  tagName: string,
): ComputedRef<ButtonStudioDefaults> {
  const { defaults: browser } = useBrowserDefaults(tagName);

  return computed(() => {
    const styles = browser.value;
    const num = (prop: string): number | undefined => {
      const raw = styles?.[prop];
      if (!raw || raw === "none") return undefined;
      const parsed = parseFloat(raw);
      return isNaN(parsed) ? undefined : parsed;
    };
    return {
      width: HARDCODED.width,
      height: HARDCODED.height,
      fontSize: num("fontSize") ?? HARDCODED.fontSize,
      padding: num("paddingTop") ?? HARDCODED.padding,
      borderWidth: num("borderTopWidth") ?? HARDCODED.borderWidth,
      bg: rgbToHex(styles?.["backgroundColor"]) || HARDCODED.bg,
      fgText: rgbToHex(styles?.color) || HARDCODED.fgText,
      borderColor: rgbToHex(styles?.["borderTopColor"]) || HARDCODED.borderColor,
    };
  });
}
