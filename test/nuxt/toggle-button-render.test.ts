/**
 * The toggle component teaches one idea: a control that applies or removes an
 * effect must expose its on/off state to assistive technology (aria-pressed),
 * and the wrong ways to do it (aria-checked, visual-only) are visible in the
 * markup. So these tests don't just check the string — they pin that the
 * rendered output makes each lesson legible:
 *   - the pressed state shows up THREE ways (the aria attribute, the pressed-
 *     tint class, AND the sample text turning bold) so the effect is visible on
 *     real content, not just an abstract attribute;
 *   - the JS pane matches the HTML — and for aria-pressed it keeps the ARIA
 *     state in sync, the step production code most often forgets;
 *   - the icon-content option shows the Bold icon, the action being shown.
 *
 * Nuxt env (not unit): renderToggleButton lives in definition.ts, which pulls
 * in `defineAsyncComponent` for its controlsComponent — a Nuxt auto-import the
 * plain-node project can't resolve. The render fn itself is pure; we reach it
 * through the definition because that is exactly what the studio calls.
 */

import { describe, expect, it } from "vitest";
import { toggleButtonDefinition } from "~/components/inspected/buttons/toggle-buttons/definition";
import type { ButtonProps } from "~/components/inspected/buttons/shared/types";
import type { RenderedFragment } from "~/types/component";

function render(props: Partial<ButtonProps>): RenderedFragment {
  return toggleButtonDefinition.render(props) as RenderedFragment;
}

const ARIA_PRESSED_UNPRESSED: Partial<ButtonProps> = {
  renderAs: "button-button",
  label: "Bold",
  toggleBehaviour: "aria-pressed",
  togglePressed: false,
};

describe("renderToggleButton — structure: the sample text demonstrates the effect", () => {
  it("renders the button beside a sample paragraph, wires the demo handler, and injects the pressed-tint CSS", () => {
    const { html, css, js } = render(ARIA_PRESSED_UNPRESSED);
    expect(html).toBe(
      '<div style="display: flex; flex-direction: column; gap: 0.85em; align-items: flex-start; font-family: Arial, Helvetica, sans-serif;">' +
        '<button onclick="toggleBold()" type="button" aria-pressed="false">Bold</button>' +
        '<p style="margin: 0; max-width: 32ch; color: #000;">This sample text turns bold when the toggle is on.</p>' +
        "</div>",
    );
    // The pressed-tint rule is always present for a toggle so the "on" state
    // can show visually; it targets the al-pressed class the button gains when
    // pressed (see the pressed-state test below).
    expect(css).toBe(
      ".al-inspected-element.al-pressed{box-shadow:inset 0 0 0 999px rgb(0 0 0 / 0.18);}",
    );
    expect(js).toContain("aria-pressed");
  });

  // onclick="toggleBold()" is a deliberate exception to the "pure semantic
  // markup, no inline handlers" baseline pinned for action-triggers. Here the
  // handler IS part of the lesson — the HTML pane shows production-style code
  // the student reads and copies. Pinning it guards that intent.
  it("carries an inline onclick handler (the production-style hook the lesson teaches)", () => {
    expect(render(ARIA_PRESSED_UNPRESSED).html).toContain('onclick="toggleBold()"');
  });
});

describe("renderToggleButton — pressed state is exposed to AT and shown on content", () => {
  it("aria-pressed: when pressed, the attribute, the pressed class, AND the bolded text flip together", () => {
    const { html } = render({ ...ARIA_PRESSED_UNPRESSED, togglePressed: true });
    expect(html).toContain('aria-pressed="true"');
    expect(html).toContain('class="al-inspected-element al-pressed"');
    expect(html).toContain("<strong>This sample text turns bold when the toggle is on.</strong>");
  });

  it("aria-pressed: when unpressed, none of those applied-state markers are present", () => {
    const { html } = render(ARIA_PRESSED_UNPRESSED);
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain("al-pressed");
    expect(html).not.toContain("<strong>");
  });
});

describe("renderToggleButton — the wrong/right behaviours are three different markups", () => {
  it("aria-checked emits the wrong attribute on a plain button (no aria-pressed)", () => {
    const { html } = render({ ...ARIA_PRESSED_UNPRESSED, toggleBehaviour: "aria-checked" });
    expect(html).toContain('aria-checked="false"');
    expect(html).not.toContain("aria-pressed");
  });

  it("visual-only: tints when pressed but exposes NO ARIA state — exactly what toggle-state-missing flags", () => {
    const { html } = render({
      ...ARIA_PRESSED_UNPRESSED,
      toggleBehaviour: "visual-only",
      togglePressed: true,
    });
    expect(html).toContain("al-pressed"); // visibly toggled
    expect(html).not.toContain("aria-pressed");
    expect(html).not.toContain("aria-checked"); // ...but silent to assistive tech
  });
});

describe("renderToggleButton — the JS pane matches the HTML the student is reading", () => {
  it("aria-pressed behaviour ships JS that keeps aria-pressed in sync (the step production code forgets)", () => {
    expect(render(ARIA_PRESSED_UNPRESSED).js).toContain("setAttribute('aria-pressed'");
  });

  it("the non-ARIA behaviours ship the minimal toggle with no ARIA to maintain", () => {
    expect(render({ ...ARIA_PRESSED_UNPRESSED, toggleBehaviour: "visual-only" }).js).not.toContain(
      "aria-pressed",
    );
    expect(render({ ...ARIA_PRESSED_UNPRESSED, toggleBehaviour: "aria-checked" }).js).not.toContain(
      "aria-pressed",
    );
  });
});

describe("renderToggleButton — icon content shows the Bold icon, scoped to this component", () => {
  it("swaps the shared magnifier for the Lucide bold icon when content is icon", () => {
    const { html } = render({
      renderAs: "button-button",
      label: "Bold",
      ariaLabel: "Bold",
      contentType: "icon",
      toggleBehaviour: "aria-pressed",
      togglePressed: false,
    });
    expect(html).toContain("M6 12h9a4 4 0 0 1 0 8"); // the Lucide bold path
    expect(html).not.toContain("&#128269;"); // not the generic magnifier glyph
  });
});
