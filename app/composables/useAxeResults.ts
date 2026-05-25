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
  const domViolations = useState<AxeResult[]>('dom-violations', () => [])

  const allViolations = computed(() => [
    ...axeState.value.violations,
    ...customViolations.value,
    ...domViolations.value
  ])

  return { allViolations }
}

export function useAxeCounts() {
  const axeState = useAxeResults()
  const customViolations = useState<AxeResult[]>('custom-violations', () => [])
  const domViolations = useState<AxeResult[]>('dom-violations', () => [])

  const isCritical = (impact: string | null | undefined) =>
    impact === 'critical' || impact === 'serious'
  const isWarning = (impact: string | null | undefined) =>
    impact === 'moderate' || impact === 'minor'

  const criticalCount = computed(() =>
    axeState.value.violations.filter(v => isCritical(v.impact)).length
    + customViolations.value.filter(v => isCritical(v.impact)).length
    + domViolations.value.filter(v => isCritical(v.impact)).length
  )

  const warningCount = computed(() =>
    axeState.value.violations.filter(v => isWarning(v.impact)).length
    + customViolations.value.filter(v => isWarning(v.impact)).length
    + domViolations.value.filter(v => isWarning(v.impact)).length
  )

  const passingCount = computed(() => axeState.value.passes.length)

  return { criticalCount, warningCount, passingCount }
}
