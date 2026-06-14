/**
 * joinStyleDeclarations formats an inline `style` value with a space after the
 * property colon and after each semicolon — the hand-written / browser
 * `style.cssText` convention. The spacing is what lets the code drawer
 * soft-wrap a long value at declaration boundaries. Shared by both
 * inline-style builders (forms + button family) so they can't drift.
 */

import { describe, expect, it } from "vitest";
import { joinStyleDeclarations } from "../../app/utils/joinStyleDeclarations";

describe("joinStyleDeclarations", () => {
  it("adds a space after each colon and semicolon", () => {
    expect(joinStyleDeclarations(["width:24px", "height:24px"])).toBe("width: 24px; height: 24px");
  });

  // No /g flag, so only the first colon — the property/value separator — is
  // spaced. No value in our set contains a colon, but this pins the contract.
  it("only spaces the property colon, not colons inside a value", () => {
    expect(joinStyleDeclarations(["background:rgb(0 0 0 / 0.5)"])).toBe(
      "background: rgb(0 0 0 / 0.5)",
    );
  });

  it("is idempotent — an already-spaced declaration is not double-spaced", () => {
    expect(joinStyleDeclarations(["width: 24px"])).toBe("width: 24px");
  });

  it("preserves the internal spaces of a shorthand value", () => {
    expect(joinStyleDeclarations(["padding:1px 1px 1px 1px"])).toBe("padding: 1px 1px 1px 1px");
  });

  it("returns an empty string for no declarations", () => {
    expect(joinStyleDeclarations([])).toBe("");
  });
});
