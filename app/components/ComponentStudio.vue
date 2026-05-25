<script setup lang="ts">
/**
 * Mounts the full studio for a real (non-placeholder) component definition.
 *
 */
import type { ComponentDefinition } from '~/types/component'

const props = defineProps<{
  definition: ComponentDefinition<Record<string, unknown>>
}>()

const { previewRef, componentProps } = useInspectedComponent(props.definition)

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
  <Teleport to="#controls-panel">
    <ControlsPanel v-model="componentProps" />
  </Teleport>
  <Teleport to="#issues-panel">
    <IssuesPanel />
  </Teleport>
  <Teleport to="#manual-panel">
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
