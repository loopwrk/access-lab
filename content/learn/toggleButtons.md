---
title: Toggle Buttons and the aria-pressed Attribute
topicId: toggle-buttons
category: buttons-with-state
order: 1
related:
  - accessible-name
  - switches
concepts:
  - button-element
  - aria-state
summary: A toggle button is an action whose effect sticks — mute, bold, pin,
  follow. Use a button with aria-pressed; never aria-checked, never visual-only.
---

A toggle button is a control that performs a specific action and stays in that active state until you click it again. Common examples include a "Mute/Unmute" microphone button, a "Bold" text formatting button, or a "Pin" icon on a message board.

Because the button stays pressed, it needs to communicate two pieces of information: what the button does, and whether it is currently pressed or unpressed.

## The Correct Pattern

To build an accessible toggle button, use a standard HTML `<button>` element and add the `aria-pressed` attribute. This attribute explicitly tells assistive technologies that the button can be toggled, and communicates its current status.

When a screen reader encounters this element, it will typically announce something like _"toggle button, pressed"_ or _"toggle button, not pressed."_ When a user activates the button, your JavaScript must do two things simultaneously: perform the action (like muting the audio) and flip the `aria-pressed` value between `true` and `false`. This ensures the digital, behind-the-scenes state always matches the visual design on the screen.

## Why You Should Keep the Text Label Stable

When designing a toggle, it is very tempting to change the visible text label based on the current state (for example, swapping the text from "Mute" to "Unmute"). However, it is almost always better to keep the text label exactly the same and rely on `aria-pressed` to communicate the state.

Keeping a stable label (e.g., "Mute") has two major accessibility benefits:

1. **Better for voice control:** People using speech recognition software rely on the visible text to click a button with their voice. If the text constantly changes between "Mute" and "Unmute," the user might issue the wrong command or feel unsure of what to say.
2. **Better for screen readers:** People navigating non-visually build a mental map of your interface based on the names of the controls. A stable name combined with an `aria-pressed` status indicator prevents users from having to constantly relearn or re-map the button after every click.

While flipping the text label is not strictly forbidden, keeping a stable name makes your interface much more predictable and easier to navigate.

## Common Mistakes to Avoid

When building toggle buttons, developers frequently run into these three failure modes:

- **Visual-Only Changes:** The button changes visually when clicked—perhaps the background color shifts or the icon gains a thicker border—but the `aria-pressed` attribute is missing. Screen reader users will hear the exact same generic button announcement every time they interact with it, leaving them with no way to know if the toggle is actually active.
- **Using `aria-checked`:** The `aria-checked` attribute is strictly meant for checkboxes, radio buttons, and switches. A native `<button>` element does not support this state. Always use `aria-pressed` for standard buttons.
- **Flipping Labels Too Drastically:** If you do decide to change the text label (like switching from "Follow" to "Following"), be careful not to make the two labels so completely different that they sound like unrelated actions. Drastic shifts increase the mental effort required to understand the interface.

## Toggle Button vs. Switch

Because toggle buttons and switches both flip between two states, it can be confusing to know which one to use. Here is the standard rule:

- **Use a toggle button (`aria-pressed`):** When the control triggers a specific action that leaves a lingering effect, like _Muting_ audio, _Bolding_ text, or _Pinning_ a document. The action itself is the primary focus.
- **Use a switch (`aria-checked`):** When the control represents a system setting or preference, like turning on _Dark Mode_, enabling _Email Notifications_, or toggling _Wi-Fi_. The on/off value of the setting is the primary focus.
