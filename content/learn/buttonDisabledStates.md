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


## What the disabled attribute does


### Setting the disabled attribute on a button or input button changes four things at once:

- Click events are not fired. The browser blocks them at the event-dispatch layer, so JavaScript handlers never run.
- The button is removed from the keyboard focus order by default. Tab and Shift+Tab skip past it.
- The button does not participate in form submission. A disabled submit button cannot trigger the form, and its value is not included in the form's payload.
- The form's implicit-submit-on-Enter behaviour skips disabled buttons when picking which submit control to fire.

The result is a control that is visually present but completely inert. For genuinely unreachable functionality, this is the right tool.


## How screen readers announce disabled buttons

Screen readers announce a disabled button differently from an enabled one. NVDA and JAWS say "dimmed" or "unavailable". VoiceOver says "dimmed". The element is still in the accessibility tree, so a user navigating the page sequentially will hear it, but they will be told they cannot interact with it.

Some virtual-cursor modes skip disabled controls entirely. Users may not realise the button exists or what it does. This is the accessibility cost of disabling: the user gets less information than a sighted user who can read context around the dim button.


## The aria-disabled alternative

Setting aria-disabled="true" on a button takes a different approach. The button remains in the focus order, remains clickable, and continues to fire events. Screen readers still announce it as disabled, but the button is reachable, and your JavaScript can decide what to do when it is activated.

A common pattern: a form's primary submit button gets aria-disabled while validation is incomplete. When the user clicks it anyway, the page scrolls to the first invalid field and explains what is wrong. The user receives feedback instead of silence.

The visual styling comes from a CSS selector like [aria-disabled="true"]. The HTML disabled attribute has its own browser-supplied dim styling; aria-disabled does not, so you must style it yourself.

Choose between the two based on what the user should be able to do. If the button is genuinely unreachable, use disabled. If you want users to be able to click it and get feedback explaining the disabled state, use aria-disabled and handle the click in JavaScript.


## When to avoid disabled buttons altogether

Some accessibility practitioners argue that disabled buttons should be avoided in favour of always-enabled buttons with clear, visible error messages. The argument is that a disabled submit button gives the user less information than an enabled button that explains exactly what is wrong.

There is no WCAG rule against the disabled attribute. Both approaches can be accessible. The aria-disabled pattern is a middle ground: the button looks unavailable, the user can still click it, and the click handler provides specific feedback.


## Practical guidance

- Use disabled when the button is genuinely inert. A deleted record cannot be re-deleted; that button should be disabled and unreachable.
- Use aria-disabled when you want the user to be able to click and receive feedback. Validation-pending submit buttons are the canonical example.
- Never communicate disabled state with colour alone. The browser's dim styling is one cue; pair it with the disabled attribute or aria-disabled so the meaning is conveyed to assistive technology as well.
- Consider whether disabled is the right pattern at all. An enabled button with a clear error message often serves users better, particularly users who cannot easily perceive the dim styling.

## Related topics

What counts as an accessible name

Why button type matters
