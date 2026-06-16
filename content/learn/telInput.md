---
title: 'type="tel" sets the phone keypad, but does not validate the format'
topicId: tel-input
category: form-inputs
order: 5
related:
  - number-input
  - accessible-name
  - native-rendering
concepts:
  - form-control
summary: '`type="tel"` sets the telephone keypad on touch devices and signals what the field is for, but it does not check the value - unlike `type="email"`, it accepts anything. Phone formats vary too much worldwide for a built-in rule, so validating the number is your job: a lenient `pattern`, JavaScript or a library, and a server-side check as the final word.'
---

A telephone input looks like an ordinary single-line text field. People reach for `<input type="tel">` whenever a field collects a phone number. It does one helpful thing and deliberately skips another: it sets the phone keypad on touch devices, but it does not check that what was typed is a valid phone number. Knowing where that line sits is the difference between a field that helps and one that quietly accepts nonsense.

## What `type="tel"` does

- **It sets the telephone keypad on touch devices.** On a phone or tablet, focusing the field brings up the dial pad - digits plus the symbols phone numbers use, such as `+`, `*`, and `#`. People entering a number get the keys they need instead of the full keyboard.
- **It signals the field's purpose.** Paired with `autocomplete="tel"`, the browser can offer the person's saved number, and assistive technology can describe the field by what it is for.

That is the whole job. `type="tel"` is a hint about the kind of data and the kind of keyboard - nothing more.

## What it does not do

**It does not validate the format.** Unlike `type="email"` and `type="url"`, which reject obviously malformed values, `type="tel"` accepts anything at all - letters, symbols, an empty string, a whole sentence. The form submits whatever was typed.

This is on purpose. Phone number formats vary enormously around the world: different lengths, country codes, area codes, separators, extensions, and local conventions. There is no single pattern that is correct everywhere, so the browser deliberately enforces none. A built-in rule strict enough to be useful in one country would reject valid numbers in another.

The practical consequence: **if the value needs to be a real phone number, that check is your responsibility**, not the browser's.

## Validating a phone number when you need to

Reach for one of these, from lightest to most thorough:

- **The `pattern` attribute** runs a regular expression in the browser and blocks submission when the value does not match. Keep it deliberately lenient - allow spaces, brackets, `+`, and dashes - so you do not reject valid formats. Always pair it with a `title` that describes what you expect, because the browser shows that text when the value fails.

```html
<label for="phone">Phone number</label>
<p id="phone-hint">
  Digits, with optional spaces,
  brackets, + and -.
</p>
<input
  type="tel"
  id="phone"
  name="phone"
  autocomplete="tel"
  pattern="[0-9 ()+-]{7,}"
  title="Use digits, with optional spaces,
  brackets, + and -."
  aria-describedby="phone-hint"
/>
```

- **JavaScript** handles anything a single pattern cannot - normalising the input as the person types, or checking a number against real numbering rules. A maintained library such as Google's libphonenumber knows the rules for each country and is far safer than a hand-written regular expression.
- **Server-side checks** are the real source of truth. Anything in the browser can be bypassed, so validate again on the server before you trust or store the number.
- **NPM packages** - many developers reach for NPM packages to handle the formatting for speed and ease of use, [libphonenumber-js](https://www.npmjs.com/package/libphonenumber-js) is a popular example.

## Make the requirement clear to everyone

Validation only helps if people can tell what is expected and what went wrong.

- **State the format in visible text** next to the field, and link it with `aria-describedby` so it is announced along with the label. Do not rely on the `placeholder` for this - it disappears the moment someone starts typing, and its low contrast is hard to read.
- **Do not lean on the native validation bubble alone.** The small popup the browser shows when `pattern` fails is easy to miss, is announced inconsistently across assistive technology, and vanishes on the next keystroke. Show your own error message in the page, near the field, and connect it with `aria-describedby` so it reaches everyone.
- **Be generous with what you accept.** Stripping or normalising spaces, brackets, and dashes for the person is kinder than rejecting their input. A field that refuses a number written the way someone has always known it is a barrier, not a safeguard.
- **Add `autocomplete="tel"`.** Autofill is quicker for everyone, and it especially helps people who rely on it to avoid re-typing and people with memory or attention differences.

## The short version

`type="tel"` gives the right keyboard and signals the field's purpose, but it never checks the value. If the number has to be valid, enforce that yourself - a lenient `pattern` for simple cases, JavaScript or a library for real rules, and the server as the final word - and always make the expected format visible and programmatically associated so everyone knows what to enter.
