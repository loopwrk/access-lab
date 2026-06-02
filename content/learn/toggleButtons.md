---
title: Toggle buttons and aria-pressed
topicId: toggle-buttons
category: buttons-with-state
order: 1
related:
  - accessible-name
  - switches
summary: A toggle button is an action whose effect sticks — mute, bold, pin,
  follow. Use a button with aria-pressed; never aria-checked, never visual-only.
---

A toggle button is a button that performs an action and whose effect persists. Mute mutes audio and stays muted. Bold formats the selection and the next thing you type. Pin keeps a panel open until you unpin it. The button is still a button — you can activate it, repeatedly — but it also carries a state: pressed or not pressed.


## The correct pattern

Use a plain `<button>` element with `aria-pressed`. The attribute tells assistive technology that the button is a toggle, and what its current state is.

Screen readers announce a button with aria-pressed as "toggle button, pressed" or "toggle button, not pressed." The label stays stable across activations — Mute remains Mute whether the audio is muted or not. The state is carried by the attribute, not by relabeling.

On activation, flip aria-pressed. The same click handler that performs the action should also update the attribute. They must stay in sync.


## Why the label stays stable

It is tempting to change the label between Mute and Unmute as the state changes. The text-based intuition is that the button always says what it will do next. This is a common pattern, and it breaks two things.

First, voice-control users say the label to activate the control. Saying "Click the Mute button" becomes a race condition — at the moment of speaking, the button might be labelled either way. The user does not know which word to say.

Second, screen reader users expect the control's identity to stay constant. When the label flips, they have to mentally re-map the control on every activation. A stable label plus a state announcement is calmer and more predictable.


## Common anti-patterns


### Three failure modes show up repeatedly:

Visual-only state. The button changes appearance on click — colour, filled icon, border — but exposes no ARIA state. Screen reader users hear the same announcement on every activation and cannot tell whether the toggle is currently on or off. This is a Level A failure of SC 4.1.2 Name, Role, Value.

aria-checked on a plain button. aria-checked is only valid on widgets whose role expects it — checkbox, radio, switch. On a `<button>` it is not part of the role's supported state set. Assistive technology may ignore it or announce inconsistently.

Label that changes with state. The text alternates between Mute and Unmute (or Follow and Following). Stable labels read more reliably, especially for voice-control users.


## When it's a switch instead

A toggle button is an action with a sticky effect. A switch is an on/off setting — the value is the point. The boundary is fuzzy in casual speech, but the ARIA patterns differ.

Reach for `role="switch"` and aria-checked when the control represents a setting (Dark mode, Receive emails, Notifications). Reach for `<button>` with `aria-pressed` when it represents an action whose effect happens to persist (Mute, Bold, Pin).


## Related topics

Switches and role=switch

How accessible names work
