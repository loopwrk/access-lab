import type { ComponentDefinition, ComponentId } from '~/types/component'

/**
 * When a placeholder is promoted to a real component:
 *   1. Create `app/components/inspected/<id>/{definition,render}.ts`
 *      following the Button shape.
 *   2. Import the new definition into `index.ts` and overwrite the
 *      placeholder entry in the registry spread.
 *   3. Delete the entry from this file.
 */
function createPlaceholder(
  id: ComponentId,
  name: string,
  tagName: string
): ComponentDefinition {
  return {
    id,
    name,
    tagName,
    defaultProps: {},
    controls: [],
    rules: [],
    manualChecklist: [],
    render: () => '',
    placeholder: true
  }
}

/**
 * Keyed by every ComponentId that doesn't yet have a real definition.
 * Spread into the main registry; promoting a component means removing
 * its key from here and importing its real definition in `index.ts`.
 */
export const placeholderDefinitions: Record<
  Exclude<
    ComponentId,
    'buttons-action-triggers' | 'buttons-form-buttons' | 'buttons-toggle-buttons' | 'buttons-switches' | 'input'
  >,
  ComponentDefinition
> = {
  accordion: createPlaceholder('accordion', 'Accordion', 'div'),
  carousel: createPlaceholder('carousel', 'Carousel', 'div'),
  modal: createPlaceholder('modal', 'Modal', 'dialog'),
  menu: createPlaceholder('menu', 'Menu', 'div'),
  tooltip: createPlaceholder('tooltip', 'Tooltip', 'div'),
  tabs: createPlaceholder('tabs', 'Tabs', 'div')
}
