import type { ManualChecklistItem, Rule } from "~/rules/types";

/**
 * Stable identifiers for every inspected component in the studio.
 *
 * Matches the slugs used by `pages/components/[component].vue` and the
 * keys of the registry in `components/inspected/index.ts`. Adding a new
 * component starts here: add the id to this union, then add the matching
 * definition to the registry.
 */
export type ComponentId =
  | "button"
  | "accordion"
  | "carousel"
  | "modal"
  | "menu"
  | "tooltip"
  | "tabs"
  | "form-field";

/**
 * Schema entries for the auto-rendered controls panel. Discriminated by
 * `kind`. `group` is recursive — groups contain other controls.
 */
export type ControlSchema =
  | { kind: "text"; key: string; label: string; placeholder?: string }
  | {
      kind: "slider";
      key: string;
      label: string;
      min: number;
      max: number;
      step?: number;
      unit?: string;
      splittable?: boolean;
    }
  | { kind: "colour"; key: string; label: string }
  | {
      kind: "segmented";
      key: string;
      label: string;
      options: { value: string; label: string }[];
    }
  | { kind: "group"; label: string; controls: ControlSchema[] };

/**
 * Contract every inspected component conforms to (plan.md §7).
 *
 * The generic `P` is the component's prop shape. Authors annotate the
 * exported definition with `ComponentDefinition<MyProps>` so shape drift
 * (missing keys, wrong types, stale render fn signature) is caught at the
 * type level rather than at runtime.
 */
export interface ComponentDefinition<P = Record<string, unknown>> {
  /** Stable identifier — route slug + registry key. */
  id: ComponentId;
  /** Display name used in copy and headings. */
  name: string;
  /** HTML tag rendered into the iframe (e.g. 'button', 'dialog'). */
  tagName: string;
  /** Initial values seeded into the controls panel on first mount. */
  defaultProps: Partial<P>;
  /** Schema for the auto-generated controls panel. */
  controls: ControlSchema[];
  /** Component-specific prop-based rules. */
  rules: Rule[];
  /** Manual review items shown in the Manual tab. */
  manualChecklist: ManualChecklistItem[];
  /** Pure props → HTML render function. */
  render: (props: Partial<P>) => string;
  /**
   * Marks the entry as a "coming soon" placeholder.
   */
  placeholder?: boolean;
}
