import type { Ref } from 'vue'

export interface SectionToggleConfig<P> {
  enable: () => Partial<P>
  disable: () => Partial<P>
}

export function useToggleableSection<P extends Record<string, unknown>>(
  model: Ref<Partial<P>>,
  config: SectionToggleConfig<P>,
  initial = false
) {
  const enabled = ref(initial)

  function toggle(value: boolean | 'indeterminate') {
    enabled.value = value === true
    Object.assign(model.value, value === true ? config.enable() : config.disable())
  }

  return { enabled, toggle }
}
