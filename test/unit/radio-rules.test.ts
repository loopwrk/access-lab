/**
 * The radio group-no-fieldset rule — the same gap axe leaves for checkboxes:
 * mutually-exclusive radios with no <fieldset>/<legend> read as valid
 * individual controls, so axe stays silent while the group question is lost.
 * It must NOT defer to axe. Pure function → node unit env.
 */

import { describe, expect, it } from "vitest";
import { radioGroupNoFieldset } from "../../app/rules/radio/group-no-fieldset";

describe("radioGroupNoFieldset", () => {
  it("fires (serious) only for the group-no-fieldset mode", () => {
    expect(radioGroupNoFieldset.evaluate({ groupMode: "group-no-fieldset" })?.severity).toBe(
      "serious",
    );
  });

  it("stays silent for the correct fieldset mode, and when unset", () => {
    expect(radioGroupNoFieldset.evaluate({ groupMode: "group-with-fieldset" })).toBeNull();
    expect(radioGroupNoFieldset.evaluate({})).toBeNull();
  });

  it("does NOT defer to axe (bare radios have valid names; the group is the gap)", () => {
    expect(radioGroupNoFieldset.supersededByAxe).toBeUndefined();
  });

  it("declares Level A metadata (1.3.1 Info and Relationships)", () => {
    expect(radioGroupNoFieldset.id).toBe("radio-group-no-fieldset");
    expect(radioGroupNoFieldset.wcag).toContain("1.3.1");
    expect(radioGroupNoFieldset.tags).toContain("wcag2a");
  });
});
