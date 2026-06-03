import type { Rule } from "~/rules/types";

export const targetSizeAA: Rule = {
  id: "target-size-aa",
  title: "Button target size below AA minimum",
  wcag: "SC 2.5.8 Target Size (Minimum) — Level AA",
  tags: ["wcag22aa", "wcag258"],
  description:
    "Every interactive element must have a bounding box of at least 24×24 CSS pixels.",
  help: "Button must be at least 24×24 CSS pixels (Level AA)",
  helpUrl:
    "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html",
  evaluate(props) {
    const w = Number(props.width ?? 0);
    const h = Number(props.height ?? 0);
    if (w < 24 || h < 24) {
      return {
        severity: "serious",
        measurement: `Current size: ${w} × ${h}px — fails AA minimum of 24×24px`,
      };
    }
    return null;
  },
};

export const targetSizeAAA: Rule = {
  id: "target-size-aaa",
  title: "Button target size below AAA recommendation",
  wcag: "SC 2.5.5 Target Size — Level AAA",
  tags: ["wcag2aaa", "wcag255"],
  description:
    "For the best touch experience, especially on mobile, targets should be at least 44×44 CSS pixels. This gold-standard size benefits people using touch devices, head wands, eye-tracking, or users who are in transit or navigating an interface while in motion.",
  help: "Button should be at least 44×44 CSS pixels for Level AAA",
  helpUrl:
    "https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html",
  evaluate(props) {
    const w = Number(props.width ?? 0);
    const h = Number(props.height ?? 0);
    // Only fire AAA warning if AA passes (don't double-report)
    if (w >= 24 && h >= 24 && (w < 44 || h < 44)) {
      return {
        severity: "moderate",
        measurement: `Current size: ${w} × ${h}px — fails AAA recommendation of 44×44px`,
      };
    }
    return null;
  },
};
