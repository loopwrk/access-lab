import type { Rule } from "~/rules/types";

// Fires when the button visibly toggles on click (via CSS class) but
// exposes no ARIA state — screen reader users hear the same announcement
// each activation and can't tell whether the toggle is currently on or
// off.
export const toggleStateMissing: Rule = {
  id: "toggle-state-missing",
  title: "Toggle state not exposed to assistive tech",
  wcag: "SC 4.1.2 Name, Role, Value — Level A",
  tags: ["wcag2a", "wcag412"],
  description:
    "The button changes appearance on click but exposes no ARIA state. Screen reader users hear the same announcement on every activation and have no way to tell whether the toggle is currently on or off — so after activating it they don't know whether their intent landed.",
  help: "Add `aria-pressed=\"true|false\"` to expose the toggle state. Keep the label stable (`Mute` not `Mute`/`Unmute`); let aria-pressed convey on/off.",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html",
  evaluate(props) {
    if (props.toggleBehaviour !== "visual-only") return null;
    return {
      severity: "serious",
      measurement:
        "Toggle behaviour is set to visual-only — the button's pressed state has no ARIA representation.",
    };
  },
};
