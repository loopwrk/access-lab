import type { CssLength } from "~/composables/useUnitConversion";

/** Format a CssLength as a CSS-ready string, e.g. `"1.5rem"`, `"24px"`. */
export function formatCssLength(length: CssLength): string {
  return `${length.value}${length.unit}`;
}
