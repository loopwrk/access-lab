---
title: Switches and role=switch
topicId: switches
category: buttons-with-state
order: 2
related:
  - accessible-name
  - toggle-buttons
  - toggle-vs-switch
concepts:
  - aria-state
  - form-control
  - accessible-name
summary: A switch represents a setting that is on or off - Wi-Fi, Dark mode,
  Notifications. Use a native checkbox with role=switch, or a button with
  role=switch and aria-checked.
---

A switch represents a binary setting - something that is on or off. Wi-Fi on/Wi-Fi off, Dark mode on/dark mode off etc. Both positions are equally valid states of a setting; neither is "doing nothing". This is what makes a switch different from a regular button (which performs an action) and from a toggle button (which applies or removes an effect).

> Not sure if you should use a switch or a toggle button? See [Choosing between a toggle and a switch](/learn/toggle-vs-switch).

## The correct pattern

There are two good ways to build a switch.

### Option 1: Native checkbox with role="switch"

```html
<label>
  <span>Dark mode</span>
  <input type="checkbox" role="switch" />
</label>
```

This is often the better choice. The browser handles keyboard activation, focus styling, and label-click behaviour without any JavaScript. Adding `role="switch"` tells assistive technology to announce the control as a switch rather than a checkbox, so screen readers say _"Dark mode, switch, on"_ instead of _"Dark mode, checkbox, checked"_.

### Option 2: Button with role="switch" and aria-checked

Switches are commonly styled as a pill with a sliding thumb - a visual popularised by [Material Design](https://m3.material.io/components/switch/overview) and mobile operating systems. Users have come to expect that look, and a native checkbox does not produce it without significant custom CSS.

If you build the pill from scratch, the most accessible approach is a `<button>` with `role="switch"` and `aria-checked`:

```html
<button
  type="button"
  role="switch"
  aria-checked="false"
>
  Dark mode
</button>
```

`role="switch"` tells assistive technology that this control is a binary setting, and `aria-checked` carries its current value. Your event handler should flip `aria-checked` between `"true"` and `"false"` each time the setting changes.

## Keep the label stable

A switch's label should name the setting, not its current state. "Dark mode" stays "Dark mode" whether the setting is on or off - flipping the label to "Light mode" would name a different setting and break the user's mental map of the control.

If you want to convey extra context about the current value, two patterns work:

- The switch's own state (`aria-checked` or `checked`) - assistive technology already announces this.
- Helper text near the switch - a small line of supplementary description.

This separation helps people understand both what the setting controls (the label) and what its current value is (the switch state).

## Make the label clickable

People expect to tap the text label to flip a switch. That is how it works in every smartphone settings screen and in most modern desktop interfaces.

The native checkbox approach gives you this for free, as long as the `<label>` is associated with the `<input>` (either by wrapping it or via the `for`/`id` pair). The custom button approach does not - you will need to wire the label's click event to the button's click event manually.

A larger clickable area benefits everyone, but it is especially helpful for touch users, people with motor difficulties, and anyone who finds small targets fiddly.

## Switch vs. checkbox

Both controls represent a binary choice. The difference is _when the change takes effect_:

- **Switch** - the setting changes the moment the user flips it. Turning on Airplane mode disables the radios right then.
- **Checkbox** - the choice is part of a larger form that the user submits later. Agreeing to terms of service, or selecting which topics a newsletter should cover.

If the user has to press a submit button before anything happens, use a checkbox. If the user's interaction itself is the commitment, use a switch.

## Common mistakes

### Silent switches

The element looks like a switch and flips visually, but there is no `role` and no `aria-checked` value. Assistive technology has no way to announce what the control is or what state it is in, so a screen reader user can hit it without realising it is interactive at all.

### Using `aria-pressed` instead of `aria-checked`

`aria-pressed` is for toggle buttons - controls that apply or remove an effect. A switch uses `aria-checked` so it is announced as on or off, not as pressed or not pressed.

### A label that flips with the state

Changing "Dark mode" to "Light mode" when the user flips the switch turns a setting label into something more like an action label. The state is already conveyed by the `checked` value; let the label name the setting and let the state speak for itself.
