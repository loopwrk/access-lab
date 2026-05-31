<script setup lang="ts">
import type { BaseButtonProps } from '~/types/button'
import type { DisclosureBehaviour } from '~/components/inspected/buttons/shared/types'

type DisclosureProps = Partial<BaseButtonProps> & {
  disclosureBehaviour?: DisclosureBehaviour
  disclosureExpanded?: boolean
  disclosureShowControls?: boolean
}

const model = defineModel<DisclosureProps>({ required: true })
const { update } = useButtonControlsModel(model)

const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()

const behaviour = computed(() => model.value.disclosureBehaviour ?? 'none')

const OPTIONS: { value: DisclosureBehaviour, labelKey: string }[] = [
  { value: 'none', labelKey: 'controls.disclosureBehaviourNone' },
  { value: 'aria-expanded', labelKey: 'controls.disclosureBehaviourAriaExpanded' },
  { value: 'out-of-sync', labelKey: 'controls.disclosureBehaviourOutOfSync' }
]
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <legend class="control-group-title mb-1.5">
      <a
        href="#topic-disclosure-triggers"
        class="control-label-link"
        @click.prevent="focusLearnTopic('disclosure-triggers')"
      >
        {{ t('controls.disclosureBehaviour') }}
        <UIcon
          name="i-lucide-arrow-up-right"
          class="control-label-link-icon"
          aria-hidden="true"
        />
      </a>
    </legend>

    <UFieldGroup
      size="sm"
      orientation="vertical"
    >
      <UButton
        v-for="opt in OPTIONS"
        :key="opt.value"
        :color="behaviour === opt.value ? 'primary' : 'neutral'"
        :variant="behaviour === opt.value ? 'solid' : 'ghost'"
        @click="update('disclosureBehaviour', opt.value)"
      >
        {{ t(opt.labelKey) }}
      </UButton>
    </UFieldGroup>

    <UFormField
      v-if="behaviour !== 'none'"
      class="flex flex-col mt-2"
    >
      <template #label>
        <span class="control-group-title">{{ t('controls.disclosureShowControls') }}</span>
      </template>
      <USwitch
        :model-value="model.disclosureShowControls === true"
        size="sm"
        color="primary"
        @update:model-value="update('disclosureShowControls', $event === true)"
      />
    </UFormField>
  </fieldset>
</template>
