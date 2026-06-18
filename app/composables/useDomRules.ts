import type { DomMeasurement, DomRule, ViolationResult } from "~/rules/types";
import type { AxeResult } from "~/types/axe";

/**
 * DOM-based rule engine.
 *
 * Mirrors useCustomRules but evaluates against the latest iframe-side DOM
 * measurement (posted by preview-shell.html as `dom:measurement` and stored
 * in `dom-measurement` shared state by useAxeAudit) rather than against
 * component props.
 *
 * Each registered rule is re-evaluated whenever the measurement changes;
 * matching results are translated into the shared AxeResult shape and
 * stored in `dom-violations` state, where useAllViolations and
 * useAxeCounts pick them up alongside axe + prop-based custom violations.
 */
function domRuleToAxeResult(
  rule: DomRule,
  result: ViolationResult,
  tagName: string,
): AxeResult {
  return {
    id: rule.id,
    description: rule.description,
    help: rule.help,
    helpUrl: rule.helpUrl ?? "",
    learnTopicId: rule.learnTopicId,
    impact: result.severity,
    tags: rule.tags ?? [],
    nodes: [
      {
        html: `<${tagName}>`,
        impact: result.severity,
        target: [tagName],
        any: [],
        all: [],
        none: [
          {
            id: rule.id,
            impact: result.severity,
            message: result.measurement,
            data: null,
          },
        ],
      },
    ],
  };
}

export function useDomRules(rules: DomRule[]) {
  const measurement = useState<DomMeasurement | null>(
    "dom-measurement",
    () => null,
  );
  const domViolations = useState<AxeResult[]>("dom-violations", () => []);

  watch(
    measurement,
    (m) => {
      if (!m) {
        domViolations.value = [];
        return;
      }
      const results: AxeResult[] = [];
      for (const rule of rules) {
        const result = rule.evaluate(m);
        if (result) results.push(domRuleToAxeResult(rule, result, m.tagName));
      }
      domViolations.value = results;
    },
    { immediate: true },
  );

  function clear() {
    domViolations.value = [];
  }

  return { domViolations, clear };
}
