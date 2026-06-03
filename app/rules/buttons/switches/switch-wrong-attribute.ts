import type { Rule } from "~/rules/types";

// `aria-pressed` is the toggle-button pattern — it announces "toggle
// button, pressed/not pressed". Switches are settings, not actions, and
// should use `role="switch"` + `aria-checked` so AT announces "switch,
// on/off". The patterns are not interchangeable.
export const switchWrongAttribute: Rule = {
  id: "switch-wrong-attribute",
  title: "Switch uses aria-pressed instead of role=\"switch\"",
  wcag: "SC 4.1.2 Name, Role, Value — Level A",
  tags: ["wcag2a", "wcag412"],
  description:
    "`aria-pressed` is the toggle-button pattern — assistive tech announces it as a button that performs an action with a sticky effect. A switch is semantically different: it represents an on/off setting whose value is the point. Using aria-pressed for a switch produces the wrong announcement (\"button, pressed\" instead of \"switch, on\").",
  help: "Replace `aria-pressed` with `role=\"switch\"` + `aria-checked=\"true|false\"`. The element is still rendered as a `<button>`, but assistive tech now understands it represents a setting rather than an action.",
  helpUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/switch/",
  evaluate(props) {
    // The input-checkbox-switch variant hardcodes role="switch" in the
    // markup, so the switchBehaviour prop doesn't drive output for it.
    if (props.renderAs === "input-checkbox-switch") return null;
    if (props.switchBehaviour !== "aria-pressed") return null;
    return {
      severity: "serious",
      measurement:
        "Switch uses aria-pressed — assistive tech will announce it as a toggle button rather than a setting.",
    };
  },
};
