<script setup lang="ts">
export interface StyleTargetOption {
  value: string;
  label: string;
}

const props = defineProps<{
  modelValue: string;
  options: StyleTargetOption[];
  legend: string;
}>();

const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const groupName = useId();
</script>

<template>
  <fieldset class="border-0 p-0 m-0 flex flex-col gap-1.5">
    <legend class="control-group-title mb-1.5">
      {{ legend }}
    </legend>
    <div class="grid grid-cols-2 gap-1.5">
      <label
        v-for="opt in props.options"
        :key="opt.value"
        :class="[
          'style-target-pill',
          opt.value === props.modelValue && 'style-target-pill--selected',
        ]"
      >
        <input
          type="radio"
          :name="groupName"
          :value="opt.value"
          :checked="opt.value === props.modelValue"
          class="sr-only"
          @change="emit('update:modelValue', opt.value)"
        >
        <span>{{ opt.label }}</span>
      </label>
    </div>
  </fieldset>
</template>

<style scoped>
/*
 * Pill styling. Tokens come from `tokens.css` so light / dark / high-
 * contrast all inherit automatically.
 *
 * `:focus-within` is what shows the focus ring — the input itself is
 * sr-only so its native focus ring is invisible; the label's
 * focus-within picks up that the inside radio is focused.
 */
.style-target-pill {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 0.75rem;
  border-radius: 9999px;
  background: var(--surface-2);
  color: var(--text-secondary);
  cursor: pointer;
  user-select: none;
  text-align: center;
  font-size: var(--al-font-size-body);
  line-height: 1.2;
  transition: background-color 150ms, color 150ms;
}

.style-target-pill:hover {
  background: var(--brand-soft);
  color: var(--text-primary);
}

.style-target-pill--selected {
  background: var(--brand);
  color: var(--on-brand);
}

.style-target-pill--selected:hover {
  background: var(--brand);
  color: var(--on-brand);
}

.style-target-pill:focus-within {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
