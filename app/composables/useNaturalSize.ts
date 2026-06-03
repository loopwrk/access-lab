import type { Ref } from "vue";
import type { CssLength } from "~/composables/useUnitConversion";
import type { ButtonContentProps, ButtonStyleProps, ButtonAriaProps } from "~/types/button";

type NaturalSizeModel = Partial<ButtonContentProps & ButtonStyleProps & ButtonAriaProps>;

export function useNaturalSize(model: Ref<NaturalSizeModel>, tagName: string) {
  const unitConv = useUnitConversion();
  const { defaults: browserDefaults, measureIntrinsicSize } = useBrowserDefaults(tagName);

  const naturalSize = ref({ width: 0, height: 0 });

  const px = (length: CssLength | undefined): number =>
    length ? unitConv.lengthToPx(length) : 0;

  function buildEffectiveCss(): string {
    const m = model.value;
    const parts: string[] = [];

    if (m.fontSize != null) parts.push(`font-size:${px(m.fontSize)}px`);

    const hasSplitPadding
      = m.paddingTop != null || m.paddingRight != null
        || m.paddingBottom != null || m.paddingLeft != null;

    if (hasSplitPadding) {
      const fallback = m.padding;
      parts.push(
        `padding:${px(m.paddingTop ?? fallback)}px ${px(m.paddingRight ?? fallback)}px ${px(m.paddingBottom ?? fallback)}px ${px(m.paddingLeft ?? fallback)}px`,
      );
    } else if (m.padding != null) {
      parts.push(`padding:${px(m.padding)}px`);
    }

    const hasSplitBorder
      = m.borderTopWidth != null || m.borderRightWidth != null
        || m.borderBottomWidth != null || m.borderLeftWidth != null;

    if (hasSplitBorder) {
      const fallback = m.borderWidth;
      parts.push(
        `border-top-width:${px(m.borderTopWidth ?? fallback)}px;`
        + `border-right-width:${px(m.borderRightWidth ?? fallback)}px;`
        + `border-bottom-width:${px(m.borderBottomWidth ?? fallback)}px;`
        + `border-left-width:${px(m.borderLeftWidth ?? fallback)}px;`
        + `border-style:solid`,
      );
    } else if (m.borderWidth != null) {
      parts.push(`border-width:${px(m.borderWidth)}px;border-style:solid`);
    }

    return parts.join(";");
  }

  function probeContent(): { content: string; asHtml: boolean } {
    const m = model.value;
    if (m.contentType === "icon") {
      return { content: "<span aria-hidden=\"true\">&#128269;</span>", asHtml: true };
    }
    return { content: m.label || "Click Me!", asHtml: false };
  }

  function recompute() {
    if (!import.meta.client) return;
    const { content, asHtml } = probeContent();
    naturalSize.value = measureIntrinsicSize(content, buildEffectiveCss(), asHtml);
  }

  watch(
    () => {
      const m = model.value;
      return [
        m.label, m.contentType,
        m.fontSize,
        m.padding, m.paddingTop, m.paddingRight, m.paddingBottom, m.paddingLeft,
        m.borderWidth, m.borderTopWidth, m.borderRightWidth, m.borderBottomWidth, m.borderLeftWidth,
      ];
    },
    recompute,
    { immediate: true, deep: true },
  );

  return { naturalSize, browserDefaults };
}
