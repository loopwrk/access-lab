/**
 * AppBar's narrow-viewport disclosure. The desktop strip and the controls'
 * behaviour are covered elsewhere (display-controls-panel.test.ts); what's
 * worth pinning here is the wiring that makes the bottom sheet dismissable:
 *
 *   - the "Display settings" trigger opens the sheet;
 *   - the sheet hosts the display controls;
 *   - the visible, labelled close button dismisses it again.
 *
 * The close button is the researched best practice for a modal sheet (tap-
 * outside and the drag handle alone are not discoverable or keyboard /
 * screen-reader operable), so its presence and its close action are the
 * contract under test.
 *
 * UDrawer is stubbed to render its body unconditionally and to forward its
 * open state as a data attribute (Vaul's real portal + focus trap aren't
 * needed to assert the open/close wiring). useColorMode + useIsBelowDesktop
 * are mocked so the bar mounts deterministically.
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h } from "vue";
import AppBar from "~/components/AppBar.vue";

const belowDesktop = vi.hoisted(() => ({ value: true }));
mockNuxtImport("useIsBelowDesktop", () => () => belowDesktop);

const colorMode = vi.hoisted(() => ({ value: "light", preference: "light" }));
mockNuxtImport("useColorMode", () => () => colorMode);

const stubs = {
  UDrawer: {
    props: ["open", "title", "description", "ui"],
    emits: ["update:open"],
    template: `<div data-testid="drawer" :data-open="String(open)">
      <span data-testid="drawer-trigger" @click="$emit('update:open', true)"><slot /></span>
      <div data-testid="drawer-body"><slot name="body" /></div>
    </div>`,
  },
  UButton: {
    props: ["icon", "color", "variant", "block", "to"],
    emits: ["click"],
    template: `<button @click="$emit('click')"><slot /></button>`,
  },
  UFieldGroup: { template: `<div><slot /></div>` },
  UTooltip: { props: ["text"], template: `<div><slot /></div>` },
  UIcon: { props: ["name"], template: `<i />` },
};

function mount() {
  return mountSuspended(AppBar, { global: { stubs } });
}

const drawer = (w: Awaited<ReturnType<typeof mount>>) => w.get("[data-testid='drawer']");
const trigger = (w: Awaited<ReturnType<typeof mount>>) =>
  w.findAll("button").find((b) => b.text() === "Display settings");
const closeButton = (w: Awaited<ReturnType<typeof mount>>) =>
  w.find("[data-testid='drawer-body'] button[aria-label='Close']");

// Warm-up mount to dodge the documented cold-start mountSuspended flake.
beforeAll(async () => {
  await mountSuspended(defineComponent({ setup: () => () => h("div") }));
}, 60000);

beforeEach(() => {
  localStorage.clear();
  belowDesktop.value = true;
  colorMode.value = "light";
  colorMode.preference = "light";
});

describe("AppBar display-settings sheet", () => {
  it("renders the Display settings trigger", async () => {
    expect(trigger(await mount())).toBeDefined();
  });

  it("hosts the display controls inside the sheet", async () => {
    const wrapper = await mount();
    const body = wrapper.get("[data-testid='drawer-body']");
    // The panel renders its grouped controls (fieldset legends).
    expect(body.text()).toContain("Font");
    expect(body.text()).toContain("Text size");
  });

  it("opens the sheet from the trigger", async () => {
    const wrapper = await mount();
    expect(drawer(wrapper).attributes("data-open")).toBe("false");

    await trigger(wrapper)!.trigger("click");

    expect(drawer(wrapper).attributes("data-open")).toBe("true");
  });

  it("exposes a labelled close button that dismisses the sheet", async () => {
    const wrapper = await mount();
    await trigger(wrapper)!.trigger("click");
    expect(drawer(wrapper).attributes("data-open")).toBe("true");

    const close = closeButton(wrapper);
    expect(close.exists()).toBe(true);
    expect(close.attributes("aria-label")).toBe("Close");

    await close.trigger("click");

    expect(drawer(wrapper).attributes("data-open")).toBe("false");
  });
});
