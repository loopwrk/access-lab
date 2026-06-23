/**
 * The font picker hides any option whose required system font is missing, so a
 * device that cannot render Comic Sans MS (iOS, Android) never offers it. These
 * tests pin the Comic Sans entry's metadata and the two pure helpers that drive
 * the filtering, independent of the canvas detection or the Nuxt wiring.
 */

import { describe, expect, it } from "vitest";
import {
  fontOptions,
  detectUnavailableSystemFonts,
  filterAvailableFonts,
} from "../../app/utils/displayControlOptions";

describe("fontOptions", () => {
  it("marks Comic Sans as depending on the Comic Sans MS system font", () => {
    const comicSans = fontOptions.find((option) => option.label === "Comic Sans");
    expect(comicSans?.requiresSystemFont).toBe("Comic Sans MS");
  });

  it("falls back to self-hosted Comic Neue then sans-serif, never cursive", () => {
    const comicSans = fontOptions.find((option) => option.label === "Comic Sans");
    expect(comicSans?.value).not.toContain("cursive");
    // Comic Neue is the bundled net before the generic family, so a leaked button
    // on a device without Comic Sans MS still renders a Comic-style face.
    expect(comicSans?.value).toContain("Comic Neue");
    expect(comicSans?.value.trim().endsWith("sans-serif")).toBe(true);
  });

  it("leaves the self-hosted fonts with no system-font dependency", () => {
    const selfHosted = fontOptions.filter((option) => option.label !== "Comic Sans");
    expect(selfHosted.every((option) => option.requiresSystemFont === undefined)).toBe(true);
  });
});

describe("detectUnavailableSystemFonts", () => {
  it("reports a required font the availability check rejects", () => {
    expect(detectUnavailableSystemFonts(fontOptions, () => false)).toEqual(["Comic Sans MS"]);
  });

  it("reports nothing when every required font is available", () => {
    expect(detectUnavailableSystemFonts(fontOptions, () => true)).toEqual([]);
  });

  it("tests each distinct required font once", () => {
    const checked: string[] = [];
    detectUnavailableSystemFonts(fontOptions, (fontName) => {
      checked.push(fontName);
      return true;
    });
    expect(checked).toEqual([...new Set(checked)]);
    expect(checked).toContain("Comic Sans MS");
  });
});

describe("filterAvailableFonts", () => {
  it("drops options whose required system font is unavailable", () => {
    const result = filterAvailableFonts(fontOptions, ["Comic Sans MS"]);
    expect(result.some((option) => option.label === "Comic Sans")).toBe(false);
    expect(result).toHaveLength(fontOptions.length - 1);
  });

  it("keeps every option when nothing is unavailable", () => {
    expect(filterAvailableFonts(fontOptions, [])).toEqual(fontOptions);
  });

  it("always keeps options that have no system-font dependency", () => {
    const result = filterAvailableFonts(fontOptions, ["Comic Sans MS"]);
    expect(result.map((option) => option.label)).toEqual(["Figtree", "Dyslexic", "Atkinson"]);
  });
});
