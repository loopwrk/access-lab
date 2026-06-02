---
title: How the value attribute behaves on a button
topicId: button-value-attribute
category: forms
order: 2
related:
  - button-types
  - form-wrapping
summary: On a button element, the value attribute is hidden form data, not a
  label. Screen readers ignore it entirely. This is the opposite of how value
  works on an input button.
---

The value attribute is a frequent source of confusion because it does completely different things depending on which element it is set on. Understanding the split prevents a class of subtle accessibility bugs.


## The difference between button and input elements

On an input element with type=button, type=submit, or type=reset, the value attribute is the visible text shown to the user. It is also the accessible name announced by assistive technology. Set value=Save and the input button reads Save on screen and to a screen reader.

The reason input behaves this way is that `<input>` is a void element. HTML defines it as self-closing with no children, so writing `<input>Save</input>` is invalid and browsers silently correct it. With nowhere inside the element for text content, the specification puts the visible label on the value attribute. Same attribute, two roles by necessity: the visible label and the form data the server receives.

On a button element, the value attribute does not appear on screen at all. It is hidden form data, included with the form submission when the user clicks the button. The visible text is whatever you put between the opening and closing tags of the button.

Two elements that look identical in the UI carry the value attribute in completely different roles. A developer used to one pattern may carry the assumption over to the other and create a button that appears to have a label but does not.


## When you would actually use the button value attribute

The most common reason to set a value on a button is when a single form has more than one submit button, and the server needs to know which one was clicked.

Imagine a form for writing a blog post. At the bottom you have two submit buttons. One is labelled Save as Draft and carries value=draft. The other is labelled Publish Now and carries value=publish. Both buttons share the same name attribute, for example name=action. When the user clicks Save as Draft, the form submits and the server receives action=draft in the request data. When they click Publish Now, the server receives action=publish.

The server reads the name and value pair to decide what to do next. Without the value attribute, the server would have no way to distinguish which button submitted the form.


## Why the value attribute is invisible to screen readers

When a screen reader announces a button, it reads only the accessible name. For a button element, the accessible name comes from the text content between the opening and closing tags, or from an aria-label if one is set. The value attribute is not part of the accessible name computation at all.

This creates a quiet accessibility failure. A developer writes a button with the visible text X and sets value=Delete Item, expecting the value to convey the action. A screen reader user hears only X, button. They have no idea that this button is intended to delete something.

The fix is to make the action part of the visible label, or to add an aria-label that describes the action in plain words. For example, aria-label=Delete Item paired with the X icon. The screen reader now announces Delete Item, button, regardless of what value is set for the form data.


## The link to label in name

The same example reveals another concern. WCAG Success Criterion 2.5.3, Label in Name, requires the accessible name of a control to contain its visible text. Voice control users speak the visible label to activate a control.

An X button with value=Delete Item and no aria-label has visible text X. A voice user saying click Delete Item finds nothing matching, because no control on the page is named Delete Item. Saying click X works, but only because the user can see the visible text.

If the developer adds aria-label=Delete Item to fix the screen reader problem, a new issue appears. The visible label is X but the accessible name is Delete Item. The two no longer agree. Axe flags this with the label-content-name-mismatch rule.

Resolving both at once means pairing a visible label with a matching accessible name. Either replace the X with the word Delete and let the visible text speak for itself, or pair the X icon with aria-label=Delete Item and accept that voice users will need to speak the action rather than the icon. The choice depends on which user groups the product prioritises and whether the icon is reinforced elsewhere.


## Practical guidance


### A few rules of thumb that prevent most value-attribute confusion:

- Treat value on a button element as form data only. If you want a label, set the text content of the button, not the value attribute.
- Treat value on an input button as both the label and the form data. The same string fills both roles. Make sure the string is meaningful in both contexts.
- When building multi-submit forms, give each button visible text that matches its intent. Save as Draft and Publish Now are clearer than reusing a single Submit button with hidden value differences.
- When an icon must stand in for text, add an aria-label that describes the action. Do not rely on the value attribute to convey meaning to assistive technology.

## Related topics

Why button type matters

Why wrapping a button in a form matters
