import type { ComponentDefinition, ComponentId } from "~/types/component";
import { buttonDefinition } from "./button/definition";
import { placeholderDefinitions } from "./placeholders";

/**
 * Registry of every inspected component the studio can render.
 *
 * Keyed by ComponentId — the route slug used by
 * `pages/components/[component].vue`.
 *
 */
export const inspectedComponents: Record<
  ComponentId,
  ComponentDefinition<Record<string, unknown>>
> = {
  ...placeholderDefinitions,
  button: buttonDefinition as unknown as ComponentDefinition<
    Record<string, unknown>
  >,
};

/**
 * Look up a definition by route slug. Returns `undefined` for any id
 * that isn't a valid ComponentId so callers can throw a 404.
 */
export function getDefinition(
  id: string,
): ComponentDefinition<Record<string, unknown>> | undefined {
  return inspectedComponents[id as ComponentId];
}
