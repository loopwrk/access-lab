/**
 * Architectural role: the iframe shell reports a trigger activation as a plain
 * `demo:activate` fact (it no longer decides what the activation MEANS). This
 * watcher is where the menu assigns meaning — flip menuOpen, which re-renders
 * the preview with or without the `hidden` attribute on the popup. Listening
 * for the fact (not `demo:click`) is what lets a type-less <button> — which the
 * shell treats as a submit elsewhere — still open the popup.
 *
 * Nuxt env: MenuTriggerControls uses defineModel, usePreviewMessage, and real
 * section components — only a live mount exercises the watcher honestly.
 */

import { afterEach, describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, nextTick, ref } from "vue";
import MenuTriggerControls from "~/components/inspected/buttons/menu-triggers/MenuTriggerControls.vue";
import type { ButtonProps } from "~/components/inspected/buttons/shared/types";

type Model = Partial<ButtonProps>;

// Unmount between tests so each component's window "message" listener is torn
// down (useEventListener cleans up on unmount) — otherwise a stale listener
// from a previous test would also react to the dispatched message.
let wrapper: { unmount: () => void } | null = null;
afterEach(() => {
  wrapper?.unmount();
  wrapper = null;
});

function makeWrapper(initial: Model) {
  const model = ref<Model>({ ...initial });
  const Wrapper = defineComponent({
    components: { MenuTriggerControls },
    setup() {
      return { model };
    },
    template: `<MenuTriggerControls v-model="model" />`,
  });
  return { model, Wrapper };
}

async function dispatch(type: string) {
  window.dispatchEvent(new MessageEvent("message", { data: { type } }));
  await nextTick();
  await nextTick();
}

describe("MenuTriggerControls — interprets the activation fact", () => {
  it("flips menuOpen on each demo:activate", async () => {
    const { model, Wrapper } = makeWrapper({
      renderAs: "button-button",
      menuBehaviour: "aria-expanded-haspopup",
      menuOpen: false,
    });
    wrapper = await mountSuspended(Wrapper);

    await dispatch("demo:activate");
    expect(model.value.menuOpen).toBe(true); // popup reveals, aria-expanded flips

    await dispatch("demo:activate");
    expect(model.value.menuOpen).toBe(false); // and hides again
  });

  it("opens even for the none behaviour — the popup still appears; only the ARIA differs", async () => {
    const { model, Wrapper } = makeWrapper({
      renderAs: "button-button",
      menuBehaviour: "none",
      menuOpen: false,
    });
    wrapper = await mountSuspended(Wrapper);

    await dispatch("demo:activate");
    expect(model.value.menuOpen).toBe(true);
  });

  it("ignores the legacy demo:click — menu has moved to the activation fact", async () => {
    const { model, Wrapper } = makeWrapper({
      renderAs: "button-button",
      menuBehaviour: "aria-expanded-haspopup",
      menuOpen: false,
    });
    wrapper = await mountSuspended(Wrapper);

    await dispatch("demo:click");
    expect(model.value.menuOpen).toBe(false);
  });
});
