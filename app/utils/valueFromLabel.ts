/**
 * Derive a machine-friendly form `value` from a human-readable label.
 *
 * In the controls panel the user only types the visible option text — a
 * select element's choices or a radio group's items. Each rendered `<option>` /
 * `<input type="radio">` still needs a `value` (the string the form
 * actually submits), so the renderers generate one from the label
 * instead of making the user supply both.
 *
 * Used by `select/render.ts` and `radio/render.ts`:
 *
 *   valueFromLabel("Second Option") // "second-option"
 *   // → <option value="second-option">Second Option</option>
 */
export function valueFromLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, "-");
}
