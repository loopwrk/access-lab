<script setup lang="ts">
import { PREVIEW_MESSAGE, type IframeBoundMessage } from "~/types/preview-messages";

const iframeRef = useTemplateRef<HTMLIFrameElement>("iframe");

const {
  violations,
  passes,
  incomplete,
  isReady,
  errorMessage,
} = useAxeAudit(iframeRef);

const pendingRender = ref<{ html: string; css?: string; rootFontSize?: number } | null>(null);

function send(html: string, css?: string, rootFontSize?: number) {
  const iframe = iframeRef.value;
  if (!iframe || !iframe.contentWindow) return;

  const message: IframeBoundMessage = {
    type: PREVIEW_MESSAGE.RENDER_IN_PREVIEW,
    html,
    css: css ?? "",
    rootFontSize,
  };
  iframe.contentWindow.postMessage(message, window.location.origin);
}

/**
 * Render an HTML fragment into the iframe shell.
 *
 * `rootFontSize` (CSS px) sets the iframe's root font-size so rem-based
 * CSS in the rendered HTML resolves against the same base the controls
 * panel uses.
 */
function render(html: string, css?: string, rootFontSize?: number) {
  if (isReady.value) {
    send(html, css, rootFontSize);
  } else {
    pendingRender.value = { html, css, rootFontSize };
  }
}

watch(isReady, (ready) => {
  if (ready && pendingRender.value) {
    send(pendingRender.value.html, pendingRender.value.css, pendingRender.value.rootFontSize);
    pendingRender.value = null;
  }
});

defineExpose({ render, violations, passes, incomplete });

const { t } = useI18n();
const toast = useToast();

// Surface an axe-audit failure: a toast for the user, plus a dev-only console
// error for debugging. Watching errorMessage (rather than toasting inside the
// audit handler) dedupes repeated identical errors — the watch fires only when
// the message changes.
watch(errorMessage, (message) => {
  if (!message) return;
  if (import.meta.dev) console.error("[axe] audit failed:", message);
  toast.add({
    title: t("studio.toasts.axeError"),
    description: message,
    icon: "i-lucide-circle-alert",
    color: "error",
  });
});

function focusContent() {
  focusPreviewContent(iframeRef.value);
}
</script>

<template>
  <div class="relative flex-1 flex items-center justify-center bg-(--surface-2)">
    <UButton
      class="absolute top-2 left-2 z-[1]"
      color="neutral"
      variant="soft"
      size="sm"
      icon="i-lucide-focus"
      :aria-label="t('preview.focusContentAria')"
      @click="focusContent"
    >
      {{ t('preview.focusContent') }}
    </UButton>
    <!--
      Chrome warns that `allow-scripts allow-same-origin` lets the iframe
      escape its sandbox. We accept that tradeoff: axe-core runs inside
      the iframe and needs same-origin DOM access to audit the rendered
      component. The iframe document is `preview-shell.html` from our
      own origin and only renders markup posted from the parent — there
      is no untrusted content path. `allow-forms` lets the form-wrapper
      demo submit-event behaviour.
    -->
    <iframe
      :id="PREVIEW_IFRAME_ID"
      ref="iframe"
      src="/preview-shell.html"
      title="Component preview"
      sandbox="allow-scripts allow-same-origin allow-forms"
      class="w-full h-full border-none bg-white"
    />
    <div
      v-if="!isReady"
      class="absolute inset-0 flex items-center justify-center pointer-events-none"
    >
      <p class="text-muted">
        {{ t('preview.loading') }}
      </p>
    </div>
  </div>
</template>
