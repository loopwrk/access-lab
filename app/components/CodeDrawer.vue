<script setup lang="ts">
import { prettifyCss } from '~/utils/prettifyCss'

const { t } = useI18n()
const { renderedHtml, renderedCss } = useRenderedHtml()
const { convert: toClassHtml } = useInlineToClass()

const codeView = ref<'html' | 'css'>('html')
const hasCss = computed(() => renderedCss.value.trim().length > 0)
const prettifiedCss = computed(() => prettifyCss(renderedCss.value))

// When CSS becomes unavailable mid-session (e.g. user switches off a
// feature), fall back to HTML so the drawer isn't stuck on an empty view.
watch(hasCss, (present) => {
  if (!present && codeView.value === 'css') codeView.value = 'html'
})

const copied = ref<'inline' | 'class' | 'error' | null>(null)

async function copyHtml(mode: 'inline' | 'class') {
  const text = mode === 'inline'
    ? renderedHtml.value
    : (toClassHtml(renderedHtml.value) ?? renderedHtml.value)
  try {
    await navigator.clipboard.writeText(text)
    copied.value = mode
    setTimeout(() => {
      copied.value = null
    }, 800)
  } catch (err) {
    console.error('Failed to copy to clipboard:', err)
    copied.value = 'error'
    setTimeout(() => {
      copied.value = null
    }, 800)
  }
}
</script>

<template>
  <UCollapsible
    default-open
    class="border-t border-(--border) bg-(--surface)"
  >
    <UButton
      :label="t('codeDrawer.label')"
      color="neutral"
      variant="ghost"
      block
      trailing-icon="i-lucide-chevron-down"
      class="group"
      :ui="{ trailingIcon: 'group-data-[state=open]:rotate-180 transition-transform duration-200' }"
    />
    <template #content>
      <div class="flex flex-col gap-2 px-5 pb-4">
        <UFieldGroup
          v-if="hasCss"
          size="xs"
        >
          <UButton
            :color="codeView === 'html' ? 'primary' : 'neutral'"
            :variant="codeView === 'html' ? 'solid' : 'ghost'"
            @click="codeView = 'html'"
          >
            HTML
          </UButton>
          <UButton
            :color="codeView === 'css' ? 'primary' : 'neutral'"
            :variant="codeView === 'css' ? 'solid' : 'ghost'"
            @click="codeView = 'css'"
          >
            CSS
          </UButton>
        </UFieldGroup>

        <div class="max-h-[220px] overflow-auto">
          <ProsePre
            v-if="renderedHtml && codeView === 'html'"
            language="html"
            :code="renderedHtml"
          >
            {{ renderedHtml }}
          </ProsePre>
          <ProsePre
            v-else-if="hasCss && codeView === 'css'"
            language="css"
            :code="prettifiedCss"
          >
            {{ prettifiedCss }}
          </ProsePre>
          <p
            v-else
            class="text-(length:--al-font-size-body) text-(--text-muted) m-0 py-2"
          >
            {{ t('codeDrawer.empty') }}
          </p>
        </div>

        <p
          class="text-(length:--al-font-size-caption) font-semibold text-(--text-muted) uppercase tracking-[0.06em] m-0"
        >
          {{ t('codeDrawer.copyLabel') }}
        </p>
        <div class="flex gap-2 justify-start">
          <UFieldGroup>
            <UButton
              class="min-w-[110px] flex justify-center"
              size="md"
              variant="ghost"
              color="neutral"
              :disabled="!renderedHtml"
              @click="copyHtml('inline')"
            >
              {{ copied === 'inline' ? t('codeDrawer.copied') : t('codeDrawer.copyInline') }}
            </UButton>
          </UFieldGroup>
          <UFieldGroup>
            <UButton
              class="min-w-[150px] flex justify-center"
              size="md"
              variant="ghost"
              color="neutral"
              :disabled="!renderedHtml"
              @click="copyHtml('class')"
            >
              {{ copied === 'class' ? t('codeDrawer.copied') : t('codeDrawer.copyClasses') }}
            </UButton>
          </UFieldGroup>
        </div>
      </div>
    </template>
  </UCollapsible>
</template>
