type ImpactValue = 'minor' | 'moderate' | 'serious' | 'critical' | null

/**
 * A rule that evaluates against a component's prop values. Runs in the host
 * page; cheap, synchronous, no DOM access.
 */
export interface Rule {
  id: string
  title: string
  wcag: string
  description: string
  help: string
  helpUrl?: string
  evaluate: (props: Record<string, unknown>) => ViolationResult | null
}

/**
 * A snapshot of the rendered element's box and content dimensions, measured
 * inside the preview iframe and posted to the host via `overflow:result`.
 *
 * scrollWidth/Height include any overflowed content; clientWidth/Height
 * are the visible content-box. scrollX > clientX → horizontal overflow.
 */
export interface DomMeasurement {
  tagName: string
  scrollWidth: number
  clientWidth: number
  scrollHeight: number
  clientHeight: number
}

/**
 * A rule that evaluates against the rendered element's box dimensions —
 * needed when the violation depends on runtime layout rather than declared
 * props (e.g. text overflow, which depends on font metrics + content +
 * container together). Measurement is captured inside the iframe; the rule's
 * evaluate fn runs in the host page using the posted measurement.
 */
export interface DomRule {
  id: string
  title: string
  wcag: string
  description: string
  help: string
  helpUrl?: string
  evaluate: (measurement: DomMeasurement) => ViolationResult | null
}

export interface ViolationResult {
  severity: NonNullable<ImpactValue>
  measurement: string
}
