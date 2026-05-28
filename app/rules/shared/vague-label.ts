import type { Rule } from "../types";

const VAGUE_LABELS = new Set([
  "ok",
  "click",
  "click here",
  "submit",
  "button",
  "go",
  "do it",
  "yes",
  "no",
  "tap",
  "tap here",
  "click me",
  "click me!",
  "more",
  "read more",
  "learn more",
  "label",
  "button label",
  "?",
  "...",
]);

function normalize(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim().toLowerCase();
  return trimmed.length === 0 ? null : trimmed;
}

export const vagueLabel: Rule = {
  id: "vague-label",
  title: "Label is too vague to be meaningful",
  wcag: "SC 2.4.6 Headings and Labels — Level AA",
  tags: ["best-practice"],
  description:
    'The button\'s accessible name conveys no information about its purpose out of context. Screen reader users navigating by element list will hear a bare "OK" or "Submit" with no indication of what action it performs. Labels read most clearly as a verb + noun ("Save changes") rather than a verb alone ("Save") or a generic placeholder ("OK", "Click here").',
  help: "Rewrite the label so it makes sense when read out of context. Aim for verb + noun where possible.",
  helpUrl:
    "https://www.w3.org/WAI/WCAG22/Understanding/headings-and-labels.html",
  learnTopicId: "vague-label",
  evaluate(props) {
    const isIcon = props.contentType === "icon";
    const ariaName = normalize(props.ariaLabel);
    const visibleName = isIcon ? null : normalize(props.label);
    const effective = ariaName ?? visibleName;

    if (!effective) return null;
    if (!VAGUE_LABELS.has(effective)) return null;

    const displayName =
      (props.ariaLabel as string) || (props.label as string) || "";

    return {
      severity: "moderate",
      measurement: `"${displayName}" is too vague — screen-reader users navigating by element list won't know what this button does.`,
    };
  },
};
