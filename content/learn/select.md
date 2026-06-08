---
title: Selects, comboboxes, and why the native one wins
topicId: select
category: form-inputs
order: 3
related:
  - radio
  - accessible-name
  - form-wrapping
concepts:
  - form-control
  - accessible-name
  - form-context
  - native-elements
summary: A select lets users pick one option (or several) from a list. The native `<select>` ships with a working keyboard, a platform-native picker on mobile, and an accessible role for free. Most custom dropdowns lose at least one of those - usually all three.
---

A select lets a user pick one option from a list. Common examples include picking a country at checkout, choosing a subscription plan, or filtering search results. There are three patterns that look similar at first glance:

1. The native `<select>` element.
2. The native `<select multiple>` for picking more than one option.
3. A custom `<div role="combobox">` styled to look like a dropdown.

Pattern 1 is almost always the right answer. Pattern 2 has a discoverability problem worth knowing about. Pattern 3 is where most accessibility failures live.

## The native `<select>` does a lot for free

The native element is one of the most accessibility-rich controls in HTML. The browser handles:

- **Keyboard activation** - `Tab` focuses the select, `Down Arrow` / `Space` / `Enter` opens it, arrow keys move between options, `Escape` closes without committing.
- **Type-ahead** - typing a letter jumps to the next option starting with that letter. Typing the same letter again cycles to the next match.
- **Mobile native pickers** - iOS shows the rolling wheel, Android shows a full-screen list, both with platform accessibility wired in.
- **Accessible role and name** - `combobox` role announced automatically; a properly-associated `<label>` provides the accessible name.
- **Required validation** - the browser blocks form submission with a native message if the field is required and unselected.

  options: ["Antarctic", "Arctic", "Atlantic", "Indian", "Pacific"],

```html
<label for="plan">Choose an ocean:</label>
<select id="plan" name="plan" required>
  <option value="">Pick one…</option>
  <option value="antarctic">Antarctic</option>
  <option value="arctic">Arctic</option>
  <option value="atlantic">Atlantic</option>
  <option value="indian">Indian</option>
  <option value="pacific">Pacific</option>
</select>
```

The blank `<option value="">Pick one…</option>` is a useful trick when the field is required: it shows a clear placeholder, and because its value is empty the form will not submit until the user actively picks something.

## `<select multiple>` needs a usage hint

Adding the `multiple` attribute changes the rendering from a dropdown to a visible list-box. The accessibility wiring is still good, but **the multi-select interaction is not visually discoverable** - sighted users have no way to know they can pick more than one without help.

Always pair `multiple` with a usage hint near the field. The hint can live in the label, in helper text below the field, or both.

```html
<label for="topics">Pick the topics you are interested in</label>
<p id="topics-hint">Hold Cmd (Mac) or Ctrl (Windows) to pick more than one.</p>
<select id="topics" name="topics" aria-describedby="topics-hint" multiple>
  <option value="design">Design</option>
  <option value="dev">Development</option>
  <option value="ops">Ops</option>
</select>
```

The `aria-describedby` link tells screen readers to read the hint along with the field, so the multi-select instruction reaches non-sighted users too.

## The custom `<div role="combobox">` trap

It is common for design systems to replace the native select with a styled `<div>` so colours, spacing, and the popup chrome all match the rest of the product. Done well, this is a legitimate choice. Done badly - which is most of the time - it produces a control that mouse users can operate and nobody else can.

A typical broken version looks like this:

```html
<div>Choose a plan</div>
<div role="combobox" aria-expanded="false">Free ▾</div>
```

Three things are wrong:

- **No `aria-controls`** - the combobox advertises a popup but never says which element the popup is.
- **No listbox** - there is nothing for `aria-expanded` to flip between collapsed and expanded states of.
- **No keyboard support** - `Tab` lands on the trigger because of `tabindex="0"`, but `Down`, `Space`, `Enter`, type-ahead, and `Escape` all do nothing.

Screen reader users hear "combobox, collapsed" and find no way to expand it. Keyboard-only users tab onto a control they cannot use. Mobile users get a div they have to tap exactly, with no platform picker chrome.

If you really must build a custom combobox, follow the [WAI-ARIA Authoring Practices Combobox pattern](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/) exactly: a focusable trigger with `aria-controls` pointing to a `role="listbox"`, options with `role="option"` and `aria-selected`, all the keyboard handlers wired by hand, and managed focus on open and close.

## Label association matters as much as it does anywhere

The same four label-association choices apply here as to other form controls. In order of preference:

1. **`<label for>` + `id`** - separate label and field. Works everywhere, including with `<select multiple>`.
2. **Wrapping `<label>`** - the select sits inside the label. Slightly more typing, slightly less flexible for layout.
3. **`aria-label`** - no visible label. Use only when context makes the field's purpose obvious (e.g. a single-input search form with a magnifying-glass button).
4. **No label** - never on a real form.

A label is also what makes the click target useful. Clicking a properly-associated `<label>` focuses the select (and on most browsers opens it). Without that association, only the small triangle at the right of the field is clickable - much worse for touch users and people with motor impairments.

## The `required` attribute is invisible

Setting `required` makes the browser block form submission, but it adds no visible cue. Pair it with explicit text in the label or near the field - `"Plan (required)"`, an asterisk with a key explaining what it means, or a helper sentence below.

```html
<label for="plan">Plan <span aria-hidden="true">*</span> <span class="sr-only">required</span></label>
<select id="plan" name="plan" required>…</select>
```

The hidden text gives screen reader users the same information the asterisk gives sighted users. The asterisk itself is announced as decorative.
