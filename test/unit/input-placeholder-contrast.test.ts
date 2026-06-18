/**
 * Catches the low-contrast placeholder axe-core misses: placeholders render via
 * the `::placeholder` pseudo-element with no DOM text node, so axe's
 * color-contrast pass has nothing to grab and they ship unnoticed. This rule
 * reuses the same `useContrast._internal` math the badge uses, so the studio's
 * verdict and this rule never disagree. The contract worth pinning: it grades
 * the placeholder colour against the input's *own* background (defaulting to
 * white), and only when a placeholder text + a custom placeholder colour are
 * both present. Pure function → node unit env.
 */

import { describe, expect, it } from "vitest";
import { placeholderContrast } from "../../app/rules/input/placeholder-contrast";

describe("placeholderContrast", () => {
  it("fires (serious) for a low-contrast placeholder on the default white background", () => {
    const result = placeholderContrast.evaluate({
      placeholder: "Enter value",
      placeholderStyle: { fgText: "#999999" }, // ~2.85:1 on white
    });
    expect(result?.severity).toBe("serious");
    expect(result?.message).toContain("#999999");
    expect(result?.message).toContain("4.5:1");
  });

  it("stays silent when the placeholder colour clears 4.5:1", () => {
    expect(
      placeholderContrast.evaluate({
        placeholder: "Enter value",
        placeholderStyle: { fgText: "#000000" }, // 21:1 on white
      }),
    ).toBeNull();
  });

  it("grades against the input's OWN background when one is set", () => {
    // white-on-white = 1:1
    expect(
      placeholderContrast.evaluate({
        placeholder: "x",
        bg: "#ffffff",
        placeholderStyle: { fgText: "#ffffff" },
      })?.severity,
    ).toBe("serious");
    // near-black on black also fails
    expect(
      placeholderContrast.evaluate({
        placeholder: "x",
        bg: "#000000",
        placeholderStyle: { fgText: "#111111" },
      })?.severity,
    ).toBe("serious");
  });

  it("does not fire without a placeholder, or without a custom placeholder colour", () => {
    expect(placeholderContrast.evaluate({ placeholderStyle: { fgText: "#999999" } })).toBeNull();
    expect(placeholderContrast.evaluate({ placeholder: "Enter value" })).toBeNull();
    expect(placeholderContrast.evaluate({ placeholder: "Enter value", placeholderStyle: {} })).toBeNull();
  });

  it("declares Level AA contrast metadata", () => {
    expect(placeholderContrast.id).toBe("input-placeholder-contrast");
    expect(placeholderContrast.tags).toEqual(expect.arrayContaining(["wcag2aa", "wcag143"]));
  });
});
