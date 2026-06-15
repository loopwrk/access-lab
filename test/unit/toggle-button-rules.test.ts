/**
 * What makes these worth testing beyond "input X → output Y" is the DIVISION
 * OF LABOUR with axe-core, which is the whole reason custom rules exist:
 *
 *   - toggle-state-missing fills a gap axe genuinely can't see: a plain button
 *     that merely LOOKS toggled (a CSS tint) but exposes no ARIA. There is no
 *     invalid markup for axe to flag, so this rule must always fire — it must
 *     NOT defer to axe.
 *   - toggle-wrong-attribute is the opposite: aria-checked on a plain button is
 *     INVALID ARIA, which axe already reports via aria-allowed-attr. So this is
 *     the one custom button rule that duplicates axe, and it declares
 *     supersededByAxe to defer (the merge-layer suppression is exercised in
 *     audit-pipeline.test.ts).
 *
 * Pinning that one rule defers and the other deliberately does not is the point
 * of this file — get it wrong and the studio either double-reports a single
 * mistake or silently drops a failure axe can't catch.
 *
 * Pure functions → node unit env.
 */

import { describe, expect, it } from "vitest";
import { toggleStateMissing } from "../../app/rules/buttons/toggle-buttons/toggle-state-missing";
import { toggleWrongAttribute } from "../../app/rules/buttons/toggle-buttons/toggle-wrong-attribute";

describe("toggleStateMissing — the visible-but-silent toggle axe can't see", () => {
  it("fires (serious) only for visual-only", () => {
    expect(toggleStateMissing.evaluate({ toggleBehaviour: "visual-only" })?.severity).toBe(
      "serious",
    );
  });

  it("stays silent for behaviours that expose state, or aren't a toggle at all", () => {
    expect(toggleStateMissing.evaluate({ toggleBehaviour: "aria-pressed" })).toBeNull();
    expect(toggleStateMissing.evaluate({ toggleBehaviour: "aria-checked" })).toBeNull();
    expect(toggleStateMissing.evaluate({ toggleBehaviour: "none" })).toBeNull();
    expect(toggleStateMissing.evaluate({})).toBeNull();
  });

  // It fills a gap axe is silent on — there is no invalid markup, just a plain
  // button with a CSS tint — so it must NOT defer to axe. If someone added
  // supersededByAxe here, a real failure axe cannot detect would be dropped.
  it("does NOT declare supersededByAxe — it is the only signal for this failure", () => {
    expect(toggleStateMissing.supersededByAxe).toBeUndefined();
  });

  it("declares Level A metadata (4.1.2 Name, Role, Value)", () => {
    expect(toggleStateMissing.wcag).toContain("4.1.2");
    expect(toggleStateMissing.tags).toContain("wcag2a");
  });
});

describe("toggleWrongAttribute — the invalid attribute axe also catches", () => {
  it("fires (serious) for aria-checked on a plain button", () => {
    expect(toggleWrongAttribute.evaluate({ toggleBehaviour: "aria-checked" })?.severity).toBe(
      "serious",
    );
  });

  it("stays silent for the correct pattern and the other behaviours", () => {
    expect(toggleWrongAttribute.evaluate({ toggleBehaviour: "aria-pressed" })).toBeNull();
    expect(toggleWrongAttribute.evaluate({ toggleBehaviour: "visual-only" })).toBeNull();
    expect(toggleWrongAttribute.evaluate({ toggleBehaviour: "none" })).toBeNull();
    expect(toggleWrongAttribute.evaluate({})).toBeNull();
  });

  // The deferral contract: aria-checked is INVALID on role=button, so axe's
  // aria-allowed-attr already reports it. This rule still fires (so it covers
  // the case when axe is unavailable) but declares the axe rule that supersedes
  // it, letting the merge layer drop the duplicate (suppression tested in
  // audit-pipeline.test.ts). This is the one custom button rule that defers.
  it("declares supersededByAxe: aria-allowed-attr (defers rather than double-reporting)", () => {
    expect(toggleWrongAttribute.supersededByAxe).toEqual(["aria-allowed-attr"]);
  });

  it("declares Level A metadata (4.1.2 Name, Role, Value)", () => {
    expect(toggleWrongAttribute.wcag).toContain("4.1.2");
    expect(toggleWrongAttribute.tags).toContain("wcag2a");
  });
});
