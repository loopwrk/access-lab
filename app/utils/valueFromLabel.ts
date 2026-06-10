/**
 * Derive a form `value` attribute from a visible option label,
 * e.g. "Second option" → "second-option".
 */
export function valueFromLabel(label: string): string {
  return label.trim().toLowerCase().replace(/\s+/g, "-");
}
