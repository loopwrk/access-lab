/**
 * `isFontAvailable` decides whether the font picker may offer a system font like
 * Comic Sans MS. The detection compares canvas text widths so these tests
 * drive it with a stubbed canvas whose measurements we control.
 */

import { afterEach, describe, expect, it, vi } from "vitest";
import { isFontAvailable } from "../../app/utils/isFontAvailable";

/**
 * Installs a fake `document` whose canvas reports a width derived from the
 * current `context.font`, so a test can model "this font changes the metrics"
 * (installed) versus "width is identical whatever the font" (fell back).
 */
function stubCanvasMeasuringBy(measure: (font: string) => number) {
  const context = {
    font: "",
    measureText() {
      return { width: measure(this.font) };
    },
  };
  vi.stubGlobal("document", {
    createElement: () => ({ getContext: () => context }),
  });
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("isFontAvailable", () => {
  it("returns true when naming the font changes the measured width", () => {
    stubCanvasMeasuringBy((font) => (font.includes('"Comic Sans MS"') ? 120 : 100));
    expect(isFontAvailable("Comic Sans MS")).toBe(true);
  });

  it("returns false when the width is identical with or without the font", () => {
    stubCanvasMeasuringBy(() => 100);
    expect(isFontAvailable("Nonexistent Font")).toBe(false);
  });

  it("returns false during server rendering, when there is no document", () => {
    vi.stubGlobal("document", undefined);
    expect(isFontAvailable("Comic Sans MS")).toBe(false);
  });

  it("returns false when a 2d canvas context cannot be obtained", () => {
    vi.stubGlobal("document", {
      createElement: () => ({ getContext: () => null }),
    });
    expect(isFontAvailable("Comic Sans MS")).toBe(false);
  });
});
