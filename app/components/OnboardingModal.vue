<script setup lang="ts">
import type { Component } from "vue";
import FeatureRow from "./onboarding/FeatureRow.vue";
import MiniSidebar from "./onboarding/MiniSidebar.vue";
import MiniVariantPicker from "./onboarding/MiniVariantPicker.vue";
import MiniControls from "./onboarding/MiniControls.vue";
import MiniCounts from "./onboarding/MiniCounts.vue";
import MiniIssue from "./onboarding/MiniIssue.vue";
import MiniLearn from "./onboarding/MiniLearn.vue";
import MiniCode from "./onboarding/MiniCode.vue";

const { t } = useI18n();
const { isOpen, step, hasSeen, stepCount, open, close, next, prev } = useOnboarding();
const isBelowDesktop = useIsBelowDesktop();
const reducedMotion = usePreferredReducedMotion();

const animate = computed(() => reducedMotion.value !== "reduce");
const isLastStep = computed(() => step.value === stepCount - 1);

interface Feature {
  icon: string;
  title: string;
  description: string;
  visual?: Component;
}

const welcomePills = computed(() => [
  { icon: "i-lucide-sliders-horizontal", label: t("onboarding.steps.welcome.pills.tune") },
  { icon: "i-lucide-shield-check", label: t("onboarding.steps.welcome.pills.catch") },
  { icon: "i-lucide-graduation-cap", label: t("onboarding.steps.welcome.pills.learn") },
]);

const pickFeatures = computed<Feature[]>(() => [
  {
    icon: "i-lucide-mouse-pointer-click",
    title: t("onboarding.steps.pick.features.sidebar.title"),
    description: t("onboarding.steps.pick.features.sidebar.description"),
    visual: MiniSidebar,
  },
  {
    icon: "i-lucide-code",
    title: t("onboarding.steps.pick.features.variant.title"),
    description: t("onboarding.steps.pick.features.variant.description"),
    visual: MiniVariantPicker,
  },
]);

const tuneFeatures = computed<Feature[]>(() => [
  {
    icon: "i-lucide-sliders-horizontal",
    title: t("onboarding.steps.tune.features.controls.title"),
    description: t("onboarding.steps.tune.features.controls.description"),
    visual: MiniControls,
  },
  {
    icon: "i-lucide-gauge",
    title: t("onboarding.steps.tune.features.counts.title"),
    description: t("onboarding.steps.tune.features.counts.description"),
    visual: MiniCounts,
  },
  {
    icon: "i-lucide-list-checks",
    title: t("onboarding.steps.tune.features.issues.title"),
    description: t("onboarding.steps.tune.features.issues.description"),
    visual: MiniIssue,
  },
]);

const learnFeatures = computed<Feature[]>(() => [
  {
    icon: "i-lucide-graduation-cap",
    title: t("onboarding.steps.learn.features.learn.title"),
    description: t("onboarding.steps.learn.features.learn.description"),
    visual: MiniLearn,
  },
  {
    icon: "i-lucide-code",
    title: t("onboarding.steps.learn.features.code.title"),
    description: t("onboarding.steps.learn.features.code.description"),
    visual: MiniCode,
  },
]);

const currentLead = computed(
  () =>
    [
      null,
      t("onboarding.steps.pick.lead"),
      t("onboarding.steps.tune.lead"),
      t("onboarding.steps.learn.lead"),
    ][step.value],
);
const currentFeatures = computed<Feature[]>(
  () => [[], pickFeatures.value, tuneFeatures.value, learnFeatures.value][step.value] ?? [],
);

const bodyRef = useTemplateRef<HTMLElement>("body");
watch(step, () => {
  if (bodyRef.value) bodyRef.value.scrollTop = 0;
});

onMounted(() => {
  if (!hasSeen.value && !isBelowDesktop.value) open();
});

function onOpenChange(value: boolean) {
  if (!value) close();
}
</script>

<template>
  <UModal
    :open="isOpen"
    :title="t('onboarding.title')"
    :description="t('onboarding.subtitle')"
    :close="false"
    :transition="animate"
    :ui="{
      overlay: 'bg-(--scrim) backdrop-blur-[2px]',
      content: 'max-w-[900px] w-[94vw] bg-(--surface) ring-(--border) shadow-2xl divide-y-0',
    }"
    @update:open="onOpenChange"
  >
    <template #content>
      <!-- Header -->
      <div
        class="flex items-center justify-between gap-4 py-4 px-5 border-b border-(--border) flex-none"
      >
        <div class="flex items-center gap-2.5">
          <UIcon
            name="i-lucide-message-square-dot"
            class="size-5 text-(--brand)"
            aria-hidden="true"
          />
          <span
            class="font-semibold text-(length:--al-font-size-brand) text-(--text-primary) tracking-[-0.01em]"
          >
            {{ t("appBar.brand") }}
          </span>
          <span
            class="border-l border-(--border) pl-2.5 text-(length:--al-font-size-detail) font-semibold text-(--text-muted)"
          >
            {{ t("onboarding.header.eyebrow") }}
          </span>
        </div>
        <UButton
          color="neutral"
          variant="ghost"
          size="sm"
          icon="i-lucide-x"
          @click="close"
        >
          {{ t("onboarding.skip") }}
        </UButton>
      </div>

      <!-- Body. Keyboard-operable scrollable region (matches CodeDrawer) -->
      <div
        ref="body"
        tabindex="0"
        role="region"
        :aria-label="t('onboarding.contentLabel')"
        class="flex-1 min-h-0 overflow-y-auto py-6 px-7 focus-visible:outline-[3px] focus-visible:outline-(--focus-ring) focus-visible:-outline-offset-[3px]"
      >
        <Transition
          mode="out-in"
          enter-active-class="motion-safe:transition-opacity motion-safe:duration-200 motion-safe:ease-out"
          enter-from-class="motion-safe:opacity-0"
          leave-active-class="motion-safe:transition-opacity motion-safe:duration-100 motion-safe:ease-in"
          leave-to-class="motion-safe:opacity-0"
        >
          <!-- Welcome -->
          <div
            v-if="step === 0"
            :key="step"
            class="flex flex-col items-center text-center gap-4 pt-3 pb-1"
          >
            <div class="flex items-center gap-3">
              <UIcon
                name="i-lucide-message-square-dot"
                class="size-12 text-(--brand)"
                aria-hidden="true"
              />
              <span class="text-2xl font-semibold text-(--text-primary) tracking-[-0.01em]">
                {{ t("appBar.brand") }}
              </span>
            </div>
            <div class="flex flex-col gap-2.5 max-w-[540px]">
              <h3
                class="text-3xl font-semibold text-(--text-primary) tracking-[-0.01em] leading-tight whitespace-pre-line"
              >
                {{ t("onboarding.steps.welcome.heading") }}
              </h3>
              <p
                class="text-(length:--al-font-size-display) text-(--text-secondary) leading-relaxed"
              >
                {{ t("onboarding.steps.welcome.body") }}
              </p>
            </div>
            <ul class="flex flex-wrap justify-center gap-2.5 mt-1 list-none p-0 m-0">
              <li
                v-for="pill in welcomePills"
                :key="pill.label"
                class="inline-flex items-center gap-2 py-2 px-3.5 bg-(--surface) border border-(--border) rounded-md text-(length:--al-font-size-detail) font-semibold text-(--text-primary)"
              >
                <UIcon
                  :name="pill.icon"
                  class="size-4 text-(--brand)"
                  aria-hidden="true"
                />
                {{ pill.label }}
              </li>
            </ul>
          </div>

          <!-- Feature-row steps -->
          <div
            v-else
            class="flex flex-col gap-6"
          >
            <h3 class="text-2xl font-semibold text-(--text-primary) tracking-[-0.01em]">
              {{ currentLead }}
            </h3>
            <ul class="flex flex-col gap-8 list-none p-0 m-0">
              <FeatureRow
                v-for="feature in currentFeatures"
                :key="feature.title"
                v-bind="feature"
              />
            </ul>
          </div>
        </Transition>
      </div>

      <!-- Footer -->
      <div
        class="flex items-center justify-between gap-4 py-3.5 px-5 border-t border-(--border) bg-(--surface) flex-none"
      >
        <span
          role="status"
          class="text-(length:--al-font-size-detail) text-(--text-muted) font-medium"
        >
          {{ t("onboarding.stepCounter", { current: step + 1, total: stepCount }) }}
        </span>
        <div class="flex items-center gap-2.5">
          <UButton
            v-if="step > 0"
            color="neutral"
            variant="outline"
            icon="i-lucide-arrow-left"
            @click="prev"
          >
            {{ t("onboarding.back") }}
          </UButton>
          <UButton
            v-if="!isLastStep"
            color="primary"
            trailing-icon="i-lucide-arrow-right"
            @click="next"
          >
            {{ t("onboarding.next") }}
          </UButton>
          <UButton
            v-else
            color="primary"
            icon="i-lucide-rocket"
            @click="close"
          >
            {{ t("onboarding.getStarted") }}
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
