---
title: Toggle buttons and aria-pressed
topicId: toggle-buttons
category: buttons-with-state
order: 1
related:
  - accessible-name
  - switches
  - toggle-vs-switch
concepts:
  - button-element
  - aria-state
summary: A toggle button applies or removes a specific effect - Bold, Mute,
  Pin, Like. Use a button with aria-pressed; never aria-checked, never
  visual-only.
---

A toggle button is a control that applies or removes a specific effect. For example, a button that makes text bold in a text editor, a button that mutes audio in a video player, or activating a thumbs-up icon-button to "like" a post. The button stays "pressed" while the effect is applied and returns to "unpressed" when it is removed.

> Not sure if you should use a toggle button or a switch? See [Choosing between a toggle and a switch](/learn/toggle-vs-switch).

Because the button stays in a state (e.g. pressed or unpressed), it needs to communicate two pieces of information: what the button does, and whether the effect is currently applied.

## The correct pattern

Build a toggle button on a `<button>` element and add the `aria-pressed` attribute. The attribute tells assistive technology that this control toggles, and carries its current value.

```html
<button type="button" aria-pressed="false">
  Bold
</button>
```

Screen readers typically announce this as _"Bold, toggle button, not pressed"_, and as _"Bold, toggle button, pressed"_ once the effect is applied.

Your click handler should do two things in the same step:

1. Apply (or remove) the effect on whatever the button controls.
2. Flip `aria-pressed` between `"true"` and `"false"`.

If you only do one of those, the visual state and the announced state will disagree.

## Keep the label stable

A common temptation is to swap the visible text based on state - "Mute" becomes "Unmute" once muted. It is almost always better to keep the label as the name of the action and let `aria-pressed` do the work of communicating whether it's active or not.

A stable label is easier on two groups of users in particular:

- **Voice-control users** speak the text they see on screen to activate a control. A label that keeps changing means the spoken command changes too, and users cannot be sure what to say.
- **Screen reader users** build a mental map of the page from the names of its controls. A label that stays put is easier to find again, and the `pressed` / `not pressed` state already says everything that needs to be said about the current value.

Changing the label is not strictly forbidden, but a stable name produces a more predictable interface.

## Common mistakes

### Visual-only toggles

The button changes appearance when clicked, such as a background colour shift or adding/changing a border - but `aria-pressed` is missing. Sighted users see the change; assistive technology has no information that anything has toggled, and screen reader users hear the same plain button announcement either way. This breaks [WCAG 4.1.2 Name, Role, Value](https://www.w3.org/WAI/WCAG21/Understanding/name-role-value).

### Using `aria-checked` instead of `aria-pressed`

`aria-checked` is for checkboxes, radio buttons, and switches. A toggle button uses `aria-pressed`. Mixing them up announces the control as the wrong kind of thing - a toggle button with `aria-checked` is announced as if it were a switch, which gives users an inaccurate mental model of what activating it will do.
