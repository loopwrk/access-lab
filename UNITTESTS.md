# AccessLab - Test Coverage Plan

A batched, ordered plan for test coverage. We worked root -> branches: shared foundations first, then per-component verticals, then shared inspector UI, then full user journeys.

Unit and Nuxt-component coverage is now complete: Parts A (shared foundations), B1-B10 (every component's render, rules, and controls), and C1-C11 (inspector UI + studio shell) are done, with 359 unit + 242 Nuxt-component tests passing. This document now tracks only what is still outstanding: one residual item from Part A, and all of Part D (Playwright end-to-end plus the AAA gate).

---

## How we work each batch (the loop)

For every batch below:

1. **You** manually exercise that area in the running app (`corepack pnpm dev`), using the batch's manual checklist, and note any bugs / surprises.
2. **You tell me the section is done.** Mention any bugs found, so we fix the code first and never write tests that pin buggy behaviour.
3. **I audit** any existing tests in that area first (still fit for purpose? need rewriting against changed behaviour?), then write the new tests.
4. **I run** `corepack pnpm test:unit` / `test:nuxt` (and Playwright for Part D), iterate to green, and confirm the pre-commit gate (`lint` + `typecheck`) still passes.
5. We move to the next batch.

> Nothing is written until you've done the manual pass and given the go-ahead for that section.

---

## Conventions (match the existing tests)

- **`unit` vitest project**: node environment, relative imports (`../../app/...`), pure functions only. Rich "why" docstrings at the top of each file.
- **`nuxt` vitest project**: happy-dom, `~/` alias, `mountSuspended` + a small v-model wrapper component for anything that touches `defineModel`, `useI18n`, `useState`, `watch`, or other Nuxt auto-imports.
- **Characterisation tests** pin exact emitted markup byte-for-byte (the rendered HTML is load-bearing: axe audits it, rules reason about it, the code drawer shows it). See `form-input-renderers.test.ts`.
- No project-wide `prettier --write`; format only files we touch.
- **Known flake:** the combined `corepack pnpm test` (both projects at once) intermittently fails a first `mountSuspended` cold-start; run `test:unit` and `test:nuxt` separately. See NOTES.md.

---

## Outstanding work

### A1 residual - Learn-vocabulary drift guard `[unit / node]`

The one piece of Part A not yet written: a drift-guard test asserting that `LEARN_CONCEPT_IDS` (`app/utils/learnConcepts.ts`) and the category list (`app/utils/learnCategories.ts`) exactly match the Zod enums in `content.config.ts`. These are "files commonly touched together": the vocab lists and the Zod enums must stay in sync or article-frontmatter validation drifts. Everything else in Part A is done.

### Part D - User end-to-end (Playwright)

Real-browser journeys through the studio. The in-iframe axe audit already runs at runtime; these tests drive the user's experience and add the planned AAA gate on the app's own chrome.

- **D0 - Harness setup:** install `@playwright/test` + `@axe-core/playwright`, add config + a `test:e2e` script, run against `corepack pnpm preview`. Confirm the tooling choice before installing anything.
- **D1 - Studio core journey:** `/` redirects to action-triggers; sidebar nav switches components; preview iframe renders; controls survive navigation (the per-id `useState`).
- **D2 - Audit feedback loop:** change a control, preview repaints, Issues panel + toolbar counts update (e.g. shrink target size and a critical appears).
- **D3 - Variant & wrapper pickers:** switching variant updates preview + Issues; wrapping in `<form>` changes submit behaviour.
- **D4 - Code drawer:** open, switch panes, Copy inline / Copy with classes write to clipboard.
- **D5 - Read Mode:** open a Learn topic from a learn-link and from the Learn tab; deep-link `/learn/<topicId>` resolves SSR'd; close returns to the stashed studio route.
- **D6 - Global prefs persistence:** font / size / high-contrast / theme persist across reload (localStorage + color-mode cookie).
- **D7 - AAA gate (the big one):** run `@axe-core/playwright` against every studio + learn route and assert zero violations at WCAG 2.2 AAA. This is the gate AGENTS.md / PROGRESS.md call for but that was never wired. Note: this audits the app chrome, not the user-tuned inspected component.
- **D8 - Mobile blocker:** below the `lg` breakpoint the studio shows `MobileBlocker`; `/learn/*` stays usable.

---

## Progress tracker

| Batch         | Area                     | Manual pass | Tests written | Notes                                                                                     |
| ------------- | ------------------------ | :---------: | :-----------: | ----------------------------------------------------------------------------------------- |
| A1 (residual) | Learn-vocab drift guard  |     n/a     |       ☐       | `LEARN_CONCEPT_IDS` + the category list vs the `content.config.ts` Zod enums. Rest of A done. |
| D0            | E2E harness setup        |      ☐      |       ☐       | confirm tooling first                                                                     |
| D1            | Studio core journey      |      ☐      |       ☐       |                                                                                           |
| D2            | Audit feedback loop      |      ☐      |       ☐       |                                                                                           |
| D3            | Variant & wrapper pickers |     ☐      |       ☐       |                                                                                           |
| D4            | Code drawer (e2e)        |      ☐      |       ☐       |                                                                                           |
| D5            | Read Mode (e2e)          |      ☐      |       ☐       |                                                                                           |
| D6            | Global prefs persistence |      ☐      |       ☐       |                                                                                           |
| D7            | AAA gate (all routes)    |      ☐      |       ☐       |                                                                                           |
| D8            | Mobile blocker           |      ☐      |       ☐       |                                                                                           |
