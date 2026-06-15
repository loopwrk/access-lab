/**
 * Clicking the rendered control posts demo:click; this watcher flips
 * switchChecked, which re-renders with the new aria-checked / :checked so a
 * screen reader announces the change. Two contracts matter:
 *   - the none gate: a plain button (no exposed state) must not acquire phantom
 *     switchChecked state;
 *   - the input-checkbox-switch exception: that variant hardcodes role="switch",
 *     so it is ALWAYS an active switch regardless of switchBehaviour — the
 *     watcher flips it even when the behaviour is none/unset.
 *
 * Nuxt env: SwitchControls uses defineModel, usePreviewMessage, and real
 * section components — only a live mount exercises the watcher honestly.
 */

import { afterEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, nextTick, ref } from "vue";
import SwitchControls from "~/components/inspected/buttons/switches/SwitchControls.vue";
import type { ButtonProps } from "~/components/inspected/buttons/shared/types";

type Model = Partial<ButtonProps>;

// Unmount between tests so each component's window "message" listener is torn
// down (useEventListener cleans up on unmount) — otherwise a stale listener
// would also react to the dispatched demo:click.
let wrapper: { unmount: () => void } | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

function makeWrapper(initial: Model) {
  const model = ref<Model>({ ...initial });
  const Wrapper = defineComponent({
    components: { SwitchControls },
    setup() {
      return { model };
    },
    template: `<SwitchControls v-model="model" />`,
  });
  return { model, Wrapper };
}

async function dispatchDemoClick() {
  // Mirrors what preview-shell.html posts when the rendered control is
  // activated in the iframe; usePreviewMessage listens on window "message".
  window.dispatchEvent(new MessageEvent("message", { data: { type: "demo:click" } }));
  await nextTick();
  await nextTick();
}

describe("SwitchControls — a demo click flips the exposed switch state", () => {
  it("toggles switchChecked on each activation for an active behaviour", async () => {
    const { model, Wrapper } = makeWrapper({
      renderAs: "button-button",
      label: "Toggle dark mode",
      switchBehaviour: "role-switch",
      switchChecked: false,
    });
    wrapper = await mountSuspended(Wrapper);

    await dispatchDemoClick();
    expect(model.value.switchChecked).toBe(true); // re-render now emits aria-checked="true"

    await dispatchDemoClick();
    expect(model.value.switchChecked).toBe(false);
  });

  it("does NOT flip when the behaviour is 'none' (a plain button has no state to expose)", async () => {
    const { model, Wrapper } = makeWrapper({
      renderAs: "button-button",
      label: "Toggle dark mode",
      switchBehaviour: "none",
      switchChecked: false,
    });
    wrapper = await mountSuspended(Wrapper);

    await dispatchDemoClick();
    expect(model.value.switchChecked).toBe(false);
  });

  it("flips the native input-checkbox-switch even when switchBehaviour is none (it is always a real switch)", async () => {
    // The variant hardcodes role="switch", so the behaviour gate is bypassed —
    // the markup is an active switch regardless of the (irrelevant) behaviour.
    const { model, Wrapper } = makeWrapper({
      renderAs: "input-checkbox-switch",
      label: "Toggle dark mode",
      switchBehaviour: "none",
      switchChecked: false,
    });
    wrapper = await mountSuspended(Wrapper);

    await dispatchDemoClick();
    expect(model.value.switchChecked).toBe(true);
  });
});
