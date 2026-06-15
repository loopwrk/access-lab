/**
 * These watchers are the controls-layer logic that keeps the studio's model
 * coherent as the user switches button variants. They matter for the teaching
 * goal because an incoherent model renders a misleading example: an icon
 * stranded on a void <input> (which can't host one), a stale label that no
 * longer matches the variant, or a <form> wrapper around a button that has no
 * business submitting. Each test names the lesson the watcher protects.
 *
 * Why the Nuxt env: FormButtonControls uses defineModel, useI18n,
 * useNaturalSize, useButtonStudioDefaults and renders real section components.
 * None of that exists in the plain node env, so the only honest way to
 * exercise the watchers is a real mount — the same approach as
 * checkbox-controls.test.ts.
 */

import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, nextTick, ref } from "vue";
import FormButtonControls from "~/components/inspected/buttons/form-buttons/FormButtonControls.vue";
import type { BaseButtonProps } from "~/types/button";

type Model = Partial<BaseButtonProps> & { wrappers?: string[] };

/**
 * Minimal v-model harness: the wrapper owns a ref the test mutates and reads,
 * mirroring what useInspectedComponent seeds in production.
 */
function makeWrapper(initial: Model) {
  const model = ref<Model>({ ...initial });
  const Wrapper = defineComponent({
    components: { FormButtonControls },
    setup() {
      return { model };
    },
    template: `<FormButtonControls v-model="model" />`,
  });
  return { model, Wrapper };
}

/**
 * Two ticks wait out the v-model round trip: the watcher mutates the child's
 * defineModel proxy, which emits update:modelValue, which the parent's v-model
 * writes back to the wrapper ref. One tick isn't always enough; two is the
 * safe upper bound (see checkbox-controls.test.ts).
 */
async function flushModelSync() {
  await nextTick();
  await nextTick();
}

describe("FormButtonControls — contentType is cleared when moving onto a void <input>", () => {
  it("resets an icon to text when switching from a <button> to an <input> variant", async () => {
    // An <input> is a void element and cannot contain an icon span; leaving
    // contentType="icon" would render markup the variant can't actually
    // produce. A bespoke label keeps the label-restore watcher out of the way.
    const { model, Wrapper } = makeWrapper({
      renderAs: "button-submit",
      contentType: "icon",
      label: "Bespoke label",
    });
    await mountSuspended(Wrapper);

    model.value = { ...model.value, renderAs: "input-submit" };
    await flushModelSync();

    expect(model.value.contentType).toBe("text");
  });

  it("leaves an icon alone when switching between two <button> variants", async () => {
    const { model, Wrapper } = makeWrapper({
      renderAs: "button-submit",
      contentType: "icon",
      label: "Bespoke label",
    });
    await mountSuspended(Wrapper);

    model.value = { ...model.value, renderAs: "button-reset" };
    await flushModelSync();

    expect(model.value.contentType).toBe("icon");
  });
});

describe("FormButtonControls — the label follows the variant's default, unless it's bespoke", () => {
  it("swaps to the new variant's default label when the current one is a known default", async () => {
    const { model, Wrapper } = makeWrapper({ renderAs: "button-submit", label: "Save changes" });
    await mountSuspended(Wrapper);

    model.value = { ...model.value, renderAs: "button-reset" };
    await flushModelSync();

    expect(model.value.label).toBe("Discard changes");
  });

  it("preserves a label the user typed themselves", async () => {
    // "Publish now" is not in the known-defaults set, so the watcher must treat
    // it as the user's intent and leave it untouched across a variant switch.
    const { model, Wrapper } = makeWrapper({ renderAs: "button-submit", label: "Publish now" });
    await mountSuspended(Wrapper);

    model.value = { ...model.value, renderAs: "button-reset" };
    await flushModelSync();

    expect(model.value.label).toBe("Publish now");
  });
});

describe("FormButtonControls — the form wrapper tracks whether the variant has form behaviour", () => {
  it("forces a <form> wrapper for a submit-like variant", async () => {
    const { model, Wrapper } = makeWrapper({ renderAs: "input-button", wrappers: [], label: "Go" });
    await mountSuspended(Wrapper);

    model.value = { ...model.value, renderAs: "input-submit" };
    await flushModelSync();

    expect(model.value.wrappers).toEqual(["form"]);
  });

  it("clears the <form> wrapper for a variant with no form behaviour", async () => {
    const { model, Wrapper } = makeWrapper({
      renderAs: "input-submit",
      wrappers: ["form"],
      label: "Go",
    });
    await mountSuspended(Wrapper);

    model.value = { ...model.value, renderAs: "input-button" };
    await flushModelSync();

    expect(model.value.wrappers).toEqual([]);
  });

  it("leaves a non-form wrapper (e.g. an anchor) untouched", async () => {
    // The watcher only ever ADDS or REMOVES the form wrapper. A link container
    // the user chose must survive a switch to a non-form variant — otherwise a
    // variant change would silently undo the very setup the focusable-in-anchor
    // lesson depends on.
    const { model, Wrapper } = makeWrapper({
      renderAs: "input-submit",
      wrappers: ["link"],
      label: "Go",
    });
    await mountSuspended(Wrapper);

    model.value = { ...model.value, renderAs: "input-button" };
    await flushModelSync();

    expect(model.value.wrappers).toEqual(["link"]);
  });
});
