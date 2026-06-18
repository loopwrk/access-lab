/**
 * Pure-function tests for the cross-component custom rules.
 *
 * These run on the host against component props (vague-label) or against the
 * iframe's box measurement (overflow). They catch failures axe-core can't:
 * vague-label is a best-practice naming check; content-overflow reasons about
 * runtime layout. Both are pure, so they run in the node unit env.
 *
 * invisible-text compares PARSED colours, so it catches equivalent colours
 * written differently (#fff vs #ffffff) — the exact set axe skips.
 */

import { describe, expect, it } from "vitest";
import { vagueLabel } from "../../app/rules/shared/vague-label";
import { invisibleText } from "../../app/rules/shared/invisible-text";
import { contentOverflow } from "../../app/rules/shared/overflow";

describe("vagueLabel", () => {
  it("fires for a vague visible label", () => {
    const result = vagueLabel.evaluate({ label: "OK" });
    expect(result?.severity).toBe("moderate");
    expect(result?.message).toContain("OK");
  });

  it("normalises case and surrounding whitespace before matching", () => {
    expect(vagueLabel.evaluate({ label: "  Click Here  " })).not.toBeNull();
  });

  it("does not fire for a meaningful verb + noun label", () => {
    expect(vagueLabel.evaluate({ label: "Save changes" })).toBeNull();
  });

  it("treats Submit as vague (the deliberate verb-noun teaching stance)", () => {
    expect(vagueLabel.evaluate({ label: "Submit" })).not.toBeNull();
  });

  it("uses the accessible name: aria-label overrides the visible label", () => {
    // Meaningful visible text but a vague aria-label → AT hears "OK" → fires.
    expect(vagueLabel.evaluate({ label: "Save changes", ariaLabel: "OK" })).not.toBeNull();
    // Vague visible text but a meaningful aria-label → AT hears the good name → clear.
    expect(vagueLabel.evaluate({ label: "OK", ariaLabel: "Delete account" })).toBeNull();
  });

  it("ignores the visible label for icon content (its name comes from aria-label)", () => {
    expect(vagueLabel.evaluate({ contentType: "icon", label: "OK" })).toBeNull();
    expect(
      vagueLabel.evaluate({ contentType: "icon", label: "OK", ariaLabel: "Submit" }),
    ).not.toBeNull();
  });

  it("does not fire when there is no effective name", () => {
    expect(vagueLabel.evaluate({})).toBeNull();
    expect(vagueLabel.evaluate({ label: "" })).toBeNull();
    expect(vagueLabel.evaluate({ label: "   " })).toBeNull();
  });

  it("declares the right metadata", () => {
    expect(vagueLabel.id).toBe("vague-label");
    expect(vagueLabel.tags).toContain("best-practice");
    expect(vagueLabel.learnTopicId).toBe("vague-label");
  });
});

describe("contentOverflow", () => {
  const box = (over: Partial<{ sw: number; cw: number; sh: number; ch: number }>) => ({
    tagName: "button",
    scrollWidth: over.sw ?? 100,
    clientWidth: over.cw ?? 100,
    scrollHeight: over.sh ?? 40,
    clientHeight: over.ch ?? 40,
    // Required by DomMeasurement; content-overflow ignores them.
    targetWidth: over.cw ?? 100,
    targetHeight: over.ch ?? 40,
  });

  it("returns null when content fits (scroll == client on both axes)", () => {
    expect(contentOverflow.evaluate(box({}))).toBeNull();
  });

  it("fires (critical) on horizontal overflow", () => {
    const result = contentOverflow.evaluate(box({ sw: 200, cw: 150 }));
    expect(result?.severity).toBe("critical");
    expect(result?.message).toContain("content width 200px exceeds container 150px");
    expect(result?.message).toContain("<button>");
  });

  it("fires on vertical overflow", () => {
    const result = contentOverflow.evaluate(box({ sh: 80, ch: 40 }));
    expect(result?.message).toContain("content height 80px exceeds container 40px");
  });

  it("reports both axes when both overflow", () => {
    const result = contentOverflow.evaluate(box({ sw: 200, cw: 150, sh: 80, ch: 40 }));
    expect(result?.message).toContain("content width 200px exceeds container 150px");
    expect(result?.message).toContain("content height 80px exceeds container 40px");
  });

  it("declares the right metadata", () => {
    expect(contentOverflow.id).toBe("content-overflow");
  });
});

describe("invisibleText", () => {
  it("fires (critical) when fg and bg are the same colour", () => {
    const result = invisibleText.evaluate({ fgText: "#000000", bg: "#000000" });
    expect(result?.severity).toBe("critical");
    expect(result?.message).toContain("#000000");
  });

  // The fix: compare parsed colours, not strings — so equivalent colours
  // written differently are caught. This is exactly the set axe skips.
  it("matches equivalent colours written differently", () => {
    expect(invisibleText.evaluate({ fgText: "#fff", bg: "#ffffff" })).not.toBeNull();
    expect(invisibleText.evaluate({ fgText: "#fff", bg: "rgb(255, 255, 255)" })).not.toBeNull();
    expect(invisibleText.evaluate({ fgText: "FFF", bg: "#ffffff" })).not.toBeNull();
    expect(invisibleText.evaluate({ fgText: "#000000ff", bg: "#000" })).not.toBeNull();
  });

  it("does not fire for distinct colours", () => {
    expect(invisibleText.evaluate({ fgText: "#000", bg: "#fff" })).toBeNull();
    expect(invisibleText.evaluate({ fgText: "#fffffe", bg: "#ffffff" })).toBeNull();
  });

  it("treats a different alpha as a different colour", () => {
    expect(invisibleText.evaluate({ fgText: "rgba(0,0,0,1)", bg: "rgba(0,0,0,0.5)" })).toBeNull();
  });

  it("falls back to a string match for colours the parser cannot understand", () => {
    expect(invisibleText.evaluate({ fgText: "red", bg: "red" })).not.toBeNull();
    expect(invisibleText.evaluate({ fgText: "red", bg: "blue" })).toBeNull();
  });

  it("does not fire when a colour is missing or empty", () => {
    expect(invisibleText.evaluate({})).toBeNull();
    expect(invisibleText.evaluate({ fgText: "#000" })).toBeNull();
    expect(invisibleText.evaluate({ fgText: "  ", bg: "  " })).toBeNull();
  });

  it("declares the right metadata", () => {
    expect(invisibleText.id).toBe("invisible-text");
    expect(invisibleText.tags).toEqual(expect.arrayContaining(["wcag2aa", "wcag143"]));
    expect(invisibleText.learnTopicId).toBe("invisible-text");
  });
});
