import type { ComponentDefinition, ComponentId } from "~/types/component";
import { actionTriggerDefinition } from "./buttons/action-triggers/definition";
import { formButtonDefinition } from "./buttons/form-buttons/definition";
import { toggleButtonDefinition } from "./buttons/toggle-buttons/definition";
import { switchDefinition } from "./buttons/switches/definition";
import { disclosureTriggerDefinition } from "./buttons/disclosure-triggers/definition";
import { menuTriggerDefinition } from "./buttons/menu-triggers/definition";
import { inputDefinition } from "./input/definition";
import { checkboxDefinition } from "./checkbox/definition";
import { radioDefinition } from "./radio/definition";
import { selectDefinition } from "./select/definition";

/**
 * Erase a definition's specific prop type for registry storage. The studio
 * consumes every definition through the untyped prop-bag shape (props flow
 * through useState + v-model as Record<string, unknown>), so this is the one
 * sanctioned place that erasure happens - definitions themselves stay fully
 * typed against their own prop interfaces.
 */
function asRegistryEntry<P>(
  definition: ComponentDefinition<P>,
): ComponentDefinition<Record<string, unknown>> {
  return definition as unknown as ComponentDefinition<Record<string, unknown>>;
}

/**
 * Registry of every inspected component the studio can render. Keyed
 * by ComponentId.
 */
export const inspectedComponents: Record<
  ComponentId,
  ComponentDefinition<Record<string, unknown>>
> = {
  "buttons-action-triggers": asRegistryEntry(actionTriggerDefinition),
  "buttons-form-buttons": asRegistryEntry(formButtonDefinition),
  "buttons-toggle-buttons": asRegistryEntry(toggleButtonDefinition),
  "buttons-switches": asRegistryEntry(switchDefinition),
  "buttons-disclosure-triggers": asRegistryEntry(disclosureTriggerDefinition),
  "buttons-menu-triggers": asRegistryEntry(menuTriggerDefinition),
  input: asRegistryEntry(inputDefinition),
  checkbox: asRegistryEntry(checkboxDefinition),
  radio: asRegistryEntry(radioDefinition),
  select: asRegistryEntry(selectDefinition),
};

export function getDefinition(
  id: string,
): ComponentDefinition<Record<string, unknown>> | undefined {
  return inspectedComponents[id as ComponentId];
}
