import type { AxeResult } from '~/composables/useAxeAudit'
import type { Rule, ViolationResult } from '~/rules/types'

function violationToAxeResult(rule: Rule, result: ViolationResult): AxeResult {
  return {
    id: rule.id,
    description: rule.description,
    help: rule.help,
    helpUrl: rule.helpUrl ?? '',
    impact: result.severity,
    tags: [],
    nodes: [
      {
        html: '<button>',
        impact: result.severity,
        target: ['button'],
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

export function useCustomRules(rules: Rule[]) {
  const customViolations = useState<AxeResult[]>('custom-violations', () => [])

  function evaluate(props: Record<string, unknown>) {
    const results: AxeResult[] = []

    for (const rule of rules) {
      const result = rule.evaluate(props)
      if (result) {
        results.push(violationToAxeResult(rule, result))
      }
    }

    customViolations.value = results
  }

  function clear() {
    customViolations.value = []
  }

  return { customViolations, evaluate, clear }
}
