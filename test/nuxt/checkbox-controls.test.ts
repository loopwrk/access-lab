/**
 * Nuxt-environment tests for `CheckboxControls`: the `renderAs → ariaChecked`
 * sync watcher, the `groupMode → parent-with-children` derive watcher, and the
 * iframe click bridge (`demo:click` / `demo:click-child`) that drives the
 * "select all" cascade and parent auto-sync. The click bridge is the heart of
 * the component and was previously untested.
 *
 * Why the Nuxt env: the component uses `defineModel`, `useI18n`,
 * `usePreviewMessage`, `useInspectorTab`, and several Nuxt auto-imports
 * (computed, watch, ref). Only a real mount inside the Nuxt runtime exercises
 * the watchers and the message handlers honestly.
 */

import { afterEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, nextTick, ref } from "vue";
import CheckboxControls from "~/components/inspected/checkbox/CheckboxControls.vue";
import type { CheckboxProps } from "~/components/inspected/checkbox/definition";

// Unmount between tests so each mount's window "message" listener is torn down
// (useEventListener cleans up on unmount) — otherwise a stale listener from a
// previous test would also react to a dispatched demo:click.
let wrapper: { unmount: () => void } | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

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
 * Two `nextTick`s wait out the two-step v-model commit: the child's
 * `model.value = …` write emits `update:modelValue`, the parent writes back to
 * the wrapper's ref, and that re-flows through the prop.
 */
async function flushModelSync() {
  await nextTick();
  await nextTick();
}

async function dispatch(data: Record<string, unknown>) {
  window.dispatchEvent(new MessageEvent("message", { data }));
  await flushModelSync();
}

describe("CheckboxControls — renderAs → ariaChecked sync watcher", () => {
  it("enables ariaChecked when switching to div-checkbox", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE_PROPS, renderAs: "input-checkbox", ariaChecked: false });
    wrapper = await mountSuspended(Wrapper);
    model.value = { ...model.value, renderAs: "div-checkbox" };
    await flushModelSync();
    expect(model.value.ariaChecked).toBe(true);
  });

  it("disables ariaChecked when switching from div-checkbox to input-checkbox", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE_PROPS, renderAs: "div-checkbox", ariaChecked: true });
    wrapper = await mountSuspended(Wrapper);
    model.value = { ...model.value, renderAs: "input-checkbox" };
    await flushModelSync();
    expect(model.value.ariaChecked).toBe(false);
  });

  it("does not touch ariaChecked when an unrelated prop changes", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE_PROPS, renderAs: "input-checkbox", ariaChecked: false });
    wrapper = await mountSuspended(Wrapper);
    model.value = { ...model.value, labelAssociation: "aria-label" };
    await flushModelSync();
    expect(model.value.ariaChecked).toBe(false);
  });

  it("does not re-fire on a no-op renderAs assignment (preserves a manual opt-in)", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE_PROPS, renderAs: "input-checkbox", ariaChecked: true });
    wrapper = await mountSuspended(Wrapper);
    model.value = { ...model.value, renderAs: "input-checkbox" };
    await flushModelSync();
    expect(model.value.ariaChecked).toBe(true);
  });
});

describe("CheckboxControls — groupMode → parent-with-children derive", () => {
  it("derives the parent from the children when entering parent-with-children", async () => {
    const { model, Wrapper } = makeWrapper({
      ...BASE_PROPS,
      groupMode: "single",
      checked: false,
      indeterminate: false,
      childChecked: [true, false, false], // 1 of 3 → indeterminate
    });
    wrapper = await mountSuspended(Wrapper);
    model.value = { ...model.value, groupMode: "parent-with-children" };
    await flushModelSync();
    expect(model.value.indeterminate).toBe(true);
    expect(model.value.checked).toBe(false);
  });
});

describe("CheckboxControls — demo:click", () => {
  it("flips checked for a standalone checkbox", async () => {
    const { model, Wrapper } = makeWrapper({ ...BASE_PROPS, groupMode: "single", checked: false });
    wrapper = await mountSuspended(Wrapper);
    await dispatch({ type: "demo:click" });
    expect(model.value.checked).toBe(true);
    await dispatch({ type: "demo:click" });
    expect(model.value.checked).toBe(false);
  });

  it("cascades to every child and clears indeterminate when the parent is clicked", async () => {
    const { model, Wrapper } = makeWrapper({
      ...BASE_PROPS,
      groupMode: "parent-with-children",
      checked: false,
      indeterminate: true,
      childChecked: [true, false, false],
    });
    wrapper = await mountSuspended(Wrapper);
    await dispatch({ type: "demo:click" });
    expect(model.value.checked).toBe(true);
    expect(model.value.indeterminate).toBe(false);
    expect(model.value.childChecked).toEqual([true, true, true]);
  });
});

describe("CheckboxControls — demo:click-child", () => {
  it("flips just the clicked child in a sibling group (no parent to sync)", async () => {
    const { model, Wrapper } = makeWrapper({
      ...BASE_PROPS,
      groupMode: "group-with-fieldset",
      childChecked: [false, false],
    });
    wrapper = await mountSuspended(Wrapper);
    await dispatch({ type: "demo:click-child", index: 1 });
    expect(model.value.childChecked).toEqual([false, true]);
  });

  it("auto-syncs the parent to checked when the click ticks the last child", async () => {
    const { model, Wrapper } = makeWrapper({
      ...BASE_PROPS,
      groupMode: "parent-with-children",
      checked: false,
      indeterminate: true, // in sync with 2-of-3
      childChecked: [true, true, false],
    });
    wrapper = await mountSuspended(Wrapper);
    await dispatch({ type: "demo:click-child", index: 2 }); // → all ticked
    expect(model.value.childChecked).toEqual([true, true, true]);
    expect(model.value.checked).toBe(true);
    expect(model.value.indeterminate).toBe(false);
  });

  it("auto-syncs the parent to unchecked when the click removes the last tick", async () => {
    const { model, Wrapper } = makeWrapper({
      ...BASE_PROPS,
      groupMode: "parent-with-children",
      checked: false,
      indeterminate: true, // in sync with 1-of-3
      childChecked: [true, false, false],
    });
    wrapper = await mountSuspended(Wrapper);
    await dispatch({ type: "demo:click-child", index: 0 }); // → none ticked
    expect(model.value.childChecked).toEqual([false, false, false]);
    expect(model.value.checked).toBe(false);
    expect(model.value.indeterminate).toBe(false);
  });

  it("preserves a manual parent override (mismatch) instead of auto-syncing", async () => {
    // children [true,false,false] derive to indeterminate, but the user has
    // forced the parent to checked=true — exactly the bug the demo surfaces.
    const { model, Wrapper } = makeWrapper({
      ...BASE_PROPS,
      groupMode: "parent-with-children",
      checked: true,
      indeterminate: false,
      childChecked: [true, false, false],
    });
    wrapper = await mountSuspended(Wrapper);
    await dispatch({ type: "demo:click-child", index: 1 });
    expect(model.value.childChecked).toEqual([true, true, false]); // child updated
    expect(model.value.checked).toBe(true); // override preserved
    expect(model.value.indeterminate).toBe(false);
  });
});
