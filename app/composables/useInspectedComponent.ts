import type { ComponentDefinition } from "~/types/component";
import { contentOverflow } from "~/rules/shared/overflow";
import { invisibleText } from "~/rules/shared/invisible-text";
import { vagueLabel } from "~/rules/shared/vague-label";

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
  options: { debounceMs?: number } = {},
) {
  const debounceMs = options.debounceMs ?? 10;

  const previewRef = ref<{
    render: (html: string, css?: string, rootFontSize?: number) => void;
  } | null>(null);

  const componentProps = ref<Partial<Record<string, unknown>>>({
    ...definition.defaultProps,
  });

  const customRules = useCustomRules([
    ...definition.rules,
    invisibleText,
    vagueLabel,
  ]);

  useDomRules([contentOverflow]);

  const { setHtml } = useRenderedHtml();
  const unitConv = useUnitConversion();

  let renderTimer: ReturnType<typeof setTimeout> | null = null;

  watch(
    // Both deps: re-render on prop changes AND on simulated-root changes
    // (the slider in the controls panel sets the root; the iframe needs
    // to repaint to honour the new base for rem values).
    [componentProps, unitConv.simulatedRootPx],
    () => {
      if (renderTimer) clearTimeout(renderTimer);
      renderTimer = setTimeout(() => {
        const html = definition.render(componentProps.value);
        previewRef.value?.render(
          html,
          undefined,
          unitConv.simulatedRootPx.value,
        );
        setHtml(html);
        // Resolve any CssLength values to flat px so rule evaluators
        // (target-size, contrast-via-fontSize, etc.) can keep reading
        // props.<key> as numbers without caring about units.
        const resolved = unitConv.resolveProps(
          componentProps.value as Record<string, unknown>,
        );
        customRules.evaluate(resolved);
      }, debounceMs);
    },
    { deep: true, immediate: true },
  );

  onBeforeUnmount(() => {
    if (renderTimer) clearTimeout(renderTimer);
  });

  return { previewRef, componentProps };
}
