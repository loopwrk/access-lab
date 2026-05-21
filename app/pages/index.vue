<script setup lang="ts">
import { renderButton } from '~/components/inspected/button/render'

const previewRef = ref<{ render: (html: string, css?: string) => void } | null>(null)

onMounted(() => {
  previewRef.value?.render(renderButton())
})
</script>

<template>
  <div class="page-home">
    <div class="home-preview">
      <PreviewIframe ref="previewRef" />
    </div>
  </div>
</template>

<style scoped>
.page-home {
  display: flex;
  flex: 1;
}

.home-preview {
  flex: 1;
  display: flex;
}
</style>
