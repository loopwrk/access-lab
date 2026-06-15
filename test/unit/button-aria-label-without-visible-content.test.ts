/**
 * Tests for the `button-aria-label-without-visible-content` rule.
 *
 * The rule surfaces a case automated tools and WCAG 2.x both miss: a <button>
 * that is named (via aria-label) but shows nothing — no text, no icon. It's a
 * best-practice flag, not a WCAG failure (the button IS named), so it must NOT
 * double-report the genuinely-nameless case axe-core already catches, and must
 * leave the legitimate icon-button pattern alone.
 *
 * Pure rule (a function of its props) → node unit env.
 */

import { describe, expect, it } from "vitest";
import { ariaLabelWithoutVisibleContent as rule } from "../../app/rules/buttons/shared/aria-label-without-visible-content";

describe("button-aria-label-without-visible-content", () => {
  it("fires (serious) for a button named only by aria-label with no text or icon", () => {
    const result = rule.evaluate({
      renderAs: "button-button",
      contentType: "text",
      label: "",
      ariaLabel: "Fire trigger event",
    });
    expect(result?.severity).toBe("serious");
  });

  it("explains in the message that it is not a WCAG failure but an AccessLab flag", () => {
    const result = rule.evaluate({
      renderAs: "button-button",
      contentType: "text",
      label: "",
      ariaLabel: "Fire trigger event",
    });
    expect(result?.measurement).toMatch(/not a WCAG failure/i);
    expect(result?.measurement).toMatch(/AccessLab flags it/i);
    expect(result?.measurement).toContain("Fire trigger event"); // names the offending control
  });

  it("does not fire for an icon button (the icon conveys purpose)", () => {
    expect(
      rule.evaluate({ renderAs: "button-button", contentType: "icon", label: "", ariaLabel: "Search" }),
    ).toBeNull();
  });

  it("does not fire when the button has visible text", () => {
    expect(
      rule.evaluate({ renderAs: "button-button", contentType: "text", label: "Save", ariaLabel: "Save changes" }),
    ).toBeNull();
  });

  it("does not fire when there is no aria-label (the nameless case is axe-core's button-name)", () => {
    expect(
      rule.evaluate({ renderAs: "button-button", contentType: "text", label: "" }),
    ).toBeNull();
    expect(
      rule.evaluate({ renderAs: "button-button", contentType: "text", label: "", ariaLabel: "   " }),
    ).toBeNull();
  });

  it("does not fire for input-type variants (they show default text or an image, not empty)", () => {
    expect(
      rule.evaluate({ renderAs: "input-submit", contentType: "text", label: "", ariaLabel: "Send" }),
    ).toBeNull();
  });

  it("does not fire for switch variants (they render a visible sibling label)", () => {
    expect(
      rule.evaluate({
        renderAs: "button-button",
        contentType: "text",
        label: "",
        ariaLabel: "Dark mode",
        switchBehaviour: "role-switch",
      }),
    ).toBeNull();
  });

  it("declares the right metadata", () => {
    expect(rule.id).toBe("button-aria-label-without-visible-content");
    expect(rule.tags).toContain("best-practice");
    expect(rule.learnTopicId).toBe("accessible-name");
  });
});
