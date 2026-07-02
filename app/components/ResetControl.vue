<script setup lang="ts">
/**
 * Presentational reset button. Uses aria-disabled (not disabled) so keyboard
 * focus survives deactivation; the reset emit is withheld here while disabled,
 * so no consumer can forget that guard.
 */
import { useId } from "vue";

interface ResetLabels {
  action: string;
  ariaLabel: string;
  enabledTitle: string;
  disabledTitle: string;
}

const props = withDefaults(
  defineProps<{
    labels: ResetLabels;
    disabled?: boolean;
  }>(),
  { disabled: false },
);

const emit = defineEmits<{ reset: [] }>();

const descriptionId = useId();

function onClick() {
  if (props.disabled) return;
  emit("reset");
}
</script>

<template>
  <button
    type="button"
    class="group w-full min-h-11 inline-flex items-center justify-center gap-2 px-[13px] text-(length:--al-font-size-body) font-semibold text-(--text-primary) bg-transparent border border-(--border-strong) rounded-none cursor-pointer transition-colors hover:bg-(--surface-2) active:translate-y-[0.5px] aria-disabled:border-(--border) aria-disabled:text-(--text-muted) aria-disabled:cursor-not-allowed aria-disabled:hover:bg-transparent aria-disabled:active:translate-y-0 focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2"
    :aria-disabled="disabled ? 'true' : undefined"
    :aria-label="labels.ariaLabel"
    :aria-describedby="descriptionId"
    :title="disabled ? labels.disabledTitle : labels.enabledTitle"
    @click="onClick"
  >
    <UIcon
      name="i-lucide-rotate-ccw"
      class="text-base text-(--brand) group-aria-disabled:text-(--text-muted)"
      aria-hidden="true"
    />
    {{ labels.action }}
  </button>
  <span
    :id="descriptionId"
    class="sr-only"
  >
    {{ disabled ? labels.disabledTitle : labels.enabledTitle }}
  </span>
</template>
