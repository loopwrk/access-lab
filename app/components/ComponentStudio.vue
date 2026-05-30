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

const { t } = useI18n()
const { focusLearnTopic } = useInspectorTab()
const { previewRef, componentProps } = useInspectedComponent(props.definition)
const { activeComponentName } = useStudioToolbar()

const renderAs = computed({
  get: () => (componentProps.value.renderAs as string | undefined) ?? '',
  set: (next: string) => {
    componentProps.value = { ...componentProps.value, renderAs: next }
  }
})

const variantPlaceholder = computed(() =>
  t('variantPicker.placeholderForElement', { name: props.definition.name })
)

const enabledWrappers = computed({
  get: () => (componentProps.value.wrappers as string[] | undefined) ?? [],
  set: (next: string[]) => {
    componentProps.value = { ...componentProps.value, wrappers: next }
  }
})

/**
 * Context-wrappers actually available for the current variant. A wrapper
 * may declare `availableFor(renderAs)` to opt out of certain variants —
 * for example, `<button>` wrapping another `<button>` can't exist at
 * runtime because the HTML parser auto-closes the outer button.
 */
const availableContextWrappers = computed(() => {
  const all = props.definition.contextWrappers ?? []
  const renderAs = componentProps.value.renderAs as string | undefined
  return all.filter(w => w.availableFor?.(renderAs) ?? true)
})

watch(availableContextWrappers, (next) => {
  const current = (componentProps.value.wrappers as string[] | undefined)?.[0]
  if (!current) return
  if (!next.some(w => w.key === current)) {
    componentProps.value = { ...componentProps.value, wrappers: [] }
  }
})

const toast = useToast()

interface FormSubmittedMessage {
  type: 'form:submitted'
  name: string
  value: string
}

function buildSubmittedTitle(data: FormSubmittedMessage): string {
  if (data.name && data.value) {
    return t('studio.toasts.formSubmittedWithNameValue', { name: data.name, value: data.value })
  }
  if (data.value) {
    return t('studio.toasts.formSubmittedWithValue', { value: data.value })
  }
  if (data.name) {
    return t('studio.toasts.formSubmittedWithNameValue', { name: data.name, value: '' })
  }
  return t('studio.toasts.formSubmitted')
}

const formSubmittedAction = computed(() => [{
  label: t('studio.toasts.formSubmittedLink'),
  onClick: () => focusLearnTopic('form-wrapping'),
  color: 'neutral' as const,
  variant: 'link' as const
}])

const submitNoFormAction = computed(() => [{
  label: t('studio.toasts.submitNoFormLink'),
  onClick: () => focusLearnTopic('button-types'),
  color: 'neutral' as const,
  variant: 'link' as const
}])

function onMessage(event: MessageEvent) {
  const data = event.data
  if (data?.type === 'demo:click') {
    if (props.definition.suppressDemoClickToast) return
    toast.add({
      title: t('studio.toasts.demoAction'),
      icon: 'i-lucide-circle-check',
      color: 'success'
    })
  } else if (data?.type === 'form:submitted') {
    toast.add({
      title: buildSubmittedTitle(data as FormSubmittedMessage),
      icon: 'i-lucide-send',
      color: 'info',
      actions: formSubmittedAction.value
    })
  } else if (data?.type === 'form:reset') {
    toast.add({
      title: t('studio.toasts.formReset'),
      icon: 'i-lucide-rotate-ccw',
      color: 'warning'
    })
  } else if (data?.type === 'form:submitMissingForm') {
    toast.add({
      title: t('studio.toasts.submitNoForm'),
      icon: 'i-lucide-circle-alert',
      color: 'error',
      actions: submitNoFormAction.value
    })
  } else if (data?.type === 'form:resetMissingForm') {
    toast.add({
      title: t('studio.toasts.resetNoForm'),
      icon: 'i-lucide-circle-alert',
      color: 'error'
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
  <Teleport v-if="availableContextWrappers.length" to="#preview-toolbar-wrappers">
    <WrapperToggles v-model="enabledWrappers" :options="availableContextWrappers"
      :element-name="props.definition.tagName" />
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
