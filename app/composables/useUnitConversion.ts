/**
 * Render-output unit fidelity for the controls panel, with per-property
 * unit choice and a simulated root font-size for the rem demo.
 *
 * - Length-typed props (`width`, `padding`, `fontSize`, etc.) are stored
 *   as `CssLength` objects: a numeric value plus the unit the user typed
 *   (`'px'` or `'rem'`). The render function emits the literal CSS, so
 *   the iframe receives `width: 1.5rem` rather than `width: 24px` when
 *   the user has chosen rem.
 *
 */

export type CssUnit = "px" | "rem";

export interface CssLength {
  value: number;
  unit: CssUnit;
}

const DEFAULT_ROOT_PX = 16;

const SLIDER_REFERENCE_PX = 16;

const REM_DECIMAL_PLACES = 2;

export function useUnitConversion() {
  const simulatedRootPx = useState<number>(
    "al-simulated-root-px",
    () => DEFAULT_ROOT_PX,
  );

  function lengthToPx(length: CssLength | null | undefined): number {
    if (!length) return 0;
    if (length.unit === "rem") return length.value * simulatedRootPx.value;
    return length.value;
  }

  function lengthToSliderPx(length: CssLength | null | undefined): number {
    if (!length) return 0;
    if (length.unit === "rem") return length.value * SLIDER_REFERENCE_PX;
    return length.value;
  }

  /** Format a CssLength as CSS-ready string (e.g. `"1.5rem"`, `"24px"`). */
  function formatLength(length: CssLength): string {
    return `${length.value}${length.unit}`;
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
        value: parseFloat((pxValue / SLIDER_REFERENCE_PX).toFixed(REM_DECIMAL_PLACES)),
        unit: "rem",
      };
    }
    return { value: Math.round(pxValue), unit: "px" };
  }

  function convertLength(length: CssLength, targetUnit: CssUnit): CssLength {
    if (length.unit === targetUnit) return length;
    return fromPx(lengthToPx(length), targetUnit);
  }

  function displayStep(pxStep: number, unit: CssUnit): number {
    if (unit === "rem") {
      return parseFloat((pxStep / SLIDER_REFERENCE_PX).toFixed(REM_DECIMAL_PLACES));
    }
    return pxStep;
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

  function resolveProps(
    props: Record<string, unknown>,
  ): Record<string, unknown> {
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

  const unitOptions: { label: string; value: CssUnit }[] = [
    { label: "px", value: "px" },
    { label: "rem", value: "rem" },
  ];

  return {
    simulatedRootPx,
    unitOptions,
    lengthToPx,
    lengthToSliderPx,
    formatLength,
    fromPx,
    fromSliderPx,
    convertLength,
    displayStep,
    isCssLength,
    resolveProps,
    hasRem,
  };
}
