import type { Rule } from "~/rules/types";
import type { AxeResult } from "~/types/axe";
import { axeResultFromRule } from "~/utils/axeResultFromRule";

/**
 * Prop-based rule engine. `evaluate` runs every registered rule against the
 * current prop bag and publishes the firing rules to the shared
 * custom-violations state, where useAllViolations and useAxeCounts merge
 * them with axe + DOM-rule findings.
 */
export function useCustomRules(rules: Rule[], tagName: string) {
  const customViolations = useCustomViolations();

  function evaluate(props: Record<string, unknown>) {
    const results: AxeResult[] = [];

    for (const rule of rules) {
      const result = rule.evaluate(props);
      if (result) {
        results.push(axeResultFromRule(rule, result, tagName));
      }
    }

    customViolations.value = results;
  }

  return { customViolations, evaluate };
}
