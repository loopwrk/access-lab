/**
 * Shared UCheckbox `:ui` slot override for the studio's card-style
 * boolean toggles.
 *
 * Every control panel that exposes a true/false flag uses the same
 * card visual: `variant="card"` + `color="primary"` + this UI patch
 * that tints the card with `--brand-soft` when checked and bolds the
 * label. Defining the patch in one place keeps the look consistent
 * across the Checkbox State + ARIA cards, the button-family section
 * toggles (Focus, Dimensions, Border, Colours, Text), and the
 * Radio / Select / Input controls.
 *
 * Reka surfaces the checked state as `data-state="checked"` on the
 * indicator; `has-data-[state=checked]` lifts that condition to the
 * card's root so the whole tile changes background. Token-driven so
 * the colour is correct in light, dark, and high-contrast modes (see
 * AGENTS.md "no hard-coded colours").
 */
export const CONTROL_CARD_UI = {
  root: "has-data-[state=checked]:bg-(--brand-soft)",
  label: "font-semibold text-(--text-primary)",
} as const;
