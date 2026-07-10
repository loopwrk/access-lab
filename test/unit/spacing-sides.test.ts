/**
 * Formatting helpers behind the reveal-on-take-over fact lines. The visible
 * readout and the seeded control values must describe the same box, so the
 * formatting (and the uniform check that picks between the single-value and
 * four-value fact line) is pinned here.
 *
 * Pure functions → node unit env.
 */

import { describe, expect, it } from "vitest";
import {
  formatPxReadout,
  formatSideCss,
  formatSidesCssText,
  sidesUniform,
} from "../../app/utils/spacingSides";

describe("formatPxReadout", () => {
  it("formats whole pixels with the spaced readout unit", () => {
    expect(formatPxReadout(124)).toBe("124 px");
  });

  it("trims long fractions to two decimal places", () => {
    expect(formatPxReadout(13.333333)).toBe("13.33 px");
  });

  it("drops trailing zeros", () => {
    expect(formatPxReadout(2.5)).toBe("2.5 px");
    expect(formatPxReadout(2.0)).toBe("2 px");
  });
});

describe("formatSideCss", () => {
  it("serialises like CSS, without a space", () => {
    expect(formatSideCss(6)).toBe("6px");
  });
});

describe("formatSidesCssText", () => {
  it("lists all four sides in CSS top/right/bottom/left order", () => {
    expect(formatSidesCssText({ top: 1, right: 6, bottom: 2, left: 8 })).toBe(
      "1px 6px 2px 8px",
    );
  });

  it("does not collapse repeated values — the fact line stays explicit", () => {
    expect(formatSidesCssText({ top: 1, right: 6, bottom: 1, left: 6 })).toBe(
      "1px 6px 1px 6px",
    );
  });
});

describe("sidesUniform", () => {
  it("is true when every side matches", () => {
    expect(sidesUniform({ top: 2, right: 2, bottom: 2, left: 2 })).toBe(true);
  });

  it("is false for the asymmetric UA button padding", () => {
    expect(sidesUniform({ top: 1, right: 6, bottom: 1, left: 6 })).toBe(false);
  });
});
