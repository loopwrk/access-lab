import type { ManualChecklistItem } from "~/rules/types";

export const selectManualChecklist: ManualChecklistItem[] = [
  {
    id: "select-keyboard-opens",
    title: "Pressing Down Arrow, Space, or Enter opens the dropdown",
    wcagSc: "2.1.1 Keyboard",
    description:
      "Tab to the select with the keyboard and press Down Arrow (or Space / Enter on most browsers). The dropdown should open and focus should land on the current value. Native `<select>` does this for free; custom comboboxes need keyboard handlers wired by hand.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html",
  },
  {
    id: "select-arrow-navigation",
    title: "Arrow keys move between options once open",
    wcagSc: "2.1.1 Keyboard",
    description:
      "With the dropdown open, Up and Down Arrows should move between options without committing the choice (some browsers commit on each move — both behaviours are acceptable). Home jumps to the first option, End to the last.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html",
  },
  {
    id: "select-escape-closes",
    title: "Escape closes the dropdown without changing the value",
    wcagSc: "2.1.2 No Keyboard Trap",
    description:
      "Press Escape while the dropdown is open. The list should close and the previously-selected value should remain. Without this, keyboard users who open the dropdown by accident have no way to back out cleanly.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html",
  },
  {
    id: "select-type-ahead",
    title: "Typing a letter jumps to the next matching option",
    wcagSc: "2.1.1 Keyboard",
    description:
      "With the dropdown closed but focused, typing a letter should move the selection to the next option whose label starts with that letter. Pressing the same letter again cycles to the next match. Native selects implement this for free.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html",
  },
  {
    id: "select-label-clickable",
    title: "Clicking the label focuses the select and opens the picker",
    wcagSc: "2.5.5 Target Size (Enhanced)",
    description:
      "If the label is correctly associated, clicking it should focus the select (and on most browsers, open the dropdown). A bare `<div>` labelling the field has no programmatic association — only the small select arrow itself is clickable.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html",
  },
  {
    id: "select-required-cue",
    title: "`required` is paired with a visible cue",
    wcagSc: "3.3.2 Labels or Instructions",
    description:
      "Setting `required` makes the browser block form submission when no choice is made, but it adds no visible indicator on its own. The label or surrounding text must explicitly state the field is required (e.g. \"Plan (required)\" or a visible asterisk with a key explaining it).",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html",
  },
  {
    id: "select-mobile-native",
    title: "The mobile browser uses its native picker",
    wcagSc: "4.1.2 Name, Role, Value",
    description:
      "On phones and tablets, the native `<select>` opens the platform's accessible picker — a wheel on iOS, a list on Android. Custom comboboxes break this entirely, forcing mobile users into a fiddly DOM-based picker that often misses touch-target and screen-reader contracts.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/name-role-value.html",
  },
  {
    id: "select-multiple-instructions",
    title: "Multiple selection is paired with a usage hint",
    wcagSc: "3.3.2 Labels or Instructions",
    description:
      "If the select uses `multiple`, the label or helper text should explain how to select more than one (e.g. \"Hold Cmd / Ctrl to pick more than one\"). The visual rendering changes from a dropdown to a list-box, but the multi-select interaction is not discoverable from the visual alone.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html",
  },
];
