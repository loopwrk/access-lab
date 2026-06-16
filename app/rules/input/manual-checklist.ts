import type { ManualChecklistItem } from "~/rules/types";

export const inputManualChecklist: ManualChecklistItem[] = [
  {
    id: "label-visible-and-associated",
    title: "Make sure the label is visible and clearly associated with the input",
    wcagSc: "1.3.1 Info and Relationships, 3.3.2 Labels or Instructions",
    description:
      "Every input needs a visible label that is programmatically associated with it - either through `<label for>` matching the input's id, or by wrapping the input inside the label. Placeholder text is not a label; it disappears the moment the user starts typing and is not announced reliably by assistive technology.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/labels-or-instructions.html",
  },
  {
    id: "visible-focus-indicator",
    title: "Make sure there is a visible focus indicator",
    wcagSc: "2.4.7 Focus Visible",
    description:
      "When the input receives keyboard focus, the user should be able to see clearly that it is focused. Browser defaults usually satisfy this, but custom styling can remove the focus ring accidentally. Tab to the input and confirm a visible outline appears.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html",
  },
  {
    id: "error-message-association",
    title: "Make sure error messages are visible and announced",
    wcagSc: "3.3.1 Error Identification, 3.3.3 Error Suggestion",
    description:
      'If validation fails, the error message should be visible near the input AND associated with it via `aria-describedby` pointing at the error element\'s id. Combined with `aria-invalid="true"` on the input, assistive technology announces the error as soon as the field is focused.',
    url: "https://www.w3.org/WAI/WCAG22/Understanding/error-identification.html",
  },
  {
    id: "touch-target-size",
    title: "Check the input has a sufficient touch target",
    wcagSc: "2.5.8 Target Size (Minimum)",
    description:
      "The input's clickable area should be at least 24 by 24 CSS pixels for WCAG AA, ideally 44 by 44 for AAA. A clickable label associated with the input enlarges the effective target, which helps touch users, people with hand tremors, and anyone aiming with imprecise pointers.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html",
  },
  {
    id: "autocomplete-on-personal-info",
    title: "Add the autocomplete attribute for personal information fields",
    wcagSc: "1.3.5 Identify Input Purpose",
    description:
      'Inputs that collect personal information - name, email, phone, address, payment details - should declare the autocomplete attribute with the appropriate value (e.g. autocomplete="email"). This enables browser autofill, supports users with cognitive disabilities who benefit from not retyping information, and helps people using motor-assistive input devices.',
    url: "https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html",
  },
  {
    id: "works-at-200-percent-text",
    title: "Does the input still work at 200% text size?",
    wcagSc: "1.4.4 Resize Text",
    description:
      "Increase your browser text size to 200%. Is the label still visible alongside the input? Does the input still fit on screen without horizontal scrolling? Is the placeholder readable? The full interaction should remain usable at this zoom level.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html",
  },
];
