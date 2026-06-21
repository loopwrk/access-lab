<script setup lang="ts">
/**
 * Single learn-topic article. The topic id comes from the route
 * params, which is the only source of truth for "what am I reading."
 *
 * Layout, AppBar, tree aside, slideover, close button all live in
 * `layouts/learn.vue` - this file is just the article body. Keeps
 * the page focused on content rendering.
 *
 * `definePageMeta({ key })` forces a fresh component instance per
 * topicId, which (a) ensures the article element re-mounts so the
 * focus-on-load behaviour fires for screen-reader users on every
 * topic change, and (b) avoids any subtle staleness from the old
 * topic's DOM lingering during reactivity transitions.
 */
definePageMeta({
  layout: "learn",
  key: (route) => route.path,
});

const { t } = useI18n();
const route = useRoute();

const topicId = computed(() => {
  const raw = route.params.topicId;
  return Array.isArray(raw) ? raw[0] : raw;
});

// useAsyncData is *cached by key*. The page re-mounts per topic
// (via `definePageMeta({ key })` below), so we want each topic to
// have its own cache slot - otherwise the second mount hits the
// first topic's cached value and returns it without re-fetching
// (the `watch` only fires on subsequent changes, not initial mount).
// Capturing `topicId.value` at setup time gives each fresh mount a
// unique, stable key for its lifetime - no watch needed.
const cacheKey = `learn-topic-page:${topicId.value}`;

const { data: doc, status } = useAsyncData(cacheKey, () => {
  const id = topicId.value;
  if (!id) return Promise.resolve(null);
  return queryCollection("content").where("topicId", "=", id).first();
});

const articleRef = ref<HTMLElement | null>(null);

// Move focus into the article once the markdown has resolved so a
// screen-reader user lands at the title and can read forward
// immediately. Pointer users can still scroll/click freely.
//
// `preventScroll: true` is important under SSR: without it, the
// browser scroll-into-views the focused article on hydration, which
// (because the article is already in the initial HTML and tall) ends
// up pushing the AppBar + toolbar above the viewport. The focus
// itself is what matters for AT users; the scroll-on-focus side
// effect is purely cosmetic and unwanted.
watch([status, articleRef], ([currentStatus, el]) => {
  if (currentStatus === "success" && el) {
    nextTick(() => el.focus({ preventScroll: true }));
  }
});
</script>

<template>
  <div
    v-if="status === 'pending'"
    class="flex items-center justify-center gap-2 py-16"
  >
    <UIcon
      name="i-lucide-loader-circle"
      class="size-6 animate-spin text-(--text-muted)"
      aria-hidden="true"
    />
    <span class="sr-only">{{ t("learn.readMode.loading") }}</span>
  </div>

  <div
    v-else-if="!doc"
    class="flex flex-col items-center justify-center gap-3 py-16"
  >
    <UIcon
      name="i-lucide-file-question"
      class="size-8 text-(--text-muted)"
      aria-hidden="true"
    />
    <p class="text-(--text-muted) text-(length:--al-font-size-body)">
      {{ t("learn.readMode.notFound") }}
    </p>
    <!--
      Surface the "go home" affordance here too. On desktop the
      layout's close button is also present; on mobile it's hidden,
      so this is the only escape hatch - explicit text rather than
      an icon so screen-reader users get a clear destination.
    -->
    <UButton
      color="neutral"
      variant="outline"
      size="sm"
      :to="'/'"
    >
      {{ t("learn.readMode.goBack") }}
    </UButton>
  </div>

  <!--
    tabindex=-1 so focus can move here programmatically once the
    article resolves. The frontmatter `title` is rendered as the
    <h1> so the markdown body stays focused on section content
    (## and below) - single source of truth for the article title.
  -->
  <article
    v-else
    ref="articleRef"
    tabindex="-1"
    class="mx-auto max-w-[66ch] px-4 py-6 sm:px-8 sm:py-10 focus:outline-none read-mode-prose"
  >
    <h1 v-if="doc.title">
      {{ doc.title }}
    </h1>
    <ContentRenderer
      :value="doc"
      prose
    />
  </article>
</template>

<style scoped>
/*
 * Prose customisation. Nuxt Content's ContentRenderer + Tailwind
 * Typography handles the heavy lifting; this only overrides what the
 * defaults can't express through Tailwind utilities - namely token-
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
  font-size: var(--al-learn-h1-font-size);
  font-weight: 600;
  line-height: 1.2;
  color: var(--al-learn-h1-color);
  margin: 0 0 0.75rem;
}

.read-mode-prose :deep(h2) {
  font-size: var(--al-learn-h2-font-size);
  font-weight: 600;
  line-height: 1.25;
  color: var(--al-learn-h2-color);
  margin: 2rem 0 0.5rem;
}

.read-mode-prose :deep(h3) {
  font-size: var(--al-learn-h3-font-size);
  font-weight: 600;
  line-height: 1.3;
  color: var(--al-learn-h3-color);
  margin: 1.5rem 0 0.5rem;
}

.read-mode-prose :deep(h4) {
  font-size: var(--al-learn-h4-font-size);
  line-height: 1.3;
  color: var(--al-learn-h4-color);
}

.read-mode-prose :deep(h5) {
  font-size: var(--al-learn-h5-font-size);
  line-height: 1.3;
  color: var(--al-learn-h5-color);
}

.read-mode-prose :deep(p) {
  font-size: var(--al-learn-paragraph-font-size);
  color: var(--text-secondary);
  margin: 0 0 1rem;
}

.read-mode-prose :deep(ul),
.read-mode-prose :deep(ol) {
  font-size: var(--al-learn-list-item-font-size);
  padding-left: 1.5rem;
  margin: 0 0 1rem;
}

.read-mode-prose :deep(li) {
  font-size: var(--al-learn-list-item-font-size);
  color: var(--text-secondary);
  margin-bottom: 0.375rem;
}

.read-mode-prose :deep(code) {
  font-family: var(--al-font-mono);
  font-size: var(--al-learn-code-font-size);
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
  font-size: var(--al-learn-code-block-font-size);
  line-height: 1.5;
}

.read-mode-prose :deep(pre code) {
  font-size: 0.9em;
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

.read-mode-prose :deep(th),
.read-mode-prose :deep(td) {
  font-size: var(--al-learn-paragraph-font-size);
  color: var(--text-secondary);
}

.read-mode-prose :deep(strong) {
  color: var(--text-primary);
}

@media (max-width: 640px) {
  .read-mode-prose :deep(code) {
    white-space: normal;
    overflow-wrap: break-word;
  }

  .read-mode-prose :deep(table) {
    display: block;
    max-width: 100%;
    overflow-x: auto;
  }
}
</style>
