<script setup lang="ts">
/**
 * Inline, interactive demo for the Switches Learn article (used via MDC as
 * `::switch-demo`). It shows the article's two options side by side:
 *
 *   - Option 1: an UNSTYLED native `<input type="checkbox" role="switch">`. It
 *     still looks like a checkbox on purpose - `role="switch"` changes only what
 *     assistive technology announces, not the appearance. The pill look is what
 *     Option 2 spends "significant custom CSS" on.
 *   - Option 2: a `<button role="switch" aria-checked>` styled into the pill,
 *     its look driven from `aria-checked`.
 *
 * Toggling either control flips just that card into dark mode - card, label, and
 * control all respond - by adding the app's own `.theme-dark` token class to the
 * card (reusing the tokens rather than hardcoding colours) plus
 * `color-scheme: dark` so the native checkbox renders its dark variant too. The
 * effect is visible when the page itself is in light mode; in global dark mode
 * the cards are already dark.
 *
 * Both meet the AAA bar the rest of the app holds itself to: a real focusable
 * control with an accessible name, a >=44px target via the label row, a
 * `:focus-visible` ring, the pill slide gated behind `prefers-reduced-motion`,
 * and the on/off look driven from the control's own state.
 */
const nativeOn = ref(false);
const buttonOn = ref(false);
</script>

<template>
  <div class="my-6 grid gap-4 sm:grid-cols-2">
    <!-- Option 1: unstyled native checkbox + role="switch" -->
    <div
      class="rounded-lg border border-(--border) bg-(--surface) p-4"
      :class="nativeOn ? 'theme-dark [color-scheme:dark]' : ''"
    >
      <span class="mb-3 block text-lg font-semibold text-(--text-primary)">
        Native checkbox + <code>role="switch"</code>
      </span>
      <label class="inline-flex min-h-11 cursor-pointer items-center gap-3 text-(--text-primary)">
        <span>Dark mode</span>
        <input
          v-model="nativeOn"
          type="checkbox"
          role="switch"
        />
      </label>
    </div>

    <!-- Option 2: button + role="switch" + aria-checked, styled as a pill -->
    <div
      class="rounded-lg border border-(--border) bg-(--surface) p-4"
      :class="buttonOn ? 'theme-dark [color-scheme:dark]' : ''"
    >
      <span class="mb-3 block text-lg font-semibold text-(--text-primary)">
        Button + <code>role="switch"</code> + <code>aria-checked</code>
      </span>
      <button
        type="button"
        role="switch"
        :aria-checked="buttonOn"
        class="group inline-flex min-h-11 cursor-pointer items-center gap-3 rounded text-(--text-primary) focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-(--focus-ring)"
        @click="buttonOn = !buttonOn"
      >
        <span>Dark mode</span>
        <span
          aria-hidden="true"
          class="relative inline-block h-6 w-11 shrink-0 rounded-full bg-(--border-strong) motion-safe:transition-colors group-aria-checked:bg-(--brand)"
        >
          <span
            class="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-(--bg) motion-safe:transition-transform group-aria-checked:translate-x-5"
          />
        </span>
      </button>
    </div>
  </div>
</template>
