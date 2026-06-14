/**
 * Unit tests for the shared render utilities used by the form-input
 * renderers. These are pure functions; the renderer characterisation
 * tests in form-input-renderers.test.ts cover their integration.
 */

import { describe, expect, it } from "vitest";
import { associateLabel } from "../../app/utils/associateLabel";
import { escapeHtml } from "../../app/utils/escapeHtml";
import { formatCssLength } from "../../app/utils/formatCssLength";
import { inlineStyleAttribute } from "../../app/utils/inlineStyleAttribute";
import { valueFromLabel } from "../../app/utils/valueFromLabel";

describe("escapeHtml", () => {
  it("escapes ampersands, angle brackets, and double quotes", () => {
    expect(escapeHtml('<a href="x">Fish & chips</a>')).toBe(
      "&lt;a href=&quot;x&quot;&gt;Fish &amp; chips&lt;/a&gt;",
    );
  });

  it("returns plain text unchanged", () => {
    expect(escapeHtml("Subscribe")).toBe("Subscribe");
  });

  it("returns an empty string unchanged", () => {
    expect(escapeHtml("")).toBe("");
  });

  // The ampersand must be escaped first; otherwise the `&` introduced when
  // escaping `<`/`>`/`"` would itself be re-escaped, turning `<` into
  // `&amp;lt;`. The markup the iframe renders (and the code drawer shows
  // verbatim) would then be wrong.
  it("escapes the ampersand first so other entities are not double-encoded", () => {
    expect(escapeHtml("<")).toBe("&lt;");
    expect(escapeHtml("&lt;")).toBe("&amp;lt;");
  });

  // Renderers must escape user text exactly once. Pinning non-idempotence
  // guards against a future caller escaping an already-escaped string.
  it("is not idempotent — escaping twice double-encodes", () => {
    expect(escapeHtml(escapeHtml("<"))).toBe("&amp;lt;");
  });

  // Every attribute the renderers emit is double-quoted, so single quotes
  // never need escaping inside them. Leaving `'` untouched keeps labels
  // like "it's" readable in the code drawer.
  it("does not escape single quotes (attributes are always double-quoted)", () => {
    expect(escapeHtml("it's a 'value'")).toBe("it's a 'value'");
  });
});

describe("formatCssLength", () => {
  it("joins value and unit", () => {
    expect(formatCssLength({ value: 1.5, unit: "rem" })).toBe("1.5rem");
    expect(formatCssLength({ value: 24, unit: "px" })).toBe("24px");
  });

  it("emits zero with its unit (valid CSS)", () => {
    expect(formatCssLength({ value: 0, unit: "px" })).toBe("0px");
  });

  it("preserves fractional rem values", () => {
    expect(formatCssLength({ value: 1.25, unit: "rem" })).toBe("1.25rem");
  });

  // A pure join: it trusts the numeric validity guaranteed upstream by
  // useUnitConversion (rounding, parseFloat) and does no clamping itself.
  // Pinning the negative case documents that the function is not the place
  // sizes get sanitised.
  it("passes negative values straight through (no clamping)", () => {
    expect(formatCssLength({ value: -4, unit: "px" })).toBe("-4px");
  });
});

describe("valueFromLabel", () => {
  it("lowercases and hyphenates the label", () => {
    expect(valueFromLabel("Second Option")).toBe("second-option");
  });

  it("trims and collapses whitespace", () => {
    expect(valueFromLabel("  Spread   out  ")).toBe("spread-out");
  });

  it("collapses any whitespace run, including tabs and newlines", () => {
    expect(valueFromLabel("Read\tMore\nNow")).toBe("read-more-now");
  });

  it("returns an empty string for empty or whitespace-only input", () => {
    expect(valueFromLabel("")).toBe("");
    expect(valueFromLabel("   ")).toBe("");
  });

  it("leaves an already-kebab value unchanged", () => {
    expect(valueFromLabel("dog")).toBe("dog");
  });

  // valueFromLabel only normalises case + whitespace; it deliberately does
  // NOT strip or escape punctuation. The renderers wrap the result in
  // escapeHtml() before emitting it as a `value` attribute (radio/render.ts
  // and select/render.ts), so escaping here would double-encode. This pins
  // the no-sanitisation contract that makes the downstream escaping correct.
  it("preserves punctuation (escaping happens in the renderers, not here)", () => {
    expect(valueFromLabel("Don't!")).toBe("don't!");
  });
});

describe("inlineStyleAttribute", () => {
  it("returns an empty string when no style props are set", () => {
    expect(inlineStyleAttribute({})).toBe("");
  });

  it("emits all declarations in a stable order with a leading space", () => {
    expect(
      inlineStyleAttribute({
        fontSize: { value: 16, unit: "px" },
        bg: "#fff",
        fgText: "#000",
        borderColor: "#888",
      }),
    ).toBe(' style="font-size:16px;background:#fff;color:#000;border-color:#888"');
  });

  it("skips unset properties", () => {
    expect(inlineStyleAttribute({ fgText: "#333" })).toBe(' style="color:#333"');
  });

  // Declaration order is fixed in the function body, so the order the keys
  // are supplied in must not affect the output. The renderer characterisation
  // tests and the code drawer both depend on this determinism.
  it("uses a fixed declaration order regardless of input key order", () => {
    expect(
      inlineStyleAttribute({
        borderColor: "#888",
        fgText: "#000",
        bg: "#fff",
        fontSize: { value: 16, unit: "px" },
      }),
    ).toBe(' style="font-size:16px;background:#fff;color:#000;border-color:#888"');
  });

  // Empty-string colours are treated as unset (the truthy guard), so the
  // output never contains a malformed `background:`/`color:` with no value.
  it("treats empty-string colour values as unset", () => {
    expect(inlineStyleAttribute({ bg: "", fgText: "", borderColor: "" })).toBe("");
  });

  // A zero font-size is a real CssLength object (truthy), so it is emitted —
  // unlike an empty colour string, it is not dropped.
  it("emits a zero font-size", () => {
    expect(inlineStyleAttribute({ fontSize: { value: 0, unit: "px" } })).toBe(
      ' style="font-size:0px"',
    );
  });

  // Colour values are inserted verbatim — NOT escaped — because they come
  // from the constrained colour pickers (hex / rgb()), never free text.
  // This pins that trust boundary; rgb() syntax with spaces and a slash
  // must survive untouched.
  it("inserts colour values verbatim, preserving rgb() syntax", () => {
    expect(inlineStyleAttribute({ bg: "rgb(0 0 0 / 0.5)" })).toBe(
      ' style="background:rgb(0 0 0 / 0.5)"',
    );
  });
});

describe("associateLabel", () => {
  const renderControl = (ariaLabelText?: string) =>
    ariaLabelText === undefined ? "<input />" : `<input aria-label="${ariaLabelText}" />`;

  it("defaults to for-id with the label after the control", () => {
    expect(
      associateLabel({ association: undefined, controlId: "x", labelText: "Name", renderControl }),
    ).toBe('<input /> <label for="x">Name</label>');
  });

  it("puts the for-id label before the control when labelPosition is before", () => {
    expect(
      associateLabel({
        association: "for-id",
        controlId: "x",
        labelText: "Name",
        labelStyle: ' style="display:block"',
        labelPosition: "before",
        renderControl,
      }),
    ).toBe('<label for="x" style="display:block">Name</label><input />');
  });

  it("wraps the control inside the label for wrapping mode", () => {
    expect(
      associateLabel({ association: "wrapping", controlId: "x", labelText: "Name", renderControl }),
    ).toBe("<label><input /> Name</label>");
  });

  it("passes the raw label text through for aria-label mode", () => {
    expect(
      associateLabel({
        association: "aria-label",
        controlId: "x",
        labelText: "Name",
        renderControl,
      }),
    ).toBe('<input aria-label="Name" />');
  });

  it("renders the bare control for none mode", () => {
    expect(
      associateLabel({ association: "none", controlId: "x", labelText: "Name", renderControl }),
    ).toBe("<input />");
  });

  it("escapes the visible label text", () => {
    expect(
      associateLabel({
        association: "for-id",
        controlId: "x",
        labelText: "Fish & chips",
        renderControl,
      }),
    ).toBe('<input /> <label for="x">Fish &amp; chips</label>');
  });

  // Split escaping responsibility: associateLabel escapes the VISIBLE label
  // (for-id / wrapping), but in aria-label mode it hands the RAW text to
  // renderControl and trusts it to escape — which the real renderers do via
  // escapeHtml when building `aria-label="..."` (see radio/render.ts). The
  // stub renderControl here does not escape, so the raw `&` proves the text
  // passes through associateLabel untouched.
  it("passes aria-label text to renderControl unescaped (the renderer escapes it)", () => {
    expect(
      associateLabel({
        association: "aria-label",
        controlId: "x",
        labelText: "Fish & chips",
        renderControl,
      }),
    ).toBe('<input aria-label="Fish & chips" />');
  });

  // labelStyle is applied to the <label> in both label-bearing modes and in
  // both positions. Pin one "before" and one "after" case so a regression in
  // either branch is caught.
  it("applies labelStyle to a wrapping label in the before position", () => {
    expect(
      associateLabel({
        association: "wrapping",
        controlId: "x",
        labelText: "Name",
        labelStyle: ' style="display:block"',
        labelPosition: "before",
        renderControl,
      }),
    ).toBe('<label style="display:block">Name <input /></label>');
  });

  it("applies labelStyle to a for-id label in the after position", () => {
    expect(
      associateLabel({
        association: "for-id",
        controlId: "x",
        labelText: "Name",
        labelStyle: ' style="margin-left:4px"',
        labelPosition: "after",
        renderControl,
      }),
    ).toBe('<input /> <label for="x" style="margin-left:4px">Name</label>');
  });
});
