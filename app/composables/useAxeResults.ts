import type { AxeResult } from './useAxeAudit'

interface AxeState {
  violations: AxeResult[]
  passes: AxeResult[]
  incomplete: AxeResult[]
  isReady: boolean
  errorMessage: string | null
}

export function useAxeResults() {
  return useState<AxeState>('axe-results', () => ({
    violations: [],
    passes: [],
    incomplete: [],
    isReady: false,
    errorMessage: null
  }))
}

export function useAllViolations() {
  const axeState = useAxeResults()
  const customViolations = useState<AxeResult[]>('custom-violations', () => [])

  const allViolations = computed(() => [
    ...axeState.value.violations,
    ...customViolations.value
  ])

  return { allViolations }
}

export function useAxeCounts() {
  const axeState = useAxeResults()
  const customViolations = useState<AxeResult[]>('custom-violations', () => [])

  const criticalCount = computed(() => {
    const axeCritical = axeState.value.violations.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    ).length
    const customCritical = customViolations.value.filter(
      v => v.impact === 'critical' || v.impact === 'serious'
    ).length
    return axeCritical + customCritical
  })

  const warningCount = computed(() => {
    const axeWarnings = axeState.value.violations.filter(
      v => v.impact === 'moderate' || v.impact === 'minor'
    ).length
    const customWarnings = customViolations.value.filter(
      v => v.impact === 'moderate' || v.impact === 'minor'
    ).length
    return axeWarnings + customWarnings
  })

  const passingCount = computed(() => axeState.value.passes.length)

  return { criticalCount, warningCount, passingCount }
}
