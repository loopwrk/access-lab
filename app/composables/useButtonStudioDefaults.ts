import type { ComputedRef } from "vue";

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

function rgbToHex(rgbStr: string | undefined): string {
  if (!rgbStr || !rgbStr.includes("rgb")) return "";
  const match = rgbStr.match(/\d+/g);
  if (!match) return "";
  const [r = 0, g = 0, b = 0] = match.map(Number);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

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
