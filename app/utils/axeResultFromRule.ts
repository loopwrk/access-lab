import type { RuleBase, ViolationResult } from "~/rules/types";
import type { AxeResult } from "~/types/axe";

/**
 * Translate a firing rule into the AxeResult shape the Issues panel renders,
 * so custom and DOM violations flow through the same pipeline as axe's own.
 */
export function axeResultFromRule(
  rule: RuleBase,
  result: ViolationResult,
  tagName: string,
): AxeResult {
  return {
    id: rule.id,
    description: rule.description,
    help: rule.help,
    helpUrl: rule.helpUrl ?? "",
    learnTopicId: rule.learnTopicId,
    supersededByAxe: rule.supersededByAxe,
    whyItMattersKey: rule.whyItMattersKey,
    howToFixKey: rule.howToFixKey,
    detailLabelKey: rule.detailLabelKey,
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
            message: result.message,
            data: null,
          },
        ],
      },
    ],
  };
}
