import type { ComponentDefinition, ComponentId } from '~/types/component'
import { actionTriggerDefinition } from './buttons/action-triggers/definition'
import { formButtonDefinition } from './buttons/form-buttons/definition'
import { toggleButtonDefinition } from './buttons/toggle-buttons/definition'
import { switchDefinition } from './buttons/switches/definition'
import { disclosureTriggerDefinition } from './buttons/disclosure-triggers/definition'
import { menuTriggerDefinition } from './buttons/menu-triggers/definition'
import { inputDefinition } from './input/definition'
import { checkboxDefinition } from './checkbox/definition'
import { radioDefinition } from './radio/definition'
import { placeholderDefinitions } from './placeholders'

/**
 * Registry of every inspected component the studio can render. Keyed
 * by ComponentId; real definitions override the placeholder spread.
 */
export const inspectedComponents: Record<
  ComponentId,
  ComponentDefinition<Record<string, unknown>>
> = {
  ...placeholderDefinitions,
  'buttons-action-triggers': actionTriggerDefinition as unknown as ComponentDefinition<
    Record<string, unknown>
  >,
  'buttons-form-buttons': formButtonDefinition as unknown as ComponentDefinition<
    Record<string, unknown>
  >,
  'buttons-toggle-buttons': toggleButtonDefinition as unknown as ComponentDefinition<
    Record<string, unknown>
  >,
  'buttons-switches': switchDefinition as unknown as ComponentDefinition<
    Record<string, unknown>
  >,
  'buttons-disclosure-triggers': disclosureTriggerDefinition as unknown as ComponentDefinition<
    Record<string, unknown>
  >,
  'buttons-menu-triggers': menuTriggerDefinition as unknown as ComponentDefinition<
    Record<string, unknown>
  >,
  'input': inputDefinition as unknown as ComponentDefinition<
    Record<string, unknown>
  >,
  'checkbox': checkboxDefinition as unknown as ComponentDefinition<
    Record<string, unknown>
  >,
  'radio': radioDefinition as unknown as ComponentDefinition<
    Record<string, unknown>
  >
}

export function getDefinition(
  id: string
): ComponentDefinition<Record<string, unknown>> | undefined {
  return inspectedComponents[id as ComponentId]
}
