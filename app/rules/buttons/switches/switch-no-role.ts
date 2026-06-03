import type { Rule } from "~/rules/types";

// Fires when the page's behaviour is set to "None" — the rendered
// element is a plain button with no switch semantics. Sighted users
// might still see it visually flip, but assistive tech announces it as
// "button, label" with no indication it's an on/off setting.
export const switchNoRole: Rule = {
  id: "switch-no-role",
  title: "Switch has no role or state",
  wcag: "SC 4.1.2 Name, Role, Value — Level A",
  tags: ["wcag2a", "wcag412"],
  description:
    "The element is intended to be a switch but exposes no role or state to assistive technology. Screen reader users hear it announced as a regular button with no indication that activating it toggles a setting on or off.",
  help: "Add `role=\"switch\"` and `aria-checked=\"true|false\"`. Together they tell assistive tech that this is a setting control and what its current value is. Keep the label stable — let aria-checked carry the on/off state.",
  helpUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/switch/",
  evaluate(props) {
    // The input-checkbox-switch variant hardcodes role="switch" in the
    // markup, so the switchBehaviour prop doesn't drive output for it.
    if (props.renderAs === "input-checkbox-switch") return null;
    if (props.switchBehaviour !== "none") return null;
    return {
      severity: "serious",
      measurement:
        "Switch behaviour is set to None — the element renders as a plain button with no ARIA role or state.",
    };
  },
};
