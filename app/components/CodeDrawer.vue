<script setup lang="ts">
import { prettifyCss } from "~/utils/prettifyCss";
import { prettifyHtml } from "~/utils/prettifyHtml";

const { t } = useI18n();
const { renderedHtml, renderedCss, renderedJs } = useRenderedHtml();
const { convert: toClassHtml } = useInlineToClass();

const isOpen = ref(true);
const codeView = ref<"html" | "css" | "js">("html");

const converted = computed(() => toClassHtml(renderedHtml.value));

// CSS pane content: studio-injected rules first, then (if the user
// has set inline styles) the class-converted block, separated by a
// comment so the source of each block is unambiguous.
const combinedCss = computed(() => {
  const studio = renderedCss.value.trim();
  const cls = converted.value?.css.trim() ?? "";
  if (studio && cls) {
    return `${studio}\n\n/* Class-converted from inline styles */\n${cls}`;
  }
  return studio || cls;
});

const hasCss = computed(() => combinedCss.value.length > 0);
const hasJs = computed(() => renderedJs.value.trim().length > 0);

watch(hasCss, (present) => {
  if (!present && codeView.value === "css") codeView.value = "html";
});
watch(hasJs, (present) => {
  if (!present && codeView.value === "js") codeView.value = "html";
});

const prettifiedHtml = computed(() => prettifyHtml(renderedHtml.value));
const prettifiedCss = computed(() => prettifyCss(combinedCss.value));
const prettifiedJs = computed(() => renderedJs.value.trim());

// User-resizable code area. Height persists per-session via
// localStorage. Bounded so the drawer can't swallow the preview or
// shrink so small the code is useless.
const MIN_HEIGHT = 80;
const MAX_HEIGHT_VH = 70;
const DEFAULT_HEIGHT = 220;
const KEYBOARD_STEP_PX = 24;

const codeAreaHeight = useLocalStorage("al-code-drawer-height", DEFAULT_HEIGHT);
const isDragging = ref(false);

// Reactive viewport height — drawer max recomputes automatically when
// the window resizes, so a re-clamped height applies the next time
// effectiveHeight reads it.
const { height: windowHeight } = useWindowSize();
const maxHeightPx = computed(() =>
  Math.round((windowHeight.value * MAX_HEIGHT_VH) / 100),
);

function clamp(value: number): number {
  return Math.max(MIN_HEIGHT, Math.min(maxHeightPx.value, value));
}

const effectiveHeight = computed(() => clamp(codeAreaHeight.value));

let dragStartY = 0;
let dragStartHeight = 0;

// Pointer-drag listeners are always attached to window (auto-cleaned on
// unmount by useEventListener) and gated by isDragging so they're cheap
// when idle. We can't dynamically toggle the target because the drag
// would start on a stale closure.
useEventListener(window, "pointermove", (event: PointerEvent) => {
  if (!isDragging.value) return;
  const delta = dragStartY - event.clientY;
  codeAreaHeight.value = clamp(dragStartHeight + delta);
});
useEventListener(window, "pointerup", () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  document.body.style.userSelect = "";
});

function onPointerDown(event: PointerEvent) {
  isDragging.value = true;
  dragStartY = event.clientY;
  dragStartHeight = effectiveHeight.value
    ; (event.currentTarget as Element).setPointerCapture(event.pointerId);
  document.body.style.userSelect = "none";
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === "ArrowUp") {
    event.preventDefault();
    codeAreaHeight.value = clamp(effectiveHeight.value + KEYBOARD_STEP_PX);
  } else if (event.key === "ArrowDown") {
    event.preventDefault();
    codeAreaHeight.value = clamp(effectiveHeight.value - KEYBOARD_STEP_PX);
  } else if (event.key === "Home") {
    event.preventDefault();
    codeAreaHeight.value = MIN_HEIGHT;
  } else if (event.key === "End") {
    event.preventDefault();
    codeAreaHeight.value = maxHeightPx.value;
  }
}

onBeforeUnmount(() => {
  document.body.style.userSelect = "";
});

const copied = ref<"inline" | "class" | "css" | "js" | "error" | null>(null);
const COPY_FEEDBACK_MS = 800;

// useTimeoutFn handles the start/stop lifecycle for us. Restarting
// before the previous timer fires (back-to-back copies) cancels and
// re-schedules cleanly.
const { start: scheduleCopyReset } = useTimeoutFn(
  () => { copied.value = null; },
  COPY_FEEDBACK_MS,
  { immediate: false },
);

// Indent each non-empty line by two spaces, for nesting prettified CSS
// inside the exported <style> block.
function indentBlock(text: string): string {
  return text
    .split("\n")
    .map((line) => (line ? `  ${line}` : line))
    .join("\n");
}

async function copyContent(mode: "inline" | "class" | "css" | "js") {
  let text = "";
  if (mode === "inline") {
    text = prettifiedHtml.value;
  } else if (mode === "class") {
    // Self-contained snippet: the studio CSS plus the class extracted from the
    // inline styles in a <style> block, then the markup that references them.
    // No <html>/<head>/<body> — this is meant to drop into an existing page.
    const markup = prettifyHtml(converted.value?.html ?? renderedHtml.value);
    const studioCss = prettifyCss(renderedCss.value);
    const classCss = converted.value ? prettifyCss(converted.value.css) : "";
    const styleBody = [studioCss, classCss].filter((block) => block.trim()).join("\n\n");
    text = styleBody ? `<style>\n${indentBlock(styleBody)}\n</style>\n\n${markup}` : markup;
  } else if (mode === "css") {
    text = prettifiedCss.value;
  } else if (mode === "js") {
    text = prettifiedJs.value;
  }
  try {
    await navigator.clipboard.writeText(text);
    copied.value = mode;
  } catch (err) {
    console.error("Failed to copy to clipboard:", err);
    copied.value = "error";
  }
  scheduleCopyReset();
}
</script>

<template>
  <div>
    <div v-if="isOpen" role="separator" aria-orientation="horizontal" :aria-label="t('codeDrawer.resizeLabel')"
      :aria-valuenow="effectiveHeight" :aria-valuemin="MIN_HEIGHT" :aria-valuemax="maxHeightPx" tabindex="0" :class="[
        'relative h-1.5 cursor-row-resize outline-none transition-colors',
        `before:content-[''] before:absolute before:inset-x-0 before:-inset-y-2`,
        isDragging
          ? 'bg-(--brand)'
          : 'bg-(--border) hover:bg-(--brand) focus-visible:bg-(--brand)',
      ]" @pointerdown="onPointerDown" @keydown="onKeydown" />
    <UCollapsible v-model:open="isOpen" :class="[
      'bg-(--surface)',
      isOpen ? '' : 'border-t border-(--border)',
    ]">
      <UButton :aria-label="t('codeDrawer.toggleAria')" color="neutral" variant="ghost" block
        trailing-icon="i-lucide-chevron-down" size="sm" class="group justify-end" :ui="{
          trailingIcon:
            'group-data-[state=open]:rotate-180 transition-transform duration-200',
        }" />
      <template #content>
        <div class="flex flex-col gap-3 px-5 pb-4">
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
            <UButton v-if="hasJs" :color="codeView === 'js' ? 'primary' : 'neutral'"
              :variant="codeView === 'js' ? 'solid' : 'ghost'" @click="codeView = 'js'">
              JS
            </UButton>
          </UFieldGroup>

          <div
            class="al-code-region overflow-auto focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:outline-offset-[-3px]"
            :style="{ height: `${effectiveHeight}px` }" tabindex="0" role="region" :aria-label="t(
              codeView === 'css'
                ? 'codeDrawer.cssRegionLabel'
                : codeView === 'js'
                  ? 'codeDrawer.jsRegionLabel'
                  : 'codeDrawer.htmlRegionLabel',
            )">
            <!-- <ProsePre v-if="renderedHtml && codeView === 'html'" language="html" class="-my-5" :code="prettifiedHtml">
              {{ prettifiedHtml }}
            </ProsePre> -->
            <ProsePre v-if="renderedHtml && codeView === 'html'" language="html"
              class="-my-5 text-(--color-text-brand) bg-color-pre-bg" :code="prettifiedHtml">
              {{ prettifiedHtml }}
            </ProsePre>
            <ProsePre v-else-if="hasCss && codeView === 'css'" language="css"
              class="-my-5 text-(--color-text-brand) bg-color-pre-bg" :code="prettifiedCss">
              {{ prettifiedCss }}
            </ProsePre>
            <ProsePre v-else-if="hasJs && codeView === 'js'" language="javascript"
              class="-my-5 text-(--color-text-brand) bg-color-pre-bg" :code="prettifiedJs">
              {{ prettifiedJs }}
            </ProsePre>
            <p v-else class="text-(length:--al-font-size-body) text-(--text-muted) m-0 py-2 px-3 -my-5">
              {{ t('codeDrawer.empty') }}
            </p>
          </div>

          <!--
            Copy actions are contextual to the active tab. HTML gets
            the inline-vs-classes split; CSS gets a single Copy CSS.
          -->
          <div v-if="codeView === 'html'" class="flex gap-2 justify-start">
            <UButton class="min-w-[110px] flex justify-center" size="md" variant="outline" color="neutral"
              :icon="copied === 'inline' ? 'i-lucide-check' : undefined" :disabled="!renderedHtml"
              @click="copyContent('inline')">
              {{ copied === 'inline'
                ? t('codeDrawer.copied')
                : t('codeDrawer.copyInline') }}
            </UButton>
            <UTooltip :text="t('codeDrawer.copyClassesTooltip')">
              <UButton class="min-w-[150px] flex justify-center" size="md" variant="outline" color="neutral"
                :icon="copied === 'class' ? 'i-lucide-check' : undefined" :disabled="!renderedHtml"
                @click="copyContent('class')">
                {{ copied === 'class'
                  ? t('codeDrawer.copied')
                  : t('codeDrawer.copyClasses') }}
              </UButton>
            </UTooltip>
          </div>
          <div v-else-if="codeView === 'css'" class="flex gap-2 justify-start">
            <UButton class="min-w-[110px] flex justify-center" size="md" variant="outline" color="neutral"
              :icon="copied === 'css' ? 'i-lucide-check' : undefined" :disabled="!hasCss" @click="copyContent('css')">
              {{ copied === 'css'
                ? t('codeDrawer.copied')
                : t('codeDrawer.copyCss') }}
            </UButton>
          </div>
          <div v-else-if="codeView === 'js'" class="flex gap-2 justify-start">
            <UButton class="min-w-[140px] flex justify-center" size="md" variant="outline" color="neutral"
              :icon="copied === 'js' ? 'i-lucide-check' : undefined" :disabled="!hasJs" @click="copyContent('js')">
              {{ copied === 'js'
                ? t('codeDrawer.copied')
                : t('codeDrawer.copyJs') }}
            </UButton>
          </div>
        </div>
      </template>
    </UCollapsible>
  </div>
</template>

<style scoped>
/*
  ProsePre emits a <pre><code> that can't be callsed directly, so reach it with
  :deep(). Soft-wrap long lines — e.g. a long inline `style` value — at the
  spaces between declarations instead of overflowing the drawer horizontally.
*/
.al-code-region :deep(pre),
.al-code-region :deep(code) {
  white-space: pre-wrap;
  overflow-wrap: break-word;
}
</style>
