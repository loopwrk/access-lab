/**
 * The switch teaches: expose on/off state to assistive technology, and the
 * difference between doing it right (role="switch" + aria-checked), with the
 * wrong attribute (aria-pressed → announced as a toggle button, not a switch),
 * and not at all (a plain button that STILL flips dark mode for mouse users -
 * silent to AT). So these tests pin that each behaviour produces the markup
 * that carries (or fails to carry) that state, and that the dark-mode hook +
 * JS pane match what the student would ship.
 *
 * Nuxt env (not unit): renderSwitch lives in definition.ts, which imports
 * defineAsyncComponent for its controlsComponent - a Nuxt auto-import the node
 * project can't resolve. We reach the render fn through the definition because
 * that is exactly what the studio calls.
 */

import { describe, expect, it } from "vitest";
import { switchDefinition } from "~/components/inspected/buttons/switches/definition";
import type { ButtonProps } from "~/components/inspected/buttons/shared/types";
import type { RenderedFragment } from "~/types/component";

function render(props: Partial<ButtonProps>): RenderedFragment {
  return switchDefinition.render(props) as RenderedFragment;
}

const ROLE_SWITCH: Partial<ButtonProps> = {
  renderAs: "button-button",
  label: "Toggle dark mode",
  switchBehaviour: "role-switch",
  switchChecked: false,
  switchPillStyling: true,
};

describe("renderSwitch - the correct pattern: role=switch + aria-checked, pill-styled", () => {
  it("renders the pill button named by an external label, with role/aria-checked and the dark-mode hook", () => {
    const { html, css, js } = render(ROLE_SWITCH);
    // The pill has no text content - its accessible name comes from the sibling
    // <span> via aria-labelledby (the visible-label-beside-the-control pattern).
    // role="switch" + aria-checked is what makes AT announce "switch, off".
    expect(html).toBe(
      '<div class="al-switch-wrap" data-al-activates>' +
        '<span id="al-switch-label">Toggle dark mode</span>' +
        '<button onclick="toggleDarkMode()" class="al-inspected-element al-switch" type="button" aria-labelledby="al-switch-label" role="switch" aria-checked="false"></button>' +
        "</div>",
    );
    expect(css).toContain(".al-inspected-element.al-switch{"); // pill + thumb styling present
    expect(css).toContain("body.dark-mode{background:#000;color:#fff;}"); // the effect the switch controls
    expect(js).toContain("aria-checked"); // the role-switch JS keeps the state in sync
  });

  it("reflects the on state in BOTH aria-checked and the pressed class (thumb position)", () => {
    const { html } = render({ ...ROLE_SWITCH, switchChecked: true });
    expect(html).toContain('aria-checked="true"');
    expect(html).toContain("al-pressed"); // drives the .al-switch.al-pressed::before thumb slide
  });
});

describe("renderSwitch - the wrong attribute: aria-pressed (toggle, not switch)", () => {
  it("emits aria-pressed and no switch role/state, so AT announces a toggle button", () => {
    const { html, js } = render({ ...ROLE_SWITCH, switchBehaviour: "aria-pressed" });
    expect(html).toContain('aria-pressed="false"');
    expect(html).not.toContain('role="switch"');
    expect(html).not.toContain("aria-checked");
    expect(js).not.toContain("aria-checked"); // simpler JS - no switch state to maintain
  });
});

describe("renderSwitch - no ARIA: the works-visually-but-silent anti-pattern", () => {
  it("renders a plain button with no role/state, yet still flips dark mode via the click hook", () => {
    const { html, css } = render({ ...ROLE_SWITCH, switchBehaviour: "none" });
    // The crux of switch-no-role: the onclick + body.dark-mode rule mean a
    // mouse user sees dark mode flip, but there is no role / aria-checked /
    // aria-pressed, so assistive tech is told nothing. Visual works; semantics
    // don't - which is exactly why this is an anti-pattern, not a missing demo.
    expect(html).toBe('<button onclick="toggleDarkMode()" type="button">Toggle dark mode</button>');
    expect(html).not.toContain("role=");
    expect(html).not.toContain("aria-");
    expect(css).toBe("body.dark-mode{background:#000;color:#fff;}");
  });
});

describe("renderSwitch - the recommended native variant: <input type=checkbox role=switch>", () => {
  it("renders a labelled native checkbox with role=switch and no explicit aria-checked", () => {
    const { html, js } = render({
      renderAs: "input-checkbox-switch",
      label: "Toggle dark mode",
      switchBehaviour: "role-switch",
      switchChecked: false,
    });
    // The native checkbox's own checked state maps to the switch value, so no
    // explicit aria-checked is needed - that's the appeal of this pattern.
    expect(html).toBe(
      '<label for="al-switch-input"><span>Toggle dark mode</span>' +
        '<input onclick="toggleDarkMode()" class="al-inspected-element" id="al-switch-input" type="checkbox" role="switch"></label>',
    );
    expect(html).not.toContain("aria-checked");
    expect(js).not.toContain("aria-checked"); // the browser tracks :checked; JS just toggles the class
  });

  it("uses the native checked attribute for the on state", () => {
    const { html } = render({
      renderAs: "input-checkbox-switch",
      label: "Toggle dark mode",
      switchBehaviour: "role-switch",
      switchChecked: true,
    });
    expect(html).toContain("checked");
    expect(html).toContain('role="switch"');
  });
});
