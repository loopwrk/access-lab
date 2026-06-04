---
title: Radio buttons and mutually-exclusive groups
topicId: radio
category: form-inputs
order: 2
related:
  - checkbox
  - accessible-name
concepts:
  - form-control
  - accessible-name
summary: A radio group lets users pick exactly one option from a small set. The
  lessons cluster around three things — shared name, fieldset/legend for the
  group, and the keyboard interaction model.
---

Radio buttons are form controls used when a person must select exactly one option from a small, predefined list. Common examples include selecting choosing a payment method or filling out personal details in a survey or application form.

For a radio button group to be fully accessible and function correctly for all users, three core requirements must be met:

1. Every radio button in the group must share the exact same `name` attribute.
2. The entire group must be wrapped in a `<fieldset>` with a `<legend>` to provide context.
3. The keyboard navigation must follow native browser standards, which assistive technologies rely on for predictable interaction.

## The Shared `name` Attribute Defines the Group

To group radio buttons together programmatically, you must give every option in that specific set the exact same `name` attribute. This shared name tells the browser that these choices belong to an interconnected list where selecting one option automatically unselects whichever option was previously chosen.

While the `name` attribute is identical across the group, each individual radio button must have its own unique `value` attribute. This unique value represents the specific choice that will be submitted when the form is sent.

```html
<fieldset>
  <legend>Select a subscription plan</legend>

  <input type="radio" id="plan-basic" name="subscription-plan" value="basic">
  <label for="plan-basic">Basic Plan</label>

  <input type="radio" id="plan-pro" name="subscription-plan" value="pro">
  <label for="plan-pro">Pro Plan</label>
</fieldset>
```

### A Common Grouping Mistake

A frequent development mistake is giving visually grouped radio buttons different `name` attributes. While they might look like a single unified list on the screen, the browser treats them as completely separate, independent controls. This allows a user to select multiple options at the same time, which breaks the required single-choice functionality and misrepresents how the form actually processes data.

## Groups need fieldset and legend

The `<fieldset>` element wraps the related radios, and the `<legend>` provides the group’s question or label. Assistive technologies announce the legend as the context for the group, so each option is understood as part of that question (for example: “Which plan would you like? Free, radio button, not checked”).

Without a proper legend, a user moving through the radios may only hear individual option labels (“Free, radio button”), with no clear indication of what question those options belong to.

A common anti-pattern is using a heading or paragraph above the radios instead of a `<legend>`. This can look identical visually, but it is not consistently exposed as an accessible group label.

## The keyboard interaction model

Native radios are designed so that:

- `Tab` moves focus into the radio group (landing on the currently selected option, or the first option if none is selected)
- Arrow keys (`Up`, `Down`, `Left`, `Right`) move between options within the group
- `Tab` moves focus out of the group to the next interactive element

Importantly, the radio group behaves as a single tab stop in most cases, rather than each radio being individually tab-navigable.

Custom div-based radio implementations often break this model. To replicate native behaviour, you need to manage focus state manually (typically via `tabindex`), handle arrow key navigation, and keep selection state in sync. This is significantly more complex than using the native element, which already implements the correct accessibility and keyboard behaviour.

## `required` is a group constraint

Setting `required` on any radio in the group makes the entire group required — the form cannot be submitted unless one option is selected. The browser applies this rule at the group level, not per individual radio.

Applying `required` to every radio is unnecessary but generally harmless.

The `required` constraint is not visible until form submission triggers browser validation. If a group is required, it should be indicated in the legend (for example: “Which plan would you like? (required)”) so users understand the constraint before attempting to submit.

## Radio vs checkbox

The mental model is: “pick one” vs “pick zero or more”.

Use radios when:

- Exactly one option can be selected at a time (or selection is optional, but still limited to one choice)
- Options are mutually exclusive — selecting one inherently excludes the others
- The set of options is small enough to present without overwhelming the user

Use checkboxes when:

- Users may select none, one, or multiple options
- Each option is independent of the others

## When a `<select>` is better than radios

For long lists (often ~7–10+ options), such as country pickers or time zones, a `<select>` element is often more appropriate. Radios require all options to be visible at once, which can become visually and cognitively heavy at scale.

Select elements collapse the list until needed, reducing on-screen complexity. The trade-off is that radios support faster comparison and decision-making when the set is small and visible at a glance.
