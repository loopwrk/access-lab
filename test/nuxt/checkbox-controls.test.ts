/**
 * Nuxt-environment test for the `CheckboxControls` component's
 * `renderAs` → `ariaChecked` synchronisation watcher.
 *
 * Why the Nuxt env: the component uses `defineModel`, `useI18n`,
 * `usePreviewMessage`, `useInspectorTab`, and several Nuxt auto-imports
 * (computed, watch, ref). The unit env (plain node) has none of these,
 * so the only honest way to exercise the watcher is through a real
 * component mount inside the Nuxt runtime.
 *
 * What's tested: the bidirectional behaviour of the watcher. The
 * forward direction (native → div) was the original mitigation for
 * the div variant's missing-state-mechanism problem. The reverse
 * direction (div → native) is the new addition — without it, a
 * lingering `ariaChecked` from a previous div visit makes the native
 * variant fire `checkbox-aria-checked-redundant` even though the
 * user never opted in to that attribute on the native control.
 */

import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, nextTick, ref } from "vue";
import CheckboxControls from "~/components/inspected/checkbox/CheckboxControls.vue";
import type { CheckboxProps } from "~/components/inspected/checkbox/definition";

/**
 * Minimal v-model harness. CheckboxControls expects a
 * `Partial<CheckboxProps>` model; the wrapper component exposes a ref
 * for the test to mutate and read. The shape mirrors what
 * `useInspectedComponent` would seed in production — just enough
 * fields that the controls panel renders without errors.
 */
function makeWrapper(initial: Partial<CheckboxProps>) {
  const model = ref<Partial<CheckboxProps>>({ ...initial });
  const Wrapper = defineComponent({
    components: { CheckboxControls },
    setup() {
      return { model };
    },
    template: `<CheckboxControls v-model="model" />`,
  });
  return { model, Wrapper };
}

const BASE_PROPS: Partial<CheckboxProps> = {
  label: "Subscribe",
  labelAssociation: "for-id",
  groupMode: "single",
  groupItems: [],
  childChecked: [],
  checked: false,
  indeterminate: false,
  required: false,
  disabled: false,
};

/**
 * Two `nextTick`s wait out the two-step commit: the child's
 * `model.value = …` write emits `update:modelValue`, then the parent's
 * v-model handler writes back to the wrapper's ref, and the wrapper's
 * ref update re-flows back through the prop. One tick isn't always
 * enough; two is the safe upper bound for this kind of round trip.
 */
async function flushModelSync() {
  await nextTick();
  await nextTick();
}

describe("CheckboxControls — renderAs → ariaChecked sync watcher", () => {
  it("enables ariaChecked when switching to div-checkbox", async () => {
    const { model, Wrapper } = makeWrapper({
      ...BASE_PROPS,
      renderAs: "input-checkbox",
      ariaChecked: false,
    });
    await mountSuspended(Wrapper);

    model.value = { ...model.value, renderAs: "div-checkbox" };
    await flushModelSync();

    expect(model.value.ariaChecked).toBe(true);
  });

  it("disables ariaChecked when switching from div-checkbox to input-checkbox", async () => {
    const { model, Wrapper } = makeWrapper({
      ...BASE_PROPS,
      renderAs: "div-checkbox",
      ariaChecked: true,
    });
    await mountSuspended(Wrapper);

    model.value = { ...model.value, renderAs: "input-checkbox" };
    await flushModelSync();

    expect(model.value.ariaChecked).toBe(false);
  });

  it("does not touch ariaChecked when other props change without renderAs", async () => {
    // The watcher is keyed on `renderAs`. Changing an unrelated field
    // like `labelAssociation` should leave `ariaChecked` exactly where
    // the user (or the previous variant) put it.
    const { model, Wrapper } = makeWrapper({
      ...BASE_PROPS,
      renderAs: "input-checkbox",
      ariaChecked: false,
    });
    await mountSuspended(Wrapper);

    model.value = { ...model.value, labelAssociation: "aria-label" };
    await flushModelSync();

    expect(model.value.ariaChecked).toBe(false);
  });

  it("does not re-fire on a no-op renderAs assignment", async () => {
    // Writing the same value back to renderAs should not flip
    // ariaChecked. The watcher's `next === prev` guard covers this;
    // Vue normally skips the callback for unchanged values, but
    // belt-and-braces means a faulty re-render or a forced update
    // doesn't accidentally reset the user's manual ariaChecked.
    const { model, Wrapper } = makeWrapper({
      ...BASE_PROPS,
      renderAs: "input-checkbox",
      ariaChecked: true, // user manually opted in
    });
    await mountSuspended(Wrapper);

    model.value = { ...model.value, renderAs: "input-checkbox" };
    await flushModelSync();

    expect(model.value.ariaChecked).toBe(true);
  });
});
