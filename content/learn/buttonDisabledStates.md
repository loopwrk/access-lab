---
title: Disabled states on buttons
topicId: button-disabled-states
category: forms
order: 4
related:
  - accessible-name
  - button-types
concepts:
  - button-element
  - disabled-state
summary: "The disabled attribute makes a button inert: no clicks, no focus, no
  submit. The aria-disabled alternative keeps the button reachable while
  announcing its unavailable state."
---

Buttons can be marked as unavailable in two different ways, and the choice between them changes how the button behaves for every user. Knowing the difference prevents a common class of accessibility bugs where a button looks disabled but does not behave that way.

## What the Native `disabled` Attribute Does

Setting the native `disabled` attribute on a `<button>` or an `<input type="button">` completely changes its behavior across the browser. It triggers four automatic behaviors:

- **Blocks Interactivity:** Click and touch events are stopped by the browser, meaning your JavaScript click handlers will never run.
- **Removes Keyboard Focus:** The button is dropped from the natural tab order. Users navigating via keyboard (Tab and Shift + Tab) will skip past it entirely.
- **Excludes Form Submission:** A disabled submit button cannot send form data, and its value is left out of the form's payload.
- **Skips Implicit Submission:** The browser ignores disabled buttons when deciding which control to activate if a user presses Enter inside a form field.

The result is a control that is visually present but completely inert. For functionality that a user genuinely cannot access under any circumstances, this is the correct tool.

## How Screen Readers Announce Disabled Buttons

Screen readers use specific terms to indicate that a native button is present but not available for interaction.

For example:

- **NVDA and JAWS** typically announce the button as _"dimmed"_ or _"unavailable"_.
- **VoiceOver** usually announces it as _"dimmed"_.

In some navigation modes, screen readers may skip disabled controls entirely. In these cases, users may not encounter the button while exploring the page.

This is an important trade-off: disabling an element natively can reduce the amount of information available to users who navigate non-visually, compared to users who can see the full interface.

## The `aria-disabled` alternative

Setting `aria-disabled="true"` on a button does not change how the browser behaves. It only communicates state to assistive technologies.

Unlike the native `disabled` attribute, `aria-disabled` does not enforce any interaction rules. It is purely descriptive.

This means:

- the element remains focusable (if it normally would be)
- the element remains interactive unless you explicitly block interaction in JavaScript
- it will still fire events unless your code prevents them

Screen readers will usually announce the button as disabled, but this depends on the browser and assistive technology combination.

A common pattern is to visually mark a submit button as disabled using `aria-disabled` while still allowing interaction. The event handler then provides feedback, such as highlighting missing fields or showing an error message.

Because `aria-disabled` does not provide native styling or behaviour, both must be handled manually.

## Choosing Between Disabled and Active States

Many accessibility specialists recommend avoiding the native `disabled` attribute on form submissions in favor of an always-active button paired with clear error messages. A locked, unclickable button does not provide built-in feedback about why it is unavailable. An always-active button, paired with validation feedback, can communicate what needs to be fixed more clearly.

However, there is no Web Content Accessibility Guidelines (WCAG) rule banning the `disabled` attribute. Both strategies can be implemented successfully depending on your use case.

## Practical Guidance

- **Use `disabled` for permanently locked actions:** If an action cannot be performed under any circumstances (e.g. trying to delete a record that has already been removed), use the native `disabled` attribute to make it completely inert.
- **Use `aria-disabled` when the element should appear unavailable but still remain operable in your interaction design:** If the button will become available once the user fixes a mistake (like filling out a required form field), use `aria-disabled="true"` so they can click it to discover what needs correcting.
- **Never communicate state with color alone:** The browser's default faint text color is not enough. Always pair your visual designs with either the native `disabled` attribute or `aria-disabled="true"` so the state is passed to assistive technologies.
- **Account for low contrast:** Default browser styling for disabled buttons often reduces visual prominence (for example by lowering opacity or contrast). This can make the control harder to perceive, especially for users with low vision or in high-glare environments.
