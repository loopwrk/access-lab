---
title: Why image buttons submit coordinates
topicId: image-button-coordinates
category: forms
order: 4
related:
  - button-types
  - form-wrapping
  - accessible-name
  - native-rendering
concepts:
  - button-element
  - form-context
  - accessible-name
summary: An input with type="image" is a submit button that also sends the x and
  y position of the click. Its accessible name comes from the alt text, and the
  coordinates it reports are different for people who do not use a pointer.
---

The [`<input type="image">`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/image) element looks like an image you can click, but it is really a submit button wearing an image as a mask. It carries one behaviour that surprises most developers the first time they meet it: when it submits a form, it also sends the coordinates of where the click landed on the image.

## What an image button submits

When you activate an image button inside a form, the browser submits the form **and** appends the horizontal and vertical position of the click, measured in pixels from the top-left corner of the image.

If the input has no `name`, the position is sent as two fields called `x` and `y`:

```html
<form action="/search" method="get">
  <input
    type="image"
    src="/icons/search.svg"
    alt="Search" />
</form>
```

A click 87 pixels across and 12 pixels down submits:

```
x=87&y=12
```

If the input has a `name`, that name becomes a prefix and the two fields are sent as `name.x` and `name.y`:

```html
<input
  type="image"
  name="map"
  src="/icons/search.svg"
  alt="Search"
/>
```

```
map.x=87&map.y=12
```

This is a long-standing behaviour from the early web. A server could place a single image on the page (a "server-side image map") and use the click position to work out which region the user had chosen. It is rarely the right tool today, but the coordinate behaviour is still part of the element.

## The accessible name comes from `alt`

An image button has no text content, and its `value` attribute is form data rather than a label. Its accessible name therefore comes from the `alt` attribute, exactly as it would for a plain `<img>`.

Good practice - a clear `alt` that describes the action:

```html
<input
  type="image"
  src="/icons/search.svg"
  alt="Search"
/>
```

Screen reader users hear "Search, button".

A common mistake - a missing or empty `alt`:

```html
<input type="image" src="/icons/search.svg" />
```

The button now has no accessible name. People using a screen reader hear only "button", or the browser may fall back to reading the image's file name, which is seldom meaningful. Automated checks, including axe-core, report this as a missing button name.

## The pointer-and-keyboard difference

This is the part that matters most for inclusive design. The coordinates describe a pointer click and nothing else. When someone activates the image button **with the keyboard** - by moving focus to it and pressing Enter - there is no pointer position, so the browser submits `x=0` and `y=0`.

That means any server logic that depends on _where_ the image was clicked behaves differently, or stops working entirely, for:

- people who operate the page with a keyboard
- people who use a screen reader
- people who use a switch device or any other input that is not a mouse or touch

If the meaning of the action depends on the coordinates, that meaning is simply not available to anyone who does not use a pointer. This is why coordinate submission should never be the only way to express a choice.

## When to use it, and what to use instead

Reach for `<input type="image">` only when the click position is genuinely the information you need - and even then, offer a non-pointer route to the same choice.

For the far more common case - "I want a submit button that shows an icon or image instead of text" - you do not need the coordinate behaviour at all. Use a `<button type="submit">` with an image or icon inside it:

```html
<button type="submit">
  <img src="/icons/search.svg" alt="Search" />
</button>
```

This gives you:

- a submit button with no surprise coordinate fields
- the same accessible name, taken from the image's `alt`
- identical behaviour for pointer users and keyboard users
- room to add visible text next to the icon later

## Practical guidance

### A few rules of thumb for image buttons:

- Treat `<input type="image">` as a submit button first and an image second. It will submit the form and send the click coordinates with it.
- Always give it a meaningful `alt`. That text is its accessible name; without it the control is unnamed.
- Never depend on the coordinates as the only way to capture a choice. Keyboard and assistive-technology users submit `0, 0`.
- If you only want an image-faced button, prefer a `<button type="submit">` with an `<img>` inside. Keep `<input type="image">` for the rare case where the click position is the actual data.
