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
});

describe("formatCssLength", () => {
  it("joins value and unit", () => {
    expect(formatCssLength({ value: 1.5, unit: "rem" })).toBe("1.5rem");
    expect(formatCssLength({ value: 24, unit: "px" })).toBe("24px");
  });
});

describe("valueFromLabel", () => {
  it("lowercases and hyphenates the label", () => {
    expect(valueFromLabel("Second Option")).toBe("second-option");
  });

  it("trims and collapses whitespace", () => {
    expect(valueFromLabel("  Spread   out  ")).toBe("spread-out");
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
});
