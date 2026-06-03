<script setup lang="ts">
/**
 * Categorised index of Learn topics, rendered as an accordion via
 * UContentNavigation. Used by the learn layout as the left-rail tree
 * and by its mobile slideover (same instance).
 *
 * Each leaf renders as a real `NuxtLink` to `/learn/<topicId>` — the
 * `path` is set to the real route, so middle-click / open-in-new-tab
 * / right-click "copy link" all do the right thing. Plain left-clicks
 * are intercepted to use `switchTopic` instead of `push`, so flipping
 * between topics in the tree doesn't bloat browser history.
 */
import type { ContentNavigationItem } from "@nuxt/content";

const props = defineProps<{
  activeId?: string | null;
}>();

const emit = defineEmits<{
  (e: "select", topicId: string): void;
}>();

const { t } = useI18n();
const { groups } = useLearnTopicTree();
const { switchTopic } = useReadMode();

const navigation = computed<ContentNavigationItem[]>(() =>
  groups.value.map((group) => ({
    title: t(group.category.titleKey),
    // Category nodes are accordion triggers — no path of their own.
    path: "",
    // Pre-open the category that contains the active topic so the
    // user lands in the right place without expanding manually.
    defaultOpen: group.topics.some((t) => t.id === props.activeId),
    children: group.topics.map((topic) => ({
      title: topic.title,
      // Real route — so right-click / middle-click / "copy link" all
      // produce a useful URL. Plain left-clicks are intercepted by
      // onClick below to switch via replace() and keep history tidy.
      path: `/learn/${topic.id}`,
      active: topic.id === props.activeId,
      onClick: (event: MouseEvent) => onTopicLinkClick(event, topic.id),
    })),
  })),
);

function onTopicLinkClick(event: MouseEvent, topicId: string) {
  // Preserve modifier-click behaviour for anyone trying to deliberately
  // open in a new tab / window — the link's href is real, so the
  // browser's native handling will do the right thing.
  if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) {
    return;
  }
  event.preventDefault();
  switchTopic(topicId);
  // Surfaces the choice to the parent layout so it can dismiss any
  // mobile slideover that was hosting this tree.
  emit("select", topicId);
}
</script>

<template>
  <UContentNavigation
    :navigation="navigation"
    variant="link"
    highlight
    highlight-color="primary"
    type="multiple"
    :aria-label="t('learn.index.title')"
    :ui="{
      link: 'text-xl pl-8',
      linkTitle: 'text-xl whitespace-normal break-words text-left w-10/12',
    }"
  />
</template>
