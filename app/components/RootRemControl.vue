<script setup lang="ts">
/**
 * Presentational: all copy arrives via `labels` (the app supplies i18n, the
 * stories supply English), so the component renders outside Nuxt.
 */
import { computed, ref } from "vue";
import { onClickOutside } from "@vueuse/core";

interface RootRemLabels {
  trigger: string;
  title: string;
  /** Full sentence containing the literal token "1rem", rendered as an inline chip. */
  description: string;
  unit: string;
  equals: string;
  learn: string;
  slider: string;
  presetsGroup: string;
  pixelsWord: string;
}

const px = defineModel<number>({ required: true });
const open = defineModel<boolean>("open", { default: false });

const props = withDefaults(
  defineProps<{
    labels: RootRemLabels;
    min?: number;
    max?: number;
    presets?: number[];
  }>(),
  {
    min: 8,
    max: 32,
    presets: () => [12, 14, 16, 18, 20],
  },
);

const emit = defineEmits<{ learn: [] }>();

const triggerRef = ref<HTMLElement | null>(null);
const presetsRef = ref<HTMLElement | null>(null);

const descriptionParts = computed(() => props.labels.description.split("1rem"));

const focusablePresetIndex = computed(() => Math.max(props.presets.indexOf(px.value), 0));

// The popover content is teleported out of the trigger's subtree, so ignore it.
// Clicks inside the preview iframe never reach this document; consumers close on
// those via usePreviewIframeOutsideClick.
onClickOutside(
  triggerRef,
  () => {
    if (open.value) open.value = false;
  },
  { ignore: [".al-rootrem-pop"] },
);

const PRESET_KEY_OFFSETS: Record<string, number> = {
  ArrowRight: 1,
  ArrowDown: 1,
  ArrowLeft: -1,
  ArrowUp: -1,
};

function onPresetKeydown(event: KeyboardEvent, index: number) {
  const offset = PRESET_KEY_OFFSETS[event.key];
  if (offset === undefined) return;
  event.preventDefault();
  const next = (index + offset + props.presets.length) % props.presets.length;
  const value = props.presets[next];
  if (value === undefined) return;
  px.value = value;
  presetsRef.value?.querySelectorAll("button")[next]?.focus();
}

function onLearn() {
  open.value = false;
  emit("learn");
}
</script>

<template>
  <UPopover
    v-model:open="open"
    :modal="false"
    :dismissible="true"
    :content="{ align: 'start', side: 'bottom', sideOffset: 6 }"
    :ui="{
      content:
        'al-rootrem-pop w-[330px] p-4 bg-(--surface) ring-1 ring-(--border-strong) rounded-none shadow-[0_18px_44px_rgb(43_0_120_/_0.22)]',
    }"
  >
    <button
      ref="triggerRef"
      type="button"
      class="group w-full min-h-11 inline-flex items-center justify-between gap-2 px-[13px] text-(--text-primary) bg-(--brand-soft) border border-(--brand-soft-2) rounded-none cursor-pointer transition-colors hover:border-(--brand) active:border-(--brand) active:translate-y-[0.5px] aria-expanded:border-(--brand) focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2"
      :aria-expanded="open"
    >
      <span class="text-(length:--al-font-size-body) font-semibold">{{ labels.trigger }}</span>
      <span class="inline-flex items-center gap-[9px]">
        <span class="text-(length:--al-font-size-body) font-bold text-(--brand-press)"
          >{{ px }}{{ labels.unit }}</span
        >
        <UIcon
          name="i-lucide-chevron-down"
          class="text-xs text-(--text-muted) motion-safe:transition-transform group-aria-expanded:rotate-180"
          aria-hidden="true"
        />
      </span>
    </button>

    <template #content>
      <div
        role="dialog"
        :aria-label="labels.title"
      >
        <div class="flex items-center justify-between gap-2.5 mb-[9px]">
          <h3
            class="m-0 text-(length:--al-font-size-heading) font-bold text-(--text-primary) whitespace-nowrap"
          >
            {{ labels.title }}
          </h3>
          <button
            type="button"
            class="p-0.5 leading-none text-(--brand) cursor-pointer focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2"
            :aria-label="labels.learn"
            @click="onLearn"
          >
            <UIcon
              name="i-lucide-arrow-up-right"
              aria-hidden="true"
            />
          </button>
        </div>

        <p
          class="m-0 mb-[13px] text-(length:--al-font-size-caption) leading-normal text-(--text-secondary)"
        >
          <template
            v-for="(part, i) in descriptionParts"
            :key="i"
          >
            <span
              v-if="i > 0"
              class="px-[5px] font-bold bg-(--brand-soft) text-(--text-primary)"
              >1rem</span
            >{{ part }}
          </template>
        </p>

        <div class="flex items-baseline justify-between mb-[9px] text-(--text-primary)">
          <span
            ><b class="text-[1.625rem] font-bold">{{ px }}</b
            ><span class="ml-[3px] text-(length:--al-font-size-brand) text-(--text-primary)">{{
              labels.unit
            }}</span></span
          >
          <span class="text-(length:--al-font-size-brand) text-(--text-primary)">{{
            labels.equals
          }}</span>
        </div>

        <USlider
          v-model="px"
          :min="min"
          :max="max"
          :step="1"
          color="primary"
          :ui="{
            track: 'bg-(--brand-soft-2) rounded-none',
            range: 'bg-(--brand) rounded-none',
            thumb: 'bg-(--brand) ring-[3px] ring-(--surface) size-[22px]',
          }"
          :aria-label="labels.slider"
        />

        <div
          ref="presetsRef"
          class="grid grid-cols-5 gap-1.5 mt-[13px]"
          role="radiogroup"
          :aria-label="labels.presetsGroup"
        >
          <button
            v-for="(p, i) in presets"
            :key="p"
            type="button"
            role="radio"
            class="py-2 text-(length:--al-font-size-detail) font-bold text-(--text-secondary) bg-(--surface) border border-(--border) rounded-none cursor-pointer transition-colors hover:bg-(--brand-soft) not-aria-checked:hover:border-(--brand-soft-2) aria-checked:border-(--brand) aria-checked:bg-(--brand-soft) aria-checked:text-(--brand-press) focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-2"
            :aria-checked="px === p"
            :aria-label="`${p} ${labels.pixelsWord}`"
            :tabindex="i === focusablePresetIndex ? 0 : -1"
            @click="px = p"
            @keydown="onPresetKeydown($event, i)"
          >
            {{ p }}
          </button>
        </div>
      </div>
    </template>
  </UPopover>
</template>
