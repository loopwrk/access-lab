/**
 * These tests grade each rule against its TEACHING role, not just its return
 * value. The questions they pin are "does the rule fire exactly when the
 * anti-pattern is present, stay silent otherwise, and avoid telling the
 * student two overlapping things about one cause?" — because a rule that
 * over- or under-fires teaches the wrong lesson even when its arithmetic is
 * correct.
 *
 * Pure functions → node unit env. Two evaluation models live here: target-size
 * is a DomRule graded against the rendered box (see the `box` helper below),
 * while the focus and anchor rules are prop-based and receive ALREADY-RESOLVED
 * props — useInspectedComponent flattens every CssLength to a plain px number
 * via resolveProps before calling evaluate, so e.g. focusRingWidth arrives as a
 * number (2, 0), which is what those tests pass.
 */

import { describe, expect, it } from "vitest";
import type { DomMeasurement } from "../../app/rules/types";
import { targetSizeAA, targetSizeAAA } from "../../app/rules/buttons/shared/target-size";
import { focusNotVisible, focusLowContrast } from "../../app/rules/buttons/shared/focus-visible";
import { focusableInAnchor } from "../../app/rules/buttons/shared/focusable-in-anchor";

/**
 * target-size now grades the element's RENDERED border-box, delivered on
 * DomMeasurement.targetWidth / targetHeight (offsetWidth/Height, measured in
 * the iframe). That is the point of it being a DomRule: an unsized button
 * reports its real size (e.g. ~140×40), never the phantom 0×0 a prop-based
 * read produced from undefined width/height. This helper builds a measurement;
 * the overflow fields are set to "fits" since target-size ignores them.
 */
const box = (targetWidth: number, targetHeight: number): DomMeasurement => ({
  tagName: "button",
  scrollWidth: targetWidth,
  clientWidth: targetWidth,
  scrollHeight: targetHeight,
  clientHeight: targetHeight,
  targetWidth,
  targetHeight,
});

describe("targetSizeAA — the 24×24 floor (WCAG 2.5.8, Level AA)", () => {
  it("fires (serious) when the rendered box is below 24 CSS px on either axis", () => {
    const r = targetSizeAA.evaluate(box(20, 20));
    expect(r?.severity).toBe("serious");
    expect(r?.message).toContain("20 × 20px");
    expect(r?.message).toContain("AA");
    // One axis under the floor is enough to fail.
    expect(targetSizeAA.evaluate(box(30, 20))).not.toBeNull();
    expect(targetSizeAA.evaluate(box(20, 30))).not.toBeNull();
  });

  it("passes at exactly 24×24 (the boundary is inclusive)", () => {
    expect(targetSizeAA.evaluate(box(24, 24))).toBeNull();
  });

  it("grades the measured render, not declared props — a real ~140×40 button passes AA", () => {
    // The bug this conversion fixes: an unsized button used to report 0 × 0
    // from undefined props and show a phantom AA critical. Reading the rendered
    // box means a normal default button (well over 24 on both axes) is
    // correctly silent at AA, matching what the student sees in the preview.
    expect(targetSizeAA.evaluate(box(140, 40))).toBeNull();
  });

  it("declares the AA metadata the panel shows the learner", () => {
    expect(targetSizeAA.id).toBe("target-size-aa");
    expect(targetSizeAA.wcag).toContain("2.5.8");
    expect(targetSizeAA.tags).toContain("wcag22aa");
  });
});

describe("targetSizeAAA — the 44×44 goal, layered above AA (WCAG 2.5.5)", () => {
  it("fires (moderate) in the 24–43 band where AA passes but AAA does not", () => {
    const r = targetSizeAAA.evaluate(box(24, 24));
    expect(r?.severity).toBe("moderate");
    expect(r?.message).toContain("44×44");
  });

  it("passes at exactly 44×44", () => {
    expect(targetSizeAAA.evaluate(box(44, 44))).toBeNull();
  });

  it("warns on a typical default button — ≥24 but under 44 tall (the real, common case)", () => {
    // A native button is usually below 44px tall, so on a default-sized button
    // AA is clear and AAA warns. This is the accurate teaching the prop-based
    // rule could never give: it only ever saw 0 (unset) or an explicit override.
    expect(targetSizeAAA.evaluate(box(140, 40))?.severity).toBe("moderate");
  });

  // The architectural seam: AA (serious) and AAA (moderate) are mutually
  // exclusive at every size. One undersized button therefore shows ONE issue,
  // not a stacked AA+AAA pair — which is what lets the panel teach "AA is the
  // floor you must clear, AAA is the goal to aim for" instead of double-
  // counting a single cause and inflating the critical badge.
  it("stays silent while AA is failing, so the two never double-report", () => {
    expect(targetSizeAAA.evaluate(box(20, 20))).toBeNull(); // AA owns this size
    expect(targetSizeAA.evaluate(box(20, 20))).not.toBeNull();
  });

  it("fires when AA passes on both axes but one axis is still under 44", () => {
    expect(targetSizeAAA.evaluate(box(44, 30))).not.toBeNull();
  });
});

describe("focusNotVisible — only grades a focus ring the author chose to override", () => {
  it("is silent when the override is off (the browser's own ring stands)", () => {
    expect(focusNotVisible.evaluate({ focusRingEnabled: false })).toBeNull();
    expect(focusNotVisible.evaluate({})).toBeNull();
  });

  it("fires (serious) when the override is on but the ring width is 0", () => {
    // This is `outline: none` with nothing put back — the classic CSS-reset
    // mistake that strands sighted keyboard users. In the studio the
    // FocusSection seeds width=2 on enable, so this only happens when the user
    // deliberately drags the width to 0; the rule's `?? 0` fallback is just a
    // defensive backstop, not the path the UI normally produces.
    expect(focusNotVisible.evaluate({ focusRingEnabled: true, focusRingWidth: 0 })?.severity).toBe(
      "serious",
    );
  });

  it("passes once the overridden ring has a visible (>0) width", () => {
    expect(focusNotVisible.evaluate({ focusRingEnabled: true, focusRingWidth: 2 })).toBeNull();
  });

  it("declares Level AA metadata (2.4.7 Focus Visible)", () => {
    expect(focusNotVisible.wcag).toContain("2.4.7");
    expect(focusNotVisible.tags).toContain("wcag2aa");
  });
});

describe("focusLowContrast — the ring must be visible against the (white) preview page", () => {
  // The backdrop is hardcoded #ffffff because the preview iframe is always
  // white (PreviewIframe paints bg-white; the shell sets no background). So the
  // rule grades the ring against the surface it actually sits on at the
  // outline-offset — the correct comparison for WCAG 1.4.11 non-text contrast.
  it("fires (serious) for a ring under 3:1 against white (white-on-white is invisible)", () => {
    expect(
      focusLowContrast.evaluate({
        focusRingEnabled: true,
        focusRingColor: "#ffffff",
        focusRingWidth: 2,
      })?.severity,
    ).toBe("serious");
  });

  it("passes for a high-contrast ring (black on white ≈ 21:1)", () => {
    expect(
      focusLowContrast.evaluate({
        focusRingEnabled: true,
        focusRingColor: "#000000",
        focusRingWidth: 2,
      }),
    ).toBeNull();
  });

  it("is silent when the override is off or no colour is set (nothing to grade)", () => {
    expect(
      focusLowContrast.evaluate({ focusRingEnabled: false, focusRingColor: "#ffffff" }),
    ).toBeNull();
    expect(focusLowContrast.evaluate({ focusRingEnabled: true })).toBeNull();
  });

  // The severity-division seam: at width 0 the ring is absent, which is
  // focusNotVisible's job at higher severity. focusLowContrast defers (returns
  // null) so a zero-width ring surfaces as ONE serious "no indicator" issue,
  // not a confusing "no indicator" + "low contrast" pair about the same ring.
  it("defers to focusNotVisible when the ring width is 0 (no double-flag)", () => {
    expect(
      focusLowContrast.evaluate({
        focusRingEnabled: true,
        focusRingColor: "#ffffff",
        focusRingWidth: 0,
      }),
    ).toBeNull();
  });
});

describe("focusableInAnchor — fills the nested-interactive gap axe leaves open", () => {
  it("fires (serious) when the button is wrapped in an <a href>", () => {
    const r = focusableInAnchor.evaluate({ wrappers: ["link"] });
    expect(r?.severity).toBe("serious");
    expect(r?.message).toContain("anchor");
  });

  // The division of labour with axe: axe's nested-interactive DOES catch a
  // button inside a button (button children are presentational), so this rule
  // deliberately handles ONLY the anchor case, which axe stays silent on (a
  // link's children are not presentational). Pinning the button/form/none
  // nulls documents that the rule isn't trying to re-cover axe's ground —
  // remove that scoping and the studio would double-report button-in-button.
  it("does not fire for the form or button wrappers, or no wrapper", () => {
    expect(focusableInAnchor.evaluate({ wrappers: ["form"] })).toBeNull();
    expect(focusableInAnchor.evaluate({ wrappers: ["button"] })).toBeNull();
    expect(focusableInAnchor.evaluate({ wrappers: [] })).toBeNull();
    expect(focusableInAnchor.evaluate({})).toBeNull();
  });

  it("declares Level A metadata (4.1.2 Name, Role, Value)", () => {
    expect(focusableInAnchor.wcag).toContain("4.1.2");
    expect(focusableInAnchor.tags).toContain("wcag2a");
  });
});
