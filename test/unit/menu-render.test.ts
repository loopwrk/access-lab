/**
 * Characterisation tests for the menu-trigger render output.
 *
 * Like disclosure, the menu markup is load-bearing (axe audits it, the rules
 * reason about it, the code drawer shows it) and now carries the
 * `data-al-interaction` marker the iframe shell reads to report an activation.
 * So this pins:
 *   - the marker sits on the studio WRAPPER, never on the copied button
 *   - aria-haspopup / aria-expanded track the four behaviours the page teaches
 *   - aria-controls follows the "Include aria-controls" option
 *   - the popup carries role=menu + role=menuitem items, hidden until open
 *
 * Pure function → node unit env (matches disclosure-render.test.ts).
 */

import { describe, expect, it } from "vitest";
import { renderButton } from "../../app/components/inspected/buttons/shared/render";
import type { ButtonProps } from "../../app/components/inspected/buttons/shared/types";

const base: Partial<ButtonProps> = {
  renderAs: "button-button",
  label: "Account",
  menuBehaviour: "aria-expanded-haspopup",
  menuOpen: false,
  menuShowControls: true,
  menuItems: ["Profile", "Settings"],
};

const buttonTag = (html: string) => html.match(/<button[^>]*>/)![0];

describe("renderButton (menu) — wrapper, marker, and popup", () => {
  it("wraps trigger + popup and marks the WRAPPER (not the button) for the host bridge", () => {
    const { html } = renderButton(base);
    expect(html).toBe(
      '<div class="al-menu-wrap" data-al-interaction="toggle">' +
        '<button type="button" aria-haspopup="menu" aria-expanded="false" aria-controls="al-menu-popup">Account</button>' +
        '<ul id="al-menu-popup" class="al-menu-popup" role="menu" hidden>' +
        '<li role="menuitem" tabindex="-1">Profile</li>' +
        '<li role="menuitem" tabindex="-1">Settings</li>' +
        "</ul>" +
        "</div>",
    );
    expect(buttonTag(html)).not.toContain("data-al-interaction");
  });

  it("keeps the marker on the bare <button> variant too, so a type-less trigger still opens the popup", () => {
    const { html } = renderButton({ ...base, renderAs: "button" });
    expect(html).toContain('<div class="al-menu-wrap" data-al-interaction="toggle">');
    expect(buttonTag(html)).not.toContain("type=");
  });

  it("reveals the popup (drops hidden) and flips aria-expanded when open", () => {
    const { html } = renderButton({ ...base, menuOpen: true });
    expect(buttonTag(html)).toContain('aria-expanded="true"');
    expect(html).toContain('class="al-menu-popup" role="menu">'); // no hidden attribute
  });
});

describe("renderButton (menu) — the four behaviours the page teaches", () => {
  it("emits both aria-haspopup and aria-expanded for the correct behaviour", () => {
    const tag = buttonTag(renderButton({ ...base, menuBehaviour: "aria-expanded-haspopup" }).html);
    expect(tag).toContain('aria-haspopup="menu"');
    expect(tag).toContain('aria-expanded="false"');
  });

  it("emits only aria-haspopup for haspopup-only (the missing-state anti-pattern)", () => {
    const tag = buttonTag(renderButton({ ...base, menuBehaviour: "haspopup-only" }).html);
    expect(tag).toContain('aria-haspopup="menu"');
    expect(tag).not.toContain("aria-expanded");
  });

  it("emits only aria-expanded for expanded-only (the missing-popup-role anti-pattern)", () => {
    const tag = buttonTag(renderButton({ ...base, menuBehaviour: "expanded-only" }).html);
    expect(tag).toContain('aria-expanded="false"');
    expect(tag).not.toContain("aria-haspopup");
  });

  it("emits neither for the none behaviour, but keeps aria-controls when included", () => {
    const tag = buttonTag(renderButton({ ...base, menuBehaviour: "none" }).html);
    expect(tag).not.toContain("aria-haspopup");
    expect(tag).not.toContain("aria-expanded");
    expect(tag).toContain('aria-controls="al-menu-popup"');
  });

  it("includes aria-controls only when menuShowControls is on", () => {
    expect(buttonTag(renderButton({ ...base, menuShowControls: true }).html)).toContain(
      'aria-controls="al-menu-popup"',
    );
    expect(buttonTag(renderButton({ ...base, menuShowControls: false }).html)).not.toContain(
      "aria-controls",
    );
  });
});
