---
title: 'type="number" is for quantities, not strings of digits'
topicId: number-input
category: form-inputs
order: 4
related:
  - select
  - accessible-name
  - native-rendering
concepts:
  - form-control
summary: '`type="number"` is built for quantities you would do maths on - age, count, price. For strings of digits like card numbers, phone numbers, and postal codes it does real harm: it drops leading zeros and adds controls that can silently change the value. The numeric keypad you actually want comes from `inputmode="numeric"`.'
---

A number input looks like an ordinary single-line text field, usually with small up and down arrows on one side. People reach for `<input type="number">` whenever a field collects digits - a quantity, an age, a card number, a postcode. That instinct is only half right. `type="number"` is built for one specific job, and using it outside that job quietly damages both the data and the experience.

The distinction that matters is this: **is the value a quantity you would do maths on, or a string of digits you would never add up?**

- A **quantity** - age, number of guests, a price, a 1–5 rating - is a real number. `type="number"` is exactly right.
- A **string of digits** - a card number, phone number, postcode, PIN, or account number - only happens to be made of digits. You would never add two phone numbers together. For these, `type="number"` is the wrong tool.

## What `type="number"` actually does

The browser treats the field as a number rather than as text, and that single decision sets off a chain of behaviours:

- **It filters what you can type.** Letters and most punctuation are rejected. It does still accept a few characters that surprise people: a decimal point, a leading minus, and the exponent letter `e`, because `1e3` is a valid number.
- **It reads the value as a number, so leading zeros disappear.** A postcode typed as `01234` is interpreted as the number `1234`. The zero is gone, and so is the correct value.
- **It adds stepper arrows, plus scroll-wheel and arrow-key stepping.** Hovering the field and scrolling the mouse wheel, or pressing the up and down arrow keys, changes the value. This is easy to trigger by accident and easy to miss.
- **It ignores `maxlength`.** Length limits that work on a text input have no effect here; the range is controlled with `min`, `max`, and `step` instead - none of which fit a card or phone number.
- **It can return an empty value.** If the field holds something the browser cannot read as a valid number, the submitted value comes back as an empty string. Information the person clearly typed is dropped without warning.
- **Decimal separators vary by region.** Some locales expect a comma rather than a full stop, so a value that is accepted in one place can fail in another.

None of these are faults. They are the correct behaviour **for a quantity**. They only become problems when the value was never a quantity to begin with.

## When `type="number"` is the right choice

Use it for genuine quantities - values you would sum, compare, or step through:

```html
<label for="guests">Number of guests</label>
<input type="number" id="guests" name="guests" min="1" max="12" step="1" />
```

Here every behaviour helps: the stepper lets people nudge the count up or down, `min` and `max` keep it in range, and the value is a real number ready for arithmetic. Age, quantity, price, and a star rating all share the same shape.

## When it does harm

Card numbers, phone numbers, and postal codes are strings of digits. Run them through `type="number"` and the same behaviours turn destructive:

- A postcode like `01234` loses its leading zero and becomes `1234`.
- A long card number can be reformatted or shortened, and a stray scroll of the wheel changes a digit without anyone noticing.
- Phone numbers often contain `+`, spaces, and brackets that the field rejects, so people cannot type the format they recognise.
- `maxlength` is ignored, so there is no way to cap a 16-digit card field.

The result is lost data and validation errors that confuse everyone - and the cost lands hardest on people who are already doing extra work to fill the form. Someone using a screen reader cannot see that a scroll just nudged a digit. Someone with limited fine motor control can easily mis-tap the tiny stepper arrows. The field looks helpful and is, in practice, working against them.

## What to use instead

Reach for a text field that **looks** numeric to the device but behaves like text:

```html
<!-- Card number: text field, numeric keypad, autofill -->
<label for="card">Card number</label>
<input
  type="text"
  id="card"
  name="card"
  inputmode="numeric"
  autocomplete="cc-number"
/>

<!-- Postcode -->
<label for="postcode">Postcode</label>
<input
  type="text"
  id="postcode"
  name="postcode"
  inputmode="numeric"
  autocomplete="postal-code"
/>

<!-- Phone number: type=tel is purpose-built for this -->
<label for="phone">Phone number</label>
<input type="tel" id="phone" name="phone" autocomplete="tel" />
```

Two attributes do the real work:

- **`inputmode="numeric"`** asks the on-screen keyboard to show the number pad, without changing the field's type. People typing on a phone get the keypad they want, and none of the number-field side effects come with it. For phone numbers, `type="tel"` does the same and is the purpose-built choice.
- **`autocomplete`** names the field's purpose - `cc-number`, `postal-code`, `tel`, and the rest of the WHATWG token list. The browser can then offer autofill, which is quicker for everyone and especially welcome for people who rely on autofill to avoid re-typing, and for people with memory or attention differences. Naming the purpose is also what WCAG [Success Criterion 1.3.5 Identify Input Purpose](https://www.w3.org/WAI/WCAG22/Understanding/identify-input-purpose.html) asks for.

## The short version

`type="number"` means "this value is a quantity." If the value is a string of digits you would never do maths on, say so with a text field plus `inputmode="numeric"` (or `type="tel"`), and name its purpose with `autocomplete`. You keep the numeric keypad and shed every one of the side effects.
