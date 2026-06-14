/**
 * Unit tests for the Issues-panel presentation helpers. These were
 * extracted from IssueSection.vue; the display strings they point at
 * live in i18n under `issues.why.*`.
 */

import { describe, expect, it } from "vitest";
import {
  classificationFromTags,
  formatRuleId,
  issueWhyKey,
  parseFailureSummary,
} from "../../app/utils/issueFormatting";

describe("formatRuleId", () => {
  it("title-cases hyphenated rule ids", () => {
    expect(formatRuleId("target-size")).toBe("Target Size");
  });

  it("strips the trailing WCAG level suffix", () => {
    expect(formatRuleId("target-size-aaa")).toBe("Target Size");
    expect(formatRuleId("color-contrast-aa")).toBe("Color Contrast");
  });

  it("upper-cases known acronyms", () => {
    expect(formatRuleId("aria-hidden-focus")).toBe("ARIA Hidden Focus");
    expect(formatRuleId("svg-img-alt")).toBe("SVG Img Alt");
  });

  it("upper-cases the 'id' acronym", () => {
    expect(formatRuleId("duplicate-id")).toBe("Duplicate ID");
  });

  // Only a trailing `-aa` / `-aaa` is stripped — that's what merges the AA
  // and AAA target-size rules under one heading. An id with no level suffix
  // must pass through with no truncation.
  it("leaves an id without a level suffix unchanged", () => {
    expect(formatRuleId("focus-not-visible")).toBe("Focus Not Visible");
  });
});

describe("classificationFromTags", () => {
  it("returns the WCAG level from version-specific tags", () => {
    expect(classificationFromTags(["cat.forms", "wcag2a"])).toBe("A");
    expect(classificationFromTags(["wcag21aa"])).toBe("AA");
    expect(classificationFromTags(["wcag2aaa"])).toBe("AAA");
  });

  it("prefers the strictest level when several are present", () => {
    expect(classificationFromTags(["wcag2a", "wcag2aaa"])).toBe("AAA");
  });

  it("falls back to Best Practice, then null", () => {
    expect(classificationFromTags(["best-practice"])).toBe("Best Practice");
    expect(classificationFromTags(["cat.forms"])).toBeNull();
    expect(classificationFromTags([])).toBeNull();
    expect(classificationFromTags(undefined)).toBeNull();
  });
});

describe("parseFailureSummary", () => {
  it("splits directives and their bullet items", () => {
    const summary = [
      "Fix any of the following:",
      "  Element has no title attribute",
      "  Element has no placeholder attribute",
      "Fix all of the following:",
      "  - Element is in tab order",
    ].join("\n");

    expect(parseFailureSummary(summary)).toEqual([
      {
        directive: "Fix any of the following:",
        items: ["Element has no title attribute", "Element has no placeholder attribute"],
      },
      {
        directive: "Fix all of the following:",
        items: ["Element is in tab order"],
      },
    ]);
  });

  it("ignores blank lines and text before the first directive", () => {
    expect(parseFailureSummary("stray text\n\nFix any of the following:\n  item")).toEqual([
      { directive: "Fix any of the following:", items: ["item"] },
    ]);
  });

  it("strips bullet-dot markers as well as hyphens", () => {
    expect(parseFailureSummary("Fix all of the following:\n  • First\n  • Second")).toEqual([
      { directive: "Fix all of the following:", items: ["First", "Second"] },
    ]);
  });

  // A bullet line that strips down to nothing (just the marker) must not add
  // an empty item — that's the `if (item)` guard the panel relies on so it
  // never renders an empty bullet.
  it("drops a bullet line that has no text after the marker", () => {
    expect(parseFailureSummary("Fix any of the following:\n  -\n  Real item")).toEqual([
      { directive: "Fix any of the following:", items: ["Real item"] },
    ]);
  });

  it("returns an empty array when there is no directive", () => {
    expect(parseFailureSummary("just some text\nwith no directive")).toEqual([]);
  });
});

describe("issueWhyKey", () => {
  it("prefers the category tag", () => {
    expect(issueWhyKey(["cat.forms", "wcag2a"])).toBe("issues.why.catForms");
  });

  it("maps every WCAG version of a level to the same key", () => {
    expect(issueWhyKey(["wcag2a"])).toBe("issues.why.wcagLevelA");
    expect(issueWhyKey(["wcag21a"])).toBe("issues.why.wcagLevelA");
    expect(issueWhyKey(["wcag22aa"])).toBe("issues.why.wcagLevelAA");
  });

  it("falls back to the WCAG principle from a success-criterion tag", () => {
    expect(issueWhyKey(["wcag412"])).toBe("issues.why.principle4");
    expect(issueWhyKey(["wcag111"])).toBe("issues.why.principle1");
  });

  // A criterion tag whose leading principle digit is outside 1–4 matches the
  // regex but has no principle key, so the lookup falls through. Covers the
  // guard on the principle-key branch.
  it("returns null for a criterion tag with an out-of-range principle digit", () => {
    expect(issueWhyKey(["wcag555"])).toBeNull();
  });

  it("returns null when nothing matches", () => {
    expect(issueWhyKey(["something-else"])).toBeNull();
    expect(issueWhyKey([])).toBeNull();
  });
});
