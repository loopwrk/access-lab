import type { CssLength, CssUnit } from "../composables/useUnitConversion";

/** The unit choices every length control offers. */
export const CSS_UNIT_OPTIONS: { label: string; value: CssUnit }[] = [
  { label: "px", value: "px" },
  { label: "rem", value: "rem" },
];

// Sliders and their steps resolve rem against a fixed 16px base rather than
// the simulated root: a slider's position represents the value the user
// chose, and must not jump when the root-rem demo changes the simulated root.
export const FIXED_SLIDER_BASE_PX = 16;

export const REM_DECIMAL_PLACES = 2;

/** Scale a px slider step for display in the given unit. */
export function sliderDisplayStep(pxStep: number, unit: CssUnit): number {
  if (unit === "rem") {
    return parseFloat((pxStep / FIXED_SLIDER_BASE_PX).toFixed(REM_DECIMAL_PLACES));
  }
  return pxStep;
}

/** Convert a CssLength between px and rem against the given root font-size. */
export function convertCssLength(
  length: CssLength,
  targetUnit: CssUnit,
  rootPx: number,
): CssLength {
  if (length.unit === targetUnit) return length;
  const px = length.unit === "rem" ? length.value * rootPx : length.value;
  if (targetUnit === "rem") {
    return { value: parseFloat((px / rootPx).toFixed(REM_DECIMAL_PLACES)), unit: "rem" };
  }
  return { value: Math.round(px), unit: "px" };
}
