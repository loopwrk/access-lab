# axe-core rules applicable to `<button>`

This document catalogues every axe-core rule that can fire against a
button element (native `<button>`, `<input type="button|submit|reset|image">`,
or any element with `role="button"`). It is sourced from axe-core 4.x
rule descriptions and is meant as a quick reference for the rules
AccessLab surfaces or simulates.

Rules are grouped by concern. For each rule we list the rule ID, the
WCAG success criterion it maps to, the axe impact level, what the rule
checks, when it fires against a button, and how to fix it.

---

## Accessible name

### `button-name`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** Every `<button>` element exposes a non-empty
  accessible name to assistive technology.
- **When it fires:** The button has no text content, no `aria-label`,
  no `aria-labelledby` pointing at non-empty text, no `title`, and no
  inner image with non-empty `alt`. Buttons styled with only an icon
  font and no text fallback are the most common trigger.
- **How to fix:** Add visible text inside the button. If the button is
  icon-only, add an `aria-label` describing the action ("Close",
  "Search", "Open menu"). Decorative icons inside a labelled button
  should be marked `aria-hidden="true"`.

### `input-button-name`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** Buttons rendered with the `<input>` tag (types
  `button`, `submit`, `reset`) expose a non-empty accessible name.
- **When it fires:** `<input type="submit">` is used without a `value`
  attribute and without `aria-label`. Note that for `submit` and
  `reset`, browsers supply default text ("Submit Query", "Reset") so a
  bare element will not always fail. `<input type="button">` with no
  `value` will fail because there is no UA fallback.
- **How to fix:** Set a meaningful `value` attribute, or set
  `aria-label`. Prefer `value` because it is also the visible label.

### `aria-command-name`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Serious
- **What it checks:** Any element with `role="button"` (also
  `role="link"` or `role="menuitem"`) exposes a non-empty accessible
  name.
- **When it fires:** A `<div role="button">` or `<span role="button">`
  has no text content and no `aria-label` / `aria-labelledby`.
- **How to fix:** Prefer a real `<button>` element. If you must use a
  generic element with `role="button"`, supply visible text or an
  `aria-label`, and make sure it is keyboard-operable.

### `label-content-name-mismatch` (experimental)

- **WCAG:** 2.5.3 Label in Name (Level A)
- **Impact:** Serious
- **What it checks:** When a button is named by its own visible text,
  the accessible name must contain that visible text.
- **When it fires:** The button shows "Save changes" but an
  `aria-label="Save"` overrides the accessible name to something that
  no longer contains the visible string. Voice control users speaking
  the visible label cannot activate the button.
- **How to fix:** Either drop the redundant `aria-label`, or make sure
  the visible text is a substring of the `aria-label`.

---

## Visual presentation

### `color-contrast`

- **WCAG:** 1.4.3 Contrast (Minimum) (Level AA)
- **Impact:** Serious
- **What it checks:** The contrast ratio between the button's text
  colour and its computed background meets WCAG AA thresholds: 4.5:1
  for normal text, 3:1 for text that is at least 18pt or 14pt bold.
- **When it fires:** Light grey text on a white background, brand
  buttons that fail at the default state, or hover states that drop
  below the threshold. axe will sometimes mark contrast as "needs
  review" when it cannot determine the effective background (gradients,
  background images, semi-transparent overlays).
- **How to fix:** Increase the contrast between foreground and
  background. AccessLab's contrast badge shows the live ratio so you
  can preview the change before it ships.

### `color-contrast-enhanced` (AAA, disabled by default)

- **WCAG:** 1.4.6 Contrast (Enhanced) (Level AAA)
- **Impact:** Serious
- **What it checks:** Same as `color-contrast` but at the AAA
  thresholds: 7:1 for normal text, 4.5:1 for large text.
- **When it fires:** Same triggers as `color-contrast`, but at the
  stricter ratio.
- **How to fix:** Pick a darker foreground or a lighter background.
  Required by some procurement standards (US Section 508 references it
  indirectly via WCAG conformance levels).

---

## Touch target size

### `target-size`

- **WCAG:** 2.5.8 Target Size (Minimum) (Level AA, WCAG 2.2)
- **Impact:** Serious
- **What it checks:** Pointer targets are at least 24 by 24 CSS
  pixels, or have at least 24px of spacing around them, or are inline
  in a sentence, or are part of a "user agent control" exception.
- **When it fires:** A small icon button (16x16, 20x20) sits next to
  other small targets with no padding. Common in toolbars, table row
  controls, dropdown carets.
- **How to fix:** Increase the button's hit area to 24x24 minimum. If
  you cannot grow the visual, grow the clickable region with padding
  or pseudo-element extensions. Spacing the buttons further apart also
  satisfies the SC.

---

## ARIA validity

### `aria-allowed-attr`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** ARIA attributes on the button are permitted by
  the button role (or its implicit role).
- **When it fires:** A `<button aria-selected="true">` (because
  `aria-selected` belongs to roles like `tab` or `option`, not
  `button`).
- **How to fix:** Remove the attribute, or change the role so the
  attribute is allowed. Often this means using the correct widget
  (e.g. a tab, not a button).

### `aria-required-attr`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** Required ARIA attributes for the role are
  present.
- **When it fires:** Rare on `<button>` itself because the `button`
  role has no required attributes, but a custom `role="button"` paired
  with `aria-pressed` on a toggle button without a defined state will
  trip this in some configurations.
- **How to fix:** Add the missing required attribute.

### `aria-valid-attr`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** Any attribute prefixed with `aria-` is a real
  ARIA attribute defined by the spec.
- **When it fires:** Typos like `aria-lable` or `aria-discribedby`.
- **How to fix:** Correct the spelling.

### `aria-valid-attr-value`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** ARIA attribute values match the expected type
  (boolean, id reference, token, etc.).
- **When it fires:** `aria-pressed="yes"` (should be `"true"` or
  `"false"`), `aria-labelledby="missing-id"` (the referenced id does
  not exist in the document).
- **How to fix:** Use the legal value, or make sure the referenced id
  exists.

### `aria-prohibited-attr`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Serious
- **What it checks:** The button does not use ARIA attributes that
  are explicitly prohibited for its role.
- **When it fires:** Generic-role elements with naming attributes
  (e.g. `aria-label` on a `<div>` without an interactive role) are the
  usual trigger. On a real `<button>` this rarely fires.
- **How to fix:** Remove the prohibited attribute, or give the
  element an interactive role.

### `aria-hidden-focus`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Serious
- **What it checks:** Elements marked `aria-hidden="true"` are not
  themselves focusable and do not contain focusable descendants.
- **When it fires:** A button is wrapped inside an element with
  `aria-hidden="true"`, or `aria-hidden="true"` is applied directly to
  a focusable button.
- **How to fix:** Remove `aria-hidden`, or add `inert` / `tabindex="-1"`
  to take the button out of the focus order. Hiding focusable content
  from assistive technology while leaving it tabbable is a serious
  inconsistency.

---

## Semantics and nesting

### `nested-interactive`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Serious
- **What it checks:** Interactive controls are not nested inside one
  another.
- **When it fires:** A `<button>` contains another `<button>`, an `<a>`,
  or an `<input>`. Common in card patterns where the entire card is a
  link and a button sits inside it.
- **How to fix:** Restructure so only one element is interactive.
  Either make the wrapper non-interactive and put two siblings inside,
  or use the "redundant link" pattern where the card is hit-extended
  but the button is the focusable control.

### `presentation-role-conflict`

- **WCAG:** Best practice
- **Impact:** Minor
- **What it checks:** Elements marked `role="presentation"` or
  `role="none"` do not also carry global ARIA attributes or `tabindex`,
  because those would re-expose the element to assistive tech.
- **When it fires:** `<button role="presentation" aria-label="...">`.
- **How to fix:** Remove the role, or remove the conflicting
  attributes.

### `focus-order-semantics` (experimental)

- **WCAG:** Best practice
- **Impact:** Minor
- **What it checks:** Anything in the focus order has a role
  appropriate for interactive content.
- **When it fires:** A `<div tabindex="0">` styled to look like a
  button has no `role="button"`.
- **How to fix:** Use a real `<button>`, or add the correct role and
  keyboard handlers.

---

## Identifier hygiene

### `duplicate-id-aria`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** Any `id` referenced by ARIA (`aria-labelledby`,
  `aria-describedby`, `aria-controls`, etc.) is unique within the page.
- **When it fires:** The button's `aria-describedby` points at an id
  that is reused elsewhere. Screen readers may pick the wrong target.
- **How to fix:** Make ids unique. Prefer scoped, generated ids in
  component-based codebases.

### `tabindex`

- **WCAG:** Best practice
- **Impact:** Serious
- **What it checks:** No element uses `tabindex` greater than 0.
- **When it fires:** `<button tabindex="3">`. Positive tabindex creates
  a parallel focus order that almost always desynchronises from visual
  order.
- **How to fix:** Use `tabindex="0"` to make an element focusable in
  source order, `tabindex="-1"` to make it programmatically focusable
  but skip in the tab order. Reorder the DOM if you need a different
  focus sequence.

---

## Cross-cutting reminders

Some axe rules apply at the document level rather than to the button
itself, but they often surface alongside button issues:

- **`region`** flags content that is not inside a landmark. A toolbar
  of buttons floating outside `<main>` / `<nav>` / `<form>` will
  trigger this.
- **`heading-order`** can flag a page where a button-triggered section
  has a heading at the wrong level.
- **`landmark-*`** rules can surface when a button is the only thing
  inside an unwrapped landmark.

These are not button rules per se, but worth knowing because they
appear in the same axe run.

---

## Rules AccessLab implements directly

The studio also runs a small set of custom prop-based and DOM-based
rules that go beyond what axe checks:

- **vague-label** (shared): warns on labels like "Click here",
  "Submit", "OK", "Read more", which fail SC 2.4.6 Headings and Labels
  in spirit even though axe will not catch them.
- **invisible-text** (shared): warns when the resolved text colour
  matches the background closely enough that axe's contrast rule may
  still pass on edge values.
- **content-overflow** (shared DOM rule): warns when text is clipped
  or visually truncated, supporting SC 1.4.10 Reflow and SC 1.4.4
  Resize Text.
- **target-size** (button-specific, DOM-measurement rule): reproduces axe's
  WCAG 2.2 target-size check against the control's measured border-box
  (`DomMeasurement.targetWidth/Height`), so the user sees it react live as they
  change width / padding / font-size. It is intentionally stricter than axe's
  own rule, which exempts spacing / inline / user-agent-default targets -
  AccessLab teaches the raw 24×24 (AA) and 44×44 (AAA) sizes directly.

These are documented in the source files alongside each rule.

When a custom rule overlaps a real axe rule rather than filling a gap, it
declares `supersededByAxe: [axeRuleId]` and the merge layer
(`useAllViolations` / `useAxeCounts`) drops it in favour of axe's own finding,
so one mistake surfaces as one issue. The only current example is
**toggle-wrong-attribute**, which defers to axe's `aria-allowed-attr` for
`aria-checked` on a plain button.
