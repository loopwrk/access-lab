<script setup lang="ts">
import type { NavigationMenuItem } from '@nuxt/ui'

const { isOpen: open, open: expand, close: collapse } = useSidebar()

const { t } = useI18n()

const navItems = computed<NavigationMenuItem[][]>(() => [
  [
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
    }
  ],
  [
    { label: t('nav.forms'), type: 'label' },
    { label: t('nav.input'), value: 'input', to: '/components/input', icon: 'i-lucide-text-cursor-input' },
    { label: t('nav.checkbox'), value: 'checkbox', to: '/components/checkbox', icon: 'i-lucide-square-check-big' },
    { label: t('nav.radio'), value: 'radio', to: '/components/radio', icon: 'i-lucide-circle-dot' }
  ]
])
</script>

<template>
  <aside :aria-label="t('sidebar.ariaLabel')" class="border-r border-(--border) bg-(--bg) shrink-0">
    <div v-show="open" class="w-[260px] h-full overflow-y-auto">
      <div class="flex items-center justify-between pl-3 pr-2 pt-3">
        <span class="text-lg font-medium text-(--text-primary)">
          {{ t('nav.components') }}
        </span>
        <UButton color="neutral" variant="ghost" size="xs" icon="i-lucide-panel-left"
          :aria-label="t('sidebar.toggleClose')" :aria-pressed="true" @click="collapse" />
      </div>
      <UNavigationMenu :items="navItems" orientation="vertical" highlight highlight-color="primary" collapsible :ui="{
        link: 'text-md py-2.5 pl-3',
        linkLabel: 'truncate',
        label: 'text-lg pl-3 pt-3'
      }" />
    </div>

    <div v-show="!open" class="w-[44px] h-full flex flex-col items-center pt-3">
      <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-panel-left"
        :aria-label="t('sidebar.toggleOpen')" @click="expand" />
    </div>
  </aside>
</template>
