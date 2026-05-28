import type { DomRule } from "../types";

/**
 * Detect when an element's rendered content exceeds its container's box.
 *
 * Severity is critical: when content visibly leaves its container or is
 * truncated, real information loss is at stake — primarily for low-vision,
 * zoom, and custom-style users (WCAG 1.4.4, 1.4.10, 1.4.12).
 */
export const contentOverflow: DomRule = {
  id: "content-overflow",
  title: "Content overflows its container",
  wcag: "SC 1.4.4 Resize Text — Level AA",
  tags: ["best-practice"],
  description:
    "The element's rendered content extends beyond the bounds of its box. Sighted users will see the content clipped or spilling outside the layout; users who zoom in, increase their browser's text size, or apply custom user styles can lose access to the affected content entirely. This typically happens when a fixed width or height is combined with a font size, padding, or label length that the container can no longer accommodate.",
  help: "Allow the element to size to its content (drop fixed width/height), or shrink the content (font size, label, padding) to fit",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html",
  evaluate(m) {
    const overflowX = m.scrollWidth > m.clientWidth;
    const overflowY = m.scrollHeight > m.clientHeight;
    if (!overflowX && !overflowY) return null;

    const parts: string[] = [];
    if (overflowX) {
      parts.push(
        `content width ${m.scrollWidth}px exceeds container ${m.clientWidth}px`,
      );
    }
    if (overflowY) {
      parts.push(
        `content height ${m.scrollHeight}px exceeds container ${m.clientHeight}px`,
      );
    }

    return {
      severity: "critical",
      measurement: `Content overflows the <${m.tagName}> — ${parts.join("; ")}`,
    };
  },
};
