import type { DomRule } from "~/rules/types";

// Target size is a property of the RENDERED element, so these are DOM-measurement
// rules: they grade the control's actual border-box (DomMeasurement.targetWidth /
// targetHeight, measured in the iframe) rather than a declared width/height prop.
// That distinction matters - when the user has not pinned an explicit size (the
// default on every button page) the props are unset, and a prop-based check would
// report a phantom 0×0 for a button that is visibly, say, 140×40 in the preview.

export const targetSizeAA: DomRule = {
  id: "target-size-aa",
  title: "Button target size below AA minimum",
  wcag: "SC 2.5.8 Target Size (Minimum) - Level AA",
  tags: ["wcag22aa", "wcag258"],
  description: "Every interactive element must have a bounding box of at least 24×24 CSS pixels.",
  help: "Button must be at least 24×24 CSS pixels (Level AA)",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html",
  whyItMattersKey: "rules.targetSizeAa.whyItMatters",
  howToFixKey: "rules.targetSizeAa.howToFix",
  evaluate(measurement) {
    const w = measurement.targetWidth;
    const h = measurement.targetHeight;
    if (w < 24 || h < 24) {
      return {
        severity: "serious",
        message: `Rendered size: ${w} × ${h}px - fails AA minimum of 24×24px`,
      };
    }
    return null;
  },
};

export const targetSizeAAA: DomRule = {
  id: "target-size-aaa",
  title: "Button target size below AAA recommendation",
  wcag: "SC 2.5.5 Target Size - Level AAA",
  tags: ["wcag2aaa", "wcag255"],
  description:
    "For the best touch experience, especially on mobile, targets should be at least 44×44 CSS pixels. This gold-standard size benefits people using touch devices, head wands, eye-tracking, or users who are in transit or navigating an interface while in motion.",
  help: "Button should be at least 44×44 CSS pixels for Level AAA",
  helpUrl: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html",
  whyItMattersKey: "rules.targetSizeAaa.whyItMatters",
  howToFixKey: "rules.targetSizeAaa.howToFix",
  evaluate(measurement) {
    const w = measurement.targetWidth;
    const h = measurement.targetHeight;
    // Only fire the AAA warning once AA passes, so a single undersized button
    // surfaces as one issue (AA) rather than a stacked AA + AAA pair.
    if (w >= 24 && h >= 24 && (w < 44 || h < 44)) {
      return {
        severity: "moderate",
        message: `Rendered size: ${w} × ${h}px - fails AAA recommendation of 44×44px`,
      };
    }
    return null;
  },
};
