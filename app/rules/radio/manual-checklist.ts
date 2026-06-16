import type { ManualChecklistItem } from "~/rules/types";

export const radioManualChecklist: ManualChecklistItem[] = [
  {
    id: "radio-shared-name",
    title: "All radios in the group share the same `name` attribute",
    wcagSc: "1.3.1 Info and Relationships",
    description:
      "The `name` attribute is what makes a set of radios mutually exclusive. If two radios in the same visual group have different names, the browser will let the user select both - they are technically separate groups. Inspect the rendered HTML and confirm a single name across the set.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html",
  },
  {
    id: "radio-arrow-keys-navigate",
    title: "Arrow keys move between radios within the group",
    wcagSc: "2.1.1 Keyboard",
    description:
      "Native radios get a roving tabindex: Tab moves into the group, then Arrow keys (Up/Down/Left/Right) move between options. Tab moves OUT of the group. Custom div-based radios break this entirely unless the keyboard handlers are wired by hand.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html",
  },
  {
    id: "radio-label-clickable",
    title: "Clicking the label selects the radio",
    wcagSc: "2.5.5 Target Size (Enhanced)",
    description:
      "A correctly-associated `<label>` extends the click target from the small native circle to the full label text. Click each label and confirm the radio selects. If the label is not associated, only the circle itself is clickable - much worse for touch users.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html",
  },
  {
    id: "radio-focus-visible",
    title: "The focus indicator is clearly visible",
    wcagSc: "2.4.7 Focus Visible",
    description:
      "Tab to the group and arrow through each radio. A visible focus ring should appear on the currently-focused option. Native radio focus styling is subtle by default - consider whether it meets the 3:1 contrast minimum against adjacent colours.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html",
  },
  {
    id: "radio-legend-describes-choice",
    title: "Group legend describes the choice being made",
    wcagSc: "1.3.1 Info and Relationships",
    description:
      'The `<legend>` text should answer the implicit question "what am I choosing between?". A vague legend like "Options" is far less helpful than "Which plan would you like?". Read the legend before each option in your head - does the combination make sense?',
    url: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html",
  },
  {
    id: "radio-required-on-group",
    title: "`required` applies to the group, not the individual radio",
    wcagSc: "3.3.2 Labels or Instructions",
    description:
      "Setting `required` on any one radio in the group means the form will not submit until one option in the group is selected. The browser treats this as a group-level constraint. If the field is required, make sure the legend or surrounding text says so - `required` alone has no visible cue.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html",
  },
  {
    id: "radio-default-selection",
    title: "Consider whether a default option is appropriate",
    wcagSc: "3.3.2 Labels or Instructions",
    description:
      'Pre-selecting one radio by default speeds up filling the form but can also push users toward a choice they did not intend (the "dark pattern" of pre-checking a marketing opt-in). Default to a selection only when one option is genuinely the most common or safest answer.',
    url: "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html",
  },
];
