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
const { activeComponentName, activeLearnTopicId } = useStudioToolbar()

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

interface FormSubmittedEntry { name: string, value: string }
interface FormSubmittedMessage {
  type: 'form:submitted'
  entries: FormSubmittedEntry[]
  wasImplicitSubmit: boolean
}

/**
 * Build the description text for the form-submitted toast. Each
 * checked checkbox / filled input contributes a `name=value` pair;
 * an empty form (e.g. all checkboxes unchecked) renders as the
 * "(no payload)" label.
 */
function buildSubmittedDescription(entries: FormSubmittedEntry[]): string {
  if (!entries.length) return t('studio.toasts.formSubmittedNoPayload')
  return entries.map(e => `${e.name}=${e.value}`).join(', ')
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
    const submitted = data as FormSubmittedMessage
    toast.add({
      title: t('studio.toasts.formSubmitted'),
      description: buildSubmittedDescription(submitted.entries),
      icon: 'i-lucide-send',
      color: 'info',
      // The "Why did the button send a form submission?" prompt only
      // makes sense when the submitter was a <button> with no type
      // attribute — that's the implicit-submit pitfall the link
      // explains. An explicit type="submit" button is doing exactly
      // what the developer wrote, so the question is misleading.
      actions: submitted.wasImplicitSubmit ? formSubmittedAction.value : undefined
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
  activeLearnTopicId.value = props.definition.primaryLearnTopicId ?? null
})

onBeforeUnmount(() => {
  window.removeEventListener('message', onMessage)
  activeComponentName.value = null
  activeLearnTopicId.value = null
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
  <Teleport v-if="props.definition.controlsComponent" :to="`#${INSPECTOR_PANEL_IDS.controls}`">
    <component :is="props.definition.controlsComponent" v-model="componentProps" />
  </Teleport>
  <Teleport :to="`#${INSPECTOR_PANEL_IDS.issues}`">
    <IssuesPanel />
  </Teleport>
  <Teleport :to="`#${INSPECTOR_PANEL_IDS.manual}`">
    <ManualReviewPanel :checklist="props.definition.manualChecklist" />
  </Teleport>
  <Teleport :to="`#${INSPECTOR_PANEL_IDS.learn}`">
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
