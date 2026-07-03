import type { Ref } from "vue";
import type { CssLength } from "~/composables/useUnitConversion";
import type { ButtonContentProps, ButtonStyleProps } from "~/types/button";

type NaturalSizeModel = Partial<ButtonContentProps & ButtonStyleProps>;

/**
 * Measure the intrinsic (content-driven) size of the inspected element as
 * currently configured - label / icon, font-size, padding, borders - using
 * useBrowserDefaults' hidden probe element. One of three sizing composables:
 * useBrowserDefaults probes UA styling, useButtonStudioDefaults derives the
 * control-panel defaults from that probe.
 */
export function useNaturalSize(model: Ref<NaturalSizeModel>, tagName: string) {
  const unitConv = useUnitConversion();
  const { defaults: browserDefaults, measureIntrinsicSize } = useBrowserDefaults(tagName);

  const naturalSize = ref({ width: 0, height: 0 });

  const px = (length: CssLength | undefined): number =>
    length ? unitConv.lengthToPx(length) : 0;

  function buildEffectiveCss(): string {
    const props = model.value;
    const parts: string[] = [];

    if (props.fontSize != null) parts.push(`font-size:${px(props.fontSize)}px`);

    const hasSplitPadding
      = props.paddingTop != null || props.paddingRight != null
        || props.paddingBottom != null || props.paddingLeft != null;

    if (hasSplitPadding) {
      const fallback = props.padding;
      parts.push(
        `padding:${px(props.paddingTop ?? fallback)}px ${px(props.paddingRight ?? fallback)}px ${px(props.paddingBottom ?? fallback)}px ${px(props.paddingLeft ?? fallback)}px`,
      );
    } else if (props.padding != null) {
      parts.push(`padding:${px(props.padding)}px`);
    }

    const hasSplitBorder
      = props.borderTopWidth != null || props.borderRightWidth != null
        || props.borderBottomWidth != null || props.borderLeftWidth != null;

    if (hasSplitBorder) {
      const fallback = props.borderWidth;
      parts.push(
        `border-top-width:${px(props.borderTopWidth ?? fallback)}px;`
        + `border-right-width:${px(props.borderRightWidth ?? fallback)}px;`
        + `border-bottom-width:${px(props.borderBottomWidth ?? fallback)}px;`
        + `border-left-width:${px(props.borderLeftWidth ?? fallback)}px;`
        + `border-style:solid`,
      );
    } else if (props.borderWidth != null) {
      parts.push(`border-width:${px(props.borderWidth)}px;border-style:solid`);
    }

    return parts.join(";");
  }

  function probeContent(): { content: string; asHtml: boolean } {
    const props = model.value;
    if (props.contentType === "icon") {
      return { content: "<span aria-hidden=\"true\">&#128269;</span>", asHtml: true };
    }
    return { content: props.label || "Click Me!", asHtml: false };
  }

  function recompute() {
    if (!import.meta.client) return;
    const { content, asHtml } = probeContent();
    naturalSize.value = measureIntrinsicSize(content, buildEffectiveCss(), asHtml);
  }

  watch(
    () => {
      const props = model.value;
      return [
        props.label, props.contentType,
        props.fontSize,
        props.padding, props.paddingTop, props.paddingRight, props.paddingBottom, props.paddingLeft,
        props.borderWidth, props.borderTopWidth, props.borderRightWidth, props.borderBottomWidth, props.borderLeftWidth,
      ];
    },
    recompute,
    { immediate: true, deep: true },
  );

  return { naturalSize, browserDefaults };
}
