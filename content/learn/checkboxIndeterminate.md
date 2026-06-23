---
title: Checkbox tri-state and the indeterminate trap
topicId: checkbox-indeterminate
category: form-inputs
order: 3
related:
  - checkbox
  - accessible-name
concepts:
  - form-control
  - aria-state
  - native-elements
summary: A checkbox has three meaningful states - checked, unchecked, and
  indeterminate - but the native HTML markup splits them across two flags
  that can disagree. Picking one state at a time keeps the visual and the
  submitted value telling the same story.
---

A checkbox feels like a simple control - it is either ticked or it is not. Once you start representing a "select all" parent box that summarises a group of children, a third state appears: the parent is _partially_ checked. HTML supports this third state, but it does so in a way that lets two flags drift apart - and when they do, sighted users, screen-reader users, and the form server can each be told something different.

This article is about that mismatch, and about how to model the three states so the control says the same thing to everyone.

## Three states, two flags

The HTML specification gives a native `<input type="checkbox">` two separate properties:

- **`checked`** - a content attribute and a DOM property. Decides what value the form posts. Either `true` or `false`.
- **`indeterminate`** - a DOM property only. There is no `indeterminate` attribute you can write in HTML; you set it from JavaScript: `checkbox.indeterminate = true`. It changes how the box is drawn (the small horizontal dash) but does not change `checked`.

That separation is deliberate. Form submission needed a single boolean answer in 1995 and still does; the indeterminate dash was added later, purely as a visual signal, with no effect on the form's data model.

The catch is that the two properties are independent. You can set `checked = true` and `indeterminate = true` at the same time. The box will be drawn as a dash _and_ the form will submit the box as ticked. Nothing in the browser stops this.

## What each user sees

Picture a checkbox with both flags set to true.

- **A sighted person** sees a horizontal dash. They read this as "partial" - some children selected, some not.
- **A screen-reader user** hears whatever the browser-plus-assistive-technology pairing decides to announce. NVDA with Chrome typically says "half checked" for the native indeterminate. JAWS varies by mode. VoiceOver on Safari often misses the native dash entirely and announces "checked" instead, because Safari does not always expose the indeterminate state to the accessibility tree.
- **The server** receives the form post with the box ticked - because `checked` is still `true`. Whoever processes that submission has no way to know the box looked like a dash to the person who submitted it.

Three audiences, three different stories about the same control.

## The ARIA model is cleaner

When you build a custom checkbox out of a `<div role="checkbox">`, you do not have two separate flags to juggle. ARIA exposes a single tri-state value:

```html
<div role="checkbox" aria-checked="true">Subscribe</div>
<div role="checkbox" aria-checked="false">Subscribe</div>
<div role="checkbox" aria-checked="mixed">Subscribe</div>
```

`aria-checked` takes one of three values, and they are mutually exclusive by construction. The state is what it is - there is no way to be "checked and mixed" at the same time.

That single-enumeration model is the right mental picture even when you are working with a native checkbox. The browser splits it across two properties for backward compatibility, but the underlying concept is one tri-state value.

## Where the third state is actually useful

The indeterminate dash exists for one canonical pattern: a parent checkbox that summarises a group of children.

```html
<label>
  <input type="checkbox" id="select-all" />
  Select all toppings
</label>

<fieldset>
  <legend>Toppings</legend>
  <label><input type="checkbox" name="toppings" value="mushrooms" /> Mushrooms</label>
  <label><input type="checkbox" name="toppings" value="olives" /> Olives</label>
  <label><input type="checkbox" name="toppings" value="peppers" /> Peppers</label>
</fieldset>
```

The "Select all" parent reflects the state of the children:

- All children checked → parent shows as ticked.
- No children checked → parent shows as unticked.
- Some children checked → parent shows as the dash.

In the third case, the parent should be `indeterminate = true` _and_ `checked = false`. The parent is not really ticked - it is partial. Setting `checked = true` alongside it is the bug this article is about.

## A reliable update pattern

Whenever the user explicitly clicks the parent box, the indeterminate flag should clear. The user's intent has become unambiguous - they want all children ticked or all children unticked. Leaving `indeterminate = true` after a direct click produces exactly the disagreement the article opens with.

```js
const parent = document.getElementById("select-all");

parent.addEventListener("change", () => {
  // The user has set the parent to a definite value.
  // Clear the partial-state visual.
  parent.indeterminate = false;
  // Cascade to children.
  for (const child of children) {
    child.checked = parent.checked;
  }
});

// When a child changes, recompute whether the parent is partial.
for (const child of children) {
  child.addEventListener("change", () => {
    const total = children.length;
    const ticked = children.filter((c) => c.checked).length;
    if (ticked === 0) {
      parent.checked = false;
      parent.indeterminate = false;
    } else if (ticked === total) {
      parent.checked = true;
      parent.indeterminate = false;
    } else {
      parent.checked = false;
      parent.indeterminate = true;
    }
  });
}
```

The rule of thumb: `indeterminate` is only ever `true` when `checked` is `false`. Code those two assignments together and the disagreement cannot happen.

## What screen readers do

This is where the native flags get genuinely awkward. The W3C does not specify exactly how `indeterminate` should be exposed to the accessibility tree, so platforms diverge:

- **Chrome + NVDA (Windows):** Announces "half checked" or "partially checked" when `indeterminate` is true. Works as expected.
- **Firefox + NVDA (Windows):** Same as Chrome - "half checked".
- **Safari + VoiceOver (macOS):** Frequently misses the native indeterminate. Announces "checked" or "unchecked" based on the `checked` value alone.
- **Edge + JAWS (Windows):** Generally announces "mixed" or "half checked" in browse mode; forms mode behaviour varies.

If you need the partial state to be announced reliably across platforms, the more dependable approach is a `<div role="checkbox">` with `aria-checked="mixed"`. ARIA's mixed value has a well-defined accessibility mapping; the native indeterminate is best-effort.

The trade-off: a div-based checkbox loses the keyboard handling, form submission, and label-click behaviour that the native checkbox provides for free. You pay for that consistency by re-implementing the rest of the control's contract.

## The pattern to avoid

The combination that fails - the one this article is named for - is setting both flags on a single, standalone checkbox to express "in progress" or "loading" or "default". The dash makes sense visually because it stands out, but the underlying value is still ticked, and the announcement is unpredictable.

If you need a third state on a single checkbox to mean "no value chosen yet", a checkbox is the wrong control. Two or three radios with a clear default, or a select element with an explicit "Please choose" option, give you a state machine the form can validate and assistive technology can describe.

## Quick reference

- A checkbox has three meaningful states: unchecked, checked, mixed.
- The HTML model splits the third state into an extra `indeterminate` JS-only property.
- `checked` and `indeterminate` can both be true - the browser does not stop you - and when they are, the visual, the screen-reader announcement, and the submitted form value can each tell a different story.
- Keep them mutually exclusive in your own code. If you set `indeterminate = true`, also set `checked = false`. Reset `indeterminate` on any direct user interaction.
- For a partial parent box summarising a group, the native pair works fine if you follow the update pattern above.
- If you need the "mixed" state to announce reliably across all major browser-plus-AT combinations, prefer `<div role="checkbox" aria-checked="mixed">` and re-implement the rest of the contract by hand.
- If a single, standalone checkbox feels like it needs a third state, the right answer is usually a different control - radios with a default, or a select with an explicit placeholder option.
