/**
 * The input's label follows its type: switching the variant to `tel` rewrites
 * the field label to "Phone number" so the demo stays internally consistent.
 * The deliberate behaviours to pin: it always overwrites (even a custom label
 * the user typed), it leaves the label alone when the new variant has no
 * mapping, and it does nothing on initial mount (the watch isn't immediate).
 *
 * Nuxt env: the composable uses the auto-imported `watch`.
 */

import { describe, expect, it } from "vitest";
import { mountSuspended } from "@nuxt/test-utils/runtime";
import { defineComponent, h, nextTick, ref } from "vue";
import type { Ref } from "vue";
import { useVariantLabelSync } from "~/composables/useVariantLabelSync";

interface Model {
  renderAs?: string;
  label?: string;
}

async function setup(initial: Model): Promise<Ref<Model>> {
  const model = ref<Model>({ ...initial });
  const Wrapper = defineComponent({
    setup() {
      useVariantLabelSync(model, {
        variantKey: "renderAs",
        labelKey: "label",
        labelByVariant: { text: "Name", email: "Email", tel: "Phone number" },
      });
      return () => h("div");
    },
  });
  await mountSuspended(Wrapper);
  return model;
}

describe("useVariantLabelSync", () => {
  it("rewrites the label to the canonical label when the variant changes", async () => {
    const model = await setup({ renderAs: "email", label: "Email" });
    model.value.renderAs = "tel";
    await nextTick();
    expect(model.value.label).toBe("Phone number");
  });

  it("overwrites a custom label the user typed (the label always follows the type)", async () => {
    const model = await setup({ renderAs: "email", label: "My custom label" });
    model.value.renderAs = "text";
    await nextTick();
    expect(model.value.label).toBe("Name");
  });

  it("leaves the label untouched when the new variant has no mapping", async () => {
    const model = await setup({ renderAs: "email", label: "Email" });
    model.value.renderAs = "url"; // not in the map
    await nextTick();
    expect(model.value.label).toBe("Email");
  });

  it("does not touch the label on initial mount (the watch is not immediate)", async () => {
    const model = await setup({ renderAs: "email", label: "Untouched" });
    await nextTick();
    expect(model.value.label).toBe("Untouched");
  });
});
