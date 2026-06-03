import type { AxeResult } from '~/composables/useAxeAudit'
import type { Rule, ViolationResult } from '~/rules/types'

function violationToAxeResult(
  rule: Rule,
  result: ViolationResult,
  tagName: string
): AxeResult {
  return {
    id: rule.id,
    description: rule.description,
    help: rule.help,
    helpUrl: rule.helpUrl ?? '',
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
            data: null
          }
        ]
      }
    ]
  }
}

export function useCustomRules(rules: Rule[], tagName: string) {
  const customViolations = useState<AxeResult[]>('custom-violations', () => [])

  function evaluate(props: Record<string, unknown>) {
    const results: AxeResult[] = []

    for (const rule of rules) {
      const result = rule.evaluate(props)
      if (result) {
        results.push(violationToAxeResult(rule, result, tagName))
      }
    }

    customViolations.value = results
  }

  function clear() {
    customViolations.value = []
  }

  return { customViolations, evaluate, clear }
}
