---
title: '"Invisible" Text Slips Past Automated Tests'
topicId: invisible-text
category: foundations
order: 3
related: []
summary: When text colour matches its background exactly, automated contrast
  checks are skipped. But the text disappears.
---

When text colour matches its background colour exactly, the text completely disappears from view. However, the code is still there. A screen reader will still read the words out loud, search engines will still index them, and the browser still builds space for them. But a sighted user will never see them.

## Why Automated Checkers Deliberately Skip This

Most automated accessibility tools skip contrast tests or flag it for manual review when the text colour and background colour are an exact match. They do this to avoid giving "false alarm" errors.

Using matching colours is a common, though outdated, trick developers use to intentionally hide content from sighted users while keeping it available for screen readers (like hidden form labels or extra context for links). Because an automated tool cannot tell the difference between a mistake and an intentional design choice, it simply skips the test.

The moment you change one of the colours by even a tiny fraction, the tool can calculate the contrast ratio again and will flag it as an error. Testing platforms built for human exploration fill this gap because they assume a person is checking the colours on purpose, meaning the chance of it being a deliberate hiding trick is almost zero.

## Why It Matters in Production

Accidentally invisible text is one of the easiest bugs to miss before [launching a website or deploying new code](https://developer.mozilla.org/en-US/docs/Learn_web_development/Getting_started/Your_first_website/Publishing_your_website). A developer's design file might look perfect, but a conflicting line of code or a broken variable in production can cause the colours to overlap, leaving text completely invisible while still passing every automated test.

**This creates a split user experience.**

Screen-reader users will hear the text perfectly and assume the page is fine.

Sighted users will see an empty space or an unlabeled button and might think something in the page is broken.

Catching this requires manually inspecting the final for computed colours on the screen, which standard quality assurance checks often miss.

## Web Accessibility Standards (WCAG)

**Official web accessibility guidelines require text to [stand out clearly from its background](https://developer.mozilla.org/en-US/docs/Web/Accessibility/Guides/Understanding_WCAG/Perceivable/Color_contrast).**

> This difference in brightness is measured as a contrast ratio, which quantifies how much lighter or darker the text is compared to the background.

Level AA (Standard): Requires a contrast ratio of at least 4.5:1 for normal text.

Level AAA (Highest): Raises that requirement to 7:1.

A 1:1 ratio (where the text and background are identical) is a total failure of both standards.

AccessLab's colour tool - available in the Controls panel for most HTML elements - displays the colour contrast between the background and text colour (foreground) live, as you change the colours.

## How to Fix It, or Hide Text Safely

### If the invisible text is a mistake

Update your code to use distinct text and background colours that meet the required contrast ratios.

### If you actually want to hide the text visually, but readable by screen-readers

Avoid hiding text by making it the exact same color as your background. Instead, use a modern CSS technique that shrinks the element down to an invisible 1-pixel dot. This removes the text from the screen visually while keeping the underlying code completely intact.

This safer method is important for two main reasons:

It supports assistive tech: Screen readers can still find and announce the hidden text.

It prevents visual glitches: The text won't accidentally reappear if a user highlights the page, overrides your website's colors, or enables a high-contrast theme.

Here is an example of how you can implement this using CSS:

```css
position: absolute;
width: 1px;
height: 1px;
padding: 0;
margin: -1px;
overflow: hidden;
clip-path: inset(50%);
white-space: nowrap;
border-width: 0;
```

Many modern styling tools, like Tailwind CSS, provide a pre-made sr-only (screen-reader only) class exactly for this purpose.

Read more an in-depth guide on [Hiding Elements Correctly](https://www.accessibility-developer-guide.com/examples/hiding-elements/) on the Accessibiilty Developer Guide website.
