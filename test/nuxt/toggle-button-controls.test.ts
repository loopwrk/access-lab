/**
 * Architectural role: clicking the rendered button in the iframe posts
 * `demo:click`; this watcher flips togglePressed, which re-renders the preview
 * with the new aria-pressed value and the pressed-state class — so a real
 * screen reader announces the change on activation. That round-trip is the
 * difference between a toggle that merely looks pressed and one whose state is
 * actually exposed. The guard for the "none" behaviour matters too: a plain
 * button must not silently acquire toggle state it never advertised.
 *
 * Nuxt env: ToggleButtonControls uses defineModel, usePreviewMessage, and real
 * section components — only a live mount exercises the watcher honestly.
 */

import { afterEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, nextTick, ref } from "vue";
import ToggleButtonControls from "~/components/inspected/buttons/toggle-buttons/ToggleButtonControls.vue";
import type { ButtonProps } from "~/components/inspected/buttons/shared/types";

type Model = Partial<ButtonProps>;

// Unmount between tests so each component's window "message" listener is torn
// down (useEventListener cleans up on unmount) — otherwise a stale listener
// from a previous test would also react to the dispatched demo:click.
let wrapper: { unmount: () => void } | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

function makeWrapper(initial: Model) {
  const model = ref<Model>({ ...initial });
  const Wrapper = defineComponent({
    components: { ToggleButtonControls },
    setup() {
      return { model };
    },
    template: `<ToggleButtonControls v-model="model" />`,
  });
  return { model, Wrapper };
}

async function dispatchDemoClick() {
  // Mirrors what preview-shell.html posts when the inspected button is
  // activated inside the iframe; usePreviewMessage listens on window "message".
  window.dispatchEvent(new MessageEvent("message", { data: { type: "demo:click" } }));
  await nextTick();
  await nextTick();
}

describe("ToggleButtonControls — a demo click flips the exposed pressed state", () => {
  it("toggles togglePressed on each activation for an active toggle behaviour", async () => {
    const { model, Wrapper } = makeWrapper({
      renderAs: "button-button",
      label: "Bold",
      toggleBehaviour: "aria-pressed",
      togglePressed: false,
    });
    wrapper = await mountSuspended(Wrapper);

    await dispatchDemoClick();
    expect(model.value.togglePressed).toBe(true); // re-render now emits aria-pressed="true"

    await dispatchDemoClick();
    expect(model.value.togglePressed).toBe(false); // and back, so AT hears each change
  });

  it("does NOT flip togglePressed when the behaviour is 'none' (a plain button has no state to toggle)", async () => {
    const { model, Wrapper } = makeWrapper({
      renderAs: "button-button",
      label: "Bold",
      toggleBehaviour: "none",
      togglePressed: false,
    });
    wrapper = await mountSuspended(Wrapper);

    await dispatchDemoClick();
    expect(model.value.togglePressed).toBe(false);
  });
});
