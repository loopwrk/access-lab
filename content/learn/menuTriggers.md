---
title: Menu triggers and the menu button pattern
topicId: menu-triggers
category: interaction
order: 11
related:
  - accessible-name
  - disclosure-triggers
summary: A menu trigger opens a popup of choices. The button needs both
  aria-haspopup and aria-expanded, plus a real keyboard contract that browsers
  do not give you for free.
---

A menu trigger is a button that opens a popup of choices — a profile menu, an actions overflow, a context menu. It is the most ARIA-heavy of the disclosure family because the popup is a custom widget that the browser does not understand natively, so the relationship and the keyboard behaviour are both your responsibility.


## The correct pattern

Use a plain `<button>` element with both `aria-haspopup` and `aria-expanded`. The first tells assistive technology that activating the button reveals a popup; the second carries the current open/closed state.

Mark the popup with `role="menu"` and each choice with `role="menuitem"`. Screen readers announce the trigger as "Account, menu button, collapsed" and the items as "Profile, menu item, 1 of 3" — the menu metaphor is preserved end to end.

Like the disclosure pattern, the popup itself should be hidden with the browser-native `hidden` attribute (or `display: none`) when closed. Hidden popups stay out of the accessibility tree, matching how assistive tech expects a closed menu to behave.


## Why both attributes are needed

`aria-haspopup` and `aria-expanded` solve different problems. aria-haspopup tells the user what kind of widget the button opens — a menu, a listbox, a dialog. aria-expanded tells them whether it is currently open. Drop either and the announcement degrades.

With aria-haspopup but no aria-expanded, the screen reader announces "Account, menu button" — but on every activation, regardless of state. The user cannot tell whether the menu is open without exploring the page.

With aria-expanded but no aria-haspopup, the announcement becomes "Account, button, expanded" — the generic disclosure announcement. The user is not told that activating the button reveals a menu of choices to pick from, only that something opened.


## The keyboard contract


### Native browsers give you nothing for menus beyond "Enter and Space activate buttons." Everything else is yours to wire up. The WAI-ARIA Authoring Practices specify the full keyboard contract:

Down Arrow opens the menu and moves focus to the first item. Up Arrow opens the menu and moves focus to the last item. Enter and Space open the menu without moving focus.

Inside the menu, Down Arrow and Up Arrow move between items (wrapping at the ends). Home jumps to the first item; End jumps to the last. Typing a letter jumps to the next item whose label starts with that letter.

Escape closes the menu and returns focus to the trigger. Tab closes the menu and continues outward focus order, as if the menu had not been there. Clicking outside the menu also closes it.

None of these are free. They require listeners on the trigger and on the menu, a roving tabindex pattern across the menu items (every item gets tabindex="-1" and focus is moved with JavaScript), and an outside-click handler. Most accessibility regressions in menu components come from skipping one of these steps.


## Common anti-patterns


### Three failure modes show up repeatedly:

No aria-haspopup and no aria-expanded. The element is a plain button that toggles a div on click. Sighted users see the popup; assistive technology announces a button with no popup relationship and no state. Level A failure of SC 4.1.2 Name, Role, Value.

Half-wired ARIA. The developer copy-pasted aria-haspopup from a guide and shipped without aria-expanded, or the other way round. Looks correct to automated tools; reads incorrectly to users.

Click-only menus. The popup opens with a mouse click but the arrow keys, Escape, and outside-click do nothing. Keyboard users can sometimes get focus into the menu by tabbing, but cannot exit cleanly, cannot navigate with arrows, and may end up trapped.


## Menu vs. select

If the popup is a list of options the user picks one of, and the picked value persists as the value of a form field, you probably want a `<select>` element or the listbox pattern — not a menu. Selects and listboxes carry a current value; menus do not.

Reach for a menu when the popup is a list of actions to perform — "Edit, Duplicate, Delete", "Sort ascending, Sort descending, Sort by date". Each item is a verb. Activation runs the action and the menu closes.

Reach for `<select>` or the ARIA listbox pattern when the popup is a list of values to choose between, where the chosen value sticks. Country, time zone, theme.


## Related topics

Disclosure triggers and aria-expanded

How accessible names work
