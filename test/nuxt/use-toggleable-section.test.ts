/**
 * Tests for the section on/off helper.
 *
 * `enabled` is DERIVED from whether any model key the section owns is non-null
 * — so it also flips off when those props are cleared elsewhere (e.g. the
 * reset-to-defaults control). `toggle` applies the caller's enable/disable
 * patch. (This derivation is what made overlapping keys cross-talk between the
 * Colours and Border sections — pinned separately in section-toggle-isolation.)
 *
 * Nuxt env: the composable uses `computed`.
 */

import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, ref } from "vue";
import type { ComputedRef } from "vue";
import { useToggleableSection } from "~/composables/useToggleableSection";

interface Style {
  bg?: string;
  fgText?: string;
}

const config = {
  keys: ["bg", "fgText"] as (keyof Style)[],
  enable: () => ({ bg: "#fff", fgText: "#000" }),
  disable: () => ({ bg: undefined, fgText: undefined }),
};

async function setup(initial: Partial<Style>) {
  const model = ref<Partial<Style>>({ ...initial });
  let api!: { enabled: ComputedRef<boolean>; toggle: (v: boolean | "indeterminate") => void };
  const Wrapper = defineComponent({
    setup() {
      api = useToggleableSection(model, config);
      return () => h("div");
    },
  });
  await mountSuspended(Wrapper);
  return { model, enabled: api.enabled, toggle: api.toggle };
}

describe("useToggleableSection", () => {
  it("is disabled when no owned key is set", async () => {
    const { enabled } = await setup({});
    expect(enabled.value).toBe(false);
  });

  it("is enabled when any owned key is non-null", async () => {
    const { enabled } = await setup({ bg: "#fff" });
    expect(enabled.value).toBe(true);
  });

  it("toggle(true) applies the enable patch", async () => {
    const { model, enabled, toggle } = await setup({});
    toggle(true);
    expect(model.value).toMatchObject({ bg: "#fff", fgText: "#000" });
    expect(enabled.value).toBe(true);
  });

  it("toggle(false) applies the disable patch", async () => {
    const { model, enabled, toggle } = await setup({ bg: "#fff", fgText: "#000" });
    toggle(false);
    expect(model.value.bg).toBeUndefined();
    expect(model.value.fgText).toBeUndefined();
    expect(enabled.value).toBe(false);
  });

  it("treats 'indeterminate' as not-on (applies disable)", async () => {
    const { model, toggle } = await setup({ bg: "#fff" });
    toggle("indeterminate");
    expect(model.value.bg).toBeUndefined();
  });

  it("reflects external clearing of the props (the reset case)", async () => {
    const { model, enabled } = await setup({ bg: "#fff" });
    expect(enabled.value).toBe(true);
    model.value.bg = undefined;
    expect(enabled.value).toBe(false);
  });
});
