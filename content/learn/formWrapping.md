---
title: Why wrapping a button in a form matters
topicId: form-wrapping
category: interaction
order: 5
related:
  - button-types
  - button-value-attribute
summary: Wrapping a button in a form reveals submit and reset behaviour, and
  exposes the accidental implicit-submit risk of an unconfigured button.
---

AccessLab lets you toggle a form wrapper around any button type that you select for audit. Several button variants only exhibit their real behaviour inside a form, and a plain `<button />` without an explicit type attribute can result in unintuitive results when inside a form.

## What buttons do by default inside a form

### Each button variant has a specific default behaviour when activated inside a form

Submit-typed buttons (`<button>` with `type="submit"`, and `<input>` with `type="submit"`) submit the form. The browser fires the form's submit event. If that event is not cancelled, the browser gathers the data the user has added to the form and submits it according to the form's configuration, often by sending a request to a [server](https://developer.mozilla.org/en-US/docs/Glossary/Server).

Reset-typed buttons restore every form control to its initial value. They do not submit anything.

Button-typed buttons (`type="button"`) do nothing on their own. They stay inactive until JavaScript adds an [event handler](https://developer.mozilla.org/en-US/docs/Learn_web_development/Core/Scripting/Events). This is the recommended variant for any interactive control that is not a form submission.

Outside a form, button types usually behave the same. Differences only become visible when the button is associated with a form, either by being placed inside one or by using the form attribute.

Modern HTML allows a button to submit or reset a form even if it lives entirely outside the `<form>` tags. By adding a `form` attribute to the button and matching its value to the form's `id`, you can link them together seamlessly.

```html
<button type="submit" form="login-form">Log In</button>

<form id="login-form">
  <input type="email" required />
</form>
```

## A common pitfall: accidental form submission

A button element with no `type` attribute defaults to `type="submit"` according to the HTML specification.
Outside a form this usually has no effect unless the button is associated with a form using the `form` attribute. Inside a form it is one of the most common
causes of accidental form submissions. Here is how the problem typically
appears. A developer adds a button inside a form to expand an extra field,
attaches a click handler, and releases the code. Every time the user clicks the
toggle, the form submits. The bug is easy to miss in code review because the
markup looks correct. The fix is always the same: write the type attribute
explicitly. Use `type="button"` for any control that should not submit, and
`type="submit"` for the one that should. This makes the intent clear at a
glance, wherever the button appears in the code.

### When to put buttons inside a `<form>` tag

1. **You are sending or saving data.** This applies to login screens, comment boxes, search bars, or sign-up pages. When you use a form, the browser automatically does the heavy lifting of packaging and sending that data for you.

2. **You want automatic error checking.** Built-in validation is most useful when controls are part of a form. When a form is submitted, the browser can automatically check requirements such as `required`, `type="email"`, or pattern constraints before allowing submission.

3. **You want the browser to auto-fill information.** Browsers generally work best with properly structured forms. Using a form element and appropriate autocomplete attributes can improve autofill behaviour for usernames, passwords, addresses, and payment details.

4. **You have multiple buttons that do different actions.** If you need more than one action button in the same space (like a "Save Draft" button next to a "Publish" button), putting them inside a form allows your server to easily see exactly which button the user activated. When multiple submit buttons exist in the same form, the browser includes the activated button's name/value pair in the submitted data, allowing the server to determine which action the user chose.

5. **You want standard keyboard behaviour.**
   Forms provide built-in browser behaviour such as pressing Enter in a text field to submit the form. Users generally expect this behaviour and many assistive technologies rely on these established patterns. This built-in behaviour is generally more reliable than recreating form submission patterns manually with JavaScript.

### When NOT to put buttons inside a `<form>` tag

**The button just changes something on the screen.** This includes actions like opening a pop-up window (modal), expanding a drop-down menu, or switching a setting on or off. Because you aren't sending or saving data, you should use a standalone button (`type="button"`) without wrapping it in a form.

## Preventing the accidental submission

If you are using a form because the interaction represents data entry or submission, but you want JavaScript to handle the submission process, attach `event.preventDefault()` in the form's submit handler.

### Implicit submission with Enter

Many browsers allow a form to be submitted when the user presses Enter in a text field. The browser will typically activate the form's default submit button.

This behaviour is another reason to explicitly define button types. An unintended submit button can become the form's default action and may be triggered unexpectedly when users press Enter.
