/**
 * Learn-topic category map.
 *
 * The 6 buckets the Learn index groups topics into. The id matches
 * each markdown file's frontmatter `category` field. The label is an
 * i18n key (so category names can be translated and edited without
 * touching the .md files).
 *
 * **Reorganisation contract:**
 *   - Reorder the array → tree's category order changes.
 *   - Rename a category → edit the i18n key's value, no .md changes.
 *   - Move a topic between categories → edit ONE .md frontmatter only.
 *   - Add a new category → push an entry here AND extend the enum in
 *     `content.config.ts`.
 */

export type LearnCategoryId
  = | 'foundations'
    | 'accessible-names'
    | 'forms'
    | 'form-inputs'
    | 'buttons-with-state'
    | 'disclosure-and-menu'

export interface LearnCategory {
  id: LearnCategoryId
  titleKey: string
}

// Index order = display order in the Learn tree.
export const LEARN_CATEGORIES: LearnCategory[] = [
  { id: 'foundations', titleKey: 'learn.categories.foundations' },
  { id: 'accessible-names', titleKey: 'learn.categories.accessibleNames' },
  { id: 'forms', titleKey: 'learn.categories.forms' },
  { id: 'form-inputs', titleKey: 'learn.categories.formInputs' },
  { id: 'buttons-with-state', titleKey: 'learn.categories.buttonsWithState' },
  { id: 'disclosure-and-menu', titleKey: 'learn.categories.disclosureAndMenu' }
]
