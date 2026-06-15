/**
 * Tests for the unit-conversion engine behind the controls + the rem demo.
 *
 * The load-bearing design is the DUAL REFERENCE SYSTEM:
 *   - lengthToPx / fromPx / convertLength / resolveProps resolve rem against
 *     the *simulated* root (`simulatedRootPx`) — what the iframe actually
 *     renders and what the custom rules evaluate.
 *   - lengthToSliderPx / fromSliderPx / displayStep use a *fixed 16px*
 *     reference so the slider geometry stays put while the rem-baseline slider
 *     moves.
 * If those two were ever unified, dragging the rem-baseline would visually
 * shift every other slider — so the divergence is pinned explicitly below.
 *
 * Nuxt env: the composable holds `simulatedRootPx` in `useState`, so it needs a
 * real Nuxt context. We seed the root per-test (useState is shared within the
 * file) to avoid cross-test leakage.
 */

import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h } from "vue";
import { useUnitConversion } from "~/composables/useUnitConversion";

async function setupUnitConversion(rootPx = 16) {
  let api!: ReturnType<typeof useUnitConversion>;
  const Wrapper = defineComponent({
    setup() {
      api = useUnitConversion();
      return () => h("div");
    },
  });
  await mountSuspended(Wrapper);
  api.simulatedRootPx.value = rootPx;
  return api;
}

describe("lengthToPx / fromPx (against the simulated root)", () => {
  it("resolves rem against the root and passes px through", async () => {
    const u = await setupUnitConversion(16);
    expect(u.lengthToPx({ value: 1.5, unit: "rem" })).toBe(24);
    expect(u.lengthToPx({ value: 24, unit: "px" })).toBe(24);
    expect(u.lengthToPx(null)).toBe(0);
    expect(u.lengthToPx(undefined)).toBe(0);
  });

  it("rem resolution follows a non-default simulated root", async () => {
    const u = await setupUnitConversion(20);
    expect(u.lengthToPx({ value: 1, unit: "rem" })).toBe(20);
    expect(u.fromPx(20, "rem")).toEqual({ value: 1, unit: "rem" });
  });

  it("rounds px to integers and rem to 2 dp", async () => {
    const u = await setupUnitConversion(16);
    expect(u.fromPx(24.3, "px")).toEqual({ value: 24, unit: "px" });
    expect(u.fromPx(25, "rem")).toEqual({ value: 1.56, unit: "rem" }); // 25/16 = 1.5625
  });
});

describe("dual reference: simulated root vs fixed 16px slider", () => {
  it("slider helpers stay anchored to 16px while lengthToPx tracks the root", async () => {
    const u = await setupUnitConversion(20);
    // Same 1rem value: rendered px follows the root (20), slider px does not (16).
    expect(u.lengthToPx({ value: 1, unit: "rem" })).toBe(20);
    expect(u.lengthToSliderPx({ value: 1, unit: "rem" })).toBe(16);
    // And the inverse diverges too: 16px → 0.8rem by the root, 1rem by the slider.
    expect(u.fromPx(16, "rem")).toEqual({ value: 0.8, unit: "rem" });
    expect(u.fromSliderPx(16, "rem")).toEqual({ value: 1, unit: "rem" });
  });

  it("displayStep scales a px step into rem against the fixed 16px reference", async () => {
    const u = await setupUnitConversion(20); // root is irrelevant to displayStep
    expect(u.displayStep(8, "rem")).toBe(0.5);
    expect(u.displayStep(8, "px")).toBe(8);
  });
});

describe("convertLength (preserves the rendered size across a unit toggle)", () => {
  it("converts px <-> rem against the simulated root", async () => {
    const u = await setupUnitConversion(16);
    expect(u.convertLength({ value: 24, unit: "px" }, "rem")).toEqual({ value: 1.5, unit: "rem" });
    expect(u.convertLength({ value: 1.5, unit: "rem" }, "px")).toEqual({ value: 24, unit: "px" });
  });

  it("returns the value unchanged when the unit already matches", async () => {
    const u = await setupUnitConversion(16);
    expect(u.convertLength({ value: 24, unit: "px" }, "px")).toEqual({ value: 24, unit: "px" });
  });

  it("keeps the rendered px constant across the toggle at a non-default root", async () => {
    const u = await setupUnitConversion(20);
    const asRem = u.convertLength({ value: 40, unit: "px" }, "rem");
    expect(asRem).toEqual({ value: 2, unit: "rem" });
    expect(u.lengthToPx(asRem)).toBe(40); // round-trips back to the same rendered size
  });
});

describe("resolveProps (the rem demo drives what the rules see)", () => {
  it("flattens CssLength props to px against the root, leaving other props untouched", async () => {
    const u = await setupUnitConversion(16);
    expect(
      u.resolveProps({
        width: { value: 2.75, unit: "rem" },
        height: { value: 20, unit: "px" },
        label: "Go",
        count: 5,
      }),
    ).toEqual({ width: 44, height: 20, label: "Go", count: 5 });
  });

  it("a smaller simulated root shrinks what the rules evaluate", async () => {
    // 2.75rem is 44px at root 16 (passes AAA target size) but 22px at root 8 —
    // the rem-baseline slider changes the rule verdicts through resolveProps.
    const u = await setupUnitConversion(8);
    expect(u.resolveProps({ width: { value: 2.75, unit: "rem" } })).toEqual({ width: 22 });
  });
});

describe("hasRem / isCssLength", () => {
  it("hasRem detects any rem-unit CssLength among the props", async () => {
    const u = await setupUnitConversion(16);
    expect(u.hasRem({ a: { value: 1, unit: "rem" }, b: { value: 2, unit: "px" } })).toBe(true);
    expect(u.hasRem({ a: { value: 2, unit: "px" } })).toBe(false);
    expect(u.hasRem({ a: "text", b: 5 })).toBe(false);
  });

  it("isCssLength accepts a {numeric value, unit} shape and rejects others", async () => {
    const u = await setupUnitConversion(16);
    expect(u.isCssLength({ value: 1, unit: "px" })).toBe(true);
    expect(u.isCssLength({ value: 1.5, unit: "rem" })).toBe(true);
    expect(u.isCssLength(null)).toBe(false);
    expect(u.isCssLength(5)).toBe(false);
    expect(u.isCssLength("16px")).toBe(false);
    expect(u.isCssLength({ value: 1 })).toBe(false); // missing unit
    expect(u.isCssLength({ value: "x", unit: "px" })).toBe(false); // value not numeric
  });
});

describe("rounding contract (rem round-trips are approximate)", () => {
  it("px -> rem -> px is not exactly lossless because rem rounds to 2 dp", async () => {
    const u = await setupUnitConversion(16);
    const asRem = u.fromPx(25, "rem"); // 1.5625 -> 1.56
    expect(asRem).toEqual({ value: 1.56, unit: "rem" });
    expect(u.lengthToPx(asRem)).toBe(24.96); // not 25
  });
});
