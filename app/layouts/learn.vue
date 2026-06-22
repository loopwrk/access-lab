<script setup lang="ts">
/**
 * Layout for the `/learn/*` routes.
 *
 * Distinct from the studio's `default` layout. Just the AppBar
 * kept so the font / contrast / dark-mode controls still apply.
 * A categorised tree aside on desktop, and the article slot
 * filled by `pages/learn/[topicId].vue`.
 */
const { t } = useI18n();
const { activeTopicId, close } = useReadMode();

// Slideover state. Reset to closed whenever the topic changes so the
// user lands on the new article rather than staring at a tree.
const treeOpen = ref(false);

function onTreeSelect() {
  treeOpen.value = false;
}
</script>

<template>
  <div class="grid grid-rows-[auto_1fr] min-h-dvh bg-(--bg) text-(--text-secondary)">
    <AppBar />

    <div class="flex flex-col md:min-h-0 md:overflow-hidden">
      <!--
        Local toolbar: hamburger on mobile to expose the tree, close
        button on desktop to return to the studio. Plain <span> for
        the title (not a heading) so the article's own <h1> stays
        the top of the document outline. Below `md` it is sticky so
        it pins to the top once the AppBar scrolls away.
      -->
      <div
        class="sticky top-0 z-10 bg-(--bg) md:static shrink-0 flex items-center justify-between gap-3 px-5 py-3 border-b border-(--border)"
      >
        <div class="flex items-center gap-2 min-w-0">
          <UButton
            class="md:hidden"
            color="neutral"
            variant="ghost"
            size="sm"
            icon="i-lucide-list"
            :aria-label="t('learn.readMode.openTree')"
            @click="treeOpen = true"
          />
          <span class="font-semibold text-(--text-primary) read-mode-shell-title truncate">
            {{ t("learn.readMode.title") }}
          </span>
        </div>
        <!--
          CSS-based visibility (rather than `v-if`) so the same DOM
          renders on server and client. A JS-driven `v-if` keyed off
          `useMediaQuery` would mismatch hydration: the server has
          no viewport so it always rendered the button, then mobile
          clients would unmount it on mount. `hidden lg:flex` lines
          up with the 1024px threshold used by `useIsBelowDesktop`.
        -->
        <UButton
          class="hidden lg:flex"
          color="neutral"
          variant="ghost"
          size="xl"
          icon="i-lucide-x"
          :aria-label="t('learn.readMode.close')"
          @click="close"
        >
          {{ t("learn.readMode.close") }}
        </UButton>
      </div>

      <!--
        Two-column body: desktop tree aside + scrollable page slot.
        Same plain-flex layout we landed on for the old overlay -
        UPage components don't suit a constrained-height surface
        because they rely on the document being the scroll root.
      -->
      <div class="flex-1 flex md:min-h-0 md:overflow-hidden">
        <aside
          class="hidden md:block w-[320px] shrink-0 overflow-y-auto border-r border-(--border) p-3"
          :aria-label="t('learn.index.title')"
        >
          <LearnTree
            :active-id="activeTopicId"
            @select="onTreeSelect"
          />
        </aside>

        <div class="flex-1 min-w-0 md:overflow-y-auto">
          <slot />
        </div>
      </div>

      <!--
        Mobile slideover hosting the same LearnTree. Closes itself on
        selection (via @select) so the user lands cleanly in the new
        article instead of having to dismiss the tree first.
      -->
      <USlideover
        v-model:open="treeOpen"
        side="left"
        :title="t('learn.index.title')"
      >
        <template #body>
          <LearnTree
            :active-id="activeTopicId"
            @select="onTreeSelect"
          />
        </template>
      </USlideover>
    </div>
  </div>
</template>
