---
title: What counts as an accessible name
topicId: accessible-name
category: accessible-names
order: 1
related:
  - button-value-attribute
concepts:
  - accessible-name
summary: An "accessible name" is the exact text a screen reader speaks to
  describe a web element. Browsers calculate this name by checking a specific
  list of sources (like text content, `aria-label`, or form labels) in a strict
  priority order.
---

Every interactive element on a page needs an accessible name. It is the text that a screen reader announces and that voice control software listens for. Without one, the element effectively doesn't exist to users who cannot see it.

## Why the accessible name matters

A screen reader user navigating by element list hears only the accessible name of each control. If a button has no name, it is announced as just "button", with no information about what it does. The user must either guess or move focus to it and listen for surrounding context, which is slow and unreliable.

Some voice-control users navigate by speaking the text they see on the screen. If the hidden 'accessible name' in your code doesn't match that visible text, the software won't recognise their voice command and nothing will happen.

## How the browser picks the name

Below is a list of naming sources the browser can use as an accessible name. This is not a strict order of specificity that the browser uses, however label elements, `aria-labelledby` or `aria-label` are often evaluated first and often take precedence over other accessible naming methods. This doesn't imply that they are the best options, in fact, if you can give an element an accessible name without using ARIA attributes, this is always preferred. You can read about how browsers decide which naming source to use at the [Accessible Name and Description Computation 1.2](https://www.w3.org/TR/accname-1.2/) page on the W3C website.

1. aria-labelledby
2. aria-label
3. Associated label elements for form controls
4. Visible text content for buttons, links, and similar elements
5. alt attributes for images
6. The title attribute (used as a fallback in limited cases)

> The exact priority varies by element type; the list above is not a strict hierarchy

### 1. aria-labelledby

This attribute gives you direct control over what assistive technology announces by associating it with a named element elsewhere on the page.

- **When to use:** When the text you want to use as a label **already exists** elsewhere on the page.
- **How it works:** You point this attribute to the `id` of the existing visible text you want to use as the name. You can also list more than one `id`, separated by spaces, and the browser joins their text together in the order you list them.

#### Example

Imagine a page that has several buttons that share the same visible text - a list of people, each with a "View profile" button. Sighted users tell them apart by the name beside each button, but a screen reader user moving from button to button would just hear "View profile" repeated, with nothing to separate them. `aria-labelledby` fixes this by naming each button with its own text **and** the adjacent person's name:

```html
<ul>
  <li>
    <span id="member-ada">Ada Lovelace</span>
    <button id="view-ada" aria-labelledby="view-ada member-ada">
      View profile
    </button>
  </li>
  <li>
    <span id="member-alan">Alan Turing</span>
    <button id="view-alan" aria-labelledby="view-alan member-alan">
      View profile
    </button>
  </li>
</ul>
```

Each button still shows "View profile", so voice-control users can say "View profile" to activate it, while screen reader users hear a distinct name for each one - "View profile Ada Lovelace" and "View profile Alan Turing".

> The element you are naming and the element with the name, do not need to be adjacent like they are in the example above. They just need to be on the same page.

### 2. aria-label

This attribute gives you direct control over what assistive technology announces by adding an accessible name directly to the element you want to name. Unless `aria-labelledby` is present, a screen reader will always use this as the accessible name over all other methods.

- **When to use:** When you need to provide a specific text string that isn't visible on the screen.
- **Example:** A button displaying an "X" icon can use `aria-label="Close modal"`.

#### Example

```html
<button aria-label="Close dialog">X</button>
```

### 3. Associated label elements for form controls

This is the universally supported, standard method for identifying form controls. Unless an `aria-labelledby` or `aria-label` is present, the browser will use this as the accessible name.

**How it works:** You can pair a `<label>` with an `<input>` using one of two standard methods:

1. **By Association:** Matching the label's `for="..."` attribute to the input's `id="..."`

#### Example

```html
<label for="user-email">Email Address</label>
<input type="email" id="user-email" name="email" />
```

> The label and the form control do not need to be adjacent like they are in the example above. They just need to be on the same page.

1. **By Nesting:** Wrapping the `<label>` tags around the `<input>` element.

#### Example

```html
<label>
  Password
  <input type="password" name="password" />
</label>
```

### 4. Visible text content for buttons, links, and similar elements

This is the default, most common method for labeling interactive elements. Unless overridden by higher-priority ARIA attributes, the browser will automatically extract the literal text written inside the element to use as its accessible name.

- **When to use:** Whenever the element contains visible text that clearly describes its action or destination without needing extra icon-only adjustments.
- **How it works:** The browser inspects the element and combines all internal text, including text in nested tags like `<span>`, `<strong>`, or `<em>`, into a single, clean string of text.

#### Examples

```html
<button>Save changes to article</button>
```

```html
<a href="/profile">View your profile</a>
```

### 5. alt attributes for images

When a control relies entirely on an image instead of text, the browser looks for alternative text attributes.

- **The `alt` Attribute**
  - **When to use:** On standard `<img>` tags used inside buttons/links, or on `<input type="image">` buttons.
  - **How it works:** It translates the visual purpose of the image into a text name the browser can pass to a screen reader.

#### Example

```html
<button type="button" class="icon-button">
  <img src="icons/cart.svg" alt="View Shopping Cart" />
</button>
```

### 6. The title attribute (used as a fallback in limited cases)

This attribute may be used as a fallback in some cases when no accessible name is otherwise determined. If an interactive element has no other name source available, the browser will look for a `title` attribute and use its text string as a final fallback.

- **When to use:** Use with caution. Because the native browser tooltip generated by the `title` attribute requires a mouse hover to appear, it is completely hidden from mobile users and keyboard-only users. It should only be used as a legacy fallback when other methods are impossible to implement.
- **How it works:** If the browser processes the element and finds no applicable native or ARIA-based naming source, and no placeholder attributes, it checks for a `title` attribute to pass to assistive technologies.

#### Example

```html
<button title="Edit profile">
  <svg aria-hidden="true">...</svg>
</button>
```

### How to decide which naming source to use

Start with visible, native HTML first: use real text content for buttons and links, and `<label>` elements for form controls, because these are the most robust, consistent, and least likely to break across assistive technologies. Only add ARIA when the native options can't express what you need, for example, when an icon-only button needs a label or when you need to reference existing on-page text using aria-labelledby. Prefer `aria-labelledby` over `aria-label` when possible, since it keeps naming tied to visible content and reduces duplication. Reserve title strictly as a last resort and avoid relying on it for anything important.

> The First Rule of ARIA: If you can use a native HTML element or attribute with
> the semantics and behavior you require, then do so instead of re-purposing an
> element and adding an ARIA role, state or property.

## Sources that do NOT count

### These may look like labels to a sighted user but are not accessible names

#### Placeholder text on inputs

The `placeholder` attribute on an input is sometimes read by assistive technology as a fallback when nothing else is available. However, it disappears when the user types and support is inconsistent. It should not be relied on as the only label.

---

#### Visible text near the element (unassociated content)

Headings above a button, paragraphs beside inputs, or column headers next to checkboxes are not automatically associated with controls.

The browser has no way to understand that this text describes the element unless the relationship is explicitly defined using `aria-labelledby` or a proper `<label>` association.

---

#### Pure visual styling (icons, colour, position)

An icon, colour, or layout position may appear meaningful to sighted users but does not contribute to the accessible name.

Example: an icon button with no text is not labelled unless you explicitly provide one via ARIA or a label.

---

#### Colour or shape used as meaning

Using red text to indicate “required” or a downward chevron to indicate “expand” only works visually. Assistive technology does not interpret these cues.

Visual indicators should always be paired with text that is part of the accessible name or accessible description.

---

#### The `value` attribute on `<button>` elements

The `value` attribute is not used as the accessible name for standard buttons. Screen readers use the button's text content instead.

The `value` is primarily used for form submission data, not for labelling the control.

## The label-content-name-mismatch rule

When an interactive element has both a visible text label and an `aria-label`, they must align. Specifically, the `aria-label` **must contain the exact visible text** somewhere within its string.

This is required by **WCAG Success Criterion 2.5.3 (Label in Name, Level A)**.

### Why This Breaks Accessibility

Consider a button that visibly says **"Save changes"** but is coded with `aria-label="Save"`.

- **The Problem:** A sighted user relying on speech-recognition software will look at the screen and say, _"Click Save changes"_.
- **The Failure:** The software scans the page's accessibility tree looking for an accessible name that matches "Save changes". Because the browser only registers "Save", the software finds no match. The button becomes entirely unreachable by voice commands.

### How to Fix It

You have two straightforward options:

1. **Remove the `aria-label` entirely (Recommended):** If the visible text is already clear, let the native text do the work.
2. **Ensure the visible text is a substring:** The `aria-label` can include _extra_ context, but it must start with or contain the exact visible string.

> **Good:** Visible text "Save changes" + `aria-label="Save changes to invoice"` (Accessible)

> **Bad:** Visible text "Save changes" + `aria-label="Save"` (Broken)

---

## Practical Guidance

Following a few simple rules of thumb will eliminate almost all accessible-name issues before they happen:

- **Prefer visible text over ARIA:** If an element has visible text, it automatically becomes the accessible name. Leaving ARIA out means there is nothing to accidentally break or keep in sync.
- **Save `aria-label` for non-text controls:** Only reach for `aria-label` when a control is entirely visual, like an icon-only button. Describe the action in plain words: `"Search"`, `"Close dialog"`, or `"Open menu"`.
- **Always wrap visible text in your ARIA labels:** If you must use an `aria-label` alongside visible text, make sure the visible text is the very first part of that label.

#### Example

```html
<div class="invoice-row">
  <span>Invoice #4022</span>
  <button type="button" aria-label="View Invoice 4022">View</button>
</div>
```

- **The "Out of Context" Test:** Test your labels by reading the computed accessible name entirely out of context. If a colleague can hear just the announced name and instantly guess what the button does, your label is doing its job.
