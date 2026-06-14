/**
 * Nuxt-environment regression test for Colours / Border-width section toggle
 * isolation.
 *
 * Each section's switch reads as "on" when any model key it owns is non-null
 * (useToggleableSection). `borderColor` is a colour, owned by the Colours
 * section (its control lives there). It must NOT also be owned by the
 * Border-width section — otherwise enabling either section seeds/clears
 * `borderColor` and flips the other section's switch on as a side-effect (the
 * bug this pins). Border-width owns the width keys only.
 *
 */

import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, ref } from "vue";
import type { Component } from "vue";
import type { BaseButtonProps } from "~/types/button";
import ColoursSection from "~/components/ButtonStudio/sections/ColoursSection.vue";
import BorderSection from "~/components/ButtonStudio/sections/BorderSection.vue";

const DEFAULTS = {
  width: 70,
  height: 21,
  fontSize: 14,
  padding: 0,
  borderWidth: 2,
  bg: "#efefef",
  fgText: "#000000",
  borderColor: "#888888",
};

/**
 * Mount a single studio section against a seeded model. The section toggle is
 * the switch inside the section's `<legend>`.
 */
async function mountSection(section: Component, initial: Partial<BaseButtonProps>) {
  const model = ref<Partial<BaseButtonProps>>({ ...initial });
  const Wrapper = defineComponent({
    components: { TheSection: section },
    setup() {
      return { model, DEFAULTS };
    },
    template: `<TheSection v-model="model" :defaults="DEFAULTS" />`,
  });
  const wrapper = await mountSuspended(Wrapper);
  return wrapper.find('legend button[role="switch"]').attributes("aria-checked");
}

describe("BorderSection toggle", () => {
  it("stays off when only borderColor is set (Colours owns borderColor)", async () => {
    expect(await mountSection(BorderSection, { borderColor: "#123456" })).toBe("false");
  });

  it("turns on when a border width is set", async () => {
    expect(await mountSection(BorderSection, { borderWidth: { value: 2, unit: "px" } })).toBe(
      "true",
    );
  });
});

describe("ColoursSection toggle", () => {
  it("stays off when only a border width is set (it owns colour keys, not widths)", async () => {
    expect(await mountSection(ColoursSection, { borderWidth: { value: 2, unit: "px" } })).toBe(
      "false",
    );
  });

  it("turns on when borderColor is set", async () => {
    expect(await mountSection(ColoursSection, { borderColor: "#123456" })).toBe("true");
  });
});
