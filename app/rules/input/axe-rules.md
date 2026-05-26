# axe-core rules applicable to `<input>` and other form fields

This document catalogues every axe-core rule that can fire against a
form field. The primary target is `<input>` of every type
(`text`, `email`, `tel`, `url`, `password`, `number`, `search`,
`checkbox`, `radio`, `file`, `date`, `time`, `range`, `color`, etc.),
but the same rules apply to `<textarea>`, `<select>`, and any element
with an ARIA input role (`textbox`, `combobox`, `searchbox`,
`spinbutton`, `slider`, `switch`, `checkbox`, `radio`).

It is sourced from axe-core 4.x rule descriptions. Each rule entry
lists the rule ID, the WCAG success criterion it maps to, the axe
impact level, what the rule checks, when it fires against a form
field, and how to fix it.

---

## Labelling and accessible name

### `label`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** Every form input (`<input>`, `<select>`,
  `<textarea>`) has a programmatically associated label.
- **When it fires:** No `<label for="...">` points at the input, the
  input is not wrapped by a `<label>`, and the input has no
  `aria-label` or `aria-labelledby`. Inputs that rely on a
  `placeholder` for naming will fail because placeholders disappear on
  input and are not reliable accessible names.
- **How to fix:** Add a visible `<label>` and associate it via `for` /
  `id`, or wrap the input in a `<label>`. If a visible label is truly
  impossible (a search input with an adjacent icon button labelled
  "Search", for example), use `aria-label` with a descriptive string.

### `input-button-name`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** Buttons rendered with the `<input>` tag (types
  `button`, `submit`, `reset`) expose a non-empty accessible name.
- **When it fires:** `<input type="button">` with no `value` and no
  `aria-label`.
- **How to fix:** Add a meaningful `value` attribute. Prefer `value`
  over `aria-label` because it is also the visible label.

### `input-image-alt`

- **WCAG:** 1.1.1 Non-text Content (Level A), 4.1.2 Name, Role, Value
- **Impact:** Critical
- **What it checks:** `<input type="image">` has alternative text via
  `alt`, `aria-label`, `aria-labelledby`, or `title`.
- **When it fires:** Image submit buttons missing `alt`. Screen
  readers will announce the file name as a fallback, which is rarely
  useful.
- **How to fix:** Add `alt="Search"` (or whatever the action is) to
  the `<input type="image">`.

### `select-name`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** `<select>` elements have an accessible name.
- **When it fires:** A `<select>` with no associated `<label>` and no
  `aria-label`.
- **How to fix:** Same fix as `label`: an associated `<label>` is the
  best answer.

### `aria-input-field-name`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Serious
- **What it checks:** Any element with an ARIA input role
  (`textbox`, `combobox`, `searchbox`, `spinbutton`) has an accessible
  name.
- **When it fires:** A `<div role="textbox" contenteditable>` with no
  `aria-label` or `aria-labelledby`.
- **How to fix:** Prefer native form controls. If you must use a
  custom widget, supply `aria-labelledby` pointing at a visible label.

### `aria-toggle-field-name`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Serious
- **What it checks:** ARIA toggle controls (`checkbox`, `radio`,
  `switch`, `menuitemcheckbox`, `menuitemradio`) have an accessible
  name.
- **When it fires:** A custom toggle missing a name. Native
  `<input type="checkbox|radio">` already have names via the `label`
  rule.
- **How to fix:** Add a visible label and associate it, or use
  `aria-label`.

### `label-content-name-mismatch` (experimental)

- **WCAG:** 2.5.3 Label in Name (Level A)
- **Impact:** Serious
- **What it checks:** Where a control has a visible text label, the
  accessible name contains that visible text.
- **When it fires:** Visible label "Email address" combined with
  `aria-label="Email"` strips the visible string from the accessible
  name.
- **How to fix:** Remove the redundant `aria-label`, or include the
  visible text inside it.

---

## Multiple or hidden-only labels

### `form-field-multiple-labels`

- **WCAG:** 3.3.2 Labels or Instructions (Level A)
- **Impact:** Moderate
- **What it checks:** A single form field is not labelled by more
  than one `<label>` element.
- **When it fires:** Two `<label for="email">` elements both point at
  the same input. Some screen readers concatenate, others announce only
  the first.
- **How to fix:** Use exactly one `<label>` per field. If you need
  more text, use `aria-describedby` to attach hint text via a
  `<small>` or `<div>`.

### `label-title-only`

- **WCAG:** Best practice
- **Impact:** Serious
- **What it checks:** A form field has a visible label, not only a
  `title` attribute or a hidden `aria-describedby`.
- **When it fires:** An input whose only naming mechanism is
  `title="Email"`. The tooltip is only visible on hover, is unreliable
  on touch, and is not announced consistently.
- **How to fix:** Add a visible `<label>`.

---

## Autocomplete and form metadata

### `autocomplete-valid`

- **WCAG:** 1.3.5 Identify Input Purpose (Level AA, WCAG 2.1)
- **Impact:** Serious
- **What it checks:** When `autocomplete` is set, the token list is
  valid per the WHATWG spec and is appropriate for the field's input
  type. Wrong tokens defeat browser autofill and assistive tech that
  uses field purpose to personalise UI.
- **When it fires:** `autocomplete="emial"`, `autocomplete="new"`
  (incomplete token), or tokens used on the wrong input type
  (`autocomplete="cc-number"` on a `<input type="checkbox">`).
- **How to fix:** Use a valid value from the WHATWG list. Common
  ones: `email`, `name`, `given-name`, `family-name`, `tel`,
  `street-address`, `postal-code`, `new-password`, `current-password`,
  `one-time-code`.

---

## Visual presentation

### `color-contrast`

- **WCAG:** 1.4.3 Contrast (Minimum) (Level AA)
- **Impact:** Serious
- **What it checks:** Text in and around the input (the value, the
  placeholder, the visible label, the help text) meets WCAG AA
  contrast: 4.5:1 for normal text, 3:1 for large text.
- **When it fires:** Light grey placeholder text on white, low-contrast
  help text, low-contrast labels.
- **How to fix:** Darken the foreground or lighten the background.
  Placeholder text is especially prone to failing because designers
  often pick a deliberately faded colour. Note that placeholders are
  not labels and should never be relied on for naming.

### `color-contrast-enhanced` (AAA, disabled by default)

- **WCAG:** 1.4.6 Contrast (Enhanced) (Level AAA)
- **Impact:** Serious
- **What it checks:** Same as `color-contrast` but at AAA thresholds
  (7:1 normal, 4.5:1 large).
- **When it fires:** Same triggers, stricter thresholds.
- **How to fix:** Increase contrast. Required by some procurement
  standards.

### `avoid-inline-spacing`

- **WCAG:** 1.4.12 Text Spacing (Level AA, WCAG 2.1)
- **Impact:** Serious
- **What it checks:** Text-spacing properties (`line-height`,
  `letter-spacing`, `word-spacing`, `margin-bottom` on paragraphs) set
  inline via the `style` attribute do not block users from overriding
  them with their own stylesheet.
- **When it fires:** `<input style="letter-spacing: 0">` or label /
  help text with locked-down inline spacing values that the user
  cannot override.
- **How to fix:** Move declarations into a stylesheet so user
  stylesheets and reader-mode tools can override. Or use `!important`
  only on user stylesheets, not on author styles.

---

## Touch target size

### `target-size`

- **WCAG:** 2.5.8 Target Size (Minimum) (Level AA, WCAG 2.2)
- **Impact:** Serious
- **What it checks:** Pointer targets are at least 24 by 24 CSS
  pixels, or have at least 24px of spacing around them.
- **When it fires:** Checkboxes and radios at the native ~13px hit
  area, small icon-only inputs (toolbar-style file pickers), date
  pickers with tiny day cells.
- **How to fix:** Wrap the control in a `<label>` and extend the
  click target via the label, or grow the visual control with custom
  styling, or add spacing.

---

## ARIA validity

### `aria-allowed-attr`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** Each ARIA attribute is permitted by the field's
  role (implicit or explicit).
- **When it fires:** `aria-checked` on a text input,
  `aria-multiselectable` on a single-line input.
- **How to fix:** Remove the attribute, or use the correct widget for
  the behaviour you want.

### `aria-required-attr`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** Required ARIA attributes for the role are
  present.
- **When it fires:** Custom widgets that declare a role without the
  attributes that role demands (a `role="combobox"` without
  `aria-expanded`, for example).
- **How to fix:** Add the missing attribute.

### `aria-conditional-attr`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Serious
- **What it checks:** Conditional ARIA attributes (those whose
  validity depends on the value of another attribute) are used
  consistently.
- **When it fires:** Conflicting state attributes on a custom widget.
- **How to fix:** Reconcile the conflicting attributes.

### `aria-valid-attr`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** All `aria-*` attribute names are real ARIA
  attributes.
- **When it fires:** Typos.
- **How to fix:** Correct the spelling.

### `aria-valid-attr-value`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** ARIA attribute values are of the expected type
  and, for id references, point at real elements.
- **When it fires:** `aria-describedby="hint"` where no element has
  `id="hint"`.
- **How to fix:** Use a legal value and make sure referenced ids
  exist.

### `aria-prohibited-attr`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Serious
- **What it checks:** The element does not use ARIA attributes that
  are explicitly prohibited for its role.
- **When it fires:** `aria-label` on an element with a non-interactive
  role and no naming pathway.
- **How to fix:** Remove the prohibited attribute, or give the
  element an appropriate role.

### `aria-hidden-focus`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Serious
- **What it checks:** Form fields are not made `aria-hidden="true"`
  while remaining in the focus order.
- **When it fires:** An input is wrapped in an `aria-hidden` container
  but still tabbable.
- **How to fix:** Remove `aria-hidden`, or take the input out of the
  focus order with `inert` or `tabindex="-1"` (which usually means the
  input should not be there at all).

---

## Identifier hygiene

### `duplicate-id-aria`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Critical
- **What it checks:** Every id used in ARIA attributes or in
  `<label for>` is unique within the document.
- **When it fires:** Two `<label for="email">` blocks because two
  inputs share `id="email"`. The label only associates with the first.
- **How to fix:** Make ids unique. Prefer scoped, generated ids in
  component-based codebases.

### `tabindex`

- **WCAG:** Best practice
- **Impact:** Serious
- **What it checks:** No element uses `tabindex` greater than 0.
- **When it fires:** `<input tabindex="2">`. Positive tabindex breaks
  the natural focus order.
- **How to fix:** Use `tabindex="0"` or no `tabindex` at all. Reorder
  the DOM if you need a different focus sequence.

---

## Semantics and nesting

### `nested-interactive`

- **WCAG:** 4.1.2 Name, Role, Value (Level A)
- **Impact:** Serious
- **What it checks:** Interactive controls are not nested.
- **When it fires:** An `<input>` placed inside a `<button>`, or two
  controls wrapped by a single `<label>` (one is implicitly associated,
  the other is unclear).
- **How to fix:** Restructure so the input is a sibling of any other
  interactive element, with its own label.

### `presentation-role-conflict`

- **WCAG:** Best practice
- **Impact:** Minor
- **What it checks:** Elements marked `role="presentation"` /
  `role="none"` do not also carry global ARIA attributes or `tabindex`.
- **When it fires:** `<input role="presentation" tabindex="0">`.
- **How to fix:** Remove the role or the conflicting attributes.

### `focus-order-semantics` (experimental)

- **WCAG:** Best practice
- **Impact:** Minor
- **What it checks:** Anything in the focus order has a role
  appropriate for interactive content.
- **When it fires:** A `<div contenteditable tabindex="0">` posing as
  a text input with no `role="textbox"`.
- **How to fix:** Use a native `<input>` or `<textarea>`, or add the
  correct role.

---

## Cross-cutting reminders

Some axe rules apply at the document or form level rather than to the
input itself, but they often surface alongside input issues:

- **`region`** flags content not inside a landmark. A form floating
  outside `<main>` or `<form>` can trigger this.
- **`heading-order`** can flag a fieldset heading at the wrong level.
- **`html-has-lang`** is a document-level rule that, if failing,
  affects how screen readers pronounce field labels.

These are not input rules per se, but they appear in the same axe run
and are worth resolving in tandem.

---

## Rules AccessLab implements directly

The studio also runs a small set of custom rules that go beyond what
axe checks. Some are shared across components, some are
input-specific:

- **vague-label** (shared): warns on labels like "Name", "Field",
  "Input", "Enter text". Vague labels pass axe but fail SC 2.4.6
  Headings and Labels in spirit.
- **invisible-text** (shared): warns when the resolved text colour is
  visually indistinguishable from the background even though axe's
  contrast calculation passes on edge values.
- **content-overflow** (shared DOM rule): warns when the field's
  label or help text is clipped at the iframe boundary, supporting
  SC 1.4.10 Reflow and SC 1.4.4 Resize Text.

Planned input-specific rules (session 2 of the input arc):

- **placeholder-as-label**: warns when the label is hidden and the
  only visible naming text is the placeholder. Trips on the common
  "minimal" form pattern that fails SC 3.3.2.
- **required-not-color-only**: warns when the `required` attribute is
  set but no visible text indicates required status. Trips on patterns
  that signal required-state with a red border alone, failing SC 1.4.1
  Use of Color.
- **help-text-not-associated**: warns when `helpText` is rendered but
  the input has no `aria-describedby` pointing at it.
- **type-vs-semantics**: warns when `type="text"` is used for fields
  that should be `email`, `tel`, `url`, `number`, etc., reducing
  mobile keyboard quality and disabling autofill heuristics.

These are documented in the source files alongside each rule once
implemented.
