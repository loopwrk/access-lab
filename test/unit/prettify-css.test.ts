/**
 * prettifyCss formats only the minified CSS shapes the studio actually
 * injects: simple rules, pseudo-class rules, and pseudo-element rules. It is
 * deliberately NOT a general CSS formatter (no media queries, no nested
 * at-rules, no comments) — see the note in the source. The code drawer shows
 * its output to students, so the layout is part of the lesson and worth
 * pinning. Note it does not normalise spacing inside a declaration
 * (`color:red` stays `color:red`, not `color: red`).
 */

import { describe, expect, it } from "vitest";
import { prettifyCss } from "../../app/utils/prettifyCss";

describe("prettifyCss", () => {
  it("returns an empty string for blank input", () => {
    expect(prettifyCss("")).toBe("");
    expect(prettifyCss("   ")).toBe("");
  });

  it("expands a single rule onto indented lines", () => {
    expect(prettifyCss(".x{color:red}")).toBe(".x {\n  color:red;\n}");
  });

  it("keeps multiple declarations and separates rules with a blank line", () => {
    expect(prettifyCss(".a{color:red;background:blue}.b{margin:0}")).toBe(
      ".a {\n  color:red;\n  background:blue;\n}\n\n.b {\n  margin:0;\n}",
    );
  });

  it("preserves pseudo-element selectors (the ::placeholder shape the studio emits)", () => {
    expect(prettifyCss("#al-input::placeholder{color:#999}")).toBe(
      "#al-input::placeholder {\n  color:#999;\n}",
    );
  });

  it("drops rules that have no declarations", () => {
    expect(prettifyCss(".empty{}")).toBe("");
  });
});
