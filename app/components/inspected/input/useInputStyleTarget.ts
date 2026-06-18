import type { Ref } from "vue";
import type { InputProps, InputStyleTarget, InputTextStyleSlice } from "./definition";
import type { CssLength } from "~/composables/useUnitConversion";

/**
 * State and bindings behind the input's "Style applies to" picker.
 *
 * Font-size and text-colour in the input controls don't write straight to the
 * model; they write to whichever target the user picked (label / input /
 * placeholder / help-text). The "input" target lives in the flat top-level
 * props (`fontSize` / `fgText`); the other three live in nested `*Style`
 * slices. This composable owns that indirection so the section component stays
 * declarative, and so the per-target read/write is unit-testable on its own
 * (it used to live inside the controls component's setup).
 */

/** Reset values when a style toggle is switched on. */
const DEFAULT_FONT_SIZE_PX = 14;
const DEFAULT_FG_TEXT = "#000000";
const DEFAULT_BG = "#FFFFFF";
const DEFAULT_BORDER_COLOR = "#888888";

export function useInputStyleTarget(model: Ref<Partial<InputProps>>) {
  const unitConv = useUnitConversion();
  const { update, updateMany } = useModelUpdater(model);

  const activeStyleTarget = ref<InputStyleTarget>("input");
  const isInputTarget = computed(() => activeStyleTarget.value === "input");

  // Read the current target's slice. The "input" target reads the flat
  // top-level props; the other three read their nested `*Style` slice.
  function activeSlice(): InputTextStyleSlice {
    if (activeStyleTarget.value === "label") return model.value.labelStyle ?? {};
    if (activeStyleTarget.value === "placeholder") return model.value.placeholderStyle ?? {};
    if (activeStyleTarget.value === "helpText") return model.value.helpTextStyle ?? {};
    return { fontSize: model.value.fontSize, fgText: model.value.fgText };
  }

  function updateActiveSlice(patch: Partial<InputTextStyleSlice>) {
    if (activeStyleTarget.value === "input") {
      updateMany(patch as Partial<InputProps>);
      return;
    }
    const sliceKey =
      activeStyleTarget.value === "label"
        ? "labelStyle"
        : activeStyleTarget.value === "placeholder"
          ? "placeholderStyle"
          : "helpTextStyle";
    // Merge the patch over the current slice, then drop any key whose value is
    // undefined, so toggling a property off actually removes it (rather than
    // keeping the old value, which is what a naive copy-then-skip-undefined
    // did). Without this, the text-colour switch on a nested target could not
    // be turned off: the key stayed, so `enabled` recomputed back to true.
    const merged = { ...model.value[sliceKey], ...patch };
    const next: InputTextStyleSlice = {};
    for (const key of Object.keys(merged) as (keyof InputTextStyleSlice)[]) {
      const value = merged[key];
      if (value !== undefined) next[key] = value as never;
    }
    update(sliceKey, next);
  }

  const activeFontSize = computed<CssLength | undefined>({
    get: () => activeSlice().fontSize,
    set: (value) => updateActiveSlice({ fontSize: value }),
  });
  const fontSizeEnabled = computed(() => activeFontSize.value != null);

  function toggleFontSize(value: boolean | "indeterminate") {
    activeFontSize.value = value === true ? unitConv.fromPx(DEFAULT_FONT_SIZE_PX, "rem") : undefined;
  }

  const activeFgText = computed({
    get: () => activeSlice().fgText ?? DEFAULT_FG_TEXT,
    set: (value: string) => updateActiveSlice({ fgText: value }),
  });
  const activeFgTextEnabled = computed(() => activeSlice().fgText != null);

  function toggleActiveFgText(value: boolean | "indeterminate") {
    if (value === true) {
      activeFgText.value = DEFAULT_FG_TEXT;
    } else {
      updateActiveSlice({ fgText: undefined });
    }
  }

  // Background and border are input-only; they don't follow the target picker.
  const bgColor = computed({
    get: () => model.value.bg ?? DEFAULT_BG,
    set: (value: string) => update("bg", value),
  });
  const borderColor = computed({
    get: () => model.value.borderColor ?? DEFAULT_BORDER_COLOR,
    set: (value: string) => update("borderColor", value),
  });
  const inputBgEnabled = computed(() => model.value.bg != null || model.value.borderColor != null);

  function toggleInputBg(value: boolean | "indeterminate") {
    if (value === true) {
      updateMany({ bg: DEFAULT_BG, borderColor: DEFAULT_BORDER_COLOR });
    } else {
      // Remove the keys outright (rather than set undefined) so the rendered
      // output and code drawer show no leftover background/border declarations.
      delete model.value.bg;
      delete model.value.borderColor;
    }
  }

  const { ratio: contrastRatio, verdict: contrastVerdict } = useContrast(activeFgText, bgColor, {
    fontSizePx: () =>
      activeFontSize.value ? unitConv.lengthToPx(activeFontSize.value) : DEFAULT_FONT_SIZE_PX,
    bold: false,
  });

  return {
    activeStyleTarget,
    isInputTarget,
    /** Fallback px the font-size slider shows while the control is off. */
    fontSizeDefaultPx: DEFAULT_FONT_SIZE_PX as number,
    activeFontSize,
    fontSizeEnabled,
    toggleFontSize,
    activeFgText,
    activeFgTextEnabled,
    toggleActiveFgText,
    bgColor,
    borderColor,
    inputBgEnabled,
    toggleInputBg,
    contrastRatio,
    contrastVerdict,
  };
}
