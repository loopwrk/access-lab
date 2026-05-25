import type { ComponentDefinition } from "~/types/component";
import { contentOverflow } from "~/rules/shared/overflow";
import { invisibleText } from "~/rules/shared/invisible-text";

/**
 * Drives the component studio for a given definition.
 *
 * Owns the entire per-route lifecycle that used to live in the page's
 * setup script:
 *   - the reactive component-props ref, seeded from defaultProps
 *   - a debounced render pipeline (props → render fn → iframe → code drawer)
 *   - registration of prop-based custom rules (component's own + shared)
 *   - registration of DOM-based custom rules (shared, applied universally)
 *   - timer cleanup on unmount
 *
 * The caller wires `previewRef` to `<PreviewIframe ref="...">` and
 * v-binds `componentProps` to `<ControlsPanel v-model="...">`..
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
    render: (html: string, css?: string) => void;
  } | null>(null);

  const componentProps = ref<Partial<Record<string, unknown>>>({
    ...definition.defaultProps,
  });

  const customRules = useCustomRules([...definition.rules, invisibleText]);

  useDomRules([contentOverflow]);

  const { setHtml } = useRenderedHtml();

  let renderTimer: ReturnType<typeof setTimeout> | null = null;

  watch(
    componentProps,
    () => {
      if (renderTimer) clearTimeout(renderTimer);
      renderTimer = setTimeout(() => {
        const html = definition.render(componentProps.value);
        previewRef.value?.render(html);
        setHtml(html);
        customRules.evaluate(componentProps.value);
      }, debounceMs);
    },
    { deep: true, immediate: true },
  );

  onBeforeUnmount(() => {
    if (renderTimer) clearTimeout(renderTimer);
  });

  return { previewRef, componentProps };
}
