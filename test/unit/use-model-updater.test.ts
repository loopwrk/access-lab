/**
 * Tests for the typed model-update helper every controls section uses.
 *
 * The contract is direct mutation (not spread replacement): update writes
 * through to the same model object. That's what makes section updates cheap
 * (only consumers of the changed key invalidate) and is the idiomatic Vue 3.4+
 * defineModel pattern.
 *
 * The helper only ever reads/writes `.value`, so a plain stand-in exercises its
 * full contract — no Vue reactivity (or runtime `vue` import, which the node
 * project doesn't resolve) needed.
 */

import { describe, expect, it } from "vitest";
import type { Ref } from "vue";
import { useModelUpdater } from "../../app/composables/useModelUpdater";

interface Props {
  a: number;
  b: number;
  c: number;
}

const fakeRef = <T extends object>(value: T): Ref<T> => ({ value }) as unknown as Ref<T>;

describe("useModelUpdater", () => {
  it("update mutates the existing model object in place (not a replacement)", () => {
    const model = fakeRef<Partial<Props>>({ a: 1 });
    const original = model.value;
    const { update } = useModelUpdater(model);
    update("a", 2);
    expect(model.value.a).toBe(2);
    expect(model.value).toBe(original); // same reference — direct mutation, not spread
  });

  it("update can clear a key with undefined", () => {
    const model = fakeRef<Partial<Props>>({ a: 1 });
    const { update } = useModelUpdater(model);
    update("a", undefined);
    expect(model.value.a).toBeUndefined();
  });

  it("updateMany merges a patch into the existing object", () => {
    const model = fakeRef<Partial<Props>>({ a: 1 });
    const original = model.value;
    const { updateMany } = useModelUpdater(model);
    updateMany({ b: 2, c: 3 });
    expect(model.value).toEqual({ a: 1, b: 2, c: 3 });
    expect(model.value).toBe(original);
  });
});
