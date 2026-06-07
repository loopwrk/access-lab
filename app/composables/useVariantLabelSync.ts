import type { Ref } from "vue";

/**
 * Keep a component's visible label in step with its currently-selected
 * variant. When the variant prop changes, the label prop is overwritten
 * with the canonical label declared for that variant.
 *
 * Opt-in per component. The composable doesn't read from the definition
 * directly — the controls component supplies the variant prop name, the
 * label prop name, and the variant → label map. This keeps the
 * vocabulary at the controls layer where the author can refine it
 * without touching shared infrastructure.
 *
 * Currently used by InputControls.vue (variant: input type → label
 * follows: text → "Name", email → "Email", tel → "Phone number", ...).
 * Other components can adopt the pattern by calling the composable with
 * their own variant prop, label prop, and label map.
 *
 * @example
 * ```ts
 * useVariantLabelSync(model, {
 *   variantKey: "renderAs",
 *   labelKey: "label",
 *   labelByVariant: { text: "Name", email: "Email", tel: "Phone number" },
 * });
 * ```
 *
 * Behaviour: always overwrites the label when the variant changes. If
 * the user typed a custom label and then picks a different variant,
 * the custom label is replaced. This is intentional — the field label
 * should always reflect the active type so the demo stays internally
 * consistent.
 */
export function useVariantLabelSync<P extends Record<string, unknown>>(
  model: Ref<Partial<P>>,
  config: {
    variantKey: keyof P;
    labelKey: keyof P;
    labelByVariant: Record<string, string>;
  },
) {
  watch(
    () => model.value[config.variantKey],
    (next, prev) => {
      if (next == null || next === prev) return;
      const nextLabel = config.labelByVariant[String(next)];
      if (nextLabel == null) return;
      (model.value as Partial<P>)[config.labelKey] = nextLabel as P[keyof P];
    },
  );
}
