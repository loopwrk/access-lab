import type { ManualChecklistItem } from "~/rules/types";

export const buttonManualChecklist: ManualChecklistItem[] = [
  {
    id: "use-button-element",
    title: "Use the <button> element for buttons",
    wcagSc: "1.3.1 Info and Relationships",
    description:
      "Buttons are used to submit data or perform an on-screen action. Use the native <button> element rather than <div> or <span> with click handlers - it gives you keyboard activation, focusability, and correct screen reader role for free.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html",
  },
  {
    id: "make-sure-interactive-content-is-unique",
    title: "Make sure the button label is unique and descriptive",
    wcagSc: "1.3.1 Info and Relationships",
    description:
      'Terms like "click here" and "read more" provide no context. Some people navigate using a list of all buttons on a page. Labels should describe what the button does, not how to interact with it.',
    url: "https://www.w3.org/WAI/WCAG22/Understanding/info-and-relationships.html",
  },
  {
    id: "visible-focus-style",
    title: "Make sure there is a visible focus indicator",
    wcagSc: "2.4.7 Focus Visible",
    description:
      "Can a person navigating with a keyboard, switch, voice control, or screen reader see which element currently has focus? Tab to the button and verify a visible outline or ring appears.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html",
  },
  {
    id: "input-contrast",
    title: "Check the contrast of the button border",
    wcagSc: "1.4.11 Non-text Contrast",
    description:
      "Level AA requires a contrast ratio of at least 3:1 for the button border against adjacent colors. This helps users with low vision identify the boundaries of interactive elements.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html",
  },
  {
    id: "increase-text-size",
    title: "Does the button still work at 200% text size?",
    wcagSc: "1.4.4 Resize Text",
    description:
      "Increase the browser text size to 200%. Is the button text still readable and fully visible? Does content overlap or get cut off? The button should remain usable without horizontal scrolling.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/resize-text.html",
  },
  {
    id: "no-color-alone",
    title: "Make sure color is not the only way states are conveyed",
    wcagSc: "1.4.1 Use of Color",
    description:
      "Button states like disabled, loading, success, or error should not rely on color alone. People who are color-blind or have low vision may not perceive the change. Add icons, text changes, or patterns alongside color.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html",
  },
  {
    id: "space-between-clickable-items",
    title: "Ensure sufficient spacing around the button",
    wcagSc: "2.5.5 Target Size (Enhanced)",
    description:
      "People with motor control issues such as hand tremors may struggle to tap buttons placed too close together. Provide enough spacing so the button can be activated without accidentally hitting adjacent controls.",
    url: "https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html",
  },
];
