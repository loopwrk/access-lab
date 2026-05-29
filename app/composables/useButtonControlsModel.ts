import type { Ref } from 'vue'

export function useButtonControlsModel<P extends Record<string, unknown>>(
  model: Ref<Partial<P>>
) {
  function update<K extends keyof P>(key: K, value: P[K] | undefined) {
    (model.value as Partial<P>)[key] = value as P[K]
  }

  function updateMany(patch: Partial<P>) {
    Object.assign(model.value, patch)
  }

  return { update, updateMany }
}
