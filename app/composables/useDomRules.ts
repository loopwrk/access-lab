import type { DomRule } from "~/rules/types";
import type { AxeResult } from "~/types/axe";
import { axeResultFromRule } from "~/utils/axeResultFromRule";

/**
 * DOM-based rule engine.
 *
 * Mirrors useCustomRules but evaluates against the latest iframe-side DOM
 * measurement (posted by preview-shell.html as `dom:measurement`, written by
 * useAxeAudit, read here via useDomMeasurement) rather than against
 * component props.
 *
 * Each registered rule is re-evaluated whenever the measurement changes;
 * matching results are published to the shared dom-violations state, where
 * useAllViolations and useAxeCounts pick them up alongside axe + prop-based
 * custom violations.
 */
export function useDomRules(rules: DomRule[]) {
  const measurement = useDomMeasurement();
  const domViolations = useDomViolations();

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
        if (result) results.push(axeResultFromRule(rule, result, m.tagName));
      }
      domViolations.value = results;
    },
    { immediate: true },
  );

  return { domViolations };
}
