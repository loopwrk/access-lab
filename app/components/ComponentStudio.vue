<script setup lang="ts">
/**
 * Mounts the full studio for a real (non-placeholder) component definition.
 *
 * ControlsPanel and ManualReviewPanel are still hardcoded to Button's
 * imports (audit steps 5 and 6). Until the panel decoupling lands we
 * mount them only when the active definition is Button. Other real
 * definitions (Input, etc.) still get the agnostic panels (Issues,
 * Learn) plus a live preview, so axe findings and Learn content keep
 * working end-to-end. The hasButtonControls flag here is the only
 * site that needs to change when those panels become definition-driven.
 */
import type { ComponentDefinition } from '~/types/component'

const props = defineProps<{
  definition: ComponentDefinition<Record<string, unknown>>
}>()

const { previewRef, componentProps } = useInspectedComponent(props.definition)

const hasButtonControls = computed(() => props.definition.id === 'button')

const toast = useToast()

function onMessage(event: MessageEvent) {
  if (event.data?.type === 'demo:click') {
    toast.add({
      title: 'Demo action successfully triggered',
      icon: 'i-lucide-circle-check',
      color: 'success'
    })
  }
}

onMounted(() => window.addEventListener('message', onMessage))
onBeforeUnmount(() => window.removeEventListener('message', onMessage))
</script>

<template>
  <div class="component-studio">
    <div class="studio-preview">
      <PreviewIframe ref="previewRef" />
    </div>
  </div>
  <Teleport v-if="hasButtonControls" to="#controls-panel">
    <ControlsPanel v-model="componentProps" />
  </Teleport>
  <Teleport to="#issues-panel">
    <IssuesPanel />
  </Teleport>
  <Teleport v-if="hasButtonControls" to="#manual-panel">
    <ManualReviewPanel />
  </Teleport>
  <Teleport to="#learn-panel">
    <LearnPanel />
  </Teleport>
</template>

<style scoped>
.component-studio {
  display: flex;
  flex: 1;
  height: 100%;
  min-height: 0;
}

.studio-preview {
  flex: 1;
  display: flex;
  min-width: 0;
}
</style>
