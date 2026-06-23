/**
 * DisplayControlsPanel is the narrow-viewport (and 400%-zoom) home for the
 * AppBar's accessibility controls, shown inside the Display settings bottom
 * sheet. The contracts worth pinning are behavioural, not visual (the CSS
 * collapse and the Vaul drawer mechanics are covered by manual/browser
 * passes):
 *
 *   - each control writes the user's choice through to the same persistence
 *     the desktop strip uses (font/size/contrast via localStorage, theme via
 *     the color-mode preference);
 *   - selection state is exposed to assistive technology via aria-pressed, so
 *     a screen-reader user can tell which font/size/theme is active and that
 *     high contrast is on.
 *
 * useColorMode is mocked so the theme assertions are deterministic (clicking
 * Light/Dark sets the preference). font/size/contrast use real useLocalStorage
 * and the document, which jsdom provides; localStorage is the source of truth
 * we read back, matching the approach in onboarding-modal.test.ts. isFontAvailable
 * is mocked because the picker hides any system font the device cannot render,
 * and happy-dom does not model the canvas text metrics that detection relies on.
 *
 * UButton/UIcon are stubbed down to a plain <button> so aria-pressed (and the
 * font-preview style) fall through to a real element we can query.
 */

import { beforeAll, beforeEach, describe, expect, it, vi } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick } from "vue";
import DisplayControlsPanel from "~/components/appbar/DisplayControlsPanel.vue";

const colorMode = vi.hoisted(() => ({ value: "light", preference: "light" }));
mockNuxtImport("useColorMode", () => () => colorMode);

// Canvas-based font detection cannot run in happy-dom, so the availability check
// is mocked. Default: every system font is available (the full picker shows).
const systemFonts = vi.hoisted(() => ({ comicSansAvailable: true }));
vi.mock("~/utils/isFontAvailable", () => ({
  isFontAvailable: (fontName: string) =>
    fontName === "Comic Sans MS" ? systemFonts.comicSansAvailable : true,
}));

const stubs = {
  UButton: {
    props: ["block", "color", "variant", "icon"],
    emits: ["click"],
    template: `<button @click="$emit('click')"><slot /></button>`,
  },
  UIcon: { props: ["name"], template: `<i />` },
};

function mount() {
  return mountSuspended(DisplayControlsPanel, { global: { stubs } });
}

function buttonByText(wrapper: Awaited<ReturnType<typeof mount>>, text: string) {
  return wrapper.findAll("button").find((b) => b.text() === text);
}

// Warm-up mount to dodge the documented cold-start mountSuspended flake.
beforeAll(async () => {
  await mountSuspended(defineComponent({ setup: () => () => h("div") }));
}, 60000);

beforeEach(() => {
  localStorage.clear();
  colorMode.value = "light";
  colorMode.preference = "light";
  systemFonts.comicSansAvailable = true;
  document.documentElement.className = "";
});

describe("DisplayControlsPanel", () => {
  it("labels each control group", async () => {
    const text = (await mount()).text();
    expect(text).toContain("Font");
    expect(text).toContain("Text size");
    expect(text).toContain("Contrast");
    expect(text).toContain("Theme");
  });

  it("offers every font option when the device can render them all", async () => {
    const wrapper = await mount();
    for (const label of ["Figtree", "Dyslexic", "Atkinson", "Comic Sans"]) {
      expect(buttonByText(wrapper, label)).toBeDefined();
    }
  });

  it("hides a font the device cannot render natively", async () => {
    systemFonts.comicSansAvailable = false;
    const wrapper = await mount();
    await nextTick();

    expect(buttonByText(wrapper, "Comic Sans")).toBeUndefined();
    for (const label of ["Figtree", "Dyslexic", "Atkinson"]) {
      expect(buttonByText(wrapper, label)).toBeDefined();
    }
  });

  it("falls back to the default font when the saved font is no longer renderable", async () => {
    localStorage.setItem("al-font-family", '"Comic Sans MS", "Comic Sans", "Comic Neue", sans-serif');
    systemFonts.comicSansAvailable = false;

    const wrapper = await mount();
    await nextTick();

    expect(localStorage.getItem("al-font-family")).toBe("Figtree Variable");
    expect(buttonByText(wrapper, "Figtree")!.attributes("aria-pressed")).toBe("true");
  });

  it("persists the chosen font and marks it pressed", async () => {
    const wrapper = await mount();
    expect(buttonByText(wrapper, "Figtree")!.attributes("aria-pressed")).toBe("true");

    await buttonByText(wrapper, "Atkinson")!.trigger("click");

    expect(localStorage.getItem("al-font-family")).toBe("Atkinson Hyperlegible");
    expect(buttonByText(wrapper, "Atkinson")!.attributes("aria-pressed")).toBe("true");
    expect(buttonByText(wrapper, "Figtree")!.attributes("aria-pressed")).toBe("false");
  });

  it("persists the chosen text size", async () => {
    const wrapper = await mount();
    expect(buttonByText(wrapper, "S")!.attributes("aria-pressed")).toBe("true");

    await buttonByText(wrapper, "L")!.trigger("click");

    expect(localStorage.getItem("al-font-size")).toBe("131.25%");
    expect(buttonByText(wrapper, "L")!.attributes("aria-pressed")).toBe("true");
  });

  it("toggles high contrast on and off", async () => {
    const wrapper = await mount();
    const toggle = buttonByText(wrapper, "High contrast")!;
    expect(toggle.attributes("aria-pressed")).toBe("false");

    await toggle.trigger("click");
    expect(localStorage.getItem("al-contrast")).toBe("high");
    expect(buttonByText(wrapper, "High contrast")!.attributes("aria-pressed")).toBe("true");

    await buttonByText(wrapper, "High contrast")!.trigger("click");
    expect(localStorage.getItem("al-contrast")).toBe("normal");
    expect(buttonByText(wrapper, "High contrast")!.attributes("aria-pressed")).toBe("false");
  });

  it("sets the color-mode preference from the theme buttons", async () => {
    const wrapper = await mount();
    expect(buttonByText(wrapper, "Light")!.attributes("aria-pressed")).toBe("true");
    expect(buttonByText(wrapper, "Dark")!.attributes("aria-pressed")).toBe("false");

    await buttonByText(wrapper, "Dark")!.trigger("click");
    expect(colorMode.preference).toBe("dark");

    await buttonByText(wrapper, "Light")!.trigger("click");
    expect(colorMode.preference).toBe("light");
  });
});
