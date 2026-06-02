---
title: How Browsers Handle Native Elements
topicId: native-rendering
category: foundations
order: 1
related: []
summary: Browsers use a mix of user-agent styles and platform-native rendering
  for form controls. CSS can partially or fully override this behaviour
  depending on properties such as appearance.
---

When a browser renders a default form control (like a button, dropdown, or text input), its visual appearance is determined by a mix of two factors:

- **User-agent stylesheets:** The browser's own built-in, default CSS rules.
- **Operating system native styling:** The host operating system's internal design system and UI themes.

Because of this dual dependency, default elements will look noticeably different depending on:

- **The browser:** Chrome, Firefox, Safari, and Edge all have unique internal rendering rules.
- **The operating system:** Windows, macOS, iOS, and Android each enforce their own native design language.

Ultimately, unless you explicitly override these styles with custom CSS, browsers will blend their own default rules with the host OS guidelines, leading to a highly inconsistent cross-platform experience.

The browser decides which styles take precedence over others and in which order using the [cascade algorithm](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Cascade/Introduction).

## What “native-looking” actually means

It does **not** mean the operating system is directly drawing the button onto the screen.

Instead, the browser is in control of the rendering, and it may:

- use built-in browser styles that mimic the OS
- or rely on system-provided components for parts of the control
- or combine both approaches depending on the element and browser engine

So the look feels “native”, but it is still being managed by the browser.

## A useful mental model

Think of it like this:

The browser is the designer and builder of the page.  
Sometimes it:

- follows its own default design rules
- and sometimes borrows visual ideas from the operating system

The final result is always produced by the browser, even if it resembles native system UI.

## Native vs CSS Rendering

Some form controls may use native rendering paths, while others are fully rendered using CSS and the browser’s layout engine.

In practice:

- Some properties preserve native appearance
- Some trigger a more CSS-based rendering of the element
- Behaviour varies between browser engines: Blink (Chrome, Edge), WebKit (Safari), Gecko (Firefox)

#### Should You Replace Native Styling?

It depends. In most cases, preserving native behaviour where possible is often the more accessible choice. However, sometimes replacing native styling can actually improve accessibility. For example, to meet [WCAG level AAA accessibility guidelines](https://www.w3.org/WAI/WCAG21/Understanding/target-size.html), the target size of buttons should be at least 44 x 44 pixels. Most browsers render buttons smaller than this by default.

Developers can remove much of the native appearance using:

```css
button,
input,
select,
textarea {
  appearance: none;
}
```

However, this should be done carefully.

Removing native styling means you become responsible for recreating:

- Focus indicators
- Hover states
- Disabled states
- High contrast compatibility
- Keyboard accessibility
- Touch-friendly sizing
- Dropdown arrows

#### Component Libraries

CSS and component libraries sit between your CSS and the browser.

Examples include:

- Tailwind
- Bootstrap
- Material UI

These libraries typically:

- Apply their own CSS reset or normalisation
- Override browser defaults
- Provide consistent styling across browsers
- Recreate form controls using custom CSS

This reduces cross-browser differences, but does not eliminate them completely.

Even when using a component library, native browser behaviour, operating system differences, zoom levels, accessibility settings, and font rendering can still affect the final result.

It is important to make sure that if you plan to use a library, that you choose one that places accessibility as a top priority.

## Key Takeaway

A browser does not render a page using your CSS alone.

The final result is influenced by:

1. Your CSS
2. Any component library styles
3. Browser default styles
4. Operating system rendering
5. User preferences and accessibility settings

Because of this, pixel-perfect consistency across every browser, operating system, and device is rarely achievable. The goal is usually **functional consistency and a good user experience**, rather than identical rendering everywhere.
