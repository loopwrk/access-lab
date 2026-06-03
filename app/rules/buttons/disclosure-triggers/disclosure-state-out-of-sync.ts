import type { Rule } from "~/rules/types";

// Fires when `aria-expanded` is emitted but never updated as the panel
// opens and closes. Screen reader users are told the panel is collapsed
// even when sighted users can see it open — a quieter and more
// confusing failure than no attribute at all.
export const disclosureStateOutOfSync: Rule = {
  id: "disclosure-state-out-of-sync",
  title: "aria-expanded does not match panel state",
  wcag: "SC 4.1.2 Name, Role, Value — Level A",
  tags: ["wcag2a", "wcag412"],
  description:
    "The trigger has `aria-expanded` but the value does not change when the panel opens. Assistive technology will announce the panel as collapsed even when it is visibly open, contradicting what sighted users see.",
  help: "Flip `aria-expanded` in the same click handler that opens or closes the panel. The visible state and the announced state must stay in sync on every activation.",
  helpUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/",
  evaluate(props) {
    if (props.disclosureBehaviour !== "out-of-sync") return null;
    return {
      severity: "serious",
      measurement:
        "Disclosure behaviour is set to \"stuck at false\" — aria-expanded never updates when the panel opens.",
    };
  },
};
