import type { ComponentDefinition } from '~/types/component'
import { contentOverflow } from '~/rules/shared/overflow'
import { invisibleText } from '~/rules/shared/invisible-text'
import { vagueLabel } from '~/rules/shared/vague-label'

/**
 * Drives the component studio for a given definition.
 *
 * Owns the entire per-route lifecycle that used to live in the page's
 * setup script:
 *   - the reactive component-props ref, seeded from defaultProps
 *   - a debounced render pipeline (props -> render fn -> iframe -> code drawer)
 *   - registration of prop-based custom rules (component's own + shared)
 *   - registration of DOM-based custom rules (shared, applied universally)
 *   - timer cleanup on unmount
 *   - resolving CssLength props to flat px before passing to the rules
 *     engine, so rule code stays unit-agnostic
 *
 * The caller wires `previewRef` to `<PreviewIframe ref="...">` and
 * v-binds `componentProps` to whichever controls panel the component
 * declares (`definition.controlsComponent`), via ComponentStudio.
 *
 * @param definition  The component contract to drive.
 * @param options.debounceMs  Render debounce window. Defaults to 10ms.
 */
export function useInspectedComponent(
  definition: ComponentDefinition<Record<string, unknown>>,
  options: { debounceMs?: number } = {}
) {
  const debounceMs = options.debounceMs ?? 10

  const previewRef = ref<{
    render: (html: string, css?: string, rootFontSize?: number) => void
  } | null>(null)

  // Lifted into useState (keyed per definition) so the user's tweaks
  // survive a navigation away from the studio — e.g. opening a learn
  // article on `/learn/<id>` and clicking "Close reader view" should
  // land them back on the same component with their controls intact,
  // not reset to defaults. A plain `ref` would die with the page
  // unmount. Keyed by `definition.id` so distinct components don't
  // share state (and so cross-component navigation is independent).
  const componentProps = useState<Partial<Record<string, unknown>>>(
    `inspected-component-props:${definition.id}`,
    () => ({ ...definition.defaultProps })
  )

  const customRules = useCustomRules([
    ...definition.rules,
    invisibleText,
    vagueLabel
  ])

  useDomRules([contentOverflow])

  const { setOutput } = useRenderedHtml()
  const unitConv = useUnitConversion()

  let renderTimer: ReturnType<typeof setTimeout> | null = null

  function applyContextWrappers(renderedHtml: string): string {
    const enabledKeys = componentProps.value.wrappers as string[] | undefined
    if (!enabledKeys?.length || !definition.contextWrappers?.length) {
      return renderedHtml
    }
    let wrapped = renderedHtml
    for (const wrapper of definition.contextWrappers) {
      if (enabledKeys.includes(wrapper.key)) {
        wrapped = wrapper.wrap(wrapped)
      }
    }
    return wrapped
  }

  watch(
    // Both deps: re-render on prop changes AND on simulated-root changes
    // (the slider in the controls panel sets the root; the iframe needs
    // to repaint to honour the new base for rem values).
    [componentProps, unitConv.simulatedRootPx],
    () => {
      if (renderTimer) clearTimeout(renderTimer)
      renderTimer = setTimeout(() => {
        // Normalise: definition.render may return a plain string or a
        // RenderedFragment. Both reduce to { html, css } here.
        const raw = definition.render(componentProps.value)
        const fragment = typeof raw === 'string' ? { html: raw } : raw
        const html = applyContextWrappers(fragment.html)
        const css = fragment.css ?? ''
        // Iframe still receives one concatenated payload — the <style>
        // block needs to live in the same document as the element it
        // targets.
        const payload = css ? `<style>${css}</style>${html}` : html
        previewRef.value?.render(
          payload,
          undefined,
          unitConv.simulatedRootPx.value
        )
        setOutput(html, css)
        // Resolve any CssLength values to flat px so rule evaluators
        // (target-size, contrast-via-fontSize, etc.) can keep reading
        // props.<key> as numbers without caring about units.
        const resolved = unitConv.resolveProps(
          componentProps.value as Record<string, unknown>
        )
        customRules.evaluate(resolved)
      }, debounceMs)
    },
    { deep: true, immediate: true }
  )

  onBeforeUnmount(() => {
    if (renderTimer) clearTimeout(renderTimer)
  })

  return { previewRef, componentProps }
}
