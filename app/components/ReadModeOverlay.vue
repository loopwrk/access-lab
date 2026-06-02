<script setup lang="ts">
/**
 * ReadModeOverlay — distraction-free reading view for a Learn topic.
 *
 * Renders the selected topic's markdown content via Nuxt Content's
 * ContentRenderer with Tailwind Typography (`prose`). The overlay
 * teleports into `#read-mode-target` inside the app body, sitting
 * above the studio chrome (which the layout marks `inert` while the
 * overlay is open).
 *
 * Accessibility model:
 *   - Non-modal: the AppBar stays focusable so the user can change
 *     theme / font / size while reading.
 *   - Labelled `<section>` (no `role="dialog"`) — semantic region.
 *   - Escape closes; the close button does too.
 *   - Initial focus moves to the article heading; on close, focus
 *     returns to whatever was focused before the overlay opened.
 */
const props = defineProps<{
  topicId: string
}>()

const emit = defineEmits<{
  (e: 'close'): void
}>()

const { t } = useI18n()

// Match by the frontmatter `topicId` field — the canonical id that
// also keys the in-app Learn-topic registry. Filename isn't load-
// bearing here, so renames don't break the link.
// const { data: doc, status } = useAsyncData(
//   () => `read-mode-${props.topicId}`,
//   () =>
//     queryCollection('content')
//       .where('topicId', '=', props.topicId)
//       .first()
// )

const { data: doc, status } = useAsyncData(
  `read-mode-${props.topicId}`,  // ✅ static string
  () =>
    queryCollection('content')
      .where('topicId', '=', props.topicId)
      .first()
)

const overlayRef = ref<HTMLElement | null>(null)
const articleRef = ref<HTMLElement | null>(null)

let previouslyActive: Element | null = null

onMounted(() => {
  previouslyActive = document.activeElement
})

// Once the markdown has resolved, move focus into the article so
// screen-reader users land at the title and can read forward
// immediately. Pointer users can still scroll/click freely.
watch(
  [status, articleRef],
  ([currentStatus, el]) => {
    if (currentStatus === 'success' && el) {
      nextTick(() => el.focus())
    }
  }
)

function close() {
  emit('close')
  if (previouslyActive instanceof HTMLElement) {
    nextTick(() => previouslyActive instanceof HTMLElement && previouslyActive.focus())
  }
}

function onKeydown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    close()
  }
}
</script>

<template>
  <Teleport to="#read-mode-target">
    <section ref="overlayRef" :aria-label="t('learn.readMode.ariaLabel')"
      class="absolute inset-0 z-40 flex flex-col bg-(--bg) text-(--text-secondary)" @keydown="onKeydown">
      <!--
        Toolbar uses a plain <span> rather than a heading so the
        markdown content's own <h1> remains the structural top of
        this region — heading order stays predictable for screen
        readers navigating by heading.
      -->
      <div class="shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b border-(--border)">
        <span class="font-semibold text-(length:--al-font-size-body) text-(--text-primary) truncate">
          {{ t('learn.readMode.title') }}
        </span>
        <UButton color="neutral" variant="ghost" size="sm" icon="i-lucide-x" :aria-label="t('learn.readMode.close')"
          @click="close">
          {{ t('learn.readMode.close') }}
        </UButton>
      </div>

      <div class="flex-1 overflow-y-auto">
        <div v-if="status === 'pending'" class="flex items-center justify-center gap-2 py-16">
          <UIcon name="i-lucide-loader-circle" class="size-6 animate-spin text-(--text-muted)" aria-hidden="true" />
          <span class="sr-only">{{ t('learn.readMode.loading') }}</span>
        </div>

        <div v-else-if="!doc" class="flex flex-col items-center justify-center gap-3 py-16">
          <UIcon name="i-lucide-file-question" class="size-8 text-(--text-muted)" aria-hidden="true" />
          <p class="text-(--text-muted) text-(length:--al-font-size-body)">
            {{ t('learn.readMode.notFound') }}
          </p>
          <UButton color="neutral" variant="outline" size="sm" @click="close">
            {{ t('learn.readMode.goBack') }}
          </UButton>
        </div>

        <!--
          tabindex=-1 so focus can move here programmatically on mount;
          the surrounding chrome is inert via the layout so tabbing
          stays inside the overlay + AppBar.
        -->
        <article v-else ref="articleRef" tabindex="-1"
          class="mx-auto max-w-[66ch] px-6 py-8 sm:px-8 sm:py-10 focus:outline-none read-mode-prose">
          <!--
            The frontmatter `title` is rendered here as the article's
            <h1> so the markdown body can focus on section content
            (## and below). Keeps the canonical title in one place
            and gives the page a proper heading hierarchy.
          -->
          <h1 v-if="doc.title">{{ doc.title }}</h1>
          <ContentRenderer :value="doc" prose />
        </article>
      </div>
    </section>
  </Teleport>
</template>

<style scoped>
/*
 * Prose customisation. Nuxt Content's ContentRenderer + Tailwind
 * Typography handles the heavy lifting; this only overrides what the
 * defaults can't express through Tailwind utilities — namely token-
 * driven colours, project font-size tokens, and rules that target
 * markdown-emitted elements which can't carry classes.
 *
 * Constrained line length (66ch) and a body line-height of 1.6 are
 * the readability bedrock from accessibility research on long-form
 * reading. Don't change those without a deliberate test.
 */

.read-mode-prose {
  line-height: 1.6;
}

.read-mode-prose :deep(h1) {
  font-size: var(--al-font-size-read-mode-heading);
  font-weight: 600;
  line-height: 1.2;
  color: var(--text-primary);
  margin: 0 0 0.75rem;
}

.read-mode-prose :deep(h2) {
  font-size: var(--al-font-size-read-sub-heading);
  font-weight: 600;
  line-height: 1.25;
  margin: 2rem 0 0.5rem;
}

.read-mode-prose :deep(h3) {
  font-size: calc(var(--al-font-size-body) + 0.125rem);
  font-weight: 600;
  line-height: 1.3;
  color: var(--text-primary);
  margin: 1.5rem 0 0.5rem;
}

.read-mode-prose :deep(p) {
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.read-mode-prose :deep(ul),
.read-mode-prose :deep(ol) {
  padding-left: 1.5rem;
  margin: 0 0 1rem;
}

.read-mode-prose :deep(li) {
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.read-mode-prose :deep(code) {
  font-family: var(--al-font-mono);
  font-size: 0.9em;
  padding: 0.1em 0.35em;
  background: var(--brand-soft);
  color: var(--text-primary);
  border-radius: 3px;
  white-space: nowrap;
}

.read-mode-prose :deep(pre) {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 1rem 1.25rem;
  overflow-x: auto;
  margin: 0 0 1rem;
  font-size: 0.9em;
  line-height: 1.5;
}

.read-mode-prose :deep(pre code) {
  background: transparent;
  padding: 0;
  white-space: pre;
  font-size: inherit;
  color: var(--text-primary);
}

.read-mode-prose :deep(blockquote) {
  border-left: 3px solid var(--brand);
  padding-left: 1rem;
  margin: 1rem 0;
  color: var(--text-muted);
  font-style: italic;
}

.read-mode-prose :deep(a) {
  color: var(--brand);
  text-underline-offset: 2px;
}

.read-mode-prose :deep(a:hover),
.read-mode-prose :deep(a:focus-visible) {
  color: var(--brand-hover);
}

.read-mode-prose :deep(hr) {
  border: none;
  border-top: 1px solid var(--border);
  margin: 2rem 0;
}

.read-mode-prose :deep(strong) {
  color: var(--text-primary);
}
</style>
