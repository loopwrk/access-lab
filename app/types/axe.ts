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
}

export interface AxeState {
  violations: AxeResult[];
  passes: AxeResult[];
  incomplete: AxeResult[];
  isReady: boolean;
  errorMessage: string | null;
}
