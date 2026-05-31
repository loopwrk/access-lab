<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const open = defineModel<boolean>('open', { required: true })

const { t } = useI18n()

const navItems = computed<NavigationMenuItem[][]>(() => [
  [
    { label: t('nav.components'), type: 'label' },
    {
      label: t('nav.buttons'),
      icon: 'i-lucide-square-mouse-pointer',
      type: 'trigger',
      defaultOpen: true,
      children: [
        {
          label: t('nav.buttonsActionTriggers'),
          value: 'buttons-action-triggers',
          to: '/components/buttons/action-triggers'
        },
        {
          label: t('nav.buttonsFormButtons'),
          value: 'buttons-form-buttons',
          to: '/components/buttons/form-buttons'
        },
        {
          label: t('nav.buttonsToggleButtons'),
          value: 'buttons-toggle-buttons',
          to: '/components/buttons/toggle-buttons'
        },
        {
          label: t('nav.buttonsSwitches'),
          value: 'buttons-switches',
          to: '/components/buttons/switches'
        },
        {
          label: t('nav.buttonsDisclosureTriggers'),
          value: 'buttons-disclosure-triggers',
          to: '/components/buttons/disclosure-triggers'
        },
        {
          label: t('nav.buttonsMenuTriggers'),
          value: 'buttons-menu-triggers',
          to: '/components/buttons/menu-triggers'
        }
      ]
    },
    // { label: t('nav.accordion'), value: 'accordion', to: '/components/accordion', icon: 'i-lucide-chevrons-down-up' },
    // { label: t('nav.carousel'), value: 'carousel', to: '/components/carousel', icon: 'i-lucide-images' },
    // { label: t('nav.modal'), value: 'modal', to: '/components/modal', icon: 'i-lucide-rectangle-ellipsis' },
    // { label: t('nav.menu'), value: 'menu', to: '/components/menu', icon: 'i-lucide-menu' },
    // { label: t('nav.tooltip'), value: 'tooltip', to: '/components/tooltip', icon: 'i-lucide-message-circle' },
    // { label: t('nav.tabs'), value: 'tabs', to: '/components/tabs', icon: 'i-lucide-panels-top-left' }
  ],
  [
    { label: t('nav.forms'), type: 'label' },
    { label: t('nav.input'), value: 'input', to: '/components/input', icon: 'i-lucide-text-cursor-input' }
  ]
  // TODO: Introduce framework styles after vanilla components are in place
])
</script>

<template>
  <aside :aria-label="t('sidebar.ariaLabel')" class="border-r border-(--border) bg-(--bg) shrink-0">
    <div v-show="open" class="w-[260px] h-full overflow-y-auto">
      <UNavigationMenu :items="navItems" orientation="vertical" highlight highlight-color="primary" collapsible :ui="{
        link: 'text-md py-2.5 pl-3',
        linkLabel: 'truncate',
        label: 'text-lg pl-3 pt-3'
      }" />
    </div>

    <div v-show="!open" class="w-[44px] h-full flex flex-col items-center pt-3">
      <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-panel-left"
        :aria-label="t('sidebar.toggleOpen')" @click="open = true" />
    </div>
  </aside>
</template>
