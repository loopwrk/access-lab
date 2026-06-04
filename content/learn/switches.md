---
title: Switches and role=switch
topicId: switches
category: buttons-with-state
order: 2
related:
  - accessible-name
  - toggle-buttons
concepts:
  - aria-state
  - form-control
  - accessible-name
summary: "A switch is a setting whose value is the point: on or off. Use a
  button with role=switch and aria-checked, or natively an input type=checkbox
  with role=switch."
---

A switch represents a simple on/off setting, for example, turning notifications "on" or "off". The most important part of a switch is the state it currently holds. This makes it fundamentally different from a standard button, which is used to trigger a specific action (like "Submit" or "Delete").

In code terms, the value of the state that the switch holds would be akin to the position of a lightswitch:

- It would hold the value of **true** for the **on** state
- It would hold the value of **false** for the **off** state

## The Correct Pattern

You have two good options for building a switch.

1. **The Native Checkbox (Often Best):** Use a standard HTML `<input type="checkbox">` paired with a `<label>`. This is usually the easiest and most robust choice because the browser automatically handles all the keyboard controls, focus states, and label clicks without needing any extra JavaScript.
2. **The Custom ARIA Switch:** In modern web design you will often see switches styled like a pill/capsule, like [this example](https://m3.material.io/components/switch/overview) in Google Material Design. Because of this, users have started expecting this as the default, rather than the browser-styled standard. To implement accessiblity controls correctly, use a standard `<button>` element and add `role="switch"` along with an `aria-checked` attribute. The `role` tells assistive technologies that this is a binary setting, and `aria-checked` communicates whether it is currently on or off.

### Keep the Label Stable

The main label for a switch should remain consistent and describe what the setting controls, not its current state.

For example, a switch labelled "Dark mode" should not change its label to "Light mode" when toggled. Instead, the switch itself communicates state (on/off) through its checked state.

If you want to show the current state, do it through:

- the switch control’s on/off state (e.g. aria-checked or checked)
- optional secondary text or helper text near the control

This separation helps users understand both:

- what the setting controls (the label)
- what its current value is (the switch state)

## Making the Label Clickable

People naturally expect to be able to click the text label to flip a switch—this is how it works on almost every smartphone and modern operating system.

If you use the native `<input type="checkbox">` approach with a properly linked `<label>`, the browser makes the text clickable automatically. However, if you build a custom `<button role="switch">`, the browser will not do this for you. You must write custom code to ensure clicking the text label activates the switch.

Expanding the clickable area to include the text makes your interface much easier to use, particularly for people using touch screens, individuals with hand tremors, or anyone who benefits from larger interactive targets.

## Switch vs. Checkbox

Since both controls represent an on/off choice, it can be tricky to know which one to use. Here is the standard rule of thumb:

- **Use a switch for instant changes:** If flipping the control updates the interface or saves the setting immediately (like turning on Airplane Mode), use a switch.
- **Use a checkbox for delayed submission:** If the choice is part of a larger form that the user has to review and submit later (like agreeing to a terms of service policy), use a checkbox.

## Common Mistakes to Avoid

When auditing custom switches, these three errors show up all the time:

### 1. Completely Silent Switches

The element looks like a switch and flips back and forth visually, but the code does not include a `role` or an `aria-checked` state. Assistive technologies are left completely in the dark, leading to a critical accessibility failure.

### 2. Using `aria-pressed` Instead of `aria-checked`

The `aria-pressed` attribute is meant for toggle buttons (like a "Play/Pause" button), which tells screen readers to announce the button as "pressed" or "unpressed." A true switch should use `aria-checked` so it is announced clearly as "on" or "off."

### 3. Flipper Labels

As mentioned above, do not change the text label from "Dark Mode" to "Light Mode" when the user clicks it. Let the text describe the category, and let the switch's state communicate the status.
