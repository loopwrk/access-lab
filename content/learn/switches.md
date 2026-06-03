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

A switch represents an on/off setting. Dark mode is on. Notifications are off. The value the control holds is the meaningful thing — there is no action verb separate from the state. This makes a switch semantically different from a toggle button, even though both flip between two states on activation.


## The correct pattern

Use a `<button>` with `role="switch"` with `aria-checked`. The role tells assistive technology this is a setting; the attribute carries the current value. Screen readers announce "Dark mode, switch, on."

Alternatively, use a native `<input type="checkbox" role="switch">` linked to a `label`. The browser handles keyboard activation, focus, and label-click forwarding for free. This is the easiest path when the switch lives inside a form.

Keep the label stable. Dark mode does not become Light mode when the switch flips — the label always describes what the setting controls, and aria-checked carries the current value.


## Label click forwarding

Clicking the visible label should activate the switch. Users expect this affordance — it matches every operating system and every major design system (iOS, Material, Bootstrap, GitHub).

With `<input type="checkbox" role="switch">` linked via `<label for="...">`, the browser forwards label clicks automatically. With `<button>` with `role="switch"` it does not — `<label for="...">` only binds to native form controls. You either wrap the switch in a clickable container with JavaScript, or use the native checkbox pattern instead.

Forwarding the click also extends the effective target size, which helps WCAG 2.5.5 Target Size and 2.5.8 Target Size Minimum. Motor-impaired users and touch users especially benefit.


## Switch vs. checkbox

Both can hold an on/off value. The boundary is conventional rather than strict, but two rules of thumb work in practice.

Use a switch when the change takes effect immediately. Flipping Dark mode applies the theme; flipping Notifications enables or disables them right now.

Use a checkbox when the value is submitted later as part of a form. "I agree to the terms" stays unchecked until you tick it; the value only matters when the form posts.


## Common anti-patterns


### Three failure modes show up repeatedly:

No role or state. The element is a plain button that toggles a class on click. Sighted users see the change; assistive technology announces it as a button with no indication it represents a setting. Level A failure of SC 4.1.2 Name, Role, Value.

aria-pressed on a switch. aria-pressed is the toggle-button pattern — assistive tech announces "button, pressed." A switch should announce "switch, on." The patterns are not interchangeable; reach for the right one for the semantic.

Label that flips between Dark and Light. The label should describe the setting ("Dark mode"), not the current state. Let aria-checked carry the on/off value.


## Related topics

Toggle buttons and aria-pressed

How accessible names work
