<script setup lang="ts">
type BadgeColor = "error" | "warning" | "success";

const props = withDefaults(defineProps<{
  color: BadgeColor;
  count: number;
  /** Pre-translated noun, e.g. "critical" or "warnings". */
  noun: string;
  violationIds?: string[];
}>(), {
  violationIds: () => [],
});


const showsGlow = computed(() => props.color !== "success");

const isGlowing = ref(false);
let glowTimer: ReturnType<typeof setTimeout> | null = null;

function pulseGlow() {
  // Restart cleanly: drop the class, wait a tick, re-add. CSS animations
  // don't replay if the class is already on the same element.
  isGlowing.value = false;
  if (glowTimer) clearTimeout(glowTimer);
  nextTick(() => {
    isGlowing.value = true;
    glowTimer = setTimeout(() => { isGlowing.value = false }, 720);
  });
}

const stableKey = ref(props.count);
const displayCount = ref(props.count);
const TALLY_SETTLE_MS = 200;

let firstCountChangeHandled = false;
let pendingTallyApply: ReturnType<typeof setTimeout> | null = null;

watch(() => props.count, (next) => {
  if (!firstCountChangeHandled) {
    firstCountChangeHandled = true;
    // Snap silently to the first audit result so the initial digit
    // is correct without animating in from 0.
    displayCount.value = next;
    stableKey.value = next;
    return;
  }
  if (pendingTallyApply) clearTimeout(pendingTallyApply);
  pendingTallyApply = setTimeout(() => {
    if (next !== stableKey.value) {
      stableKey.value = next;
      displayCount.value = next;
    }
    pendingTallyApply = null;
  }, TALLY_SETTLE_MS);
});

// Glow watch: fire on appearance of any NEW violation id, regardless of
// whether the count moved.
let firstIdsChangeHandled = false;
watch(() => props.violationIds, (next, prev) => {
  if (!firstIdsChangeHandled) {
    firstIdsChangeHandled = true;
    return;
  }
  if (!showsGlow.value) return;
  const prevSet = new Set(prev ?? []);
  const hasNew = next.some(id => !prevSet.has(id));
  if (hasNew) pulseGlow();
});

onBeforeUnmount(() => {
  if (glowTimer) clearTimeout(glowTimer);
  if (pendingTallyApply) clearTimeout(pendingTallyApply);
});
</script>

<template>
  <UBadge :color="color" variant="soft" size="lg" :class="[
    'count-badge',
    `count-badge--${color}`,
    isGlowing && 'count-badge--glow'
  ]">
    <span class="count-num-wrap">
      <Transition name="tally">
        <span :key="stableKey" class="count-num">{{ displayCount }}</span>
      </Transition>
    </span>
    <span>{{ ' ' }}{{ noun }}</span>
  </UBadge>
</template>

<style scoped>
.count-badge--glow {
  animation: count-badge-glow 720ms ease-out;
}

@keyframes count-badge-glow {
  0% {
    box-shadow: 0 0 0 0 var(--glow-color);
  }

  20% {
    box-shadow: 0 0 0 2px var(--glow-color);
  }

  100% {
    box-shadow: 0 0 0 4px rgb(0 0 0 / 0);
  }
}

.count-badge--error {
  --glow-color: rgb(239 68 68 / 0.5);
}

.count-badge--warning {
  --glow-color: rgb(234 179 8 / 0.5);
}

/* ── Tally tick ───────────────────────────────────────────── */
.count-num-wrap {
  display: inline-flex;
  justify-content: center;
  position: relative;
  vertical-align: baseline;
  overflow: hidden;
  min-width: 1.7ch;
}

.count-num {
  display: inline-block;
  line-height: 1;
}

.tally-enter-active,
.tally-leave-active {
  transition: transform 260ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 260ms ease-out;
}

.tally-leave-active {
  position: absolute;
  left: 0;
  right: 0;
}

.tally-enter-from {
  transform: translateY(80%);
  opacity: 0;
}

.tally-leave-to {
  transform: translateY(-80%);
  opacity: 0;
}

/* ── Reduced motion ───────────────────────────────────────── */
@media (prefers-reduced-motion: reduce) {
  .count-badge--glow {
    animation: none;
  }

  .tally-enter-active,
  .tally-leave-active {
    transition: opacity 150ms ease-out;
  }

  .tally-enter-from,
  .tally-leave-to {
    transform: none;
  }
}
</style>
