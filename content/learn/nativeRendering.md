---
title: "How Browsers Handle Native Elements"
topicId: "native-rendering"
summary: >-
  Browsers paint form controls using the OS theme. Custom CSS overrides that, changing how the box is rendered.
---

Browsers draw certain initial elements, mostly form elements, using a native rendering mode driven by your operating system's UI engine rather than standard CSS layout rules. The OS paints the button onto the screen, which is why a native button without any custom styling looks slightly different on Windows, macOS, iOS, or Android.

At first paint, the default styles you see in the browser's stylesheet aren't traditional CSS rules; they are system rules. They essentially tell the browser to ask the operating system what its current theme looks like and copy it.


## Shifting Control to CSS

The moment you apply a custom border, padding, or background, this link to the operating system breaks. The browser terminates the native rendering mode and hands full layout control over to its own CSS painting engine.

This switch is why a "2px" border you set manually might look thicker than the "2px" border the browser was just drawing: it is the exact same number, but rendered by a completely different paint engine.


## The Accessibility Responsibility

This shift from native to custom rendering creates a critical accessibility responsibility. Overriding native styles often strips away the browser's default, highly optimised behaviours.

When you style a button with CSS, you must manually code explicit design features that native buttons usually handle for you:


## Focus Rings

You must ensure clear keyboard focus indicators exist, maintaining at least a 3:1 contrast ratio so keyboard users don't lose their place.


## Hit Areas

The button must maintain a sufficient physical size (at least 44x44 pixels) for touch screens and users with limited motor control.


## Colour Contrast

Text-to-background contrast must remain high enough to prevent the button from becoming unreadable for users with low vision or colour blindness.
