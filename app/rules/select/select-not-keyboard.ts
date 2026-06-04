import type { Rule } from "~/rules/types";

export const selectNotKeyboard: Rule = {
  id: "select-not-keyboard",
  title: "Custom combobox has no keyboard support",
  wcag: "SC 2.1.1 Keyboard — Level A",
  tags: ["wcag2a", "wcag211"],
  description:
    "The select is rendered as a `<div role=\"combobox\">` with no associated listbox, no `aria-controls`, and no keyboard handlers. Sighted mouse users see something that looks like a dropdown, but keyboard users cannot open it, arrow through options, or commit a choice. Screen readers announce \"combobox, collapsed\" but there is nothing to expand.",
  help:
    "Use the native `<select>` element. If you must build a custom combobox, follow the WAI-ARIA Authoring Practices: a focusable trigger with `aria-controls` pointing to a `role=\"listbox\"`, full keyboard support (Down/Up arrows, Home/End, type-ahead, Enter to commit, Escape to close), and managed focus.",
  helpUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
  learnTopicId: "select",
  evaluate(props) {
    if (props.renderAs !== "div-combobox") return null;
    return {
      severity: "serious",
      measurement:
        "Rendered as a `<div role=\"combobox\">` with no listbox, no aria-controls, and no keyboard handling — the control is inoperable without a mouse.",
    };
  },
};
