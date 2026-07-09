import type { Ref } from "vue";
import type { ButtonContentProps } from "~/types/button";

type NaturalSizeModel = Partial<ButtonContentProps>;

/**
 * Measure the intrinsic size of the inspected element's content (label /
 * icon) under browser-default styling, using useBrowserDefaults' hidden
 * probe. Style controls (font-size, padding, border) are deliberately not
 * applied: they change the preview's computed box, but the width/height
 * controls resting on this value represent author-set values and must not
 * creep when another styling control changes. Only the content itself
 * moves the measurement.
 */
export function useNaturalSize(model: Ref<NaturalSizeModel>, tagName: string) {
  const { defaults: browserDefaults, measureIntrinsicSize } = useBrowserDefaults(tagName);

  const naturalSize = ref({ width: 0, height: 0 });

  function probeContent(): { content: string; asHtml: boolean } {
    const props = model.value;
    if (props.contentType === "icon") {
      return { content: '<span aria-hidden="true">&#128269;</span>', asHtml: true };
    }
    return { content: props.label || "Click Me!", asHtml: false };
  }

  function recompute() {
    if (!import.meta.client) return;
    const { content, asHtml } = probeContent();
    naturalSize.value = measureIntrinsicSize(content, "", asHtml);
  }

  watch(
    () => {
      const props = model.value;
      return [props.label, props.contentType];
    },
    recompute,
    { immediate: true, deep: true },
  );

  return { naturalSize, browserDefaults };
}
