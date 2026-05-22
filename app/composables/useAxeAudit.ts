type ImpactValue = 'minor' | 'moderate' | 'serious' | 'critical' | null

interface CheckResult {
  id: string
  impact?: ImpactValue
  message: string
  data: unknown
}

interface NodeResult {
  html: string
  impact?: ImpactValue
  target: string[]
  any: CheckResult[]
  all: CheckResult[]
  none: CheckResult[]
  failureSummary?: string
}

export interface AxeResult {
  id: string
  description: string
  help: string
  helpUrl: string
  impact?: ImpactValue
  tags: string[]
  nodes: NodeResult[]
}

export function useAxeAudit(iframeRef: {
  readonly value: HTMLIFrameElement | null
}) {
  const state = useState<{
    violations: AxeResult[]
    passes: AxeResult[]
    incomplete: AxeResult[]
    isReady: boolean
    errorMessage: string | null
  }>('axe-results', () => ({
    violations: [],
    passes: [],
    incomplete: [],
    isReady: false,
    errorMessage: null
  }))

  const violations = computed(() => state.value.violations)
  const passes = computed(() => state.value.passes)
  const incomplete = computed(() => state.value.incomplete)
  const isReady = computed(() => state.value.isReady)
  const errorMessage = computed(() => state.value.errorMessage)

  const criticalCount = computed(
    () =>
      state.value.violations.filter(
        (v) => v.impact === 'critical' || v.impact === 'serious',
      ).length,
  )
  const warningCount = computed(
    () =>
      state.value.violations.filter(
        (v) => v.impact === 'moderate' || v.impact === 'minor',
      ).length,
  )
  const passingCount = computed(() => state.value.passes.length)

  function handler(event: MessageEvent) {
    const iframe = iframeRef.value
    if (!iframe || event.source !== iframe.contentWindow) return

    const data = event.data
    if (!data || typeof data.type !== 'string') return

    switch (data.type) {
      case 'preview:ready':
        state.value.isReady = true
        break
      case 'axe:result':
        state.value.violations = data.violations || []
        state.value.passes = data.passes || []
        state.value.incomplete = data.incomplete || []
        state.value.errorMessage = null
        break
      case 'axe:error':
        state.value.errorMessage = data.message
        break
    }
  }

  onMounted(() => window.addEventListener('message', handler))
  onBeforeUnmount(() => window.removeEventListener('message', handler))

  return {
    violations,
    passes,
    incomplete,
    isReady,
    errorMessage,
    criticalCount,
    warningCount,
    passingCount
  }
}
