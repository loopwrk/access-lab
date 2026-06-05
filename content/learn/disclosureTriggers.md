---
title: Disclosure trigger buttons and aria-expanded
topicId: disclosure-triggers
category: disclosure-and-menu
order: 1
related:
  - switches
  - toggle-buttons
concepts:
  - button-element
  - aria-state
  - disclosure-pattern
  - native-elements
summary: A disclosure trigger reveals a panel of related content. The trigger
  needs aria-expanded so assistive tech can announce whether the panel is open
  or shut.
---

A disclosure trigger is a `<button>` or a `<summary>` element (when wrapped in a `<details>` element) whose only job is to reveal or hide a region of related content.

Common examples where `<button>` elements are used as diclosure triggers are [accordions](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) and [expandable cards](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-card/). The trigger the button, which has a relationship with content that is shown or hidden (or most commonly, both), when the button is used.

In this article, we will be focusing on `<button>` elements only, however, note that `<summary>` elements are often preferred by developers as when they are paired with `<details>` elements, they can provide the same reveal/hide behaviour with accessibility features that are easier to implement as no JavaScript is required. read more about the `<details>` HTML details disclosure element [here](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/details).

## The correct pattern

Use a `<button>` element with `aria-expanded` when it controls a collapsible region of content. The attribute carries the current state of the panel. Flip it in the same click handler that shows or hides the panel.

Most screen readers announce a button with aria-expanded as "button, expanded" or "button, collapsed." The label stays stable - "Show details" stays "Show details" whether the panel is open or shut. The state is carried by the attribute, not by relabeling.

Hide the panel with the browser-native `hidden` attribute or `display: none`.

### The Button Trigger

- **`aria-expanded`**: This is the star of the show. Update it dynamically to `true` (open) or `false` (closed) via JavaScript.
- **What to avoid**: Do _not_ use `aria-haspopup` here. That attribute tells screen readers a menu or dialog is coming, which confuses users expecting a regular section of text.

### Connecting the Content

- Give your content panel (like a `<div>`) a unique `id`.
- Add **`aria-controls="your-id-here"`** to the button. This programmatically links the button to the panel it operates.

### Hiding the Content

When the panel is closed, hide it using the HTML `hidden` attribute or CSS `display: none`. This ensures screen readers completely ignore the hidden text until the user expands it.

#### Example

```html
<!-- The Button Trigger -->
<!-- Note: aria-expanded switches between -->
<!-- "true" and "false" via JavaScript -->
<button
  type="button"
  aria-expanded="false"
  aria-controls="faq-content-1">
  What is a disclosure pattern?
</button>

<!-- The Content Panel -->
<!-- Note: The 'id' matches the -->
<!-- 'aria-controls' value above. -->
<div id="faq-content-1" hidden>
  <p>
    A disclosure pattern is a simple UI
    mechanism that lets users toggle the
    visibility of a content section. It
    uses a button to control a content
    panel.
  </p>
</div>
```

## Understanding `aria-controls`

The `aria-controls` attribute points from a button to the content panel it opens using an `id`. Think of it as a virtual bridge connecting the trigger to the data.

However, **screen reader support for `aria-controls` is patchy.** Many screen readers ignore it entirely, while only a few use it to let users "jump" straight to the opened content. Because support is unreliable, you need to know when it actually matters.

---

## Keyboard behaviour and focus management

For simple disclosure patterns (such as accordions or "show more" sections), focus should normally remain on the trigger button when the panel is opened or closed.

When the user activates the button:

- The `aria-expanded` state updates (`true` or `false`)
- The associated panel becomes visible or hidden
- Focus does **not** automatically move into the revealed content

This keeps interaction predictable and prevents users from losing their place in the interface.

### When focus _should_ move

Only move focus into the revealed content when:

- The panel contains interactive elements that require immediate action (e.g. form inputs, filters, or dialogs)
- The content is functionally a new task area rather than informational expansion

If focus is moved, ensure:

- The transition is obvious to assistive technology users
- Focus is placed at a logical starting point inside the panel (usually the first focusable element)

### Why this matters

Automatic focus movement in simple disclosures can:

- Disorient keyboard and screen reader users
- Break expected tab order
- Make repeated toggling harder to control

Keeping focus stable ensures the disclosure behaves like an expansion of context, not a navigation event.

---

### When to Use `aria-controls`

- **When the content lives elsewhere on the page:** Use it if the button is in one part of the HTML (like a sidebar) but the content panel opens up somewhere else entirely.
- **The Golden Rule:** If you use it, ensure the `id` matches perfectly. A broken `aria-controls` link pointing to an ID that doesn't exist confuses screen readers much more than leaving the attribute off entirely.

### When It's Optional (The Common Case)

- **When the content is right next to the button:** If your content panel immediately follows the button in your HTML, `aria-controls` is just a "nice-to-have." You don't strictly need it because the natural structure of your HTML already solves the problem.

---

### The Best Alternative: Natural DOM Order

Instead of relying heavily on `aria-controls`, use the [DOM Order](https://web.dev/articles/dom-order-matters) to your advantage. This is the ultimate accessibility alternative.

If you place your content panel **immediately after** the button in your HTML:

1. The user interacts with the button and hears that it is collapsed.
2. They click it, and JavaScript changes `aria-expanded` to `true`.
3. They move to the very next element in the reading order, which is naturally the newly revealed content panel.

## Why the Label Should Stay the Same

It is tempting to flip a button's text between "Show details" and "Hide details" as it opens and closes. It feels intuitive to show what the button will do next, but this actually causes two major issues.

First, **voice-control users** navigate by speaking the exact text they see on the screen. If the text keeps changing, they cannot rely on a consistent voice command to interact with the button.

Second, **screen readers** automatically announce the state as "expanded" or "collapsed" based on your `aria-expanded` attribute. If you flip the text too, it sounds repetitive and confusing (like hearing "Hide details, collapsed").

Keeping a stable label (like "Details") and letting the `aria-expanded` attribute handle the state is much more predictable and accessible for everyone.

## Common Mistakes

Watch out for these two frequent mistakes when building disclosures:

### 1. The "Visual-Only" Toggle

The panel opens and closes perfectly on screen, but the button completely lacks the `aria-expanded` attribute. Sighted users see the change, but screen reader users just hear a plain button with zero indication that something was revealed. This breaks core accessibility standards ([WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value)).

### 2. The Frozen `aria-expanded` Attribute

The `aria-expanded` attribute is present on the button, but it stays stuck at `"false"`. The developer added it for compliance but forgot to toggle it to `"true"` inside their JavaScript click handler.

Sighted users see the panel open, but screen readers are told it is still closed. This is a sneaky bug because automated testing tools usually miss it, they see that the attribute exists and assume everything is working correctly.
