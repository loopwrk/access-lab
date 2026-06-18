type ImpactValue = "minor" | "moderate" | "serious" | "critical" | null;

/**
 * A rule that evaluates against a component's prop values. Runs in the host
 * page; cheap, synchronous, no DOM access.
 */
export interface Rule {
  id: string;
  title: string;
  wcag: string;
  description: string;
  help: string;
  helpUrl?: string;
  tags?: string[];
  /**
   * Optional anchor into the Learn tab. When set, the Issues panel renders
   * an internal "Read more in the Learn tab" link alongside the external
   * `helpUrl`, which switches tabs and moves focus to the matching topic.
   */
  learnTopicId?: string;
  /**
   * axe-core rule ids that already report this same problem. When any is
   * present in the axe results, this custom rule's violation is suppressed so
   * axe's own finding wins (see useAllViolations). Use only for the rare
   * custom rule that overlaps a real axe rule rather than filling a gap axe
   * misses - most custom rules exist precisely because axe is silent.
   */
  supersededByAxe?: string[];
  evaluate: (props: Record<string, unknown>) => ViolationResult | null;
}

/**
 * A snapshot of the rendered element's box and content dimensions, measured
 * inside the preview iframe and posted to the host via `dom:measurement`.
 *
 * scrollWidth/Height include any overflowed content; clientWidth/Height
 * are the visible content-box. scrollX > clientX → horizontal overflow.
 */
export interface DomMeasurement {
  tagName: string;
  scrollWidth: number;
  clientWidth: number;
  scrollHeight: number;
  clientHeight: number;
  /**
   * The interactive control's rendered border-box (offsetWidth/offsetHeight of
   * the button/input inside the mount, not the outer wrapper). Lets the
   * target-size rules grade the size the user actually sees, rather than a
   * declared width/height prop that is usually unset.
   */
  targetWidth: number;
  targetHeight: number;
}

/**
 * A rule that evaluates against the rendered element's box dimensions -
 * needed when the violation depends on runtime layout rather than declared
 * props (e.g. text overflow, which depends on font metrics + content +
 * container together). Measurement is captured inside the iframe; the rule's
 * evaluate fn runs in the host page using the posted measurement.
 */
export interface DomRule {
  id: string;
  title: string;
  wcag: string;
  description: string;
  help: string;
  helpUrl?: string;
  tags?: string[];
  /** See Rule.learnTopicId. */
  learnTopicId?: string;
  evaluate: (measurement: DomMeasurement) => ViolationResult | null;
}

export interface ViolationResult {
  severity: NonNullable<ImpactValue>;
  measurement: string;
}
export interface ManualChecklistItem {
  id: string;
  title: string;
  wcagSc: string;
  description: string;
  url: string;
}
