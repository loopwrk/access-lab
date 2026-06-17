<script setup lang="ts">
// Static reduction of the toolbar count badges but self-animating to show the
// audit reacting. Critical/warning drift (biased downward); passing is a DERIVED
// value (TOTAL - critical - warning) so it only ever moves in response to them,
// never directly. Reuses the real AnimatedCountBadge, so the tally + glow match
// the live studio badges. Pauses under reduced motion.
const { t } = useI18n();
const reducedMotion = usePreferredReducedMotion();

const TOTAL = 12;
const MAX_PER_KIND = 3;
const MIN_INTERVAL_MS = 2000;
const MAX_INTERVAL_MS = 4000;
const DOWNWARD_BIAS = 0.62;

const critical = ref(2);
const warning = ref(1);
const passing = computed(() => TOTAL - critical.value - warning.value);

const criticalIds = computed(() => Array.from({ length: critical.value }, (_, i) => `c${i}`));
const warningIds = computed(() => Array.from({ length: warning.value }, (_, i) => `w${i}`));

function randomInterval() {
  return MIN_INTERVAL_MS + Math.random() * (MAX_INTERVAL_MS - MIN_INTERVAL_MS);
}

const { start } = useTimeoutFn(advance, randomInterval, { immediate: false });

function advance() {
  const target = Math.random() < 0.5 ? critical : warning;
  const canDecrease = target.value > 0;
  const canIncrease = target.value < MAX_PER_KIND && passing.value > 0;
  // Biased toward fewer issues (more passing) when both moves are open; otherwise
  // take whichever single move is available so the counts keep ticking.
  const decrease = canDecrease && canIncrease ? Math.random() < DOWNWARD_BIAS : canDecrease;
  if (decrease) target.value -= 1;
  else if (canIncrease) target.value += 1;
  start(); // reschedule with a fresh random interval
}

onMounted(() => {
  if (reducedMotion.value !== "reduce") start();
});
</script>

<template>
  <div class="flex gap-2 flex-wrap">
    <AnimatedCountBadge
      color="error"
      :count="critical"
      :violation-ids="criticalIds"
      :noun="t('counter.criticalNoun')"
    />
    <AnimatedCountBadge
      color="warning"
      :count="warning"
      :violation-ids="warningIds"
      :noun="t('counter.warningsNoun', 2)"
    />
    <AnimatedCountBadge
      color="success"
      :count="passing"
      :noun="t('counter.passingNoun')"
    />
  </div>
</template>
