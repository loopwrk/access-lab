<script setup lang="ts">
import { onClickOutside } from '@vueuse/core'
import type {
  ComponentVariant,
  ComponentVariantStatus,
} from '~/types/component'

interface Props {
  modelValue: string
  variants: ComponentVariant[]
  placeholder?: string
  title?: string
}

const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()

const props = withDefaults(defineProps<Props>(), {
  placeholder: () => '',
  title: () => '',
})

const resolvedPlaceholder = computed(
  () => props.placeholder || t('variantPicker.placeholder'),
)
const resolvedTitle = computed(() => props.title || t('variantPicker.title'))

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const isOpen = ref(false)
const triggerRef = ref<HTMLElement | null>(null)

function closeIfOpen() {
  if (isOpen.value) isOpen.value = false
}

onClickOutside(triggerRef, closeIfOpen, {
  ignore: ['[data-slot="content"]'],
})

usePreviewIframeOutsideClick(closeIfOpen)

const selectedVariant = computed(() =>
  props.variants.find(variant => variant.key === props.modelValue),
)

const triggerLabel = computed(
  () => selectedVariant.value?.label ?? props.placeholder,
)

interface StatusVisual {
  color: 'success' | 'info' | 'warning' | 'neutral'
  icon: string
}

const STATUS_VISUALS: Record<ComponentVariantStatus, StatusVisual> = {
  recommended: { color: 'success', icon: 'i-lucide-check' },
  info: { color: 'info', icon: 'i-lucide-info' },
  avoid: { color: 'warning', icon: 'i-lucide-triangle-alert' },
  rare: { color: 'warning', icon: 'i-lucide-triangle-alert' },
  neutral: { color: 'neutral', icon: 'i-lucide-info' },
}

interface VariantSection {
  heading: string | undefined
  items: ComponentVariant[]
}

const sections = computed<VariantSection[]>(() => {
  const grouped: VariantSection[] = []
  let currentHeading: string | undefined
  let currentItems: ComponentVariant[] = []

  for (const variant of props.variants) {
    if (variant.section !== currentHeading) {
      if (currentItems.length) {
        grouped.push({ heading: currentHeading, items: currentItems })
      }
      currentHeading = variant.section
      currentItems = []
    }
    currentItems.push(variant)
  }
  if (currentItems.length) {
    grouped.push({ heading: currentHeading, items: currentItems })
  }
  return grouped
})

function visualFor(status?: ComponentVariantStatus): StatusVisual | null {
  return status ? STATUS_VISUALS[status] : null
}

function isSelected(key: string): boolean {
  return key === props.modelValue
}

function select(key: string) {
  emit('update:modelValue', key)
  isOpen.value = false
}

function openSeeAlso(topicId: string) {
  isOpen.value = false
  focusLearnTopic(topicId)
}

const { te } = useI18n()
function maybeTranslate(value?: string): string {
  if (!value) return ''
  return te(value) ? t(value) : value
}
</script>

<template>
  <div class="inline-flex items-stretch border border-(--border) bg-(--surface-2)">
    <span
      class="flex items-center pl-3 text-(length:--al-font-size-caption) font-semibold uppercase tracking-wider text-(--text-muted)">
      {{ t('variantPicker.markup') }}
    </span>
    <USeparator orientation="vertical" :ui="{ border: 'border-(--border)' }" />
    <div class="flex items-center gap-2 px-3 py-1.5">
      <UPopover v-model:open="isOpen" :modal="false" :dismissible="true" :ui="{
        content: 'min-w-[480px] rounded-none bg-(--surface) border border-(--border-strong) shadow-lg'
      }">
        <button ref="triggerRef" type="button"
          class="inline-flex items-center gap-2 px-2.5 py-1 bg-(--brand-soft) text-(--brand) font-mono text-(length:--al-font-size-body) cursor-pointer hover:bg-(--brand-soft-2) transition-colors"
          :aria-haspopup="true" :aria-expanded="isOpen">
          <span>{{ selectedVariant?.label ?? resolvedPlaceholder }}</span>
          <UIcon name="i-lucide-chevron-down" class="size-3.5" aria-hidden="true" />
        </button>

        <template #content>
          <div class="max-h-[calc(100vh-8rem)] overflow-y-auto bg-(--surface)">
            <div class="px-4 py-3 bg-(--brand-soft) border-b border-(--border)">
              <p
                class="m-0 text-(length:--al-font-size-caption) font-semibold uppercase tracking-wider text-(--text-muted)">
                {{ resolvedTitle }}
              </p>
            </div>

            <div v-for="(section, sectionIndex) in sections" :key="section.heading ?? sectionIndex">
              <USeparator v-if="sectionIndex > 0" />

              <div class="py-2">
                <div v-for="variant in section.items" :key="variant.key"
                  class="border-l-4 transition-colors"
                  :class="isSelected(variant.key)
                    ? 'bg-(--brand-soft) border-(--brand)'
                    : 'border-transparent hover:bg-(--surface-2)'">
                  <button type="button"
                    :aria-current="isSelected(variant.key) ? 'true' : undefined"
                    class="w-full text-left px-4 py-3 flex flex-col gap-2 cursor-pointer focus-visible:bg-(--surface-2)"
                    @click="select(variant.key)">
                    <span class="flex items-center gap-2 flex-wrap">
                      <code
                        class="font-mono text-(length:--al-font-size-body) bg-(--surface-2) text-(--text-primary) px-2 py-0.5">
                        {{ variant.label }}
                      </code>
                      <UBadge v-if="variant.status === 'recommended'" color="success" variant="soft" size="sm"
                        :ui="{ base: 'rounded-none uppercase tracking-wider' }">
                        {{ t('variantPicker.recommended') }}
                      </UBadge>
                    </span>

                    <span v-if="variant.description" class="text-(length:--al-font-size-body) text-(--text-secondary)">
                      {{ maybeTranslate(variant.description) }}
                    </span>

                    <UBadge v-if="variant.statusNote && visualFor(variant.status)"
                      :color="visualFor(variant.status)!.color" :icon="visualFor(variant.status)!.icon" variant="soft"
                      size="md" :ui="{
                        base: variant.status === 'neutral'
                          ? 'rounded-none self-start bg-(--surface-2) text-(--text-secondary)'
                          : 'rounded-none self-start'
                      }">
                      {{ maybeTranslate(variant.statusNote) }}
                    </UBadge>
                  </button>

                  <div v-if="variant.seeAlsoTopicId" class="px-4 pb-3 -mt-1">
                    <a :href="`#topic-${variant.seeAlsoTopicId}`"
                      class="see-also-link inline-flex items-center gap-1 text-(length:--al-font-size-detail) text-(--text-secondary)"
                      @click.prevent="openSeeAlso(variant.seeAlsoTopicId)">
                      {{ t('variantPicker.seeAlso') }}
                      <UIcon name="i-lucide-arrow-up-right" class="size-3 opacity-70" aria-hidden="true" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </template>
      </UPopover>
    </div>
  </div>
</template>

<style scoped>
.see-also-link {
  text-decoration: none;
  cursor: pointer;
}

.see-also-link:hover,
.see-also-link:focus-visible {
  color: var(--brand);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.see-also-link:focus-visible {
  outline: 3px solid var(--focus-ring);
  outline-offset: 2px;
}
</style>
