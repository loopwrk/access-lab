import type { Rule } from "~/rules/types";

export const selectNotKeyboard: Rule = {
  id: "select-not-keyboard",
  title: "Custom combobox has no keyboard support",
  wcag: "SC 2.1.1 Keyboard - Level A",
  tags: ["wcag2a", "wcag211"],
  description:
    'The select is rendered as a `<div role="combobox">` with no `aria-controls` to a real `role="listbox"`, no `role="option"` children, and only a minimal keyboard contract (Enter/Space opens the popup; arrow navigation, type-ahead, Escape, and focus management are all missing). Sighted mouse users can pick a value; keyboard users can open the popup but cannot move through the options. Screen readers announce "combobox, collapsed" but the expanded popup has no listbox semantics to navigate.',
  help: 'Use the native `<select>` element. If you must build a custom combobox, follow the WAI-ARIA Authoring Practices: a focusable trigger with `aria-controls` pointing to a `role="listbox"`, full keyboard support (Down/Up arrows, Home/End, type-ahead, Enter to commit, Escape to close), and managed focus.',
  helpUrl: "https://www.w3.org/WAI/ARIA/apg/patterns/combobox/",
  learnTopicId: "select",
  evaluate(props) {
    if (props.renderAs !== "div-combobox") return null;
    return {
      severity: "serious",
      measurement:
        'Rendered as a `<div role="combobox">` with no aria-controls, no `role="listbox"`, no `role="option"`, and no arrow-key navigation - only mouse and a partial keyboard toggle work.',
    };
  },
};
