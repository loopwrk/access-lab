---
title: How REM units work
topicId: rem-units
category: foundations
order: 4
related: []
summary: rem is a CSS length unit that scales with the user's browser font-size
  preference. Using it for layout values respects accessibility settings that px
  values ignore.
---

rem stands for "root em". It's a CSS length unit whose value depends on the root font-size of the page, which is the font-size set on the [html element](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/html). By default, browsers set this to 16px, so 1rem typically equals 16px. The root font-size can change, and rem-based values change with it.

## What makes rem responsive

A user can change their browser's default font-size in browser settings, often labelled "page font size" or "default font size". When they do, the root font-size of every web page they visit changes. CSS values written in rem scale automatically. CSS values written in px do not.

Set a button to `width: 5rem`. At the default root size of `16px`, the button is `80px` wide (5 × `16px` = `80px`). If the user sets their browser root to `20px`, the button becomes `100px` (5 × `20px` = `100px`).

## Why this matters for accessibility

WCAG 1.4.4 Resize Text requires that text can be resized up to 200% without loss of content or functionality. If you use px for both your text and the container around it, increasing text size can cause overflow, clipping, or broken layouts. Using rem for the container as well means the layout scales with the text.

### For users who need larger text:

A user with low vision may set their default browser font size to 24px or more.

A user with a cognitive impairment may prefer larger, clearer text to reduce reading effort.

An older user may find smaller text physically uncomfortable to read at length.

In all of these cases, a rem-based design respects the user's preference. A px-based design ignores it entirely.

## rem vs em vs px

### Three common length units, three different behaviours:

px is absolute. 16px is 16px, always. It ignores the user's preferences.

em is relative to the element's own font-size, which inherits from its parent. This makes em values unpredictable in deeply nested layouts.

rem is relative to the root font-size only. Consistent across the page, and responsive to user preferences.

## When to use rem

### Most CSS values that relate to layout and typography are good candidates for rem

- Font sizes, especially headings and body text.
- Padding and margins around text.
- Widths and heights of components that contain text.
- Border-radii on elements that hold text.

### Where px still makes sense

- Hairline borders that you want pixel-precise regardless of user settings.
- Specific visual details that shouldn't scale, like dividers or small icons.
- One-off values from design tools when you need to match a mockup exactly.

A useful test: if changing the value would affect how the user reads or interacts with the page, rem is probably the right choice. If it's purely decorative or structural, px is fine.

## How to change the root font-size

It is generally advised not to change the root font-size. While everyday users don't actually think about the literal number `16 pixels`, they expect the comfort level that 16px provides. It has become the universal baseline for web legibility over the couple of few decades.

If you do want to change the root font-size, the recommended way to change the root-font size is using a CSS stylesheet. The most critical accessibility rule for the root font size is: never set the root font size in absolute pixels (like `18px`).

If a developer hardcodes `html { font-size: 18px; }`, they are effectively overriding the user's browser settings. If a user who has vision needs which require larger text than the 16px default and has set their default browser font size to `24px`, the hardcoded `18px` will shrink the text back down, breaking their custom accessibility settings.

### The Accessible Approach (in your CSS stylesheet)

Instead of pixels, use a percentage:

```css
html {
  font-size: 100%;
}
```

Why this works: Setting it to `100%` means "take whatever default font size the user has chosen in their browser settings and use that as the base." For most users, this will be `16px` (making `1rem = 16px`), but for a user who needs larger text, it will seamlessly scale to their preference (e.g., `1rem = 24px`).

Note: when viewing other, generally older codebases, you might see this `html { font-size: 62.5%; } /* 62.5% of 16px = 10px */` which was an old trick which was used as some developers preferred a base of 10 as it is easier for multiplication. This turned `1rem` into exactly `10px`, meaning `1.6rem` became `16px`, `2.4rem` became `24px`, and so on. While this preserves user accessibility settings, it creates a massive headache in modern web development, it breaks third-party component libraries (like Tailwind) UI, where components are built assuming 1rem equals the standard default (16px). Modern CSS now also supports the CSS calc() function which allows developers to work in base 10 if they prefer in their code, whilst the browser still uses base 16.
