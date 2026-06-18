/**
 * Typed helpers for writing to a controls component's `defineModel` prop bag.
 *
 * Both helpers mutate the model object in place rather than replacing it with a
 * spread copy (`model.value = { ...model.value, [key]: value }`). Two reasons:
 *
 *   1. Targeted reactivity - only consumers of the changed key re-evaluate,
 *      not every reader of the whole object.
 *   2. No write-races - two back-to-back replacement writes read `model.value`
 *      before the previous write's `defineModel` emit has committed, so the
 *      second spreads a stale copy and silently drops the first. Mutating the
 *      live object can't lose a write that way.
 *
 * `useInspectedComponent` deep-watches the prop bag, so an in-place mutation
 * still triggers a re-render. This is the idiomatic Vue 3.4+ `defineModel`
 * pattern; every controls component uses it.
 */

import type { Ref } from "vue";

export function useModelUpdater<P extends Record<string, unknown>>(model: Ref<Partial<P>>) {
  /** Write a single key. Pass `undefined` to clear it. */
  function update<K extends keyof P>(key: K, value: P[K] | undefined) {
    (model.value as Partial<P>)[key] = value as P[K];
  }

  /** Merge several keys in one mutation - useful when keys must move together. */
  function updateMany(patch: Partial<P>) {
    Object.assign(model.value, patch);
  }

  return { update, updateMany };
}
