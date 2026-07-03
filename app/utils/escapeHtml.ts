/**
 * Escape text content (& < >). Double quotes stay literal so label text
 * reads naturally in the code drawer; attribute values must use
 * escapeAttribute instead.
 */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** Escape a double-quoted attribute value: escapeHtml plus double quotes. */
export function escapeAttribute(value: string): string {
  return escapeHtml(value).replace(/"/g, "&quot;");
}
