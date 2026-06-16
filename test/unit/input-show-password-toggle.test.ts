/**
 * The show-password toggle is the input family's first interactive demo: a
 * best-practice accessible toggle button rendered next to a password field,
 * with the production handler surfaced in the code drawer's JS pane. The
 * contracts worth pinning: (1) the button only appears for a password field
 * with the toggle opted in - never for another type, never when off; (2) the
 * emitted button is the accessible pattern (real <button type="button">, a text
 * label, aria-pressed, aria-controls pointing at the field); (3) the JS pane is
 * populated only when the toggle is present. Pure render fn -> node unit env.
 */

import { describe, expect, it } from "vitest";
import { renderInput } from "../../app/components/inspected/input/render";

describe("show-password toggle - appears only for an opted-in password field", () => {
  it("renders the toggle button and JS when password + showPasswordToggle", () => {
    const { html, js } = renderInput({ renderAs: "password", showPasswordToggle: true });
    expect(html).toContain("<button");
    expect(js).toBeDefined();
  });

  it("does not render it when the toggle is off", () => {
    const { html, js } = renderInput({ renderAs: "password", showPasswordToggle: false });
    expect(html).not.toContain("al-password-toggle");
    expect(js).toBeUndefined();
  });

  it("does not render it on a non-password field even when opted in", () => {
    const { html, js } = renderInput({ renderAs: "text", showPasswordToggle: true });
    expect(html).not.toContain("al-password-toggle");
    expect(js).toBeUndefined();
  });
});

describe("show-password toggle - emits the accessible pattern", () => {
  const { html, js } = renderInput({ renderAs: "password", showPasswordToggle: true });

  it("is a real <button type=\"button\"> with a visible text label", () => {
    expect(html).toContain('type="button"');
    expect(html).toContain("Show password");
  });

  it("exposes state with aria-pressed and links the field with aria-controls", () => {
    expect(html).toContain('aria-pressed="false"');
    expect(html).toContain('aria-controls="al-input"');
  });

  it("wires the live handler the iframe shell pre-defines", () => {
    expect(html).toContain('onclick="togglePasswordVisibility(this)"');
  });

  it("shows the production handler in the JS pane, kept in sync with the markup", () => {
    expect(js).toContain("function togglePasswordVisibility");
    expect(js).toContain("aria-pressed"); // the handler keeps state in sync
    expect(js).toContain('input.type = showing ? "password" : "text"');
  });
});
