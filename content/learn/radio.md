---
title: Radio buttons and mutually-exclusive groups
topicId: radio
category: interaction
order: 15
related:
  - checkbox
  - accessible-name
summary: A radio group lets users pick exactly one option from a small
  set. The lessons cluster around three things — shared name, fieldset/legend
  for the group, and the arrow-key keyboard contract.
---

A radio button is the input you reach for when the user must pick exactly one option from a small, visible set. Country selectors, plan tiers, payment methods. Three things govern whether your radios work for everyone: every radio in the group shares one `name`, the group itself has a `<fieldset>` and `<legend>`, and the keyboard contract (arrow keys, not Tab) behaves the way assistive technology expects.

## The shared name makes them a group

All radios in the same group share the same `name` attribute. That's what tells the browser "these are mutually exclusive — selecting one deselects the others". Each radio has its own `value` attribute; whichever one is selected becomes the form data submitted under that name.

A common bug: visually-grouped radios with different `name` values. They look like a group, but the browser treats them as separate one-option sets — the user can select more than one, breaking the entire point of the control.

## Groups need fieldset and legend

The `<fieldset>` element wraps the related radios; the `<legend>` provides the group's question. Screen readers announce the legend before each option ("Which plan would you like?, Free, radio, not checked"). Without the legend, a user navigating by Tab into the group hears only "Free, radio" — no context about what they're choosing between.

A common anti-pattern is to put a heading or paragraph above the radios as the group title. Visually identical to a fieldset, programmatically silent. axe-core doesn't catch it because each radio still has a valid individual label.

## The keyboard contract

Native radios get a roving tabindex for free: `Tab` moves focus INTO the group (landing on the currently-selected radio, or the first if none is selected), arrow keys (`Up`/`Down`/`Left`/`Right`) move between options within the group, and `Tab` again moves OUT to the next field.

Custom div-based radios break this entirely. To replicate native behaviour you have to: track which radio holds tabindex=0 while the rest are tabindex=-1, listen for arrow keys to shift focus, and update the visual state. It's a lot of code to recreate what the native element gives you instantly.

## `required` is a group constraint

Setting `required` on any one radio in the group means the form won't submit until one option in the group is selected. The browser treats it as a group-level rule, not a per-radio rule. Putting `required` on every radio is redundant but harmless.

The `required` attribute is invisible to sighted users until a submit attempt fires the browser's validation message. If a group is required, indicate it in the legend ("Which plan would you like? (required)") so users know before they try to submit.

## Radio vs. checkbox

The mental model is: "pick one" vs "pick zero or more". Use radios when:

- Exactly one selection is required (or optional, but always at most one)
- Options are mutually exclusive — selecting one logically excludes the others
- The set of options is small (typically 2–7) so each is visible without scrolling

Use checkboxes when the user can pick none, one, or many, and each option stands on its own.

## When a `<select>` is better than radios

Long lists (more than ~7 options, country pickers, time zones) belong in a `<select>` element. Radios force the user to see every option at once; selects collapse the list until needed. The trade-off: radios show all choices at a glance, which helps decision-making for small sets and breaks down for large ones.
