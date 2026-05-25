<script setup lang="ts">
const error = useError()
const route = useRoute()
const { t } = useI18n()

const is404 = computed(() => error.value?.status === 404)

const missingComponentSlug = computed<string | null>(() => {
  if (!is404.value) return null
  if (!route.path.startsWith('/components/')) return null
  return route.path.split('/').pop() || null
})

async function goSomewhereUseful() {
  await clearError({ redirect: '/components/button' })
}
</script>

<template>
  <NuxtLayout>
    <section class="error-page" role="region" :aria-label="t('errorPage.ariaLabel')">
      <UCard variant="outline" class="error-card">
        <div class="flex flex-col gap-5 items-center text-center">
          <NuxtImg src="/images/404.png" width="120" height="120" alt="" class="error-illustration shrink-0 -m-4" />
          <h1 class="error-title m-0">
            {{ is404 ? t('errorPage.title404') : t('errorPage.titleGeneric') }}
          </h1>
          <p v-if="missingComponentSlug" class="error-detail m-0">
            {{ t('errorPage.componentMissing', { slug: missingComponentSlug }) }}
          </p>
          <div class="flex flex-col gap-2">
            <p class="error-body m-0">{{ t('errorPage.body1') }}</p>
            <p class="error-body m-0">{{ t('errorPage.body2') }}</p>
          </div>
          <UButton color="primary" variant="solid" @click="goSomewhereUseful">
            {{ t('errorPage.actionLabel') }}
          </UButton>
        </div>
      </UCard>
    </section>
  </NuxtLayout>
</template>

<style scoped>
.error-page {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px;
  min-height: 0;
}

.error-card {
  width: 100%;
  max-width: 32rem;
}

.error-illustration {
  width: 120px;
  height: 120px;
}

.error-title,
.error-body,
.error-detail {
  text-wrap: balance;
}

.error-title {
  font-size: var(--al-font-size-heading);
  font-weight: 600;
  color: var(--text-primary);
  line-height: 1.2;
}

.error-detail {
  font-size: var(--al-font-size-detail);
  color: var(--text-muted);
  font-family: var(--al-font-mono);
}

.error-body {
  font-size: var(--al-font-size-body);
  line-height: 1.5;
  color: var(--text-secondary);
}
</style>
