import type { CssLength } from "~/composables/useUnitConversion";

/** Format a CssLength as a CSS-ready string, e.g. `"1.5rem"`, `"24px"`. */
// CssLength = a reusable CSS size token
export function formatCssLength(cssLength: CssLength): string {
  return `${cssLength.value}${cssLength.unit}`;
}
