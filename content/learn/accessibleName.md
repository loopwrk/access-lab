---
title: "What counts as an accessible name"
topicId: "accessible-name"
summary: >-
  The accessible name is the label assistive technology announces for an element. Browsers compute it from several sources in a specific order, and some sources that look like labels do not count.
---

Every interactive element on a page needs an accessible name. It is the string that a screen reader announces, that voice control software listens for, and that automated tools check when verifying a button or input is labelled. Without one, the element is effectively anonymous to users who cannot see it.


## Why the accessible name matters

A screen reader user navigating by element list hears only the accessible name of each control. If a button has no name, it is announced as just "button", with no information about what it does. The user must either guess or move focus to it and listen for surrounding context, which is slow and unreliable.

Some voice-control users navigate by speaking the text they see on the screen. If the hidden 'accessible name' in your code doesn't match that visible text, the software won't recognise their voice command and nothing will happen.


## How the browser picks the name


### Browsers compute the accessible name by checking sources in a defined order, taking the first one that yields a non-empty value:

- aria-labelledby. If set, the browser collects the text content of the referenced elements and uses that. This wins over everything else.
- aria-label. If set and aria-labelledby is not used, the aria label attribute's value becomes the accessible name.
- For form fields, an associated label element. Either a label with a for attribute pointing at the input's id, or a label that wraps the input directly.
- For buttons and links, the text content inside the element. Whatever you put between the opening and closing tags.
- The title attribute. A fallback that browsers and assistive tech treat inconsistently. Avoid relying on it.

## Sources that count


### These provide a reliable, well-supported accessible name across browsers and assistive technology:

aria-label and aria-labelledby. The most explicit way to set the name. Use aria-label when the label is a fixed string, aria-labelledby when the label already exists as visible text elsewhere on the page.

Visible text content inside a button or link. The most natural option for buttons that already have a text label.

An associated label element on a form field. The for/id association or a wrapping label element is the standard way to label inputs and is understood everywhere.

The alt attribute on images and on input type=image. This is how the accessible name is provided for image-based controls.


## Sources that do NOT count


### These look like labels to a sighted user but are not part of the accessible name computation:

The placeholder attribute on an input. Some assistive tech reads it as a fallback when nothing else is set, but it disappears the moment the user types, and the support is inconsistent. Never rely on it as the only label.

Visible text near the element. A heading above a button, a paragraph beside an input, a column header next to a checkbox. The browser has no way to know that text describes the control unless the relationship is declared with aria-labelledby or a label element.

Visual styling alone. An icon, a colour, a position on the page. The element looks meaningful to a sighted user but provides nothing to anyone using a screen reader.

Colour or shape. Using red text to mean "required" or a downward chevron to mean "expand" only works for sighted users. Pair the visual cue with text that is part of the accessible name.

The value attribute on a button element. Screen readers announce only the text content of the button. The value is hidden form data sent to the server, not a label.


## The label-content-name-mismatch rule

When a button has both a visible text label and an aria-label, the two should match, or the aria-label should at least contain the visible text. WCAG Success Criterion 2.5.3 (Label in Name, Level A) requires it. Axe has a rule called label-content-name-mismatch that flags violations.

The classic example: a button shows "Save changes" but has aria-label="Save". A sighted user reads "Save changes" and tells their voice control software to "click Save changes". The software searches the accessible names of every control on the page, finds only "Save", and nothing matches. The button is unreachable by voice.

The fix is straightforward. Either remove the redundant aria-label and let the visible text speak for itself, or make sure the aria-label contains every word that appears visibly on the button. Adding extra context is fine: aria-label="Save changes to invoice" works because "Save changes" is still inside it.


## Practical guidance


### A few rules of thumb that prevent most accessible-name problems:

- Prefer visible text content over aria-label. The visible text is the accessible name automatically. There is nothing to keep in sync and no chance of mismatch.
- Use aria-label when the control has no visible text. The classic case is an icon-only button. Describe the action in plain words: "Search", "Close dialog", "Open menu".
- When you do use aria-label alongside visible text, include the visible text inside it. "Save changes" plus aria-label="Save changes for invoice 4521" is fine. "Save changes" plus aria-label="Save" is not.
- Test by reading the accessible name out of context. If a colleague hearing only the announced name can guess what the button does, the label is doing its job.

## Related topics

How the value attribute behaves on a button
