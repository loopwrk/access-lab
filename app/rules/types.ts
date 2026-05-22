type ImpactValue = 'minor' | 'moderate' | 'serious' | 'critical' | null

export interface Rule {
  id: string
  title: string
  wcag: string
  description: string
  help: string
  helpUrl?: string
  evaluate: (props: Record<string, unknown>) => ViolationResult | null
}

export interface ViolationResult {
  severity: NonNullable<ImpactValue>
  measurement: string
}
