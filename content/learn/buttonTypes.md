---
title: Why button type matters
topicId: button-types
category: forms
order: 1
related:
  - button-value-attribute
  - form-wrapping
concepts:
  - button-element
  - form-context
summary: The type attribute on a button element controls what the button does
  inside a form. Omitting it leads to one of the most common bugs in web forms.
---

Button elements have a `type` attribute. It controls what the button does when activated inside a form. There are three valid values. The choice between them is small in code and large in consequence.

## The three values

1. `type=submit` **submits the parent form when clicked.** The form gathers its values, fires the submit event, and dispatches the request described by the form's action and method attributes. This is the default if the type attribute is missing.

2. `type=reset` **restores every form control to its initial value.** It does not submit anything. Rarely used in modern interfaces because users often click it by accident.

3. `type=button` **does nothing on its own.** It stays inactive until JavaScript adds a click handler. This is the right choice for any interactive control that is not a form submission.

## Why explicit type matters

A button element with no type attribute defaults to type=submit, according to the HTML specification. Outside a form this has no effect. Inside a form it is one of the most common causes of accidental form submissions.

The pattern is easy to miss in code review. A developer adds a button inside a form to expand an extra field, attaches a click handler, and releases the code. Every time the user clicks the toggle, the form submits. The markup looks correct because the developer never thought to set the type explicitly.

Setting the type attribute explicitly makes the intent visible at the place the button is written. type=button for any control that should not submit, type=submit for the one that should. The compiler does not check this. Code review does not always catch it. Writing the attribute by hand on every button is the most reliable defence.

## Keyboard activation

Buttons must be operable from the keyboard. The browser handles this for native button and input elements automatically, but the exact keys differ between the two, and users (along with their assistive technology) rely on the expected behaviour.

A button element activates on both Space and Enter. The browser fires a click event whichever key the user presses. This dual binding is what screen reader users and keyboard-only users expect.

Input buttons activate on Space when focused. Inside a form, pressing Enter on any other input also triggers the form's primary submit button, even if focus is not on the button itself. This implicit-submit-on-Enter behaviour is what lets users submit a search form without reaching for the mouse.

Custom buttons built from div or span elements break this entirely. They are not keyboard-operable by default. Adding role="button" does not restore Space and Enter handling automatically; you must wire up your own keydown listeners and stop the page from scrolling on Space. Always start from a real button element and style it, rather than starting from a styled div and bolting on accessibility.

## Practical guidance

### A few rules of thumb that prevent most type-attribute confusion:

- Always set the type attribute on every button element. Treat the implicit default as a hidden risk.
- Use `type=button` for any button that triggers JavaScript-only behaviour: opening a dialog, expanding a section, toggling a state, anything that is not a form submission.
- Use `type=submit` for the single primary action of a form. If a form needs more than one submit button, see the related topic on the value attribute for the multi-submit pattern.
- Avoid `type=reset` unless you have specific evidence that users want it. The cost of an accidental click is high and the value of a form-clearing button is low.
