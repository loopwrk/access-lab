import type { ComputedRef } from "vue";
import { rgbToHex } from "~/utils/rgbToHex";

export interface SpacingSides {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface ButtonStudioDefaults {
  width: number;
  height: number;
  fontSize: number;
  padding: number;
  /**
   * UA padding per side. Browsers style buttons asymmetrically (Chrome
   * resolves `padding: 1px 6px`), so a single number cannot seed a
   * take-over without visibly changing the preview.
   */
  paddingSides: SpacingSides;
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
  paddingSides: { top: 0, right: 0, bottom: 0, left: 0 },
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
      paddingSides: {
        top: num("paddingTop") ?? HARDCODED.paddingSides.top,
        right: num("paddingRight") ?? HARDCODED.paddingSides.right,
        bottom: num("paddingBottom") ?? HARDCODED.paddingSides.bottom,
        left: num("paddingLeft") ?? HARDCODED.paddingSides.left,
      },
      borderWidth: num("borderTopWidth") ?? HARDCODED.borderWidth,
      bg: rgbToHex(styles?.["backgroundColor"]) || HARDCODED.bg,
      fgText: rgbToHex(styles?.color) || HARDCODED.fgText,
      borderColor: rgbToHex(styles?.["borderTopColor"]) || HARDCODED.borderColor,
    };
  });
}
