/**
 * Pure-math tests for the contrast engine (the `_internal` seam). This engine
 * is load-bearing: it drives the ContrastBadge the tool teaches with AND two
 * custom rules (placeholder-contrast, focus-visible) via `_internal.computeRatio`.
 */

import { describe, expect, it } from "vitest";
import { _internal } from "../../app/composables/useContrast";

const {
  parseColor,
  flatten,
  relativeLuminance,
  wcag2ContrastRatio,
  roundRatio,
  isLargeText,
  bucketVerdict,
  computeRatio,
} = _internal;

const ratioOf = (fg: string, bg: string, backdrop = "#ffffff") =>
  computeRatio(fg, bg, { fontSizePx: 16, bold: false, pageBackdrop: backdrop, algorithm: "wcag2" });

describe("parseColor", () => {
  it("expands short hex and parses full hex", () => {
    expect(parseColor("#fff")).toEqual({ r: 1, g: 1, b: 1, a: 1 });
    expect(parseColor("#000000")).toEqual({ r: 0, g: 0, b: 0, a: 1 });
  });

  it("reads the alpha channel from 8-digit hex", () => {
    const c = parseColor("#ff000080");
    expect(c?.r).toBe(1);
    expect(c?.g).toBe(0);
    expect(c?.a).toBeCloseTo(0.502, 3);
  });

  it("parses rgb(), comma rgba(), and space/slash/percent syntaxes", () => {
    expect(parseColor("rgb(255, 0, 0)")).toEqual({ r: 1, g: 0, b: 0, a: 1 });
    expect(parseColor("rgba(0,0,0,0.5)")).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
    expect(parseColor("rgb(0 0 0 / 50%)")).toEqual({ r: 0, g: 0, b: 0, a: 0.5 });
  });

  it("returns null for unparseable input (named colours are not supported)", () => {
    expect(parseColor("")).toBeNull();
    expect(parseColor("nope")).toBeNull();
    expect(parseColor("red")).toBeNull();
  });
});

describe("relativeLuminance + wcag2ContrastRatio", () => {
  it("luminance is 1 for white and 0 for black", () => {
    expect(relativeLuminance({ r: 1, g: 1, b: 1 })).toBe(1);
    expect(relativeLuminance({ r: 0, g: 0, b: 0 })).toBe(0);
  });

  it("black on white is the maximum 21:1", () => {
    expect(wcag2ContrastRatio({ r: 0, g: 0, b: 0 }, { r: 1, g: 1, b: 1 })).toBeCloseTo(21, 5);
  });
});

describe("flatten (alpha compositing)", () => {
  it("alpha 0 yields the backdrop, alpha 1 yields the colour, 0.5 the midpoint", () => {
    const white = { r: 1, g: 1, b: 1 };
    expect(flatten({ r: 0, g: 0, b: 0, a: 0 }, white)).toEqual(white);
    expect(flatten({ r: 0, g: 0, b: 0, a: 1 }, white)).toEqual({ r: 0, g: 0, b: 0 });
    expect(flatten({ r: 0, g: 0, b: 0, a: 0.5 }, white)).toEqual({ r: 0.5, g: 0.5, b: 0.5 });
  });
});

describe("isLargeText", () => {
  it("treats >=24px as large, and >=18.67px as large only when bold", () => {
    expect(isLargeText(24, false)).toBe(true);
    expect(isLargeText(23.99, false)).toBe(false);
    expect(isLargeText(18.67, true)).toBe(true);
    expect(isLargeText(18.67, false)).toBe(false);
    expect(isLargeText(18.66, true)).toBe(false);
  });
});

describe("roundRatio (the round-then-compare fix)", () => {
  it("rounds to 2 decimal places", () => {
    expect(roundRatio(4.497)).toBe(4.5);
    expect(roundRatio(4.494)).toBe(4.49);
    expect(roundRatio(20.999)).toBe(21);
  });
});

describe("bucketVerdict thresholds", () => {
  it("buckets normal text at 4.5 (AA) and 7 (AAA), with AALarge between 3 and 4.5", () => {
    expect(bucketVerdict(7, 16, false)).toBe("AAA");
    expect(bucketVerdict(6.99, 16, false)).toBe("AA");
    expect(bucketVerdict(4.5, 16, false)).toBe("AA");
    expect(bucketVerdict(4.49, 16, false)).toBe("AALarge");
    expect(bucketVerdict(3, 16, false)).toBe("AALarge");
    expect(bucketVerdict(2.99, 16, false)).toBe("Fail");
  });

  it("buckets large text at the relaxed 3 (AA) and 4.5 (AAA) thresholds", () => {
    expect(bucketVerdict(4.5, 24, false)).toBe("AAA");
    expect(bucketVerdict(3, 24, false)).toBe("AA");
    expect(bucketVerdict(2.99, 24, false)).toBe("Fail");
  });
});

describe("displayed ratio and verdict never contradict (the bug this fixes)", () => {
  it("a raw 4.497 rounds to 4.50 and reads as AA, not AALarge", () => {
    const r = roundRatio(4.497);
    expect(r).toBe(4.5);
    expect(r.toFixed(2)).toBe("4.50"); // what the badge shows
    expect(bucketVerdict(r, 16, false)).toBe("AA"); // what the badge says
  });

  it("a raw 4.494 rounds to 4.49 and stays AALarge", () => {
    const r = roundRatio(4.494);
    expect(r).toBe(4.49);
    expect(bucketVerdict(r, 16, false)).toBe("AALarge");
  });

  it("computeRatio always returns a 2-dp value, so display == comparison by construction", () => {
    for (const [fg, bg] of [
      ["#777", "#ffffff"],
      ["#123456", "#abcdef"],
      ["#000", "#fff"],
    ]) {
      const r = ratioOf(fg!, bg!);
      expect(r).toBe(roundRatio(r)); // idempotent ⇒ already rounded to 2 dp
    }
  });
});

describe("computeRatio", () => {
  it("returns 21 for black on white and 1 for identical colours", () => {
    expect(ratioOf("#000", "#fff")).toBe(21);
    expect(ratioOf("#777", "#777")).toBe(1);
  });

  it("composites a translucent foreground over the (white) page backdrop", () => {
    // Fully transparent foreground resolves to the white backdrop → white on
    // white → ratio 1. This pins the app-specific bg-over-backdrop cascade that
    // generic libraries omit.
    expect(ratioOf("rgba(0,0,0,0)", "#ffffff")).toBe(1);
  });

  it("composites a translucent background over the page backdrop", () => {
    // Transparent background resolves to white, so black text reads as 21:1.
    expect(ratioOf("#000", "rgba(255,255,255,0)")).toBe(21);
  });

  it("returns 1 when a colour cannot be parsed (no contrast determinable)", () => {
    expect(ratioOf("garbage", "#fff")).toBe(1);
  });
});
