<script setup lang="ts">
const model = defineModel<string>({ required: true });

defineProps<{
  label: string;
  disabled?: boolean;
}>();

const SWATCH_CLASS
  = "w-10 h-10 p-1 rounded-md border-2 border-(--border-strong) bg-transparent cursor-pointer shrink-0 "
    + "focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-0 "
    + "disabled:opacity-30 disabled:cursor-not-allowed";

const SWATCH_INNER_CLASS = "w-full h-full rounded-[3px]";
const LABEL_TITLE_CLASS = "text-(length:--al-font-size-heading) font-medium text-(--text-primary)";
const LABEL_HEX_CLASS = "text-(length:--al-font-size-detail) text-(--text-muted) font-mono";
</script>

<template>
  <ColorPicker
    v-slot="{ show }"
    v-model="model"
    with-alpha
    with-initial-color
    with-eye-dropper
    with-hex-input
    with-rgb-input
  >
    <div class="flex items-center justify-between gap-3">
      <button
        type="button"
        :class="SWATCH_CLASS"
        :disabled="disabled"
        @click="show"
      >
        <div
          :class="SWATCH_INNER_CLASS"
          :style="{ backgroundColor: model }"
        />
      </button>
      <div class="flex flex-col flex-1 min-w-0">
        <span :class="LABEL_TITLE_CLASS">{{ label }}</span>
        <span :class="LABEL_HEX_CLASS">{{ model }}</span>
      </div>
      <UInput
        v-model="model"
        size="sm"
        :disabled="disabled"
        class="w-24 shrink-0"
      />
    </div>
  </ColorPicker>
</template>
