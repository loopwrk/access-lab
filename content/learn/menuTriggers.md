---
title: Menu Triggers and Custom Popup Menus
topicId: menu-triggers
category: disclosure-and-menu
order: 2
related:
  - accessible-name
  - disclosure-triggers
concepts:
  - button-element
  - aria-state
  - menu-pattern
summary: A menu trigger opens a popup of choices. The button needs both
  aria-haspopup and aria-expanded, plus a real keyboard contract that browsers
  do not give you for free.
---

A menu trigger is a button that opens a pop-up list of choices, such as a settings menu. When building a custom menu using ARIA, browsers do not provide complete accessible behaviour automatically. This means you must implement keyboard interaction, focus management, and open/close state handling yourself using JavaScript.

## The Correct Pattern

If you are implementing the ARIA menu pattern, use a standard HTML `<button>` element with the following attributes:

- **`aria-haspopup="menu"`**
- **`aria-expanded="false"`** (Set to `true`, if you want it to be in an open state by default)

Optionally, you may include `aria-controls` to associate the button with the menu element it opens, although this is not strictly required.

The menu container should use `role="menu"` when implementing the ARIA menu pattern. Each interactive option inside it should use `role="menuitem"` to ensure assistive technologies correctly announce the structure and available actions.

When the menu is closed, the container element must be completely hidden using the native HTML `hidden` attribute or CSS `display: none`. This ensures it's not read by screen readers when closed.

#### Example

```html
<button
  type="button"
  id="menu-button"
  aria-haspopup="menu"
  aria-expanded="false"
>
  Actions
</button>

<ul id="actions-menu" role="menu" hidden>
  <li role="none">
    <a href="/edit" role="menuitem">Edit Item</a>
  </li>
  <li role="none">
    <button type="button" role="menuitem">
      Delete Item
    </button>
  </li>
</ul>
```

## Why Both Attributes Are Essential

The `aria-haspopup` and `aria-expanded` communicate two entirely different things:

1. **`aria-haspopup`** tells the user **what** kind of interface element will appear (e.g., a menu, a listbox, or a dialog window).
2. **`aria-expanded`** tells the user **when** that element is active and visible.

If you include `aria-haspopup` but forget `aria-expanded`, screen-reader users will be told that a menu exists, but they will not receive confirmation whether it has actually opened. Conversely, if you include `aria-expanded` without `aria-haspopup`, users will hear that a section expanded but will lack context on what type of HTML element has appeared.

## The Keyboard Contract

The keyboard behaviour described here applies specifically to the ARIA menu pattern (`role="menu"`). Browsers only provide basic keyboard support for the trigger element itself, so additional JavaScript is required to implement full menu navigation and focus control.

- **Down Arrow:** Opens the menu and automatically moves focus to the first menu item.
- **Up Arrow:** Opens the menu and automatically moves focus to the last menu item.
- **Up and Down Arrows (Inside the Menu):** Moves focus sequentially between the items. Many implementations wrap focus back to the top or bottom when reaching the ends.
- **Home and End:** Instantly jumps focus to the first or last menu item, respectively.
- **Escape:** Closes the menu immediately and returns focus directly back to the trigger button.
- **Tab:** Closes the menu and moves focus out of the component to the next focusable element in the normal page order.
- **Outside Clicks:** Clicking anywhere outside the open menu container should immediately close it.

Failing to implement this focus-management behavior is where most menu components break down. To make this work, you must listen for keyboard events and use programming strategies like a rolling `tabindex` or the `aria-activedescendant` attribute to manage which item is currently highlighted.

To learn how to implement the JavaScript required to make these elements accessible, [view this guide on MDN](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Keyboard-navigable_JavaScript_widgets?utm_source=chatgpt.com).
