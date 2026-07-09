/**
 * Render-output unit fidelity for the controls panel, with per-property
 * unit choice and a simulated root font-size for the rem demo.
 *
 * - CssLength-typed props (`width`, `padding`, `fontSize`, etc.) are stored
 *   as `CssLength` objects: a numeric value plus the unit the user typed
 *   (`'px'` or `'rem'`). The render function emits the literal CSS, so
 *   the iframe receives `width: 1.5rem` rather than `width: 24px` when
 *   the user has chosen rem.
 *
 */

import {
  CSS_UNIT_OPTIONS,
  FIXED_SLIDER_BASE_PX,
  REM_DECIMAL_PLACES,
  convertCssLength,
  sliderDisplayStep,
} from "~/utils/cssUnits";

export type CssUnit = "px" | "rem";

export interface CssLength {
  value: number;
  unit: CssUnit;
}

const DEFAULT_ROOT_PX = 16;

export function useUnitConversion() {
  const simulatedRootPx = useState<number>("al-simulated-root-px", () => DEFAULT_ROOT_PX);

  function lengthToPx(cssLength: CssLength | null | undefined): number {
    if (!cssLength) return 0;
    if (cssLength.unit === "rem") return cssLength.value * simulatedRootPx.value;
    return cssLength.value;
  }

  function lengthToSliderPx(cssLength: CssLength | null | undefined): number {
    if (!cssLength) return 0;
    if (cssLength.unit === "rem") return cssLength.value * FIXED_SLIDER_BASE_PX;
    return cssLength.value;
  }

  function fromPx(pxValue: number, unit: CssUnit): CssLength {
    if (unit === "rem") {
      return {
        value: parseFloat((pxValue / simulatedRootPx.value).toFixed(REM_DECIMAL_PLACES)),
        unit: "rem",
      };
    }
    return { value: Math.round(pxValue), unit: "px" };
  }

  function fromSliderPx(pxValue: number, unit: CssUnit): CssLength {
    if (unit === "rem") {
      return {
        value: parseFloat((pxValue / FIXED_SLIDER_BASE_PX).toFixed(REM_DECIMAL_PLACES)),
        unit: "rem",
      };
    }
    return { value: Math.round(pxValue), unit: "px" };
  }

  function convertLength(cssLength: CssLength, targetUnit: CssUnit): CssLength {
    return convertCssLength(cssLength, targetUnit, simulatedRootPx.value);
  }

  function isCssLength(value: unknown): value is CssLength {
    return (
      typeof value === "object" &&
      value !== null &&
      "value" in value &&
      "unit" in value &&
      typeof (value as CssLength).value === "number"
    );
  }

  function resolveProps(props: Record<string, unknown>): Record<string, unknown> {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(props)) {
      out[k] = isCssLength(v) ? lengthToPx(v) : v;
    }
    return out;
  }

  function hasRem(props: Record<string, unknown>): boolean {
    for (const v of Object.values(props)) {
      if (isCssLength(v) && v.unit === "rem") return true;
    }
    return false;
  }

  return {
    simulatedRootPx,
    unitOptions: CSS_UNIT_OPTIONS,
    lengthToPx,
    lengthToSliderPx,
    formatLength: formatCssLength,
    fromPx,
    fromSliderPx,
    convertLength,
    displayStep: sliderDisplayStep,
    isCssLength,
    resolveProps,
    hasRem,
  };
}
