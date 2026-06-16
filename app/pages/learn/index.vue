<script setup lang="ts">
/**
 * `/learn` bare-path redirect.
 *
 * There's no meaningful landing for the reader without a specific
 * topic, so anyone hitting `/learn` is sent to the first topic of
 * the first category. Keeping the choice here (rather than in a
 * nuxt.config routeRule) lets it react to the live topic list — if
 * the first category becomes empty, the next one wins.
 */
definePageMeta({ layout: "learn" });

const { t } = useI18n();
const { groups, status } = useLearnTopicTree();

// The topic tree resolves via `useLearnTopics`' useAsyncData. While it's still
// loading we wait (showing the spinner); once a first topic exists we redirect
// to it. If the list resolves empty — or the content query errors — fall back
// to `/` rather than leaving the reader stuck on the spinner. The status gate
// is what distinguishes "not loaded yet" from "loaded but empty", so we don't
// bounce to `/` during the normal pre-load tick.
watchEffect(() => {
  const firstTopic = groups.value[0]?.topics[0];
  if (firstTopic) {
    navigateTo(`/learn/${firstTopic.id}`, { replace: true });
    return;
  }
  if (status.value === "success" || status.value === "error") {
    navigateTo("/", { replace: true });
  }
});
</script>

<template>
  <!--
    Visible only for the brief moment before navigation resolves.
    Reuses the loading affordance from the topic page so the
    transition doesn't flash a different style.
  -->
  <div class="flex items-center justify-center gap-2 py-16">
    <UIcon
      name="i-lucide-loader-circle"
      class="size-6 animate-spin text-(--text-muted)"
      aria-hidden="true"
    />
    <span class="sr-only">{{ t('learn.readMode.loading') }}</span>
  </div>
</template>
