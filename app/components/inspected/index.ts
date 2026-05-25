import type { ComponentDefinition, ComponentId } from "~/types/component";
import { buttonDefinition } from "./button/definition";

/**
 * Registry of every inspected component the studio can render.
 *
 * Keyed by ComponentId — the route slug used by
 * `pages/components/[component].vue`.
 */
export const inspectedComponents: Partial<
  Record<ComponentId, ComponentDefinition<Record<string, unknown>>>
> = {
  button: buttonDefinition as unknown as ComponentDefinition<
    Record<string, unknown>
  >,
};

/**
 * Look up a definition by route slug. Returns `undefined` for any id
 * that isn't yet implemented so callers can branch on missing entries
 * (typically by throwing a 404).
 */
export function getDefinition(
  id: string,
): ComponentDefinition<Record<string, unknown>> | undefined {
  return inspectedComponents[id as ComponentId];
}
