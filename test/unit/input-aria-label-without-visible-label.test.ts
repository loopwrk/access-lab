/**
 * Fills a gap axe leaves: `aria-label` DOES give an accessible name, so axe's
 * `label` rule passes — but sighted users see an unlabelled field. So this rule
 * must NOT defer to axe. The graded contract: it fires only in the aria-label
 * mode, softening from serious to moderate for the one case where a visible cue
 * exists (a search input with its magnifying-glass icon), and staying silent
 * for every mode that has a real visible label. Pure function → node unit env.
 */

import { describe, expect, it } from "vitest";
import { ariaLabelWithoutVisibleLabel } from "../../app/rules/input/aria-label-without-visible-label";

const evaluate = (props: Record<string, unknown>) => ariaLabelWithoutVisibleLabel.evaluate(props);

describe("ariaLabelWithoutVisibleLabel — only in aria-label mode", () => {
  it("fires (serious) when aria-label is the only accessible name", () => {
    expect(evaluate({ labelAssociation: "aria-label" })?.severity).toBe("serious");
  });

  it("stays silent for every mode with a real visible label (and when unset)", () => {
    for (const mode of ["for-id", "wrapping", "none", "title"]) {
      expect(evaluate({ labelAssociation: mode })).toBeNull();
    }
    expect(evaluate({})).toBeNull();
  });
});

describe("ariaLabelWithoutVisibleLabel — the search-icon exception", () => {
  it("softens to moderate for a search input with the visible magnifying-glass icon", () => {
    expect(
      evaluate({ labelAssociation: "aria-label", renderAs: "search", showSearchIcon: true })
        ?.severity,
    ).toBe("moderate");
  });

  it("stays serious for a search input WITHOUT the icon (no visible cue)", () => {
    expect(
      evaluate({ labelAssociation: "aria-label", renderAs: "search", showSearchIcon: false })
        ?.severity,
    ).toBe("serious");
  });

  it("only applies to search — a text input with showSearchIcon stays serious", () => {
    expect(
      evaluate({ labelAssociation: "aria-label", renderAs: "text", showSearchIcon: true })?.severity,
    ).toBe("serious");
  });
});

describe("ariaLabelWithoutVisibleLabel — metadata", () => {
  it("does NOT defer to axe (aria-label is a valid name, so axe is silent)", () => {
    expect(ariaLabelWithoutVisibleLabel.supersededByAxe).toBeUndefined();
  });

  it("declares best-practice metadata and the accessible-name learn topic", () => {
    expect(ariaLabelWithoutVisibleLabel.id).toBe("input-aria-label-without-visible-label");
    expect(ariaLabelWithoutVisibleLabel.tags).toContain("best-practice");
    expect(ariaLabelWithoutVisibleLabel.learnTopicId).toBe("accessible-name");
  });
});
