<script setup lang="ts">
import type { BaseButtonProps } from '~/types/button'
import type { ButtonRenderAs, SwitchBehaviour } from '../shared/types'
import { switchDefinition } from './definition'
import ResetDefaultsSection from '~/components/ButtonStudio/sections/ResetDefaultsSection.vue'
import ContentSection from '~/components/ButtonStudio/sections/ContentSection.vue'
import AriaSection from '~/components/ButtonStudio/sections/AriaSection.vue'
import SwitchStateSection from '~/components/ButtonStudio/sections/SwitchStateSection.vue'
import TextSection from '~/components/ButtonStudio/sections/TextSection.vue'
import DimensionsSection from '~/components/ButtonStudio/sections/DimensionsSection.vue'
import BorderSection from '~/components/ButtonStudio/sections/BorderSection.vue'
import ColoursSection from '~/components/ButtonStudio/sections/ColoursSection.vue'
import FocusSection from '~/components/ButtonStudio/sections/FocusSection.vue'

type SwitchModel = Partial<BaseButtonProps> & {
  renderAs?: ButtonRenderAs
  wrappers?: string[]
  switchBehaviour?: SwitchBehaviour
  switchChecked?: boolean
}

const model = defineModel<SwitchModel>({ required: true })

const tagName = switchDefinition.tagName
const { naturalSize } = useNaturalSize(model, tagName)
const defaults = useButtonStudioDefaults(tagName)

const { t } = useI18n()
const toast = useToast()

// Same iframe click bridge as the toggle-buttons page. When the
// rendered button is activated in the iframe, preview-shell posts
// `demo:click` back; we flip switchChecked so the new ARIA state
// re-renders into the iframe and a real screen reader announces it.
function handleMessage(event: MessageEvent) {
  if (event.data?.type !== 'demo:click') return
  const behaviour = model.value.switchBehaviour
  if (!behaviour || behaviour === 'none') return
  model.value.switchChecked = !model.value.switchChecked
}

// The "Toggle notification" switch drives a non-dismissable toast so
// the student can see a live demo of switch state controlling something
// in the wider UI. The toast can only be closed by toggling the switch
// back off — no close affordance, no auto-dismiss.
let activeToastId: string | number | null = null

function showNotificationToast() {
  if (activeToastId != null) return
  const created = toast.add({
    title: t('switches.toastTitle'),
    description: t('switches.toastDescription'),
    icon: 'i-lucide-bell',
    color: 'info',
    close: false,
    duration: 0
  })
  activeToastId = created.id ?? null
}

function dismissNotificationToast() {
  if (activeToastId == null) return
  toast.remove(activeToastId)
  activeToastId = null
}

watch(
  () => model.value.switchChecked === true,
  (on) => {
    if (on) showNotificationToast()
    else dismissNotificationToast()
  }
)

onMounted(() => window.addEventListener('message', handleMessage))
onBeforeUnmount(() => {
  window.removeEventListener('message', handleMessage)
  // Clean up the toast when navigating away from the switches page —
  // otherwise it would persist over unrelated routes.
  dismissNotificationToast()
})
</script>

<template>
  <div class="flex flex-col gap-4">
    <ResetDefaultsSection v-model="model" />
    <USeparator />

    <ContentSection v-model="model" />
    <USeparator />

    <AriaSection v-model="model" />
    <USeparator />

    <SwitchStateSection v-model="model" />
    <USeparator />

    <TextSection v-model="model" :defaults="defaults" />
    <USeparator />

    <DimensionsSection v-model="model" :defaults="defaults" :natural-size="naturalSize" />
    <USeparator />

    <BorderSection v-model="model" :defaults="defaults" />
    <USeparator />

    <ColoursSection v-model="model" :defaults="defaults" />
    <USeparator />

    <FocusSection v-model="model" />
  </div>
</template>
