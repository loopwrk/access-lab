import type { Rule } from "~/rules/types";

// Fires when the trigger opens a popup of choices but does not advertise
// the popup with `aria-haspopup`. Screen readers will announce the
// control as a plain button (or, if `aria-expanded` is present, as a
// generic disclosure) - students will not be told that activating it
// reveals a menu of options to choose from.
export const menuNoHasPopup: Rule = {
  id: "menu-no-haspopup",
  title: "Menu trigger has no aria-haspopup",
  wcag: "SC 4.1.2 Name, Role, Value - Level A",
  tags: ["wcag2a", "wcag412"],
  description:
    "`aria-haspopup` tells assistive technology that activating the button reveals a popup. Without it, screen reader users hear a plain button (or a generic disclosure) and are not told that a menu of choices will appear.",
  help: 'Set `aria-haspopup="menu"` on the trigger. Use this in addition to `aria-expanded`, not instead of it - the two attributes describe different things.',
  helpUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/",
  evaluate(props) {
    const behaviour = props.menuBehaviour;
    if (behaviour !== "none" && behaviour !== "expanded-only") return null;
    return {
      severity: "serious",
      measurement:
        "Menu behaviour is set without `aria-haspopup` - assistive tech is not told the button opens a menu.",
    };
  },
};
