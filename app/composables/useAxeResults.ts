import type { DomMeasurement } from "~/rules/types";
import type { AxeResult, AxeState } from "~/types/axe";
import { severityBucket } from "~/utils/issueFormatting";

// Keys for the audit state shared across the pipeline. They live only inside
// these accessors - every reader and writer resolves the same state through
// the function, so a key typo is impossible rather than a silent empty store.
const AXE_RESULTS_KEY = "al-axe-results";
const CUSTOM_VIOLATIONS_KEY = "al-custom-violations";
const DOM_VIOLATIONS_KEY = "al-dom-violations";
const DOM_MEASUREMENT_KEY = "al-dom-measurement";

/** Raw axe-core output posted from the preview iframe (written by useAxeAudit). */
export function useAxeResults() {
  return useState<AxeState>(AXE_RESULTS_KEY, () => ({
    violations: [],
    passes: [],
    incomplete: [],
    isReady: false,
    errorMessage: null,
  }));
}

/** Violations from the prop-based rule engine (written by useCustomRules). */
export function useCustomViolations() {
  return useState<AxeResult[]>(CUSTOM_VIOLATIONS_KEY, () => []);
}

/** Violations from the DOM-measurement rule engine (written by useDomRules). */
export function useDomViolations() {
  return useState<AxeResult[]>(DOM_VIOLATIONS_KEY, () => []);
}

/** Latest element measurement posted by the preview iframe (written by useAxeAudit). */
export function useDomMeasurement() {
  return useState<DomMeasurement | null>(DOM_MEASUREMENT_KEY, () => null);
}

/**
 * Drop custom / DOM violations that axe-core already reports. When a custom
 * rule overlaps an axe rule — e.g. `toggle-wrong-attribute` and axe's
 * `aria-allowed-attr` both flag `aria-checked` on a plain button — we
 * prioritise axe's own finding and suppress the custom duplicate, so one
 * mistake surfaces as one issue (and one critical), not two. A custom rule
 * opts in by declaring `supersededByAxe: [axeRuleId, …]`. The check is
 * reactive: if axe hasn't run yet (or errored), the custom rule still shows,
 * so coverage degrades gracefully when axe is unavailable.
 */
function withoutAxeDuplicates(
  candidates: AxeResult[],
  axeViolations: AxeResult[],
): AxeResult[] {
  const axeIds = new Set(axeViolations.map((v) => v.id));
  return candidates.filter(
    (v) => !v.supersededByAxe?.some((id) => axeIds.has(id)),
  );
}

export function useAllViolations() {
  const axeState = useAxeResults();
  const customViolations = useCustomViolations();
  const domViolations = useDomViolations();

  const allViolations = computed(() => {
    const axeViolations = axeState.value.violations;
    return [
      ...axeViolations,
      ...withoutAxeDuplicates(customViolations.value, axeViolations),
      ...withoutAxeDuplicates(domViolations.value, axeViolations),
    ];
  });

  return { allViolations };
}

/**
 * Counts for the toolbar badges, derived from the same merged list the
 * Issues panel renders (useAllViolations), so the two can never disagree.
 */
export function useAxeCounts() {
  const axeState = useAxeResults();
  const { allViolations } = useAllViolations();

  const criticalCount = computed(
    () => allViolations.value.filter((v) => severityBucket(v.impact) === "critical").length,
  );
  const warningCount = computed(
    () => allViolations.value.filter((v) => severityBucket(v.impact) === "warning").length,
  );
  const passingCount = computed(() => axeState.value.passes.length);

  return { criticalCount, warningCount, passingCount };
}
