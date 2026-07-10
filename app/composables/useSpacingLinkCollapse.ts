import type { Ref, WritableComputedRef } from "vue";
import type { SpacingValue } from "~/components/controls/SplitSpacingControl.vue";

export function useSpacingLinkCollapse(
  independent: Ref<boolean>,
  customised: Readonly<Ref<boolean>>,
  spacing: WritableComputedRef<SpacingValue>,
) {
  watch(independent, (value) => {
    if (value || !customised.value) return;
    const linked = spacing.value.top ?? spacing.value.shorthand;
    if (!linked) return;
    spacing.value = {
      shorthand: linked,
      top: linked,
      right: linked,
      bottom: linked,
      left: linked,
    };
  });
}
