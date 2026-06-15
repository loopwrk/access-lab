/**
 * A <button>'s visible label is text *content*, so the renderer must escape it.
 * The native way to set an element's text (textContent) shows the characters
 * literally, and a bare `&` must be written `&amp;` to be valid HTML — so
 * escaping is what a browser faithfully does, not an added safety layer.
 * Without it, a typed label like `<b>Save</b>` would be interpreted as markup
 * in the preview instead of shown as the characters typed. The form-input
 * renderers already escape their labels; this brings the button in line.
 */

import { describe, expect, it } from "vitest";
import { renderButton } from "../../app/components/inspected/buttons/shared/render";

describe("renderButton label escaping", () => {
  it("escapes HTML special characters in the button's text content", () => {
    const { html } = renderButton({ label: "<b>Save</b>" });
    expect(html).toContain("&lt;b&gt;Save&lt;/b&gt;");
    expect(html).not.toContain("<b>Save</b>");
  });

  it("escapes a bare ampersand so the markup is valid HTML", () => {
    const { html } = renderButton({ label: "Fish & chips" });
    expect(html).toContain("Fish &amp; chips");
  });
});
