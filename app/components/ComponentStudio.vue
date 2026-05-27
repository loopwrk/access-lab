<script setup lang="ts">
/**
 * Mounts the full studio for a real (non-placeholder) component definition.
 *
 * Controls panel is sourced from `definition.controlsComponent`
 */
import type { ComponentDefinition } from '~/types/component'

const props = defineProps<{
  definition: ComponentDefinition<Record<string, unknown>>
}>()

const { previewRef, componentProps } = useInspectedComponent(props.definition)
const { activeComponentName } = useStudioToolbar()

const renderAs = computed({
  get: () => (componentProps.value.renderAs as string | undefined) ?? '',
  set: (next: string) => {
    componentProps.value = { ...componentProps.value, renderAs: next }
  }
})

const variantPlaceholder = computed(() => `${props.definition.name} type`)

const enabledWrappers = computed({
  get: () => (componentProps.value.wrappers as string[] | undefined) ?? [],
  set: (next: string[]) => {
    componentProps.value = { ...componentProps.value, wrappers: next }
  }
})

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

onMounted(() => {
  window.addEventListener('message', onMessage)
  activeComponentName.value = props.definition.name
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
  activeComponentName.value = null
})
</script>

<template>
  <div class="component-studio">
    <div class="studio-preview">
      <PreviewIframe ref="previewRef" />
    </div>
  </div>
  <Teleport v-if="props.definition.variants?.length" to="#preview-toolbar-variant">
    <VariantPicker v-model="renderAs" :variants="props.definition.variants" :placeholder="variantPlaceholder" />
  </Teleport>
  <Teleport v-if="props.definition.contextWrappers?.length" to="#preview-toolbar-wrappers">
    <WrapperToggles v-model="enabledWrappers" :options="props.definition.contextWrappers" />
  </Teleport>
  <Teleport v-if="props.definition.controlsComponent" to="#controls-panel">
    <component :is="props.definition.controlsComponent" v-model="componentProps" />
  </Teleport>
  <Teleport to="#issues-panel">
    <IssuesPanel />
  </Teleport>
  <Teleport to="#manual-panel">
    <ManualReviewPanel :checklist="props.definition.manualChecklist" />
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
