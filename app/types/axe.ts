/**
 * Shared axe-core result shapes.
 *
 * Lives in `~/types/` so the writer composable (`useAxeAudit`), the
 * reader composables (`useAxeResults`, `useAllViolations`, `useAxeCounts`),
 * and the rule adapters (`useCustomRules`, `useDomRules`) can all import
 * the same definitions without forming an import cycle.
 */

export type ImpactValue = "minor" | "moderate" | "serious" | "critical" | null;

export interface CheckResult {
  id: string;
  impact?: ImpactValue;
  message: string;
  data: unknown;
}

export interface NodeResult {
  html: string;
  impact?: ImpactValue;
  target: string[];
  any: CheckResult[];
  all: CheckResult[];
  none: CheckResult[];
  failureSummary?: string;
}

export interface AxeResult {
  id: string;
  description: string;
  help: string;
  helpUrl: string;
  impact?: ImpactValue;
  tags: string[];
  nodes: NodeResult[];
  learnTopicId?: string;
  /**
   * Custom/DOM rules only: i18n key for a rule-specific "why it matters"
   * explainer, preferred over the generic tag-based fallback. Never set on
   * results that come straight from axe.
   */
  whyItMattersKey?: string;
  /** Custom/DOM rules only: i18n key for a rule-specific "how to fix" instruction. */
  howToFixKey?: string;
  /**
   * Custom/DOM rules only: i18n key for the heading shown above the rule's
   * finding detail, overriding the auto-generated rule-id heading.
   */
  detailLabelKey?: string;
  /**
   * Custom/DOM rules only: axe rule ids that already report this same finding.
   * When any is present in the axe results, this violation is suppressed in
   * favour of axe's own (see useAllViolations). Never set on results that come
   * straight from axe.
   */
  supersededByAxe?: string[];
}

export interface AxeState {
  violations: AxeResult[];
  passes: AxeResult[];
  incomplete: AxeResult[];
  isReady: boolean;
  errorMessage: string | null;
}
