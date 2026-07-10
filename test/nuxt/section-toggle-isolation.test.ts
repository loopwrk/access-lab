/**
 * Nuxt-environment regression test for Colours / Border-width section
 * key-ownership isolation.
 *
 * A section reads as "customised" when any model key it owns is non-null
 * (useToggleableSection). `borderColor` is a colour, owned by the Colours
 * section (its control lives there). It must NOT also be owned by the
 * Border-width section — otherwise customising either section seeds/clears
 * `borderColor` and flips the other section on as a side-effect (the bug
 * this pins). Border-width owns the width keys only.
 *
 * Colours still surfaces its state through a legend switch; Border width
 * uses the reveal-on-take-over row, where "customised" is observable as
 * revealed controls (a slider exists) instead of a switch.
 */

import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, ref } from "vue";
import type { Component } from "vue";
import type { BaseButtonProps } from "~/types/button";
import { UApp } from "#components";
import ColoursSection from "~/components/studio/sections/ColoursSection.vue";
import BorderSection from "~/components/studio/sections/BorderSection.vue";

const DEFAULTS = {
  width: 70,
  height: 21,
  fontSize: 14,
  padding: 0,
  paddingSides: { top: 0, right: 0, bottom: 0, left: 0 },
  borderWidth: 2,
  bg: "#efefef",
  fgText: "#000000",
  borderColor: "#888888",
};

/** Mount a single studio section against a seeded model. */
async function mountSection(section: Component, initial: Partial<BaseButtonProps>) {
  const model = ref<Partial<BaseButtonProps>>({ ...initial });
  const Wrapper = defineComponent({
    components: { UApp, TheSection: section },
    setup() {
      return { model, DEFAULTS };
    },
    // UApp provides the tooltip context BorderSection's fact line needs.
    template: `<UApp><TheSection v-model="model" :defaults="DEFAULTS" /></UApp>`,
  });
  return await mountSuspended(Wrapper);
}

describe("BorderSection customised state", () => {
  it("stays collapsed when only borderColor is set (Colours owns borderColor)", async () => {
    const wrapper = await mountSection(BorderSection, { borderColor: "#123456" });
    expect(wrapper.find('[role="slider"]').exists()).toBe(false);
  });

  it("reveals its controls when a border width is set", async () => {
    const wrapper = await mountSection(BorderSection, {
      borderWidth: { value: 2, unit: "px" },
    });
    expect(wrapper.find('[role="slider"]').exists()).toBe(true);
  });
});

describe("ColoursSection toggle", () => {
  it("stays off when only a border width is set (it owns colour keys, not widths)", async () => {
    const wrapper = await mountSection(ColoursSection, {
      borderWidth: { value: 2, unit: "px" },
    });
    expect(wrapper.find('legend button[role="switch"]').attributes("aria-checked")).toBe(
      "false",
    );
  });

  it("turns on when borderColor is set", async () => {
    const wrapper = await mountSection(ColoursSection, { borderColor: "#123456" });
    expect(wrapper.find('legend button[role="switch"]').attributes("aria-checked")).toBe(
      "true",
    );
  });
});
