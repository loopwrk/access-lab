<script setup lang="ts">
import { prettifyCss } from '~/utils/prettifyCss'
import { prettifyHtml } from '~/utils/prettifyHtml'

const { t } = useI18n()
const { renderedHtml, renderedCss } = useRenderedHtml()
const { convert: toClassHtml } = useInlineToClass()

const isOpen = ref(true)
const codeView = ref<'html' | 'css'>('html')

const converted = computed(() => toClassHtml(renderedHtml.value))

// CSS pane content: studio-injected rules first, then (if the user
// has set inline styles) the class-converted block, separated by a
// comment so the source of each block is unambiguous.
const combinedCss = computed(() => {
  const studio = renderedCss.value.trim()
  const cls = converted.value?.css.trim() ?? ''
  if (studio && cls) {
    return `${studio}\n\n/* Class-converted from inline styles */\n${cls}`
  }
  return studio || cls
})

const hasCss = computed(() => combinedCss.value.length > 0)

// If the user enables a feature that adds CSS, then turns it off
// while viewing the CSS tab, fall back to HTML so the pane isn't
// left on an empty view.
watch(hasCss, (present) => {
  if (!present && codeView.value === 'css') codeView.value = 'html'
})

const prettifiedHtml = computed(() => prettifyHtml(renderedHtml.value))
const prettifiedCss = computed(() => prettifyCss(combinedCss.value))

// User-resizable code area. Height persists per-session via
// localStorage. Bounded so the drawer can't swallow the preview or
// shrink so small the code is useless.
const MIN_HEIGHT = 80
const MAX_HEIGHT_VH = 70
const DEFAULT_HEIGHT = 220
const KEYBOARD_STEP_PX = 24

const codeAreaHeight = useLocalStorage('al-code-drawer-height', DEFAULT_HEIGHT)
const isDragging = ref(false)

function maxHeightPx(): number {
  if (typeof window === 'undefined') return MAX_HEIGHT_VH * 8
  return Math.round((window.innerHeight * MAX_HEIGHT_VH) / 100)
}

function clamp(value: number): number {
  return Math.max(MIN_HEIGHT, Math.min(maxHeightPx(), value))
}

const effectiveHeight = computed(() => clamp(codeAreaHeight.value))

let dragStartY = 0
let dragStartHeight = 0

function onPointerDown(event: PointerEvent) {
  isDragging.value = true
  dragStartY = event.clientY
  dragStartHeight = effectiveHeight.value;
  (event.currentTarget as Element).setPointerCapture(event.pointerId)
  window.addEventListener('pointermove', onPointerMove)
  window.addEventListener('pointerup', onPointerUp, { once: true })
  document.body.style.userSelect = 'none'
}

function onPointerMove(event: PointerEvent) {
  const delta = dragStartY - event.clientY
  codeAreaHeight.value = clamp(dragStartHeight + delta)
}

function onPointerUp() {
  isDragging.value = false
  window.removeEventListener('pointermove', onPointerMove)
  document.body.style.userSelect = ''
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'ArrowUp') {
    event.preventDefault()
    codeAreaHeight.value = clamp(effectiveHeight.value + KEYBOARD_STEP_PX)
  } else if (event.key === 'ArrowDown') {
    event.preventDefault()
    codeAreaHeight.value = clamp(effectiveHeight.value - KEYBOARD_STEP_PX)
  } else if (event.key === 'Home') {
    event.preventDefault()
    codeAreaHeight.value = MIN_HEIGHT
  } else if (event.key === 'End') {
    event.preventDefault()
    codeAreaHeight.value = maxHeightPx()
  }
}

onBeforeUnmount(() => {
  window.removeEventListener('pointermove', onPointerMove)
  document.body.style.userSelect = ''
})

const copied = ref<'inline' | 'class' | 'css' | 'error' | null>(null)

async function copyContent(mode: 'inline' | 'class' | 'css') {
  let text = ''
  if (mode === 'inline') {
    text = prettifiedHtml.value
  } else if (mode === 'class') {
    text = prettifyHtml(converted.value?.html ?? renderedHtml.value)
  } else if (mode === 'css') {
    text = prettifiedCss.value
  }
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
  <div>
    <!--
      Resize handle at the drawer's top edge — where it borders the
      preview area above.
    -->
    <div v-if="isOpen" role="separator" aria-orientation="horizontal" :aria-label="t('codeDrawer.resizeLabel')"
      :aria-valuenow="effectiveHeight" :aria-valuemin="MIN_HEIGHT" :aria-valuemax="maxHeightPx()" tabindex="0" :class="[
        'h-1.5 cursor-row-resize outline-none transition-colors',
        isDragging
          ? 'bg-(--brand)'
          : 'bg-(--border) hover:bg-(--brand) focus-visible:bg-(--brand)'
      ]" @pointerdown="onPointerDown" @keydown="onKeydown" />
    <UCollapsible v-model:open="isOpen" :class="[
      'bg-(--surface)',
      isOpen ? '' : 'border-t border-(--border)'
    ]">
      <UButton :aria-label="t('codeDrawer.toggleAria')" color="neutral" variant="ghost" block
        trailing-icon="i-lucide-chevron-down" size="sm" class="group justify-end" :ui="{
          trailingIcon:
            'group-data-[state=open]:rotate-180 transition-transform duration-200'
        }" />
      <template #content>
        <div class="flex flex-col gap-3 px-5 pb-4">
          <!--
            View tabs. CSS stays present-but-disabled when there is
            nothing to show, so the user always sees the surface and
            learns that CSS can appear here.
          -->
          <UFieldGroup size="xs">
            <UButton :color="codeView === 'html' ? 'primary' : 'neutral'"
              :variant="codeView === 'html' ? 'solid' : 'ghost'" @click="codeView = 'html'">
              HTML
            </UButton>
            <UTooltip :text="!hasCss ? t('codeDrawer.cssDisabledTooltip') : undefined">
              <UButton :color="codeView === 'css' ? 'primary' : 'neutral'"
                :variant="codeView === 'css' ? 'solid' : 'ghost'" :disabled="!hasCss" @click="codeView = 'css'">
                CSS
              </UButton>
            </UTooltip>
          </UFieldGroup>

          <div class="overflow-auto rounded bg-(--surface-2)" :style="{ height: `${effectiveHeight}px` }">
            <ProsePre v-if="renderedHtml && codeView === 'html'" language="html" :code="prettifiedHtml">
              {{ prettifiedHtml }}
            </ProsePre>
            <ProsePre v-else-if="hasCss && codeView === 'css'" language="css" :code="prettifiedCss">
              {{ prettifiedCss }}
            </ProsePre>
            <p v-else class="text-(length:--al-font-size-body) text-(--text-muted) m-0 py-2 px-3">
              {{ t('codeDrawer.empty') }}
            </p>
          </div>

          <!--
            Copy actions are contextual to the active tab. HTML gets
            the inline-vs-classes split; CSS gets a single Copy CSS.
          -->
          <div v-if="codeView === 'html'" class="flex gap-2 justify-start">
            <UButton class="min-w-[110px] flex justify-center" size="md" variant="ghost" color="neutral"
              :icon="copied === 'inline' ? 'i-lucide-check' : undefined" :disabled="!renderedHtml"
              @click="copyContent('inline')">
              {{ copied === 'inline'
                ? t('codeDrawer.copied')
                : t('codeDrawer.copyInline') }}
            </UButton>
            <UTooltip :text="t('codeDrawer.copyClassesTooltip')">
              <UButton class="min-w-[150px] flex justify-center" size="md" variant="ghost" color="neutral"
                :icon="copied === 'class' ? 'i-lucide-check' : undefined" :disabled="!renderedHtml"
                @click="copyContent('class')">
                {{ copied === 'class'
                  ? t('codeDrawer.copied')
                  : t('codeDrawer.copyClasses') }}
              </UButton>
            </UTooltip>
          </div>
          <div v-else-if="codeView === 'css'" class="flex gap-2 justify-start">
            <UButton class="min-w-[110px] flex justify-center" size="md" variant="ghost" color="neutral"
              :icon="copied === 'css' ? 'i-lucide-check' : undefined" :disabled="!hasCss" @click="copyContent('css')">
              {{ copied === 'css'
                ? t('codeDrawer.copied')
                : t('codeDrawer.copyCss') }}
            </UButton>
          </div>
        </div>
      </template>
    </UCollapsible>
  </div>
</template>
