<script setup lang="ts">
import type { BaseButtonProps } from '~/types/button'
import type { ButtonStudioDefaults } from '~/composables/useButtonStudioDefaults'
import LengthControl from '~/components/controls/LengthControl.vue'

const props = defineProps<{ defaults: ButtonStudioDefaults }>()
const model = defineModel<Partial<BaseButtonProps>>({ required: true })

const unitConv = useUnitConversion()
const { t } = useI18n()

const { enabled, toggle } = useToggleableSection(model, {
  keys: ['fontSize'],
  enable: () => ({ fontSize: unitConv.fromPx(props.defaults.fontSize, 'rem') }),
  disable: () => ({ fontSize: undefined })
})
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <div>
      <div class="flex items-center justify-between mb-1.5">
        <span class="control-group-title font-medium text-(--text-secondary)">
          {{ t('controls.fontSize') }}
        </span>
        <USwitch
          :model-value="enabled"
          size="xs"
          color="primary"
          @update:model-value="toggle"
        />
      </div>
      <div :class="enabled ? '' : 'opacity-50'">
        <LengthControl
          :model-value="model.fontSize"
          :fallback-px="defaults.fontSize"
          :min="8"
          :max="128"
          :step="2"
          :disabled="!enabled"
          @update:model-value="model.fontSize = $event"
        />
      </div>
    </div>
  </fieldset>
</template>
