import type { Rule } from "~/rules/types";

// Fires when the trigger has `aria-haspopup` (or no ARIA at all) but
// never communicates whether the menu is currently open or closed.
// Sighted users see the popup appear; screen reader users hear the same
// announcement on every activation and cannot tell whether the menu is
// currently open.
export const menuNoExpanded: Rule = {
  id: "menu-no-expanded",
  title: "Menu trigger has no aria-expanded",
  wcag: "SC 4.1.2 Name, Role, Value — Level A",
  tags: ["wcag2a", "wcag412"],
  description:
    "`aria-expanded` carries the current open or closed state of the menu. Without it, assistive technology announces the button identically whether the menu is open or shut, contradicting what sighted users see.",
  help: "Add `aria-expanded=\"true|false\"` to the trigger and flip it in the same handler that opens or closes the menu. Pair it with `aria-haspopup=\"menu\"` so the announcement reads as \"menu, expanded\" rather than a generic disclosure.",
  helpUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/",
  evaluate(props) {
    const behaviour = props.menuBehaviour;
    if (behaviour !== "none" && behaviour !== "haspopup-only") return null;
    return {
      severity: "serious",
      measurement:
        "Menu behaviour is set without `aria-expanded` — the open/closed state is not exposed.",
    };
  },
};
