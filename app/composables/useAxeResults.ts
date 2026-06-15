import type { AxeResult, AxeState } from "~/types/axe";

export function useAxeResults() {
  return useState<AxeState>("axe-results", () => ({
    violations: [],
    passes: [],
    incomplete: [],
    isReady: false,
    errorMessage: null,
  }));
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
  const customViolations = useState<AxeResult[]>("custom-violations", () => []);
  const domViolations = useState<AxeResult[]>("dom-violations", () => []);

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

export function useAxeCounts() {
  const axeState = useAxeResults();
  const customViolations = useState<AxeResult[]>("custom-violations", () => []);
  const domViolations = useState<AxeResult[]>("dom-violations", () => []);

  const isCritical = (impact: string | null | undefined) =>
    impact === "critical" || impact === "serious";
  const isWarning = (impact: string | null | undefined) =>
    impact === "moderate" || impact === "minor";

  // Same axe-wins suppression as useAllViolations, so the toolbar badges and
  // the Issues panel always agree on the counts.
  const effectiveCustom = computed(() =>
    withoutAxeDuplicates(customViolations.value, axeState.value.violations),
  );
  const effectiveDom = computed(() =>
    withoutAxeDuplicates(domViolations.value, axeState.value.violations),
  );

  const criticalCount = computed(
    () =>
      axeState.value.violations.filter((v) => isCritical(v.impact)).length
      + effectiveCustom.value.filter((v) => isCritical(v.impact)).length
      + effectiveDom.value.filter((v) => isCritical(v.impact)).length,
  );

  const warningCount = computed(
    () =>
      axeState.value.violations.filter((v) => isWarning(v.impact)).length
      + effectiveCustom.value.filter((v) => isWarning(v.impact)).length
      + effectiveDom.value.filter((v) => isWarning(v.impact)).length,
  );

  const passingCount = computed(() => axeState.value.passes.length);

  return { criticalCount, warningCount, passingCount };
}
