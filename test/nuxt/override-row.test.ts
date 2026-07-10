/**
 * Behaviour of the reveal-on-take-over rows (OverrideRow via
 * DimensionsSection and BorderSection).
 *
 * The contract under test:
 * - a fresh panel renders facts only — no editable or disabled controls;
 * - Customise seeds the model from the resolved default (probe/natural
 *   size), so the preview cannot jump at take-over;
 * - Use default discards the override and collapses the row;
 * - rows derive their state from the model, so an external clear (the
 *   reset-all path) collapses them without any local flag drifting;
 * - focus lands on the first revealed control after take-over and back on
 *   Customise after removal, and both transitions are announced politely;
 * - an asymmetric UA padding default reveals in Independent mode with
 *   per-side values, and choosing Linked afterwards is the one deliberate
 *   value jump (every side pulled to the top value).
 */

import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { flushPromises } from "@vue/test-utils";
import type { VueWrapper } from "@vue/test-utils";
import { defineComponent, nextTick, ref } from "vue";
import type { Ref } from "vue";
import type { BaseButtonProps } from "~/types/button";
import type { ButtonStudioDefaults } from "~/composables/useButtonStudioDefaults";
import { UApp } from "#components";
import DimensionsSection from "~/components/studio/sections/DimensionsSection.vue";
import BorderSection from "~/components/studio/sections/BorderSection.vue";
import TextSection from "~/components/studio/sections/TextSection.vue";

const ASYMMETRIC_DEFAULTS: ButtonStudioDefaults = {
  width: 70,
  height: 21,
  fontSize: 14,
  padding: 1,
  paddingSides: { top: 1, right: 6, bottom: 1, left: 6 },
  borderWidth: 2,
  bg: "#efefef",
  fgText: "#000000",
  borderColor: "#888888",
};

const UNIFORM_DEFAULTS: ButtonStudioDefaults = {
  ...ASYMMETRIC_DEFAULTS,
  padding: 2,
  paddingSides: { top: 2, right: 2, bottom: 2, left: 2 },
};

const NATURAL_SIZE = { width: 124, height: 40 };

async function mountDimensions(
  model: Ref<Partial<BaseButtonProps>>,
  defaults: ButtonStudioDefaults = ASYMMETRIC_DEFAULTS,
) {
  const Wrapper = defineComponent({
    components: { UApp, DimensionsSection },
    setup() {
      return { model, defaults, NATURAL_SIZE };
    },
    // UApp provides the tooltip context the fact-line value tooltips need,
    // exactly as app.vue does for the real app.
    template: `<UApp><DimensionsSection v-model="model" :defaults="defaults" :natural-size="NATURAL_SIZE" /></UApp>`,
  });
  return await mountSuspended(Wrapper, { attachTo: document.body });
}

function buttonsByText(wrapper: Pick<VueWrapper, "findAll">, text: string) {
  return wrapper.findAll("button").filter((button) => button.text().includes(text));
}

describe("fresh panel", () => {
  it("renders facts only: no sliders, no switches, nothing disabled", async () => {
    const wrapper = await mountDimensions(ref({}));
    expect(wrapper.find('[role="slider"]').exists()).toBe(false);
    expect(wrapper.find('[role="switch"]').exists()).toBe(false);
    expect(wrapper.find("[disabled]").exists()).toBe(false);
    expect(buttonsByText(wrapper, "Customise")).toHaveLength(3);
  });

  it("names each default source; the value lives in a tooltip, not inline", async () => {
    const wrapper = await mountDimensions(ref({}));
    const text = wrapper.text();
    expect(text).toContain("auto");
    expect(text).toContain("Browser default");
    // Values moved into the hover/focus tooltip on the term.
    expect(text).not.toContain("124 px");
    expect(text).not.toContain("1px 6px 1px 6px");
    // One focusable tooltip trigger per fact row, so keyboard users can
    // reveal the value too.
    const triggers = wrapper
      .findAll('[tabindex="0"]')
      .filter((el) => /auto|Browser default/.test(el.text()));
    expect(triggers).toHaveLength(3);
  });

  it("carries the default value in the Customise accessible name", async () => {
    const wrapper = await mountDimensions(ref({}));
    const widthCustomise = buttonsByText(wrapper, "Customise")[0]!;
    expect(widthCustomise.attributes("aria-label")).toContain("auto");
    expect(widthCustomise.attributes("aria-label")).toContain("124 px");
  });
});

describe("width take-over", () => {
  it("seeds the model from the natural size and reveals the controls", async () => {
    const model = ref<Partial<BaseButtonProps>>({});
    const wrapper = await mountDimensions(model);

    await buttonsByText(wrapper, "Customise")[0]!.trigger("click");
    await flushPromises();

    expect(model.value.width).toEqual({ value: 124, unit: "px" });
    expect(wrapper.find('[role="slider"]').exists()).toBe(true);
  });

  it("moves focus to the first revealed control and announces the take-over", async () => {
    const wrapper = await mountDimensions(ref({}));

    await buttonsByText(wrapper, "Customise")[0]!.trigger("click");
    await flushPromises();

    expect(document.activeElement).not.toBe(document.body);
    expect(wrapper.element.contains(document.activeElement)).toBe(true);
    expect(wrapper.find('[aria-live="polite"]').text()).toContain("customising");
  });

  it("Use default discards the override, collapses the row, and returns focus", async () => {
    const model = ref<Partial<BaseButtonProps>>({});
    const wrapper = await mountDimensions(model);

    await buttonsByText(wrapper, "Customise")[0]!.trigger("click");
    await flushPromises();
    await buttonsByText(wrapper, "Use default")[0]!.trigger("click");
    await flushPromises();

    expect(model.value.width).toBeUndefined();
    expect(wrapper.find('[role="slider"]').exists()).toBe(false);
    expect(document.activeElement?.textContent).toContain("Customise");
    expect(wrapper.find('[aria-live="polite"]').text()).toContain("override removed");
  });
});

describe("external clears (the reset-all path)", () => {
  it("reveals and collapses purely from the model, no clicks involved", async () => {
    const model = ref<Partial<BaseButtonProps>>({});
    const wrapper = await mountDimensions(model);

    model.value.height = { value: 40, unit: "px" };
    await nextTick();
    expect(wrapper.find('[role="slider"]').exists()).toBe(true);

    model.value.height = undefined;
    await nextTick();
    expect(wrapper.find('[role="slider"]').exists()).toBe(false);
  });
});

describe("padding take-over with an asymmetric UA default", () => {
  it("reveals All sides seeded from the top value", async () => {
    const model = ref<Partial<BaseButtonProps>>({});
    const wrapper = await mountDimensions(model);

    await buttonsByText(wrapper, "Customise")[2]!.trigger("click");
    await flushPromises();

    const linked = { value: 1, unit: "px" };
    expect(model.value.padding).toEqual(linked);
    expect(model.value.paddingTop).toEqual(linked);
    expect(model.value.paddingRight).toEqual(linked);
    const modeToggle = wrapper.find('button[aria-label="Individual padding"]');
    expect(modeToggle.attributes("aria-pressed")).toBe("false");
    expect(wrapper.text()).toContain("All sides");
  });

  it("returning to All sides after individual edits pulls every side to the top value", async () => {
    const model = ref<Partial<BaseButtonProps>>({});
    const wrapper = await mountDimensions(model);

    await buttonsByText(wrapper, "Customise")[2]!.trigger("click");
    await flushPromises();
    await wrapper.find('button[aria-label="Individual padding"]').trigger("click");
    await flushPromises();
    expect(wrapper.text()).toContain("Top");

    model.value.paddingRight = { value: 6, unit: "px" };
    await nextTick();
    await wrapper.find('button[aria-label="Individual padding"]').trigger("click");
    await flushPromises();

    const linked = { value: 1, unit: "px" };
    expect(model.value.padding).toEqual(linked);
    expect(model.value.paddingRight).toEqual(linked);
    expect(wrapper.text()).toContain("All sides");
  });
});

describe("font size take-over (TextSection)", () => {
  it("states the browser default in px but seeds the control in rem", async () => {
    const model = ref<Partial<BaseButtonProps>>({});
    const Wrapper = defineComponent({
      components: { UApp, TextSection },
      setup() {
        return { model, defaults: ASYMMETRIC_DEFAULTS };
      },
      template: `<UApp><TextSection v-model="model" :defaults="defaults" /></UApp>`,
    });
    const wrapper = await mountSuspended(Wrapper, { attachTo: document.body });

    const customise = buttonsByText(wrapper, "Customise")[0]!;
    expect(customise.attributes("aria-label")).toContain("14 px");
    expect(wrapper.find('[role="slider"]').exists()).toBe(false);

    await customise.trigger("click");
    await flushPromises();
    // The app rounds rem to two decimal places (REM_DECIMAL_PLACES).
    expect(model.value.fontSize).toEqual({ value: 0.88, unit: "rem" });
    expect(wrapper.find('[role="slider"]').exists()).toBe(true);

    await buttonsByText(wrapper, "Use default")[0]!.trigger("click");
    await flushPromises();
    expect(model.value.fontSize).toBeUndefined();
    expect(wrapper.find('[role="slider"]').exists()).toBe(false);
  });
});

describe("padding take-over with a uniform default", () => {
  it("carries the single value in the accessible name and reveals Linked", async () => {
    const model = ref<Partial<BaseButtonProps>>({});
    const wrapper = await mountDimensions(model, UNIFORM_DEFAULTS);

    const paddingCustomise = buttonsByText(wrapper, "Customise")[2]!;
    expect(paddingCustomise.attributes("aria-label")).toContain("2 px");
    expect(paddingCustomise.attributes("aria-label")).not.toContain("2px 2px");

    await paddingCustomise.trigger("click");
    await flushPromises();

    expect(model.value.padding).toEqual({ value: 2, unit: "px" });
    expect(wrapper.text()).toContain("All sides");
  });
});

describe("BorderSection take-over", () => {
  it("states the uniform default, seeds Linked, and collapses on Use default", async () => {
    const model = ref<Partial<BaseButtonProps>>({});
    const Wrapper = defineComponent({
      components: { UApp, BorderSection },
      setup() {
        return { model, defaults: ASYMMETRIC_DEFAULTS };
      },
      template: `<UApp><BorderSection v-model="model" :defaults="defaults" /></UApp>`,
    });
    const wrapper = await mountSuspended(Wrapper, { attachTo: document.body });

    expect(buttonsByText(wrapper, "Customise")[0]!.attributes("aria-label")).toContain("2 px");

    await buttonsByText(wrapper, "Customise")[0]!.trigger("click");
    await flushPromises();
    expect(model.value.borderWidth).toEqual({ value: 2, unit: "px" });
    expect(wrapper.text()).toContain("All sides");

    await buttonsByText(wrapper, "Use default")[0]!.trigger("click");
    await flushPromises();
    expect(model.value.borderWidth).toBeUndefined();
    expect(wrapper.find('[role="slider"]').exists()).toBe(false);
  });
});
