import type { Ref } from 'vue'

export interface SectionToggleConfig<P> {
  /**
   * The model keys this section owns. `enabled` becomes true when any of
   * them is set on the model. Listing them here (rather than tracking
   * local state) means the switch also flips off when something else
   * clears the props — e.g. the reset-to-defaults control.
   */
  keys: (keyof P)[]
  enable: () => Partial<P>
  disable: () => Partial<P>
}

export function useToggleableSection<P extends Record<string, unknown>>(
  model: Ref<Partial<P>>,
  config: SectionToggleConfig<P>
) {
  const enabled = computed(() =>
    config.keys.some(key => model.value[key] != null)
  )

  function toggle(value: boolean | 'indeterminate') {
    Object.assign(model.value, value === true ? config.enable() : config.disable())
  }

  return { enabled, toggle }
}
