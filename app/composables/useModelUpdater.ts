/** Updates the model containing the properties used by the inspected element
Mutate instead of replacing the whole object because we only signal to Vue's
reactivity system the exact parts that need updating. Also prevents
a race condition multipe quick edits take place in short succession.
*/

import type { Ref } from "vue";

export function useModelUpdater<P extends Record<string, unknown>>(model: Ref<Partial<P>>) {
  function update<K extends keyof P>(key: K, value: P[K] | undefined) {
    (model.value as Partial<P>)[key] = value as P[K];
  }

  function updateMany(patch: Partial<P>) {
    Object.assign(model.value, patch);
  }

  return { update, updateMany };
}
