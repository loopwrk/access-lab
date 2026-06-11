/**
 * Pure helpers for presenting axe-core results in the Issues panel.
 * Everything here is a function of its arguments — display strings
 * live in i18n (`issues.why.*`); these functions only pick keys and
 * reshape rule metadata.
 */

const ACRONYMS = new Set(["wcag", "aria", "html", "css", "svg", "url", "id"]);

/** Turn a rule id like `target-size-aaa` into a heading like `Target Size`. */
export function formatRuleId(id: string): string {
  const withoutLevel = id.replace(/-aaa?$/, "");
  return withoutLevel
    .split("-")
    .map((word) => (ACRONYMS.has(word) ? word.toUpperCase() : word.charAt(0).toUpperCase() + word.slice(1)))
    .join(" ");
}

export type RuleClassification = "A" | "AA" | "AAA" | "Best Practice";

const TAG_TO_LEVEL: Array<[string, "A" | "AA" | "AAA"]> = [
  ["wcag2aaa", "AAA"],
  ["wcag22aaa", "AAA"],
  ["wcag2aa", "AA"],
  ["wcag21aa", "AA"],
  ["wcag22aa", "AA"],
  ["wcag2a", "A"],
  ["wcag21a", "A"],
  ["wcag22a", "A"],
];

/** Read the WCAG conformance level (or Best Practice) off a rule's tags. */
export function classificationFromTags(tags: string[] | undefined): RuleClassification | null {
  if (!tags) return null;
  for (const [tag, level] of TAG_TO_LEVEL) {
    if (tags.includes(tag)) return level;
  }
  if (tags.includes("best-practice")) return "Best Practice";
  return null;
}

export interface FailureSection {
  directive: string;
  items: string[];
}

/**
 * Split an axe `failureSummary` into its "Fix any/all of the following"
 * sections with their bullet items, so the panel can render them as
 * structured lists instead of a raw text blob.
 */
export function parseFailureSummary(summary: string): FailureSection[] {
  const sections: FailureSection[] = [];
  let currentSection: FailureSection | null = null;

  for (const line of summary.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (/^fix (?:any|all) of the following:/i.test(trimmed)) {
      currentSection = { directive: trimmed, items: [] };
      sections.push(currentSection);
    } else if (currentSection) {
      const item = trimmed.replace(/^[-•]\s*/, "").trim();
      if (item) {
        currentSection.items.push(item);
      }
    }
  }

  return sections;
}

/**
 * i18n keys for the "why it matters" explainer, looked up from a
 * rule's axe tags. Category tags are most specific; WCAG level tags
 * come next; the principle digit in a success-criterion tag (e.g.
 * `wcag412` → principle 4) is the last resort.
 */
const TAG_WHY_KEYS: Record<string, string> = {
  "cat.color": "issues.why.catColor",
  "cat.aria": "issues.why.catAria",
  "cat.forms": "issues.why.catForms",
  "cat.keyboard": "issues.why.catKeyboard",
  "cat.language": "issues.why.catLanguage",
  "cat.name-role-value": "issues.why.catNameRoleValue",
  "cat.semantics": "issues.why.catSemantics",
  "cat.sensory-and-visual-cues": "issues.why.catSensoryVisualCues",
  "cat.structure": "issues.why.catStructure",
  "cat.text-alternatives": "issues.why.catTextAlternatives",
  "cat.time-and-media": "issues.why.catTimeMedia",
  "wcag2a": "issues.why.wcagLevelA",
  "wcag21a": "issues.why.wcagLevelA",
  "wcag22a": "issues.why.wcagLevelA",
  "wcag2aa": "issues.why.wcagLevelAA",
  "wcag21aa": "issues.why.wcagLevelAA",
  "wcag22aa": "issues.why.wcagLevelAA",
  "wcag2aaa": "issues.why.wcagLevelAAA",
  "wcag22aaa": "issues.why.wcagLevelAAA",
  "best-practice": "issues.why.bestPractice",
};

const PRINCIPLE_WHY_KEYS: Record<string, string> = {
  1: "issues.why.principle1",
  2: "issues.why.principle2",
  3: "issues.why.principle3",
  4: "issues.why.principle4",
};

/** Pick the i18n key for a rule's "why it matters" explainer, or null when no tag matches. */
export function issueWhyKey(tags: string[]): string | null {
  for (const tag of tags) {
    const directKey = TAG_WHY_KEYS[tag];
    if (directKey) return directKey;

    const criterionMatch = tag.match(/^wcag(\d)(?:\d)(?:\d)(?:\d)?$/);
    if (criterionMatch?.[1]) {
      const principleKey = PRINCIPLE_WHY_KEYS[criterionMatch[1]];
      if (principleKey) return principleKey;
    }
  }

  return null;
}
