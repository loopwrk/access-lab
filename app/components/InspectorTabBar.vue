<script setup lang="ts">
import type { TabsItem } from "@nuxt/ui";

const props = withDefaults(
  defineProps<{
    items: TabsItem[];
    default?: boolean;
    rounded?: boolean;
    ariaLabel?: string;
  }>(),
  { default: false, rounded: true, ariaLabel: undefined },
);

const model = defineModel<string>();
</script>

<template>
  <UTabs
    v-if="props.default"
    v-model="model"
    :items="items"
    variant="link"
    color="primary"
    size="lg"
    :content="false"
    :aria-label="ariaLabel"
    :ui="{ list: 'justify-around', label: 'overflow-visible whitespace-nowrap' }"
  />

  <UTabs
    v-else
    v-model="model"
    :items="items"
    :content="false"
    :aria-label="ariaLabel"
    class="al-tabbar"
    :class="{ 'al-tabbar--square': !rounded }"
    :ui="{
      root: 'w-full block',
      list: 'al-tabbar__list',
      indicator: 'hidden',
      trigger: 'al-tabbar__tab',
    }"
  />
</template>

<style scoped>
.al-tabbar :deep(.al-tabbar__list) {
  display: flex;
  width: 100%;
  gap: 3px;
  padding: 0.313rem; /* 5px */
  background: var(--surface-2);
  border-bottom: 1px solid var(--border);
  border-radius: 0;
}

.al-tabbar :deep(.al-tabbar__tab) {
  flex: 1 1 0;
  min-width: 0;
  min-height: 44px;
  padding: 0 0.625rem; /* 10px */
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: var(--al-font-size-caption);
  line-height: 1;
  font-weight: 500;
  color: var(--text-secondary);
  background: transparent;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  cursor: pointer;
  white-space: nowrap;
  user-select: none;
}

.al-tabbar--square :deep(.al-tabbar__tab) {
  border-radius: 0;
}

.al-tabbar :deep(.al-tabbar__tab[data-state="inactive"]:hover) {
  background: var(--brand-soft);
  color: var(--text-primary);
}

.al-tabbar :deep(.al-tabbar__tab[data-state="active"]) {
  background: var(--bg);
  border-color: var(--border);
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.06);
  color: var(--brand);
  font-weight: 700;
}
.al-tabbar :deep(.al-tabbar__tab[data-state="active"]:hover) {
  color: var(--brand-hover);
  box-shadow: 0 2px 4px rgb(0 0 0 / 0.08);
}

.al-tabbar :deep(.al-tabbar__tab[data-state="inactive"]:active) {
  background: var(--brand-soft-2);
}
.al-tabbar :deep(.al-tabbar__tab[data-state="active"]:active) {
  box-shadow: 0 1px 1px rgb(0 0 0 / 0.05);
}

.al-tabbar :deep(.al-tabbar__tab:focus-visible) {
  outline: 3px solid var(--brand);
  outline-offset: 2px;
}

@media (prefers-reduced-motion: no-preference) {
  .al-tabbar :deep(.al-tabbar__tab) {
    transition:
      background-color 0.15s,
      color 0.15s,
      border-color 0.15s,
      box-shadow 0.15s;
  }
  .al-tabbar :deep(.al-tabbar__tab:active) {
    transform: translateY(0.5px);
  }
}
</style>
