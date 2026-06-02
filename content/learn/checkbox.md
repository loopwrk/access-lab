---
title: Checkbox and label association
topicId: checkbox
category: form-inputs
order: 1
related:
  - accessible-name
  - switches
summary: A checkbox captures a yes-or-no value as part of a form. Labelling it
  correctly and grouping related checkboxes inside a fieldset/legend are the two
  lessons that get missed most often.
---

A checkbox is the simplest form control after a text input: it holds a boolean value that the form submits when checked. Getting one to work accessibly comes down to two things — a real label association so the browser can forward label clicks and announce a name, and a fieldset/legend when several checkboxes represent related choices.


## Four ways to label a checkbox (only two are good)


### The native control needs an accessible name and a clickable label area. There are four common ways developers write the markup, ranked from best to worst:

`for`/`id` association. `<label>` sits beside the checkbox with a `for` attribute pointing at the input's `id`. The browser forwards clicks on the label to the checkbox automatically. This is the canonical pattern.

Wrapping `<label>`. The `<label>` surrounds both the `<input>` and the visible text. No `for`/`id` pair needed — the browser infers the association from the nesting. Equivalent to `for`/`id` in every way that matters.

`aria-label` with no visible text. The accessible name exists but sighted users see a checkbox with no caption. Use only when the surrounding visual context already makes the choice obvious (and confirm with a screen reader — `aria-label` on form controls has historically had inconsistent support).

No label at all. The checkbox has no accessible name. Screen readers announce "checkbox, not checked" with no context. Voice control users cannot target it by name. axe-core flags this as a serious failure.


## Groups need fieldset and legend

When several checkboxes represent related choices — "Notifications I want to receive", "Toppings on my pizza" — the group itself needs a name. The `<fieldset>` element wraps the related controls; the `<legend>` provides the group title. Screen readers announce the legend before each checkbox: "Notifications, Updates, checkbox, not checked."

A common anti-pattern is to put a heading or paragraph above the checkboxes as the group title. Visually it looks identical. Programmatically there is no relationship — the group context is invisible to assistive technology. axe-core does not flag this because each checkbox has a valid individual label; the missing group association is one of the cases where automated tools quietly approve a real failure.


## The indeterminate state

Checkboxes have a third visual state — a horizontal dash instead of a tick or empty box. It indicates "some but not all", typically on a parent checkbox whose children are mixed. The state can only be set from JavaScript (`checkbox.indeterminate = true`). HTML has no `indeterminate` attribute.

Assistive tech announces the indeterminate state as "mixed" or "partially checked". Pair the visual dash with text the user can read, because the dash on its own can look like a styled empty checkbox to people unfamiliar with the convention.


## What `required` means on a checkbox

Adding the `required` attribute to a checkbox means the form will not submit unless the box is checked. This is counter-intuitive — `required` on a text input means "must contain something", but on a checkbox it means "must be checked".

Use it for cases like "I agree to the terms" or "I have read the policy" where the form genuinely requires that specific checkbox to be checked. Do not put it on every checkbox in a group of preferences — that would force the user to check all of them.


## Checkbox vs. switch

Both hold an on/off value. The boundary is conventional rather than strict, but the rule of thumb is about timing.

Use a checkbox when the value is submitted later as part of a form. "I agree to the terms" stays unchecked until you tick it; the value only matters when the form posts.

Use a switch when the change takes effect immediately. Flipping Dark mode applies the theme; flipping Notifications enables or disables them right now.


## Related topics

Switches and role=switch

How accessible names work
