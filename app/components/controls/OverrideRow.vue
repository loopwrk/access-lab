<script setup lang="ts">
/**
 * A control row that is EITHER a default user-agent stylesheet or a default
 * CSS property that's computed based on content e.g. 'auto' OR an override.
 * In the default state the row names where the default comes from
 * ("Browser default" / "auto") next to a Customise button; the resolved value appears
 * in a tooltip on  hover or keyboard focus, and stays in the button accessible names and
 * announcements. Taking over reveals the live controls (default slot)
 * behind a Use default button that removes the override.
 *
 */

type DefaultKind = "browserDefault" | "auto";

const props = withDefaults(
  defineProps<{
    label: string;
    customised: boolean;
    /**
     * Where the default comes from: "browserDefault" for user-agent
     * stylesheet values (padding, border width), "auto" for sizes the
     * browser computes from the content (width, height).
     */
    defaultKind: DefaultKind;
    /** Resolved default formatted for display, e.g. "124 px" or "1px 6px 1px 6px". */
    defaultValue: string;
    /** Spoken expansion of a multi-value default, e.g. "top 1px, right 6px, ...". */
    defaultValueDetail?: string;
    /** Render as fieldset+legend for rows that reveal a control cluster. */
    group?: boolean;
  }>(),
  { defaultValueDetail: undefined, group: false },
);

const emit = defineEmits<{ customise: []; useDefault: [] }>();

const { t } = useI18n();

const termLabel = computed(() =>
  props.defaultKind === "auto"
    ? t("controls.override.auto")
    : t("controls.override.browserDefault"),
);

const spokenValue = computed(() => props.defaultValueDetail ?? props.defaultValue);

const kindSuffix = computed(() => (props.defaultKind === "auto" ? "Auto" : "BrowserDefault"));

const customiseName = computed(() =>
  t(`controls.override.customiseAria${kindSuffix.value}`, {
    property: props.label,
    value: spokenValue.value,
  }),
);

const useDefaultName = computed(() =>
  t(`controls.override.removeAria${kindSuffix.value}`, {
    property: props.label,
    value: spokenValue.value,
  }),
);

const announcement = ref("");
const controlsEl = ref<HTMLElement | null>(null);
const customiseButton = ref<HTMLButtonElement | null>(null);

const FIRST_CONTROL_SELECTOR =
  '[role="slider"], button, input, select, textarea, [tabindex]:not([tabindex="-1"])';

async function onCustomise() {
  announcement.value = t(`controls.override.announceCustomise${kindSuffix.value}`, {
    property: props.label,
    value: spokenValue.value,
  });
  emit("customise");
  await nextTick();
  controlsEl.value?.querySelector<HTMLElement>(FIRST_CONTROL_SELECTOR)?.focus();
}

async function onUseDefault() {
  announcement.value = t(`controls.override.announceRemove${kindSuffix.value}`, {
    property: props.label,
    value: spokenValue.value,
  });
  emit("useDefault");
  await nextTick();
  customiseButton.value?.focus();
}

const ACTION_BUTTON_CLASSES =
  "inline-flex shrink-0 items-center justify-center gap-2 min-h-8 px-[13px] text-(length:--al-font-size-body) font-semibold text-(--brand) bg-transparent border border-(--brand-soft-2) rounded-none cursor-pointer transition-colors hover:bg-(--surface-2) active:translate-y-[0.5px] focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2";
</script>

<template>
  <component
    :is="group ? 'fieldset' : 'div'"
    class="flex flex-col"
    :class="group ? 'border-0 p-0 m-0' : ''"
  >
    <component
      :is="group ? 'legend' : 'div'"
      class="flex w-full items-center justify-between gap-3"
      :class="customised ? 'mb-3' : ''"
    >
      <span class="control-group-title">{{ label }}</span>

      <span
        v-if="!customised"
        class="flex min-w-0 items-center gap-3"
      >
        <!-- The resolved value lives in the tooltip. The term is focusable so
             keyboard users can open it too (Reka opens on focus and points
             aria-describedby at the value); pointer users get cursor-help. -->
        <UTooltip :text="defaultValue">
          <span
            tabindex="0"
            class="whitespace-nowrap cursor-help text-(length:--al-font-size-body) text-(--text-muted) focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2"
            :class="defaultKind === 'auto' ? 'font-mono font-medium' : ''"
            >{{ termLabel }}</span
          >
        </UTooltip>
        <button
          ref="customiseButton"
          type="button"
          :class="ACTION_BUTTON_CLASSES"
          :aria-label="customiseName"
          @click="onCustomise"
        >
          {{ t("controls.override.customise") }}
        </button>
      </span>

      <span
        v-else
        class="flex items-center gap-2"
      >
        <slot name="legend-extra" />
        <button
          type="button"
          :class="ACTION_BUTTON_CLASSES"
          :aria-label="useDefaultName"
          @click="onUseDefault"
        >
          <UIcon
            name="i-lucide-rotate-ccw"
            class="text-base text-(--brand)"
            aria-hidden="true"
          />
          {{ t("controls.override.useDefault") }}
        </button>
      </span>
    </component>

    <Transition
      enter-from-class="opacity-0 -translate-y-1"
      enter-active-class="motion-safe:transition-[opacity,translate] motion-safe:duration-200 motion-safe:ease-out"
    >
      <div
        v-if="customised"
        ref="controlsEl"
      >
        <slot />
      </div>
    </Transition>

    <span
      class="sr-only"
      aria-live="polite"
      aria-atomic="true"
      >{{ announcement }}</span
    >
  </component>
</template>
