/**
 * Tests for `useInputStyleTarget` — the per-target style indirection behind the
 * input's "Style applies to" picker, extracted from `InputControls.vue` so it
 * can be exercised directly.
 *
 * The contract: the "input" target reads/writes the flat top-level props
 * (`fontSize` / `fgText`); the other three targets read/write a nested `*Style`
 * slice, and toggling a property off removes the key rather than leaving an
 * explicit `undefined`. Background/border are input-only and toggle off by
 * deleting the keys.
 *
 * Uses the Nuxt project because the composable pulls in `useUnitConversion`
 * (which is `useState`-backed) and `useContrast`.
 */

import { afterEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, ref } from "vue";
import { useInputStyleTarget } from "~/components/inspected/input/useInputStyleTarget";
import type { InputProps } from "~/components/inspected/input/definition";

let wrapper: { unmount: () => void } | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

async function setup(initial: Partial<InputProps>) {
  const model = ref<Partial<InputProps>>({ ...initial });
  let api!: ReturnType<typeof useInputStyleTarget>;
  const Wrapper = defineComponent({
    setup() {
      api = useInputStyleTarget(model);
      return () => null;
    },
  });
  wrapper = await mountSuspended(Wrapper);
  return { model, api };
}

describe("useInputStyleTarget — the input target (flat props)", () => {
  it("defaults to the input target and reads the flat fontSize / fgText", async () => {
    const { api } = await setup({ fontSize: { value: 1.25, unit: "rem" }, fgText: "#222222" });
    expect(api.activeStyleTarget.value).toBe("input");
    expect(api.isInputTarget.value).toBe(true);
    expect(api.activeFontSize.value).toEqual({ value: 1.25, unit: "rem" });
    expect(api.activeFgText.value).toBe("#222222");
  });

  it("writes the text colour straight to the top-level prop for the input target", async () => {
    const { model, api } = await setup({});
    api.activeFgText.value = "#abcdef";
    expect(model.value.fgText).toBe("#abcdef");
    expect(model.value.labelStyle).toBeUndefined();
  });
});

describe("useInputStyleTarget — a nested target (label slice)", () => {
  it("reads and writes the labelStyle slice without touching the input props", async () => {
    const { model, api } = await setup({ fgText: "#111111" });
    api.activeStyleTarget.value = "label";
    // The label slice is empty, so the colour falls back to the default.
    expect(api.activeFgTextEnabled.value).toBe(false);

    api.activeFgText.value = "#00ff00";
    expect(model.value.labelStyle).toEqual({ fgText: "#00ff00" });
    expect(model.value.fgText).toBe("#111111"); // input target untouched
  });

  it("removes the key (not sets undefined) when a nested property is toggled off", async () => {
    const { model, api } = await setup({});
    api.activeStyleTarget.value = "label";
    api.activeFgText.value = "#00ff00";
    expect(model.value.labelStyle).toEqual({ fgText: "#00ff00" });

    api.toggleActiveFgText(false);
    expect("fgText" in (model.value.labelStyle ?? {})).toBe(false);
  });
});

describe("useInputStyleTarget — toggles", () => {
  it("toggleFontSize sets a rem length on, clears it off", async () => {
    const { model, api } = await setup({});
    api.toggleFontSize(true);
    expect(api.fontSizeEnabled.value).toBe(true);
    expect(api.activeFontSize.value?.unit).toBe("rem");

    api.toggleFontSize(false);
    expect(api.fontSizeEnabled.value).toBe(false);
    expect(model.value.fontSize).toBeUndefined();
  });

  it("toggleInputBg sets bg + border on, and deletes both keys off", async () => {
    const { model, api } = await setup({});
    api.toggleInputBg(true);
    expect(model.value.bg).toBeTruthy();
    expect(model.value.borderColor).toBeTruthy();
    expect(api.inputBgEnabled.value).toBe(true);

    api.toggleInputBg(false);
    expect("bg" in model.value).toBe(false);
    expect("borderColor" in model.value).toBe(false);
  });
});
