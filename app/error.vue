<script setup lang="ts">
const error = useError();
const route = useRoute();
const { t } = useI18n();

const is404 = computed(() => error.value?.status === 404);

const missingComponentSlug = computed<string | null>(() => {
  if (!is404.value) return null;
  if (!route.path.startsWith("/components/")) return null;
  return route.path.split("/").pop() || null;
});

async function goSomewhereUseful() {
  await clearError({ redirect: "/components/buttons/action-triggers" });
}
</script>

<template>
  <NuxtLayout>
    <section
      class="flex-1 flex items-center justify-center p-8 min-h-0"
      role="region"
      :aria-label="t('errorPage.ariaLabel')"
    >
      <UCard
        variant="outline"
        class="w-full max-w-lg"
      >
        <div class="flex flex-col gap-5 items-center text-center">
          <NuxtImg
            src="/images/404.png"
            width="120"
            height="120"
            alt=""
            class="shrink-0 -m-4"
          />
          <h1
            class="m-0 text-(length:--al-font-size-heading) font-semibold text-(--text-primary) leading-tight text-balance"
          >
            {{ is404 ? t('errorPage.title404') : t('errorPage.titleGeneric') }}
          </h1>
          <p
            v-if="missingComponentSlug"
            class="m-0 text-(length:--al-font-size-detail) text-(--text-muted) font-mono text-balance"
          >
            {{ t('errorPage.componentMissing', { slug: missingComponentSlug }) }}
          </p>
          <div class="flex flex-col gap-2">
            <p class="m-0 text-(length:--al-font-size-body) leading-normal text-(--text-secondary) text-balance">
              {{ t('errorPage.body1') }}
            </p>
            <p class="m-0 text-(length:--al-font-size-body) leading-normal text-(--text-secondary) text-balance">
              {{ t('errorPage.body2') }}
            </p>
          </div>
          <UButton
            color="primary"
            variant="solid"
            @click="goSomewhereUseful"
          >
            {{ t('errorPage.actionLabel') }}
          </UButton>
        </div>
      </UCard>
    </section>
  </NuxtLayout>
</template>
