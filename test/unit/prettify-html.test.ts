/**
 * In the node (SSR) environment there is no global DOMParser, so prettifyHtml
 * takes its fallback path: trim the input and return it as-is, unformatted.
 * This keeps the function SSR-safe — it is imported by render code that can
 * run during `nuxt generate`. The real DOM-based formatting is covered in the
 * nuxt project (test/nuxt/prettify-html.test.ts), where happy-dom provides
 * DOMParser.
 */

import { describe, expect, it } from "vitest";
import { prettifyHtml } from "../../app/utils/prettifyHtml";

describe("prettifyHtml (SSR fallback, no DOMParser)", () => {
  it("returns an empty string for blank input", () => {
    expect(prettifyHtml("")).toBe("");
    expect(prettifyHtml("   ")).toBe("");
  });

  it("trims and returns the input unformatted when DOMParser is unavailable", () => {
    // Guard the assumption that this environment genuinely lacks DOMParser;
    // if a future setup polyfills it, this test would silently exercise the
    // formatting path instead of the fallback it is meant to pin.
    expect(typeof DOMParser).toBe("undefined");
    expect(prettifyHtml("  <div><span>Hi</span></div>  ")).toBe("<div><span>Hi</span></div>");
  });
});
