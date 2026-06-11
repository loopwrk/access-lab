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

  it("returns null when nothing matches", () => {
    expect(issueWhyKey(["something-else"])).toBeNull();
    expect(issueWhyKey([])).toBeNull();
  });
});
