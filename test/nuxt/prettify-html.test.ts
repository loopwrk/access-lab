/**
 * The DOM-based formatting path for prettifyHtml, exercised in the nuxt
 * project because happy-dom provides the DOMParser the function needs (the
 * node unit env only ever hits the SSR fallback — see
 * test/unit/prettify-html.test.ts). The code drawer shows this output to
 * students verbatim, so the indentation, the attribute-wrap threshold, and
 * the entity re-encoding are all load-bearing.
 */

import { describe, expect, it } from "vitest";
import { prettifyHtml } from "~/utils/prettifyHtml";

describe("prettifyHtml (DOM formatting)", () => {
  it("keeps a short text-only element on one line", () => {
    expect(prettifyHtml("<button>Click</button>")).toBe("<button>Click</button>");
  });

  it("self-closes void elements", () => {
    expect(prettifyHtml('<input type="text">')).toBe('<input type="text" />');
  });

  it("wraps the open tag when it has three or more attributes", () => {
    expect(prettifyHtml('<input type="text" name="n" id="x">')).toBe(
      ["<input", '  type="text"', '  name="n"', '  id="x"', "/>"].join("\n"),
    );
  });

  it("indents nested block elements", () => {
    expect(prettifyHtml("<div><span>Hi</span></div>")).toBe(
      ["<div>", "  <span>Hi</span>", "</div>"].join("\n"),
    );
  });

  it("re-encodes entities that DOMParser decoded on parse", () => {
    expect(prettifyHtml("<button>Yin & yang</button>")).toBe("<button>Yin &amp; yang</button>");
  });

  it("renders an empty element with an explicit closing tag on one line", () => {
    expect(prettifyHtml("<div></div>")).toBe("<div></div>");
  });
});
