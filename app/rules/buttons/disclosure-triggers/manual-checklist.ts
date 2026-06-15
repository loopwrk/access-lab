import type { ManualChecklistItem } from "~/rules/types";
import { buttonManualChecklist } from "~/rules/buttons/shared/manual-checklist";

// Disclosure-specific review points from the WAI-ARIA Authoring Practices for
// the Disclosure pattern. The studio renders bare markup and drives state from
// the controls panel, so confirming these on a real screen reader and by
// keyboard is something only a person can do — hence the manual checklist.
const disclosureReviewChecklist: ManualChecklistItem[] = [
  {
    id: "disclosure-state-announced",
    title: "A screen reader announces the panel opening and closing",
    wcagSc: "4.1.2 Name, Role, Value",
    description:
      "Turn on a screen reader, activate the trigger, and listen. It should announce the change from collapsed to expanded and back again on every activation — not stay silent or read the same thing each time. This is what aria-expanded provides.",
    url: "https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/",
  },
  {
    id: "disclosure-keyboard-toggle",
    title: "Both Enter and Space show and hide the panel",
    wcagSc: "2.1.1 Keyboard",
    description:
      "Using the keyboard alone, move to the trigger and press Enter, then Space. Both should open and close the panel. A native button element gives you this for free; a div or span with a click handler does not.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/keyboard.html",
  },
  {
    id: "disclosure-focus-stays",
    title: "Focus stays on the trigger after it is activated",
    wcagSc: "2.4.3 Focus Order",
    description:
      "Activating a disclosure should not move focus. Focus stays on the trigger so the same key can collapse it again. This is different from a menu or dialog, which deliberately move focus into the thing they open.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html",
  },
  {
    id: "disclosure-panel-follows-trigger",
    title: "The panel comes straight after the trigger in reading order",
    wcagSc: "1.3.2 Meaningful Sequence",
    description:
      "Check that the revealed panel follows the trigger in the page's reading order, so screen reader and keyboard users reach the new content immediately after the button rather than finding it somewhere unexpected.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/meaningful-sequence.html",
  },
];

export const disclosureTriggerManualChecklist: ManualChecklistItem[] = [
  ...buttonManualChecklist,
  ...disclosureReviewChecklist,
];
