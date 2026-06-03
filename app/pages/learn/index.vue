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

const { groups } = useLearnTopicTree();

// We can't `await` reactive state during setup the way we would a
// promise, but the tree is resolved by the time the page renders
// thanks to `useLearnTopics`' useAsyncData. If for some reason the
// list is empty (e.g. content build hasn't completed yet), fall back
// to `/` rather than getting stuck on a blank page.
watchEffect(() => {
  const firstTopic = groups.value[0]?.topics[0];
  if (firstTopic) {
    navigateTo(`/learn/${firstTopic.id}`, { replace: true });
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
    <span class="sr-only">Loading…</span>
  </div>
</template>
