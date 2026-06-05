# WCAG Contrast Calculation - research notes

Reference material for the live contrast badge in `ControlsPanel`. Captures
the formulas verbatim from the W3C, the thresholds, the things WCAG
deliberately leaves under-specified, and the implementation choices we're
making for AccessLab.

## Canonical sources

- **W3C - Understanding SC 1.4.3 Contrast (Minimum)**
  <https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html>
  The Understanding documents are where the actual formulas live in
  full; the WCAG 2.x normative spec just links to them.
- **W3C - WCAG 2.2 Recommendation**
  <https://www.w3.org/TR/WCAG22/>
  Defines the success criteria and threshold numbers.
- **W3C - Glossary entries** (formulas embedded inline):
  - <https://www.w3.org/TR/WCAG22/#dfn-contrast-ratio>
  - <https://www.w3.org/TR/WCAG22/#dfn-relative-luminance>
- **WebAIM - "Contrast and Color Accessibility"**
  <https://webaim.org/articles/contrast/>
  Independent, well-respected practical explainer; mirrors W3C maths and
  adds implementation guidance.
- **APCA / SAPC repository (for context on WCAG 3)**
  <https://github.com/Myndex/SAPC-APCA>

The maths is the same in WCAG 2.0, 2.1, and 2.2 - the only differences
between versions are the _thresholds_ and _which colour pairs need checking_.
WCAG 2.2 is the currently-adopted standard.

---

## 1. Relative luminance (verbatim from the W3C)

For 8-bit sRGB colours, treat each channel as a normalised value
`RsRGB = R/255`, `GsRGB = G/255`, `BsRGB = B/255`. Then apply the
piecewise gamma decode:

```
if RsRGB <= 0.04045 then R = RsRGB / 12.92
else                     R = ((RsRGB + 0.055) / 1.055) ^ 2.4

if GsRGB <= 0.04045 then G = GsRGB / 12.92
else                     G = ((GsRGB + 0.055) / 1.055) ^ 2.4

if BsRGB <= 0.04045 then B = BsRGB / 12.92
else                     B = ((BsRGB + 0.055) / 1.055) ^ 2.4
```

And combine using the ITU-R BT.709 luminance weights:

```
L = 0.2126 * R + 0.7152 * G + 0.0722 * B
```

`L` is in the range `[0, 1]` - `0` for pure black, `1` for pure white.

### Why these numbers

- `0.04045` is the breakpoint where sRGB's linear-segment slope meets its
  power-curve segment. Below it the response is linear, above it it's a
  ~2.4-gamma curve; the piecewise function avoids a singularity at zero
  that pure `x^2.4` would have.
- `12.92` and `0.055` / `1.055` are the constants that make the two
  segments meet continuously at `0.04045`.
- `2.4` is the sRGB transfer-function exponent.
- `0.2126 / 0.7152 / 0.0722` are the BT.709 / sRGB primaries' luminous
  weights - they sum to `1.0` and reflect the human eye's relative
  sensitivity to red, green, and blue light.

These constants are fixed by the sRGB specification (IEC 61966-2-1); they
are not WCAG-specific.

---

## 2. Contrast ratio (verbatim)

```
(L1 + 0.05) / (L2 + 0.05)
```

where `L1` is the relative luminance of the **lighter** colour and `L2`
is the relative luminance of the **darker** colour. (In code we usually
compute both luminances then `max(la, lb)` and `min(la, lb)` to assign.)

The `+ 0.05` offset prevents division by zero and models the small amount
of viewing-flare a screen produces in a typical viewing environment.

### Range

- `1.0:1` - identical colours (no contrast at all).
- `21.0:1` - pure black on pure white (theoretical maximum).

---

## 3. Thresholds

From WCAG 2.2 success criteria, by level:

| SC     | Level | What it covers                     | Normal text | Large text |
| ------ | ----- | ---------------------------------- | ----------- | ---------- |
| 1.4.3  | AA    | Text and images of text            | 4.5 : 1     | 3 : 1      |
| 1.4.6  | AAA   | Text and images of text (enhanced) | 7 : 1       | 4.5 : 1    |
| 1.4.11 | AA    | UI components, graphical objects   | 3 : 1       | n/a        |

### "Large text" definition

Large is **18pt or 14pt bold** - approximately **24px or 18.67px** in CSS
pixels, with `font-weight: 700` qualifying the smaller size. AccessLab's
ControlsPanel lets the user set `fontSize` directly in CSS px, so the
threshold check just compares the rendered px size against `24px` (or
`18.67px` when the bold control is on - we don't have one yet, so for the
first cut we just check the regular threshold).

### Don't round

WebAIM is explicit about this: **4.47 : 1 fails the AA 4.5 : 1
requirement**. Show the raw ratio (typically to 2 decimal places) and let
the verdict pass/fail at the precise number.

---

## 4. What WCAG deliberately leaves under-specified

These are the places where any implementation has to make a choice. Worth
documenting AccessLab's choice for each, otherwise the badge silently
disagrees with other tools.

### 4.1 Alpha / semi-transparency

WCAG 2 has no normative behaviour for semi-transparent foregrounds. WebAIM
says only: _"Reducing the alpha for an element will reduce its contrast
because you are allowing an underlying color to bleed through."_

The de-facto behaviour adopted by axe-core, Lighthouse, Chrome DevTools,
and most contrast checkers is the alpha-compositing formula:

```
C_eff = C_fg * α + C_bg * (1 - α)
```

applied per channel to the foreground colour before computing luminance.
The contrast is then between `C_eff` (now opaque) and the background.

**Edge case:** if the background itself has alpha, you have to recurse -
blend the background against _its_ backdrop (the next layer down, or
ultimately the page bg). AccessLab's button is rendered into a clean
iframe with the iframe's body as the next layer; we'll use the iframe
body's resolved colour as the final backdrop.

### 4.2 Anti-aliased edges

The Understanding doc explicitly says: _"refer to the foreground and
background colors obtained from the user agent, or the underlying markup
and stylesheets, rather than the text as presented on screen."_

In other words: don't sample pixels off the rendered glyph and compute
contrast for the mid-tone edge pixels. Use the **declared** colours from
the CSS. Anti-aliasing is the browser's problem, not the contrast
calculation's.

### 4.3 Non-uniform backgrounds (gradients, images)

WCAG doesn't define a normative rule for backgrounds that vary across
the text. WebAIM's guidance: _"usually testing the area where contrast
is lowest."_

Not relevant for our Button preview today (solid bg only). Worth flagging
when we get to components like Carousel where text overlays imagery.

### 4.4 Hover, focus, active states

WCAG 2.4.7 and 1.4.11 both apply: each state's colour pair must
independently meet 3:1 against its adjacent colours. AccessLab will
eventually want to surface this - for now, only the resting state is
audited.

### 4.5 Disabled elements

Disabled controls are explicitly exempted from 1.4.3 in WCAG 2.2 ("text
or images of text that are part of an inactive user interface component
… have no contrast requirement"). Worth knowing but not coded yet.

---

## 5. The WCAG 3 / APCA question

APCA (Accessible Perceptual Contrast Algorithm) is a candidate replacement
for the WCAG 2.x luminance-based maths. Status as of May 2026:

- **Not adopted.** APCA is referenced in WCAG 3 working drafts but the
  WCAG 3 spec itself remains a Working Draft (not a W3C Recommendation).
- **Stable as a library.** Published on npm as `apca-w3`, the algorithm
  itself doesn't churn.
- **Different scale.** APCA returns a perceptual lightness contrast
  number (`Lc`) on a roughly -108 to +108 range, with positive meaning
  light-on-dark and negative meaning dark-on-light. Not interoperable
  with the WCAG 2 ratio.

The motivation: WCAG 2's luminance maths is acknowledged (including by
the WCAG WG itself) to not track perceptual contrast well, especially
for thin text on coloured backgrounds. APCA models the human visual
system's response curve more accurately.

**AccessLab decision:** ship WCAG 2.2 first. It's what current legal
compliance audits use, and our audience (developers shipping today)
needs to pass those audits. Keep the maths in an isolated composable
(`useContrast`) so we can add `algorithm: 'apca'` as a second mode when
WCAG 3 stabilises.

---

## 6. Implementation choices

### API shape (planned)

```ts
// composables/useContrast.ts
export function useContrast(
  fg: MaybeRef<string>, // hex, possibly with alpha
  bg: MaybeRef<string>, // hex, possibly with alpha
  options?: {
    fontSizePx?: MaybeRef<number>;
    bold?: MaybeRef<boolean>;
    pageBackdrop?: string; // for cascading alpha; defaults to var(--bg)
  },
): {
  ratio: ComputedRef<number>; // raw, 2dp display
  verdict: ComputedRef<Verdict>; // 'AAA' | 'AA' | 'AALarge' | 'Fail'
  passes: ComputedRef<{ AA: boolean; AAA: boolean }>;
};
```

### Verdict labels

Four buckets, in descending order:

| Verdict   | Meaning                                              |
| --------- | ---------------------------------------------------- |
| `AAA`     | Meets AAA threshold for the current size.            |
| `AA`      | Meets AA but not AAA.                                |
| `AALarge` | Meets AA only at the relaxed "large text" threshold. |
| `Fail`    | Below the AA threshold even for large text.          |

### Display

The badge shows two things: the raw ratio (e.g. `3.42:1`) and the
verdict tag (e.g. `AA Large only`). Colour-coded with the design
tokens - `--success` for AAA, neutral for AA, `--warn` for AALarge,
`--error` for Fail. The colour is never the only cue - every verdict
also carries text per plan.md §11 ("No content via colour alone").

### Cross-check

Sanity-check our implementation against:

- WebAIM's Contrast Checker - <https://webaim.org/resources/contrastchecker/>
- Chrome DevTools' Issues panel contrast calculation.
- axe-core's `color-contrast` rule output (already running in the iframe).

These three should all return the same ratio to 2dp. If ours diverges,
the bug is in our maths, not in WCAG.
