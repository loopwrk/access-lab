---
title: "Button vs. Input: The value attribute explained"
topicId: button-value-attribute
category: forms
order: 2
related:
  - button-types
  - form-wrapping
concepts:
  - button-element
  - form-context
  - accessible-name
summary: On a button element, the value attribute is hidden form data, not a
  label. Screen readers do not use it as the button’s accessible nam. This is the opposite of how value
  works on an input button.
---

The `value` attribute is a frequent source of confusion because it does completely different things depending on which element it is set on. Understanding the split prevents a class of subtle accessibility bugs.

## The core difference: `<button>` vs. `<input>`

Consider the following:

- `<button type="button">I am a button element</button>` <br>
- `<input type="button" value='I am an input element'/>` <br>

When rendered, they both look like buttons:

<button type="button" value="I am an button element" style="all: revert; width: 12rem; height: 2.5rem; font-size: 1rem">I am a button element</button>

<input type="button" value="I am an input element" style="all: revert; width: 12rem; height: 2.5rem; font-size: 1rem" /> <br>

Although they are visually similar, that's where the similarities end.
Buttons and inputs handle the `value` attribute differently.

### The `<input>` element: double duty

For `<input>` elements (specifically `type="button"`, `type="submit"`, or `type="reset"` - all which look like buttons when rendered), the `value` attribute acts as both the **visible text** and the **accessible name** read by screen readers. For example, setting `value="Save"` makes the button visibly say "Save" to all users.

**Why?** Because `<input>` is a _void element_. It is self-closing and cannot contain text or child elements. Writing `<input>Save</input>` is invalid HTML. Since there is nowhere to place text inside the tags, the `value` attribute is forced to serve two roles simultaneously: the visible UI label and the underlying form data.

### The `<button>` element: single duty

On a `<button>` element, the `value` attribute's text never appears on the screen, and screen readers do not announce it.

Instead, the visible text is simply whatever content you place _between_ the opening and closing tags (e.g., `<button>Save</button>`). The `value` is only used when the user triggers the button and the form data is sent to the server.

### The Danger Zone

Because these two elements look exactly the same to the end-user, developers often carry their assumptions from one pattern to the other. If you treat a `<button>` like an `<input>` by relying on the `value` attribute to label it, you will accidentally create a button that might look correct in the source code, but lacks a label entirely.

## When you would actually use the button value attribute

The most common reason to set a value on a button is when a single form has more than one submit button, and the server needs to know which one was clicked.

Imagine a form for writing a blog post. At the bottom you have two submit buttons. One is labelled Save as Draft and carries `value=draft`. The other is labelled Publish Now and carries `value=publish`. Both buttons share the same `name` attribute, for example `name=action`. When the user clicks Save as Draft, the form submits and the server receives `action=draft` in the request data. When they click Publish Now, the server receives `action=publish`.

The server reads the `name` and `value` pair to decide what to do next. Without the `value` attribute, the server would have no way to distinguish which button submitted the form.

## When should you use the `value` attribute on a `<button>`?

The most common reason to use the `value` attribute on a `<button>` is when a single form has **more than one submit button**, and the server needs to know exactly which one the user clicked.

Imagine a form for writing a blog post. At the bottom, you have two distinct buttons:

1. **Save as Draft**
2. **Publish Now**

If a user clicks one of these, how does the server know which action to take? It needs a way to distinguish them behind the scenes.

### How it works (The Key-Value Pair)

To send this information to the server, forms use a pair of attributes: `name` (which acts like a category tag) and `value` (the specific choice).

You would give both buttons the exact same `name` (for example, `name="action"`), but give them completely different values:

- The "Save as Draft" button gets `value="draft"`
- The "Publish Now" button gets `value="publish"`

When the user clicks **Publish Now**, the form submits and sends a message to the server that looks like this: `action=publish`.

The server reads that hidden data and knows exactly what to do. Without the `value` attribute, the server would just know that _a_ button was clicked, but would have absolutely no idea which one.

#### Example

```html
<form action="/submit-blog-post" method="POST">
  <input type="text" name="title" placeholder="Post Title" />
  <textarea name="content" placeholder="Write your post here..."></textarea>

  <div class="button-group">
    <button type="submit" name="action" value="draft">Save as Draft</button>
    <button type="submit" name="action" value="publish">Publish Now</button>
  </div>
</form>
```

## Why Screen Readers Ignore the `value` Attribute

A screen reader only announces a button's **accessible name**, which comes from the text.

This creates a silent accessibility failure:

```html
<button type="submit" value="Delete Item">X</button>
```

Sighted users guess that "X" means delete, but screen readers might not receive the full context because the descriptive `value` is not announced. To fix this, the descriptive action must be part of the accessible name.

## The "Label in Name" Mismatch (Voice Control)

Attempting to fix the screen reader issue with an `aria-label` can accidentally break things for **voice-control users**, who navigate by speaking the text they see on screen.

A button's hidden accessible name must contain its visible text. Notice the conflict created here:

```html
<button type="submit" aria-label="Delete Item">X</button>
```

- Visible text: "X"
- Accessible name: "Delete Item"

Voice control systems often rely on visible text. If the accessible name (in this case, the `aria-label` value) diverges too much, commands may become unreliable or harder to discover.

When a voice user says "Click X", screen readers can fail because the `aria-label` could override the visible text. Automated tools like Axe flag this immediately as a `label-content-name-mismatch`.

## The Solution

To satisfy both screen readers and voice control, align the visible text with the accessible name:

1. **Visible Text (Best Practice):** Use plain text instead of an icon: `<button type="submit">Delete Item</button>`.
2. **Accessible Icon:** If you must use an "X" icon, ensure the `aria-label="Delete Item"` is acceptable for voice users to speak aloud, or ensure any accompanying visual text matches the label perfectly.

## Practical guidance

### A few rules of thumb that prevent most value-attribute confusion:

- Treat `value` on a button element as form data only. If you want a label, set the text content of the button, not the `value` attribute.
- Treat `value` on an input button as both the label and the form data. The same string fills both roles. Make sure the string is meaningful in both contexts.
- When building multi-submit forms, give each button visible text that matches its intent. Save as Draft and Publish Now are clearer than reusing a single Submit button with hidden `value` differences.
- When an icon must stand in for text, add an `aria-label` that describes the action. Do not rely on the `value` attribute to convey meaning to assistive technology.
