const TEST_STRING = "mmmmmmmmmmlli";
const TEST_FONT_SIZE = "72px";
const BASE_FONTS = ["monospace", "sans-serif", "serif"] as const;

/**
 * Detects whether a named font is actually installed on the device, rather than
 * silently falling back to a generic family. The test string is measured in each
 * base font, then in the requested font layered over that same base: if any width
 * differs, the requested font took over the rendering, so it is present. This is
 * more reliable than `document.fonts.check()`, which does not track installed
 * system fonts consistently across browsers.
 *
 * Client-only (uses a canvas); returns false during server rendering.
 */
export function isFontAvailable(fontName: string): boolean {
  if (typeof document === "undefined") return false;
  const context = document.createElement("canvas").getContext("2d");
  if (!context) return false;

  return BASE_FONTS.some((baseFont) => {
    context.font = `${TEST_FONT_SIZE} ${baseFont}`;
    const baseWidth = context.measureText(TEST_STRING).width;
    context.font = `${TEST_FONT_SIZE} "${fontName}", ${baseFont}`;
    return context.measureText(TEST_STRING).width !== baseWidth;
  });
}
