<script setup lang="ts">
/**
 * Icon-only toggle between one linked value and individual per-side values
 * for four-sided spacing controls. `true` means the sides are edited
 * individually. The icon (Figma's padding glyph: a box with one tick per
 * side) never changes; the active state is carried by the background and
 * stroke colour, by aria-pressed, and by the tooltip/accessible name the
 * parent supplies (e.g. "Individual padding").
 *
 * Variants: "outline" (default) is the quiet chip the inspector legends
 * use; "solid" mirrors the segmented content pickers - pressed matches
 * their active primary-solid button, unpressed their neutral resting state
 * inside the field-group frame.
 */
// Explicit import: this component renders in Storybook's plain Vite, which
// has no Nuxt auto-imports.
import { computed } from "vue";

const independent = defineModel<boolean>({ required: true });

const props = withDefaults(
  defineProps<{
    /** Tooltip and accessible name, e.g. "Individual padding". */
    label: string;
    variant?: "outline" | "solid";
    disabled?: boolean;
  }>(),
  { variant: "solid", disabled: false },
);

const STATE_CLASSES = {
  outline: {
    pressed: "bg-(--brand-soft) text-(--text-primary) border border-(--brand-soft-2)",
    idle: "bg-transparent text-(--text-secondary) border border-(--brand-soft-2)",
  },
  solid: {
    pressed: "bg-(--brand) text-(--on-brand) border border-(--brand) hover:bg-(--brand-hover)",
    idle: "bg-(--surface) text-(--text-primary) border border-(--border-strong) hover:bg-(--brand-soft)",
  },
} as const;

const stateClasses = computed(
  () => STATE_CLASSES[props.variant][independent.value ? "pressed" : "idle"],
);

// Brand-blue stroke everywhere except on a brand background, where the
// icon switches to the on-brand foreground.
const iconStroke = computed(() =>
  props.variant === "solid" && independent.value ? "var(--on-brand)" : "var(--brand)",
);
</script>

<template>
  <UTooltip
    :text="label"
    :content="{ side: 'left' }"
  >
    <button
      type="button"
      class="inline-flex size-8 items-center justify-center rounded-[2px] cursor-pointer transition-colors focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      :class="stateClasses"
      :aria-pressed="independent"
      :aria-label="label"
      :disabled="disabled"
      @click="independent = !independent"
    >
      <svg
        class="size-7"
        viewBox="0 0 24 24"
        fill="none"
        :stroke="iconStroke"
        stroke-width="1"
        stroke-linecap="round"
        aria-hidden="true"
      >
        <rect
          x="3"
          y="3"
          width="18"
          height="18"
          rx="2"
        />
        <path d="M9 7h6" />
        <path d="M9 17h6" />
        <path d="M7 9v6" />
        <path d="M17 9v6" />
      </svg>
    </button>
  </UTooltip>
</template>
