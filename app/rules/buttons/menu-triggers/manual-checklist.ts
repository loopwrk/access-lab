import type { ManualChecklistItem } from "~/rules/types";
import { buttonManualChecklist } from "~/rules/buttons/shared/manual-checklist";

// Menu-specific keyboard and focus-management contract from the WAI-ARIA
// Authoring Practices for the Menu Button pattern. The studio renders
// bare markup with no keyboard handlers attached, so these are review-
// only items - students must verify the behaviour exists in their own
// implementation.
const menuKeyboardChecklist: ManualChecklistItem[] = [
  {
    id: "menu-opens-with-arrow",
    title: "Down Arrow opens the menu and moves focus to the first item",
    wcagSc: "2.1.1 Keyboard",
    description:
      "Pressing Down Arrow on a focused menu trigger should open the menu and place focus on the first menu item. Pressing Up Arrow should open the menu and place focus on the last item. Enter and Space open the menu without moving focus.",
    url: "https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/",
  },
  {
    id: "menu-escape-closes",
    title: "Escape closes the menu and returns focus to the trigger",
    wcagSc: "2.1.2 No Keyboard Trap",
    description:
      "Pressing Escape while focus is inside the menu should close the menu and move focus back to the trigger button. Without this, keyboard users have no consistent way to dismiss the popup.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html",
  },
  {
    id: "menu-arrow-navigation",
    title: "Arrow keys move between menu items",
    wcagSc: "2.1.1 Keyboard",
    description:
      "Down Arrow and Up Arrow should move focus between menu items, wrapping at the ends. Home jumps to the first item; End jumps to the last. Typing a letter should jump to the next item whose label starts with that letter.",
    url: "https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/",
  },
  {
    id: "menu-tab-closes",
    title: "Tab closes the menu and continues outward focus order",
    wcagSc: "2.4.3 Focus Order",
    description:
      "Tab from inside an open menu should close the menu and move focus to the next focusable element on the page, as if the menu had not been there. Trapping Tab inside the popup breaks the expected page-level focus order.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html",
  },
  {
    id: "menu-outside-click",
    title: "Clicking outside the menu closes it",
    wcagSc: "3.2.1 On Focus",
    description:
      "Clicking anywhere outside the menu (including on other interactive controls) should close the menu. Without this, the menu can be left visibly open even when the user has moved on.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/on-focus.html",
  },
];

export const menuTriggerManualChecklist: ManualChecklistItem[] = [
  ...buttonManualChecklist,
  ...menuKeyboardChecklist,
];
