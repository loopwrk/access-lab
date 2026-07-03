/**
 * Convert a computed-style rgb()/rgba() string to a hex colour, e.g.
 * "rgb(239, 239, 239)" → "#efefef". Returns "" for anything that is not
 * an rgb string, so callers can fall back with `||`.
 */
export function rgbToHex(rgbStr: string | undefined): string {
  if (!rgbStr || !rgbStr.includes("rgb")) return "";
  const match = rgbStr.match(/\d+/g);
  if (!match) return "";
  const [r = 0, g = 0, b = 0] = match.map(Number);
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}
