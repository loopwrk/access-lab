/**
 * The onboarding tour's Mini step-visuals are static, decorative reductions of
 * real studio surfaces. They carry no logic, so these are smoke tests: each
 * mounts without throwing and reuses the real surface's vocabulary (the same
 * i18n labels the studio uses), which is the property that keeps them faithful.
 * Code snippets render as visible text (entity-encoded / interpolation-escaped).
 *
 * UIcon/UBadge are stubbed (icon loading + badge theming aren't under test).
 */

import { describe, expect, it } from "vitest";
import { mockNuxtImport, mountSuspended } from "@nuxt/test-utils/runtime";
import MiniSidebar from "~/components/onboarding/MiniSidebar.vue";
import MiniVariantPicker from "~/components/onboarding/MiniVariantPicker.vue";
import MiniControls from "~/components/onboarding/MiniControls.vue";
import MiniCounts from "~/components/onboarding/MiniCounts.vue";
import MiniIssue from "~/components/onboarding/MiniIssue.vue";
import MiniLearn from "~/components/onboarding/MiniLearn.vue";
import MiniCode from "~/components/onboarding/MiniCode.vue";

// MiniCounts self-animates on a timer unless reduced motion is preferred; mock it
// to "reduce" so these smoke tests stay static and don't leave timers pending.
mockNuxtImport("usePreferredReducedMotion", () => () => ({ value: "reduce" }));

const stubs = {
  UIcon: { props: ["name"], template: "<i />" },
  UBadge: { props: ["color", "variant", "size", "icon", "ui"], template: "<span><slot /></span>" },
};

const mount = (component: unknown) => mountSuspended(component as never, { global: { stubs } });

describe("onboarding Mini visuals", () => {
  it("MiniSidebar reuses the nav labels with one item active", async () => {
    const w = await mount(MiniSidebar);
    expect(w.text()).toContain("Buttons");
    expect(w.text()).toContain("Action buttons");
    expect(w.text()).toContain("Toggle buttons");
  });

  it("MiniVariantPicker reuses the picker vocabulary + the checkbox variant copy", async () => {
    const w = await mount(MiniVariantPicker);
    expect(w.text()).toContain("Markup");
    expect(w.text()).toContain("Render as");
    expect(w.text()).toContain("Recommended");
    expect(w.text()).toContain('<input type="checkbox">');
    expect(w.text()).toContain('<div role="checkbox">');
    // reuses the real checkbox variant status note
    expect(w.text()).toContain("The native checkbox");
  });

  it("MiniControls reuses the controls labels", async () => {
    const w = await mount(MiniControls);
    expect(w.text()).toContain("Button label");
    expect(w.text()).toContain("Background");
    expect(w.text()).toContain("Focus indicator");
  });

  it("MiniCounts reuses the counter nouns", async () => {
    const w = await mount(MiniCounts);
    expect(w.text()).toContain("critical");
    expect(w.text()).toContain("warnings");
    expect(w.text()).toContain("passing");
  });

  it("MiniIssue reuses the issue/contrast vocabulary", async () => {
    const w = await mount(MiniIssue);
    expect(w.text()).toContain("color-contrast");
    expect(w.text()).toContain("AA");
    expect(w.text()).toContain("Why it matters");
  });

  it("MiniLearn reuses the pinned heading with a nav label", async () => {
    const w = await mount(MiniLearn);
    expect(w.text()).toContain("Relevant to Action buttons");
  });

  it("MiniCode reuses the code-drawer copy labels", async () => {
    const w = await mount(MiniCode);
    expect(w.text()).toContain("Copy in-line");
    expect(w.text()).toContain("Copy with classes");
    expect(w.text()).toContain('<button type="button">Trigger click event</button>');
  });
});
