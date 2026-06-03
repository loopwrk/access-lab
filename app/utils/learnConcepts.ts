/**
 * Learn-concept vocabulary.
 *
 * A closed vocabulary used to relate articles to components. An
 * article declares which concepts it covers (frontmatter `concepts:
 * [...]`), a component declares which concepts apply to it
 * (`relevantConcepts: [...]` on its definition). The studio's Learn
 * panel pins any article whose concept set intersects with the
 * active component's, sorted by overlap count.
 *
 * **Why closed:** keeping the vocabulary small and code-defined
 * means typos and drift are caught at compile time (the union type
 * `LearnConceptId` rejects anything not on this list). It also gives
 * authors a fixed menu to choose from, which is easier than
 * inventing tags ad hoc and hoping the matching still works.
 *
 * **Adding a new concept:** add it here and to the Zod enum in
 * `content.config.ts` (both must agree). The Nuxt Content schema
 * validates article frontmatter at build time, so the two lists
 * staying in sync is enforced — adding to one without the other
 * surfaces a clear validation error.
 *
 * Keep the vocabulary tight. If a single article makes you want to
 * add a concept, prefer leaving it untagged over inventing a tag
 * that only matches one article — that's vocabulary creep, and it
 * weakens the signal-to-noise ratio of the whole system.
 */

export type LearnConceptId
  = | 'accessible-name'
    | 'button-element'
    | 'form-control'
    | 'form-context'
    | 'disabled-state'
    | 'aria-state'
    | 'disclosure-pattern'
    | 'menu-pattern'
    | 'native-elements'

export interface LearnConcept {
  id: LearnConceptId
  /**
   * Short description of what this concept covers. Not surfaced in
   * the UI today — purely for authors deciding which concepts to
   * tag an article or component with.
   */
  description: string
}

export const LEARN_CONCEPTS: LearnConcept[] = [
  {
    id: 'accessible-name',
    description: 'Labels, naming, vague vs meaningful labels, hidden text'
  },
  {
    id: 'button-element',
    description: '<button> semantics: type, value, native vs custom'
  },
  {
    id: 'form-control',
    description: 'Form widgets — inputs, checkboxes, radios, switches'
  },
  {
    id: 'form-context',
    description: 'Forms, wrapping, submit behaviour, form attributes'
  },
  {
    id: 'disabled-state',
    description: 'disabled vs aria-disabled, the disabled UX'
  },
  {
    id: 'aria-state',
    description: 'aria-pressed, aria-expanded, aria-checked, role=switch'
  },
  {
    id: 'disclosure-pattern',
    description: 'Show/hide triggers, accordions, details/summary'
  },
  {
    id: 'menu-pattern',
    description: 'Menu buttons, popovers, the menu-button keyboard contract'
  },
  {
    id: 'native-elements',
    description: 'Choosing native HTML over custom (div with role) implementations'
  }
]

/**
 * Convenience array of just the ids, for cases that need them as
 * plain strings (e.g. building a Zod enum or running set-intersect).
 */
export const LEARN_CONCEPT_IDS = LEARN_CONCEPTS.map(c => c.id) as readonly LearnConceptId[]
