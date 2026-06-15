/**
 * Both catch problems axe-core genuinely cannot: a plain button (valid HTML,
 * axe silent) and aria-pressed on a button (valid ARIA, axe silent — it can't
 * know the author meant a *switch*). So unlike toggle-wrong-attribute (whose
 * aria-checked is INVALID and therefore caught by axe's aria-allowed-attr),
 * NEITHER switch rule declares supersededByAxe — they are pure gap-fillers.
 * Pinning that contrast is the architectural point of this file.
 *
 * Both rules also skip the input-checkbox-switch variant entirely: that markup
 * hardcodes role="switch", so the switchBehaviour prop is irrelevant to it and
 * the rules must not fire against a control that is already a correct switch.
 *
 * Pure functions → node unit env.
 */

import { describe, expect, it } from "vitest";
import { switchNoRole } from "../../app/rules/buttons/switches/switch-no-role";
import { switchWrongAttribute } from "../../app/rules/buttons/switches/switch-wrong-attribute";

describe("switchNoRole — a switch that exposes no role or state", () => {
  it("fires (serious) when the behaviour is none", () => {
    expect(switchNoRole.evaluate({ switchBehaviour: "none" })?.severity).toBe("serious");
  });

  it("stays silent for the correct and wrong-attribute behaviours", () => {
    expect(switchNoRole.evaluate({ switchBehaviour: "role-switch" })).toBeNull();
    expect(switchNoRole.evaluate({ switchBehaviour: "aria-pressed" })).toBeNull();
    expect(switchNoRole.evaluate({})).toBeNull();
  });

  it("skips the input-checkbox-switch variant (its markup is already a correct switch)", () => {
    // The behaviour prop doesn't drive that variant's markup, so firing here
    // would flag a control that hardcodes role="switch" — a false positive.
    expect(
      switchNoRole.evaluate({ renderAs: "input-checkbox-switch", switchBehaviour: "none" }),
    ).toBeNull();
  });

  // axe is silent on a plain button (valid HTML), so this rule is the only
  // signal for "this was meant to be a switch but says nothing" — it must NOT
  // defer to axe (the contrast with toggle-wrong-attribute, which does).
  it("does NOT declare supersededByAxe — it fills a gap axe can't see", () => {
    expect(switchNoRole.supersededByAxe).toBeUndefined();
  });

  it("declares Level A metadata (4.1.2 Name, Role, Value)", () => {
    expect(switchNoRole.wcag).toContain("4.1.2");
    expect(switchNoRole.tags).toContain("wcag2a");
  });
});

describe("switchWrongAttribute — a switch built with aria-pressed", () => {
  it("fires (serious) when the behaviour is aria-pressed", () => {
    expect(switchWrongAttribute.evaluate({ switchBehaviour: "aria-pressed" })?.severity).toBe(
      "serious",
    );
  });

  it("stays silent for the correct behaviour, none, and unset", () => {
    expect(switchWrongAttribute.evaluate({ switchBehaviour: "role-switch" })).toBeNull();
    expect(switchWrongAttribute.evaluate({ switchBehaviour: "none" })).toBeNull();
    expect(switchWrongAttribute.evaluate({})).toBeNull();
  });

  it("skips the input-checkbox-switch variant", () => {
    expect(
      switchWrongAttribute.evaluate({
        renderAs: "input-checkbox-switch",
        switchBehaviour: "aria-pressed",
      }),
    ).toBeNull();
  });

  // aria-pressed is VALID ARIA on a button — axe accepts it and cannot know the
  // author meant a switch. So this rule catches a semantic mismatch axe can't,
  // and (unlike toggle-wrong-attribute, whose aria-checked is invalid) must NOT
  // defer to axe.
  it("does NOT declare supersededByAxe — aria-pressed is valid, so axe stays silent", () => {
    expect(switchWrongAttribute.supersededByAxe).toBeUndefined();
  });

  it("declares Level A metadata (4.1.2 Name, Role, Value)", () => {
    expect(switchWrongAttribute.wcag).toContain("4.1.2");
    expect(switchWrongAttribute.tags).toContain("wcag2a");
  });
});
