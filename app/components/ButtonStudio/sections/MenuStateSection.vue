<script setup lang="ts">
import type { BaseButtonProps } from '~/types/button'
import type { MenuBehaviour } from '~/components/inspected/buttons/shared/types'

type MenuProps = Partial<BaseButtonProps> & {
  menuBehaviour?: MenuBehaviour
  menuOpen?: boolean
  menuShowControls?: boolean
}

const model = defineModel<MenuProps>({ required: true })
const { update } = useButtonControlsModel(model)

const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()

const behaviour = computed(() => model.value.menuBehaviour ?? 'none')

const OPTIONS: { value: MenuBehaviour, labelKey: string }[] = [
  { value: 'none', labelKey: 'controls.menuBehaviourNone' },
  { value: 'aria-expanded-haspopup', labelKey: 'controls.menuBehaviourBoth' },
  { value: 'haspopup-only', labelKey: 'controls.menuBehaviourHasPopupOnly' },
  { value: 'expanded-only', labelKey: 'controls.menuBehaviourExpandedOnly' }
]
</script>

<template>
  <fieldset class="flex flex-col gap-3 border-0 p-0 m-0">
    <legend class="control-group-title mb-1.5">
      <a
        href="#topic-menu-triggers"
        class="control-label-link"
        @click.prevent="focusLearnTopic('menu-triggers')"
      >
        {{ t('controls.menuBehaviour') }}
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
        @click="update('menuBehaviour', opt.value)"
      >
        {{ t(opt.labelKey) }}
      </UButton>
    </UFieldGroup>

    <UFormField
      v-if="behaviour !== 'none'"
      class="flex flex-col mt-2"
    >
      <template #label>
        <span class="control-group-title">{{ t('controls.menuShowControls') }}</span>
      </template>
      <USwitch
        :model-value="model.menuShowControls === true"
        size="sm"
        color="primary"
        @update:model-value="update('menuShowControls', $event === true)"
      />
    </UFormField>
  </fieldset>
</template>
