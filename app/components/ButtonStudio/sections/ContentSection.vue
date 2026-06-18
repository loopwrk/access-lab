<script setup lang="ts">
import type { BaseButtonProps } from "~/types/button";
import LearnLink from "~/components/controls/LearnLink.vue";

const model = defineModel<Partial<BaseButtonProps>>({ required: true });
const { update } = useModelUpdater(model);
const { hideContentType = false } = defineProps<{
  hideContentType?: boolean;
}>();

const { t } = useI18n();

const VARIANT_LABEL_PLACEHOLDER_KEYS: Record<string, string> = {
  "button-submit": "controls.labelPlaceholderSubmit",
  "button-reset": "controls.labelPlaceholderReset",
  "input-submit": "controls.labelPlaceholderSubmit",
  "input-reset": "controls.labelPlaceholderReset",
};

const VARIANTS_WITHOUT_NAME_EFFECT = ["button-button", "input-button"];

const SAMPLE_IMAGE_PATH_SVG = "/images/click-event-button.svg";
const SAMPLE_IMAGE_PATH_PNG = "/images/click-event-button.png";

const isButtonTag = computed(() => !(model.value.renderAs ?? "button").startsWith("input-"));
const isImageInput = computed(() => model.value.renderAs === "input-image");
const showsLabelField = computed(() => !isImageInput.value);
const showsNameField = computed(
  () => !VARIANTS_WITHOUT_NAME_EFFECT.includes(model.value.renderAs ?? ""),
);
const hasSeparateValueAttribute = computed(() => isButtonTag.value || isImageInput.value);
const isSvgImage = computed(
  () => (model.value.src ?? SAMPLE_IMAGE_PATH_SVG) === SAMPLE_IMAGE_PATH_SVG,
);

const labelFieldKey = computed(() =>
  isButtonTag.value ? "controls.label" : "controls.valueAttribute",
);
const labelFieldTopicId = computed(() =>
  isButtonTag.value ? "vague-label" : "button-value-attribute",
);
const labelFieldPlaceholderKey = computed(
  () => VARIANT_LABEL_PLACEHOLDER_KEYS[model.value.renderAs ?? ""] ?? "controls.labelPlaceholder",
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <UFormField
      v-if="showsLabelField"
      class="flex flex-col"
    >
      <template #label>
        <LearnLink
          class="control-group-title"
          :topic="labelFieldTopicId"
          :label="t(labelFieldKey)"
        />
      </template>
      <UInput
        :model-value="model.label ?? ''"
        :placeholder="t(labelFieldPlaceholderKey)"
        class="w-full"
        @update:model-value="update('label', String($event))"
      />
    </UFormField>

    <UFormField
      v-if="isImageInput"
      class="flex flex-col"
    >
      <template #label>
        <span class="control-group-title">{{ t("controls.imageFormat") }}</span>
      </template>
      <UFieldGroup size="sm">
        <UButton
          :color="isSvgImage ? 'primary' : 'neutral'"
          :variant="isSvgImage ? 'solid' : 'ghost'"
          @click="update('src', SAMPLE_IMAGE_PATH_SVG)"
        >
          SVG
        </UButton>
        <UButton
          :color="!isSvgImage ? 'primary' : 'neutral'"
          :variant="!isSvgImage ? 'solid' : 'ghost'"
          @click="update('src', SAMPLE_IMAGE_PATH_PNG)"
        >
          PNG
        </UButton>
      </UFieldGroup>
    </UFormField>

    <UFormField
      v-if="isImageInput"
      class="flex flex-col"
    >
      <template #label>
        <LearnLink
          class="control-group-title"
          topic="accessible-name"
          :label="t('controls.alt')"
        />
      </template>
      <UInput
        :model-value="model.alt ?? ''"
        :placeholder="t('controls.altPlaceholder')"
        class="w-full"
        @update:model-value="update('alt', String($event))"
      />
    </UFormField>

    <UFormField
      v-if="hasSeparateValueAttribute"
      class="flex flex-col"
    >
      <template #label>
        <LearnLink
          class="control-group-title"
          topic="button-value-attribute"
          :label="t('controls.valueAttribute')"
        />
      </template>
      <UInput
        :model-value="model.value ?? ''"
        :placeholder="t('controls.valueAttributePlaceholder')"
        class="w-full"
        @update:model-value="update('value', String($event))"
      />
    </UFormField>

    <UFormField
      v-if="showsNameField"
      class="flex flex-col"
    >
      <template #label>
        <LearnLink
          class="control-group-title"
          topic="button-value-attribute"
          :label="t('controls.nameAttribute')"
        />
      </template>
      <UInput
        :model-value="model.name ?? ''"
        :placeholder="t('controls.nameAttributePlaceholder')"
        class="w-full"
        @update:model-value="update('name', String($event))"
      />
    </UFormField>

    <UFormField
      v-if="isButtonTag && !hideContentType"
      class="flex flex-col"
    >
      <template #label>
        <span class="control-group-title">{{ t("controls.contentType") }}</span>
      </template>
      <UFieldGroup size="sm">
        <UButton
          :color="(model.contentType ?? 'text') === 'text' ? 'primary' : 'neutral'"
          :variant="(model.contentType ?? 'text') === 'text' ? 'solid' : 'ghost'"
          @click="update('contentType', 'text')"
        >
          {{ t("controls.contentTypeText") }}
        </UButton>
        <UButton
          :color="model.contentType === 'icon' ? 'primary' : 'neutral'"
          :variant="model.contentType === 'icon' ? 'solid' : 'ghost'"
          icon="i-lucide-search"
          @click="update('contentType', 'icon')"
        >
          {{ t("controls.contentTypeIcon") }}
        </UButton>
      </UFieldGroup>
    </UFormField>
  </div>
</template>
