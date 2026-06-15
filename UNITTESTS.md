# AccessLab — Test Coverage Plan

A batched, ordered plan for building out test coverage. We work **root → branches**:
shared foundations first (every other layer depends on them), then per-component
verticals, then shared inspector UI, then full user journeys. It covers both **unit
tests** (vitest) and **user end-to-end tests** (Playwright — proposed, see Infrastructure).

This is a living document. We tick batches off in the Progress tracker at the bottom.

---

## How we work each batch (the loop)

For every batch below:

1. **You** manually exercise that area in the running app (`corepack pnpm dev`), using the
   batch's **Manual browser pass** checklist, and note any bugs / surprises.
2. **You tell me the section is done.** Mention any bugs found — we fix the code first, so
   we never write tests that pin buggy behaviour.
3. **I audit** any existing tests in that area first — are they still fit for purpose? Do
   they need rewriting against changed behaviour? — then write the new tests.
4. **I run** `corepack pnpm test:unit` / `test:nuxt` (and Playwright for Part D), iterate to
   green, and confirm the pre-commit gate (`lint` + `typecheck`) still passes.
5. We move to the next batch.

> Nothing is written until you've done the manual pass and given the go-ahead for that
> section.

---

## Conventions (from the existing tests — match these)

- **`unit` vitest project** — node environment, relative imports (`../../app/...`), pure
  functions only. Rich "why" docstrings at the top of each file (see
  `checkbox-aria-checked-redundant.test.ts`).
- **`nuxt` vitest project** — happy-dom, `~/` alias, `mountSuspended` + a small v-model
  wrapper component for anything that touches `defineModel`, `useI18n`, `useState`, `watch`,
  or other Nuxt auto-imports (see `checkbox-controls.test.ts`).
- **Characterisation tests** pin exact emitted markup byte-for-byte — the rendered HTML is
  load-bearing (axe audits it, rules reason about it, the code drawer shows it). See
  `form-input-renderers.test.ts`.
- No project-wide `prettier --write`; format only files we touch.

---

## Test infrastructure status

- **vitest projects** are configured in `vitest.config.ts`: `unit` (node) + `nuxt`
  (happy-dom). Coverage via v8 is enabled. Scripts: `test`, `test:unit`, `test:nuxt`,
  `test:watch`, `test:coverage`.
- **Existing test files (6)** — audited in their respective batches:
  - `test/unit/example.test.ts` — placeholder; **delete** once a real unit file lands.
  - `test/unit/render-utils.test.ts` — 5 utils (Batch A1).
  - `test/unit/issue-formatting.test.ts` — 4 helpers (Batch A1).
  - `test/unit/form-input-renderers.test.ts` — 4 renderers (Batches B7–B10).
  - `test/unit/checkbox-aria-checked-redundant.test.ts` — 1 rule (Batch B8).
  - `test/nuxt/checkbox-controls.test.ts` — controls watcher (Batch B8).
- **End-to-end is NOT set up yet.** Proposed harness: `@playwright/test` +
  `@axe-core/playwright`, run against `corepack pnpm preview` (or `dev`). This needs install +
  config + a `test:e2e` script — that's **Batch D0**, and I'll confirm the tooling choice
  with you before installing anything.
- **Doc drift to fix at the end:** `PROGRESS.md` and `NOTES.md` both say the test suite is
  "scaffolding only / empty". That's no longer true — update them once coverage lands.

---

## Part A — Shared foundations

These underpin everything. Do them first; they're fast, deterministic, mostly node-env.

### A1 — Pure utils & formatting helpers `[unit / node]`

- **Files:** `app/utils/escapeHtml.ts`, `formatCssLength.ts`, `valueFromLabel.ts`,
  `inlineStyleAttribute.ts`, `associateLabel.ts`, `issueFormatting.ts`, `prettifyCss.ts`,
  `prettifyHtml.ts`, `domIds.ts`, plus the Learn-vocabulary drift guard
  (`learnConcepts.ts` / `learnCategories.ts` vs the Zod enums in `content.config.ts`).
- **Manual browser pass:** open the **code drawer** (bottom of preview) on any component —
  flip between HTML / CSS panes and use **Copy inline** / **Copy with classes**. Confirm the
  markup is escaped and pretty-printed correctly, and that the Issues panel rule titles read
  well (these exercise `prettifyHtml/Css`, `escapeHtml`, `issueFormatting`).
- **Audit existing:** `render-utils.test.ts` (5 utils) and `issue-formatting.test.ts` (4
  helpers) — confirm still accurate, then **extend**: `prettifyCss`/`prettifyHtml` have no
  tests yet (note `prettifyHtml` needs `DOMParser`, so its real coverage belongs in the
  `nuxt`/happy-dom project; the node fallback path can stay in `unit`).
- **New assertions:** pretty-printer wrapping thresholds + void-tag handling + attr escaping;
  a **drift-guard test** asserting `LEARN_CONCEPT_IDS` and the category list exactly match the
  `content.config.ts` Zod enums (catches the "files commonly touched together" hazard).

### A2 — Contrast `[unit / node + nuxt]`

- **Files:** `app/composables/useContrast.ts` (pure math via `export const _internal`), and
  the `ContrastBadge.vue` component.
- **Manual browser pass:** in **Controls → Colours**, change background / text / border
  colours and watch the **ContrastBadge** ratio + verdict (AAA / AA / AALarge / Fail). Try a
  translucent `rgba(...)`, a `#abc` short hex, identical fg/bg, and a large font size — check
  the verdict bucket flips where expected.
- **New assertions (node):** `_internal.parseColor` (hex 3/4/6/8, rgb/rgba, garbage→null),
  `relativeLuminance`/`wcag2ContrastRatio` against known pairs (black/white = 21:1),
  `flatten` alpha compositing, `isLargeText` boundaries (24px / 18.67px bold),
  `bucketVerdict` thresholds. **High value** — this math is reused by `placeholderContrast`
  and `focusLowContrast` rules.
- **New assertions (nuxt):** `ContrastBadge` maps verdict → label/icon/colour correctly.

### A3 — Unit conversion `[unit / nuxt]`

- **Files:** `app/composables/useUnitConversion.ts` (uses `useState`, so nuxt project).
- **Manual browser pass:** on a sized control (e.g. width / padding / font-size), toggle the
  **px ↔ rem** unit switch and confirm the value converts sensibly. Then drag the global
  **rem-baseline slider** (simulated root font-size) and confirm rem-based values re-resolve
  in the preview against the new root.
- **New assertions:** px↔rem round-trips; the **slider-reference (16px) vs simulated-root**
  distinction (`lengthToPx`/`fromPx` follow `simulatedRootPx`; `lengthToSliderPx`/
  `fromSliderPx` use the fixed 16); `resolveProps` flattens only `CssLength` values;
  `hasRem`; `isCssLength`; `convertLength` no-op when units match.

### A4 — Shared rules `[unit / node]`

- **Files:** `app/rules/shared/vague-label.ts`, `invisible-text.ts`, `overflow.ts` (DomRule).
- **Manual browser pass:** on any button, set the label to `"OK"` / `"Click here"` → expect
  a **vague-label** warning in Issues; set text colour == background → **invisible-text**
  critical; shrink width/height while keeping a long label → **content-overflow** critical.
  Confirm each clears when you undo it.
- **New assertions:** vague-label vocabulary hits + verb-noun passes + icon-mode skip +
  aria-label-over-label precedence; invisible-text exact-match only (case/space normalised);
  overflow X/Y/both branches and the no-overflow null.

### A5 — Audit pipeline & shared composables `[unit / nuxt]`

- **Files:** `useCustomRules.ts`, `useDomRules.ts`, `useAxeResults.ts` (`useAllViolations`,
  `useAxeCounts`), `useButtonControlsModel.ts`, `useToggleableSection.ts`, `useInlineToClass.ts`,
  `useManualReview.ts`.
- **Manual browser pass:** watch the **toolbar count badges** (critical / warnings / passing)
  while toggling props that trip rules — confirm criticals = serious+critical and warnings =
  moderate+minor. Toggle a control **section on/off** (e.g. font-size switch, focus ring) and
  confirm the section's enabled state tracks the model. Check **Copy with classes** output
  (`useInlineToClass`). Tick items in **Manual review** and watch the progress percentage.
- **New assertions:** `useCustomRules.evaluate` translates `ViolationResult`→`AxeResult` and
  only pushes non-null; `useDomRules` re-evaluates on measurement change and clears on null;
  `useAxeCounts` bucketing across all three sources; `useAllViolations` merge order;
  `useButtonControlsModel.update`/`updateMany` direct-mutation; `useToggleableSection.enabled`
  + `toggle`; `useInlineToClass.convert` (with/without other attrs, no-style→null);
  `useManualReview` axe+static merge, `setChecked`/`checkAll`/`uncheckAll`, progress maths
  (incl. empty = 100%).

---

## Part B — Per component (vertical slices)

For each component we cover **three layers together** because that's how you'll test it in the
browser: the **render function** (characterisation, node), its **custom rule evaluators**
(node), and its **controls watcher(s) / model logic** (nuxt). Recommended order runs simplest
→ most stateful.

**Per-component Manual browser pass (template):** cycle every **variant** in the picker;
exercise every **control**; toggle each **context wrapper**; click the preview to confirm the
**toast / state** behaviour; read the **code drawer** HTML/CSS/JS panes; and walk the
**Issues** list, tripping and clearing each custom rule.

| Batch | Component | Render fn | Custom rules | Controls / watcher |
|------|-----------|-----------|--------------|--------------------|
| **B1** | `buttons-action-triggers` | `buttons/shared/render.ts` (characterise the `<button>` / `type="button"` paths) | `target-size` (AA+AAA), `focus-visible` (`focusNotVisible`+`focusLowContrast`), `focusable-in-anchor` | `ActionTriggerControls.vue` |
| **B2** | `buttons-form-buttons` | submit/reset across `<button>`/`<input>` + `input-image` | (shared button rules) | label-restore + form-wrap-by-default + contentType-clear watchers |
| **B3** | `buttons-toggle-buttons` | toggle markup + pressed CSS | `toggle-state-missing`, `toggle-wrong-attribute` | toggle controls |
| **B4** | `buttons-switches` | pill/thumb CSS + 3 variants + JS pane | `switch-no-role`, `switch-wrong-attribute` (both skip `input-checkbox-switch`) | switch state + notification toast |
| **B5** | `buttons-disclosure-triggers` | expanded/hidden panel | `disclosure-no-state`, `disclosure-state-out-of-sync` | disclosure state |
| **B6** | `buttons-menu-triggers` | haspopup/expanded + hidden popup | `menu-no-haspopup`, `menu-no-expanded` | menu state |
| **B7** | `input` | `input/render.ts` (**deepen** existing) | `input/aria-label-without-visible-label`, `placeholder-contrast` | `InputControls.vue` + `useVariantLabelSync` (type→label) |
| **B8** | `checkbox` | `checkbox/render.ts` (**audit + deepen**) | `group-no-fieldset`, `aria-checked-redundant` (**audit**), `checked-and-indeterminate`, `parent-child-mismatch` | `CheckboxControls.vue` (**audit** existing nuxt test) + `deriveParentState` |
| **B9** | `radio` | `radio/render.ts` (**deepen**) | `group-no-fieldset` | `RadioControls.vue` |
| **B10** | `select` | `select/render.ts` (**deepen** — only 1 case today; add `select-multiple` + `div-combobox`) | `select-no-label`, `select-options-empty`, `select-not-keyboard` | `SelectControls.vue` |

**Audits inside Part B:**
- **B7–B10** audit `form-input-renderers.test.ts` — it pins one variant per renderer; the
  others (input types, select-multiple, the div-combobox anti-pattern, checkbox group modes)
  are uncovered. Extend each toward full variant coverage.
- **B8** audits both `checkbox-aria-checked-redundant.test.ts` (rule) and
  `checkbox-controls.test.ts` (the `renderAs → ariaChecked` + parent-from-children watchers) —
  confirm they still match current behaviour after any bugfixes from your manual pass.

> The button-family renderer (`buttons/shared/render.ts`) is the ~500-line workhorse. I'll
> confirm it's import-clean for the node project (the form renderers already are) and pin
> output per `renderAs`, focus-ring CSS, and pressed/switch/disclosure/menu branches.

---

## Part C — Shared inspector UI & studio shell `[nuxt / mountSuspended]`

The outer branches — heavier component mounts. Do after the logic they present is covered.

- **C1 — Issues panel:** `IssueSection.vue` auto-expand on first violation (watch+immediate,
  *not* `default-open`) and the "manual collapse stays collapsed" behaviour; `IssuesPanel.vue`
  composes 3 sections. *Manual:* trip a rule and watch the section open once, then collapse it
  and trip another — it must stay shut.
- **C2 — Count badges:** `AnimatedCountBadge.vue` count display + reduced-motion. *Manual:*
  watch the toolbar badges tally.
- **C3 — Manual review panel:** `ManualReviewPanel.vue` checklist + progress badge wiring to
  `useManualReview`.
- **C4 — Learn panel & Read Mode:** `LearnPanel.vue` pinned-vs-categorised topic ordering;
  `useReadMode` open/switchTopic/close + return-path stash; `useInspectorTab.focusLearnTopic`.
  *Manual:* click a `↗` Learn-link, confirm it opens the reader and "close" returns you to the
  same component.
- **C5 — Code drawer:** `CodeDrawer.vue` HTML/CSS/JS pane toggles, copy-confirm reset, the
  keyboard-operable resize handle, JS pane hidden when no `js`.
- **C6 — ComponentStudio shell:** teleport targets resolve; toast selection logic
  (`suppressDemoClickToast`, implicit-submit link only for type-less `<button>`); the
  wrapper-availability watcher clears a wrapper that a new variant disallows.

---

## Part D — User end-to-end (Playwright)

Real-browser journeys through the studio. The in-iframe axe audit already runs at runtime;
these tests drive the **user's** experience and add the planned **AAA gate on the app's own
chrome**.

- **D0 — Harness setup:** install `@playwright/test` + `@axe-core/playwright`, add config +
  `test:e2e` script, run against `corepack pnpm preview`. *(I'll confirm tooling with you
  first.)*
- **D1 — Studio core journey:** `/` redirects to action-triggers; sidebar nav switches
  components; preview iframe renders; controls survive navigation (the per-id `useState`).
- **D2 — Audit feedback loop:** change a control → preview repaints → Issues panel + toolbar
  counts update (e.g. shrink target size → critical appears).
- **D3 — Variant & wrapper pickers:** switching variant updates preview + Issues; wrapping in
  `<form>` changes submit behaviour.
- **D4 — Code drawer:** open, switch panes, Copy inline / Copy with classes write to clipboard.
- **D5 — Read Mode:** open a Learn topic from a `↗` link and from the Learn tab; deep-link
  `/learn/<topicId>` resolves SSR'd; close returns to the stashed studio route.
- **D6 — Global prefs persistence:** font / size / high-contrast / theme persist across reload
  (localStorage + color-mode cookie).
- **D7 — AAA gate (the big one):** run `@axe-core/playwright` against every studio + learn
  route and assert zero violations at WCAG 2.2 AAA. This is the gate AGENTS.md/PROGRESS.md call
  for but that was never wired. *Note: this audits the **app chrome**, not the user-tuned
  inspected component.*
- **D8 — Mobile blocker:** below-`lg`, studio shows `MobileBlocker`; `/learn/*` stays usable.

---

## Progress tracker

| Batch | Area | Manual pass | Tests written | Notes |
|------|------|:-----------:|:-------------:|-------|
| A1 | Pure utils & formatting | ◑ | ◑ | Done: escapeHtml, formatCssLength, valueFromLabel, inlineStyleAttribute, associateLabel, issueFormatting, prettifyCss, prettifyHtml (unit fallback + nuxt DOM path), domIds. **Remaining:** Learn-vocab drift guard (learnConcepts/learnCategories vs content.config.ts) |
| A2 | Contrast (math + badge) | ☑ | ☑ | `useContrast._internal` math + round-then-compare fix (`roundRatio`) + removed dead `passes`; `ContrastBadge` verdict→label + 2-dp ratio test (icon is `aria-hidden`/decorative, so the text label is the pinned cue). |
| A3 | Unit conversion | ☑ | ☑ | `useUnitConversion` (nuxt): px↔rem, the **dual reference** (simulated-root vs fixed-16 slider), `convertLength`, `resolveProps` (rem demo → rules), `hasRem`/`isCssLength`, 2-dp round-trip contract. No bug — code confirmed correct. |
| A4 | Shared rules | ☑ | ☑ | `vague-label` (effective-name/aria-override/icon), `content-overflow` (X/Y/both), `invisible-text` — **fixed** to compare parsed colours (catches `#fff`==`#ffffff`, the gap axe also skips), browser-verified end-to-end. |
| A5 | Audit pipeline & shared composables | ☑ | ☑ | `useCustomRules`/`useDomRules` translation + replace/clear, `useAllViolations` merge order, `useAxeCounts` bucketing (serious+critical/moderate+minor, axe-only passes), `useButtonControlsModel` direct-mutation, `useToggleableSection`, `useManualReview` progress (`useInlineToClass` already covered). No bugs found. |
| B1 | buttons-action-triggers | ☐ | ☑ | `button-render.test.ts` (render: button vs button-button, name/icon/escaping, clean-markup-by-default, focus-ring CSS, border-color) + `button-shared-rules.test.ts` (target-size AA/AAA + no-double-report, focus-visible ×2, focusable-in-anchor; shared with B2). Controls panel is pure section composition — no watcher to unit-test. target-size converted to a DOM-measurement rule (`DomRule` reading `DomMeasurement.targetWidth/Height`, the control's offsetWidth/Height measured in the iframe) so an unsized button grades its real rendered size, not a phantom `0 × 0`; DOM rules are now declarable per-definition via `ComponentDefinition.domRules`. |
| B2 | buttons-form-buttons | ☐ | ☑ | `form-button-render.test.ts` (naming by element: `<button>` content vs `<input>` value vs `<input type=image>` alt; value-prop ignored; image form data) + `form-button-controls.test.ts` (nuxt: contentType-clear, label-restore-vs-bespoke, form-wrap-by-default + non-form-wrapper-survives watchers). |
| B3 | buttons-toggle-buttons | ☐ | ☐ | |
| B4 | buttons-switches | ☐ | ☐ | |
| B5 | buttons-disclosure-triggers | ☐ | ☐ | |
| B6 | buttons-menu-triggers | ☐ | ☐ | |
| B7 | input | ☐ | ☐ | deepen form-input-renderers |
| B8 | checkbox | ☐ | ☐ | audit 2 existing files |
| B9 | radio | ☐ | ☐ | |
| B10 | select | ☐ | ☐ | most under-covered renderer |
| C1 | Issues panel | ☐ | ☐ | |
| C2 | Count badges | ☐ | ☐ | |
| C3 | Manual review panel | ☐ | ☐ | |
| C4 | Learn panel & Read Mode | ☐ | ☐ | |
| C5 | Code drawer | ☐ | ☐ | |
| C6 | ComponentStudio shell | ☐ | ☐ | |
| D0 | E2E harness setup | ☐ | ☐ | confirm tooling first |
| D1 | Studio core journey | ☐ | ☐ | |
| D2 | Audit feedback loop | ☐ | ☐ | |
| D3 | Variant & wrapper pickers | ☐ | ☐ | |
| D4 | Code drawer (e2e) | ☐ | ☐ | |
| D5 | Read Mode (e2e) | ☐ | ☐ | |
| D6 | Global prefs persistence | ☐ | ☐ | |
| D7 | AAA gate (all routes) | ☐ | ☐ | |
| D8 | Mobile blocker | ☐ | ☐ | |
