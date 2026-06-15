import type { Component } from "vue";
import type { DomRule, ManualChecklistItem, Rule } from "~/rules/types";
import type { LearnConceptId } from "~/utils/learnConcepts";

/**
 * Stable identifiers for every inspected component in the studio.
 *
 * Matches the slugs used by `pages/components/[component].vue` and the
 * keys of the registry in `components/inspected/index.ts`. Adding a new
 * component starts here: add the id to this union, then add the matching
 * definition to the registry.
 */
export type ComponentId
  = | "buttons-action-triggers"
    | "buttons-form-buttons"
    | "buttons-toggle-buttons"
    | "buttons-switches"
    | "buttons-disclosure-triggers"
    | "buttons-menu-triggers"
    | "accordion"
    | "carousel"
    | "modal"
    | "menu"
    | "tooltip"
    | "tabs"
    | "input"
    | "checkbox"
    | "radio"
    | "select";

/**
 * Schema entries for the auto-rendered controls panel. Discriminated by
 * `kind`. `group` is recursive — groups contain other controls.
 */
export type ControlSchema
  = | { kind: "text"; key: string; label: string; placeholder?: string }
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
  /**
   * Component-specific DOM-measurement rules — evaluated against the rendered
   * element's box (DomMeasurement), not its props. Use for checks that depend
   * on runtime layout, e.g. target size. The shared content-overflow DomRule is
   * applied universally by useInspectedComponent, so it need not be listed here.
   */
  domRules?: DomRule[];
  /** Manual review items shown in the Manual tab. */
  manualChecklist: ManualChecklistItem[];
  /**
   * Pure props → rendered output. Returning a plain string is shorthand
   * for `{ html }`. Returning a fragment separates studio-injected CSS
   * from the markup so the code drawer can show them in different panes.
   */
  render: (props: Partial<P>) => string | RenderedFragment;
  /**
   * The per-component controls panel that ComponentStudio mounts via
   * `<component :is>` into the inspector's controls tab. Each component
   * brings its own panel because the set of meaningful controls (and
   * their UI shape) is genuinely component-specific.
   *
   * Wire this with `defineAsyncComponent(() => import('./XControls.vue'))`
   * so the static import doesn't form a cycle with the panel's import
   * of the definition. Optional because placeholder definitions don't
   * have a panel.
   */
  controlsComponent?: Component;
  variants?: ComponentVariant[];
  contextWrappers?: ContextWrapper[];
  /**
   * Marks the entry as a "coming soon" placeholder.
   */
  placeholder?: boolean;
  /**
   * Suppress the generic "Click event fired" toast from ComponentStudio
   * for this definition. Use on pages whose controls component drives
   * its own state-specific toast (e.g. the switches page surfaces a
   * notification toast that mirrors the switch state, so the generic
   * click toast would be redundant).
   */
  suppressDemoClickToast?: boolean;
  primaryLearnTopicId?: string;
  /**
   * Curated list of Learn topic ids to surface in the "Relevant to
   * <component>" section of the Learn panel, ordered by author intent
   * (most relevant first). The primary topic (`primaryLearnTopicId`)
   * always pins above this list, so don't include it here.
   *
   * Typed as `string[]` rather than a closed union because topic ids
   * are author-defined in markdown frontmatter; a typo silently drops
   * the article from the panel.
   *
   * Replaces the previous concept-tag matching, which was too eager —
   * broad concepts like `accessible-name` and `button-element` matched
   * most of the library. `relevantConcepts` below is retained for
   * documentation / future search but no longer drives the panel.
   */
  relatedLearnTopicIds?: string[];
  relevantConcepts?: LearnConceptId[];
}

export interface RenderedFragment {
  html: string;
  css?: string;
  /**
   * Optional production-style JavaScript shown in the code drawer's
   * JS tab. Not injected into the iframe — purely educational. Use
   * for components whose real-world implementation typically involves
   * a JS hook (e.g. switches toggling a class on body).
   */
  js?: string;
}

export type ComponentVariantStatus
  = | "recommended"
    | "info"
    | "avoid"
    | "rare"
    | "neutral";

export interface ComponentVariant {
  /** Value written into `props.renderAs`. */
  key: string;
  /** Typically the literal markup. */
  label: string;
  /** Optional longer description for the picker option. */
  description?: string;
  /** Pedagogical status. Drives badge colour and icon in the picker. */
  status?: ComponentVariantStatus;
  /** One-line guidance shown as a badge under the description. */
  statusNote?: string;
  /** Optional section heading. Adjacent variants sharing the same
   *  section are grouped under one header in the picker. */
  section?: string;

  seeAlsoTopicId?: string;
}

export interface ContextWrapper {
  key: string;
  label: string;
  learnTopicId?: string;
  /** Wraps the rendered HTML and returns the surrounding markup. */
  wrap: (renderedHtml: string) => string;
  availableFor?: (renderAs: string | undefined) => boolean;
}
