import type { ComponentDefinition } from "~/types/component";
import { contentOverflow } from "~/rules/shared/overflow";
import { invisibleText } from "~/rules/shared/invisible-text";
import { vagueLabel } from "~/rules/shared/vague-label";

/**
 * Drives the component studio for a given definition.
 *
 * Owns the entire per-route lifecycle.
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
  options: { debounceMs?: number } = {},
) {
  const debounceMs = options.debounceMs ?? 10;

  const previewRef = ref<{
    render: (html: string, css?: string, rootFontSize?: number) => void;
  } | null>(null);

  const componentProps = useState<Record<string, unknown>>(
    `inspected-component-props:${definition.id}`,
    () => ({ ...definition.defaultProps }),
  );

  const customRules = useCustomRules(
    [...definition.rules, invisibleText, vagueLabel],
    definition.tagName,
  );

  useDomRules([contentOverflow, ...(definition.domRules ?? [])]);

  const { setOutput } = useRenderedHtml();
  const unitConv = useUnitConversion();

  function applyContextWrappers(renderedHtml: string): string {
    const enabledKeys = componentProps.value.wrappers as string[] | undefined;
    if (!enabledKeys?.length || !definition.contextWrappers?.length) {
      return renderedHtml;
    }
    let wrapped = renderedHtml;
    for (const wrapper of definition.contextWrappers) {
      if (enabledKeys.includes(wrapper.key)) {
        wrapped = wrapper.wrap(wrapped);
      }
    }
    return wrapped;
  }

  const renderToPreview = useDebounceFn(() => {
    // Normalise: definition.render may return a plain string or a
    // RenderedFragment. Both reduce to { html, css } here.
    const raw = definition.render(componentProps.value);
    const fragment = typeof raw === "string" ? { html: raw } : raw;
    const html = applyContextWrappers(fragment.html);
    const css = fragment.css ?? "";
    const js = fragment.js ?? "";
    // Iframe still receives one concatenated payload — the <style>
    // block needs to live in the same document as the element it
    // targets. `js` is not injected; it surfaces in the code drawer
    // as the canonical production code, not as runtime behaviour.
    const payload = css ? `<style>${css}</style>${html}` : html;
    previewRef.value?.render(payload, undefined, unitConv.simulatedRootPx.value);
    setOutput(html, css, js);
    // Resolve any CssLength values to flat px so rule evaluators
    // (target-size, contrast-via-fontSize, etc.) can keep reading
    // props.<key> as numbers without caring about units.
    const resolved = unitConv.resolveProps(componentProps.value as Record<string, unknown>);
    customRules.evaluate(resolved);
  }, debounceMs);

  watch(
    // Both deps: re-render on prop changes AND on simulated-root changes
    // (the slider in the controls panel sets the root; the iframe needs
    // to repaint to honour the new base for rem values).
    [componentProps, unitConv.simulatedRootPx],
    () => renderToPreview(),
    { deep: true, immediate: true },
  );

  return { previewRef, componentProps };
}
