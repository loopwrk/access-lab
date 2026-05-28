<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import type { ContextWrapper } from '~/types/component'

interface Props {
  modelValue: string[]
  options: ContextWrapper[]
  /** The inspected element's tag name (e.g. 'button'). Used in ARIA. */
  elementName?: string
}

const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()

const props = withDefaults(defineProps<Props>(), {
  elementName: () => 'element'
})

const emit = defineEmits<{
  'update:modelValue': [value: string[]]
}>()

const NONE_KEY = '__none__'

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)

function closeIfOpen() {
  if (isOpen.value) isOpen.value = false
}

onClickOutside(triggerRef, closeIfOpen, {
  ignore: ['[data-slot="content"]'],
})

usePreviewIframeOutsideClick(closeIfOpen)

const selectedWrapper = computed<ContextWrapper | null>(() => {
  const key = props.modelValue[0]
  if (!key) return null
  return props.options.find(w => w.key === key) ?? null
})

const triggerLabel = computed(() =>
  selectedWrapper.value?.label ?? t('wrapperToggles.containerNone')
)

function isSelected(key: string): boolean {
  return key === (props.modelValue[0] ?? NONE_KEY)
}

function select(key: string) {
  if (key === NONE_KEY) {
    emit('update:modelValue', [])
  } else {
    // Replace, not append — single-select semantics.
    emit('update:modelValue', [key])
  }
  isOpen.value = false
}
</script>

<template>
  <div class="inline-flex items-stretch">
    <span class="flex items-center px-3 text-(length:--al-font-size-body) text-(--text-secondary)">
      {{ t('wrapperToggles.containerLabel') }}
    </span>
    <div class="flex items-center gap-2 px-3 py-1.5">
      <UPopover v-model:open="isOpen" :modal="false" :dismissible="true" :ui="{
        content: 'min-w-[12rem] rounded-none bg-(--surface) border border-(--border-strong) shadow-lg'
      }">
        <button ref="triggerRef" type="button"
          class="inline-flex items-center gap-2 px-2.5 py-1 bg-(--brand-soft) text-(--brand) font-mono text-(length:--al-font-size-body) cursor-pointer hover:bg-(--brand-soft-2) transition-colors"
          :aria-haspopup="true" :aria-expanded="isOpen"
          :aria-label="t('wrapperToggles.containerAria', { name: elementName })">
          <span>{{ triggerLabel }}</span>
          <UIcon name="i-lucide-chevron-down" class="size-3.5" aria-hidden="true" />
        </button>

        <template #content>
          <div class="max-h-[calc(100vh-8rem)] overflow-y-auto bg-(--surface) py-2">
            <button type="button" :aria-current="isSelected(NONE_KEY) ? 'true' : undefined"
              class="w-full text-left px-4 py-2 flex items-center gap-2 cursor-pointer border-l-4 transition-colors"
              :class="isSelected(NONE_KEY)
                ? 'bg-(--brand-soft) border-(--brand)'
                : 'border-transparent hover:bg-(--surface-2)'" @click="select(NONE_KEY)">
              <code
                class="font-mono text-(length:--al-font-size-body) bg-(--surface-2) text-(--text-secondary) px-2 py-0.5">
                {{ t('wrapperToggles.containerNone') }}
              </code>
            </button>

            <button v-for="wrapper in props.options" :key="wrapper.key" type="button"
              :aria-current="isSelected(wrapper.key) ? 'true' : undefined"
              class="w-full text-left px-4 py-2 flex items-center gap-2 cursor-pointer border-l-4 transition-colors"
              :class="isSelected(wrapper.key)
                ? 'bg-(--brand-soft) border-(--brand)'
                : 'border-transparent hover:bg-(--surface-2)'" @click="select(wrapper.key)">
              <code
                class="font-mono text-(length:--al-font-size-body) bg-(--surface-2) text-(--text-primary) px-2 py-0.5">
                {{ wrapper.label }}
              </code>
            </button>
          </div>
        </template>
      </UPopover>
    </div>

    <template v-if="selectedWrapper?.learnTopicId">
      <span class="self-stretch w-px bg-(--border)" aria-hidden="true" />
      <a :href="`#topic-${selectedWrapper.learnTopicId}`"
        class="learn-link inline-flex items-center gap-1 px-3 text-(length:--al-font-size-body) text-(--text-secondary)"
        @click.prevent="focusLearnTopic(selectedWrapper!.learnTopicId!)">
        <span>{{ t('wrapperToggles.containerLearnPrefix') }}</span>
        <code class="font-mono text-(--brand) bg-(--brand-soft) px-1 py-0.5">{{ selectedWrapper.label }}</code>
        <UIcon name="i-lucide-arrow-up-right" class="size-3.5 opacity-70" aria-hidden="true" />
      </a>
    </template>
  </div>
</template>

<style scoped>
.learn-link {
  text-decoration: none;
  cursor: pointer;
}

.learn-link:hover,
.learn-link:focus-visible {
  color: var(--brand);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.learn-link:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
