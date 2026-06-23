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

A switch represents a binary setting - something that is on or off. Wi-Fi on/Wi-Fi off, Dark mode on/Dark mode off, and so on. Both positions are equally valid states of a setting; neither is "doing nothing". This is what makes a switch different from a regular button (which performs an action) and from a toggle button (which applies or removes an effect).

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

If you build the pill from scratch, the most accessible foundation is a `<button>` with `role="switch"` and `aria-checked`:

```html
<button type="button" role="switch" aria-checked="false">
  Dark mode
</button>
```

`role="switch"` tells assistive technology that this control is a binary setting, and `aria-checked` carries its current value, so a screen reader announces it as _"Dark mode, switch, off"_.

A `<button>` does not automatically flip the value of `aria-checked` when it is clicked - so a small JavaScript event handler is needed. Because a native `<button>` fires its click event on both Space and Enter as well, you don't need to add keyboard support to the event handler:

```js
const sw = document.querySelector('[role="switch"]');

sw.addEventListener("click", () => {
  const isOn = sw.getAttribute("aria-checked") === "true";
  sw.setAttribute("aria-checked", String(!isOn));
});
```

That is now a complete, working switch - it just looks like an ordinary button with no visual indication of whether it is switched on (`true`) or switched off (`false`). This is one of the reasons why styling it as a pill is so common, because it provides this visual indication.

The pill appearance is pure CSS, layered on top of the same markup and behaviour. Add a track and thumb for the CSS to paint, keeping the label as visible text:

```html
<button type="button" role="switch" aria-checked="false" class="switch">
  <span class="switch__label">Dark mode</span>
  <span class="switch__track" aria-hidden="true">
    <span class="switch__thumb"></span>
  </span>
</button>
```

```css
.switch {
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  min-height: 44px; /* comfortable target size */
  border: 0;
  background: none;
  color: inherit;
  cursor: pointer;
}

.switch:focus-visible {
  outline: 2px solid #1a73e8; /* your focus colour */
  outline-offset: 2px;
  border-radius: 6px;
}

/* The pill track and the sliding thumb */
.switch__track {
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 999px;
  background: #767676; /* off */
}

.switch__thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
}

/* The on state is driven by aria-checked - the same attribute the
   screen reader reads - so the look can never drift out of step with
   what assistive technology announces. */
.switch[aria-checked="true"] .switch__track {
  background: #1a73e8; /* on */
}

.switch[aria-checked="true"] .switch__thumb {
  transform: translateX(20px);
}

/* Respect users who prefer reduced motion */
@media (prefers-reduced-motion: no-preference) {
  .switch__track,
  .switch__thumb {
    transition:
      background-color 150ms,
      transform 150ms;
  }
}
```

Driving the track colour and the thumb position from `[aria-checked="true"]` is the important part: one value controls the look _and_ the announcement, so the two cannot disagree. The click handler from earlier already keeps `aria-checked` in step, and it does not care whether the button is styled, so the same code drives this pill. This is exactly how the button switch in the demo below is built.

### See both approaches side by side

Both controls below are switches - a screen reader announces each as _"Dark mode, switch, on"_ or _"off"_ - but they sit at opposite ends of the styling effort. The left one is the **unstyled native checkbox** from Option 1: notice it still looks like a checkbox, because `role="switch"` changes only what assistive technology announces, not the appearance. The right one is Option 2's `<button>` styled into the familiar pill, with its accessibility requirements driven by `aria-checked`.

Toggle either control and that card flips into dark mode, so you can see the switch, its label, and the card background all respond. Focus either one with the Tab key: both respond to Space, and the button also responds to Enter, as buttons do.

::switch-demo
::

## Keep the label stable

A switch's label should name the setting, not its current state. "Dark mode" stays "Dark mode" whether the setting is on or off.

If you want to convey extra context about the current value, two patterns work:

- The switch's own state (`aria-checked` or `checked`) - assistive technology already announces this.
- Helper text near the switch - a small line of supplementary description.

This separation helps users understand both what the setting controls (the label) and what its current value is (the switch state).

## Make the label clickable

Users expect to tap the text label to flip a switch. That is standard for smartphone settings screens and in most modern desktop interfaces.

The native checkbox approach gives you this for free, as long as the `<label>` is associated with the `<input>` (either by wrapping it or via the `for`/`id` pair). The custom button approach does not - you will need to wire the label's click event to the button's click event manually.

A larger actionable area benefits everyone. Switches themselves can be small, so a clickable label is especially helpful for touch users and users with motor differences.

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
