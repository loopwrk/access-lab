# Progress

Current snapshot of what is built, what is in flight, and what remains. Update this file as the implementation moves. AGENTS.md covers conventions; this file covers state.

---

## Status

**Phase:** Mid-development, in a pre-user-testing polish window. New components are paused while existing surfaces are tightened, audited, and rough edges flattened. The next addition (after polish) will be product-driven by user-testing findings.

**What runs today:** the full Studio shell, all four inspector tabs (Controls, Issues, Manual, Learn), the three-engine audit pipeline (axe-core + prop-based custom rules + DOM-based rules), the Read Mode reader at `/learn/<topicId>`, and ten inspected components — six in the button family plus four form inputs.

**What's not done:** the test suite (vitest scaffolding only) and the axe-playwright CI accessibility gate.

---

## Completed work

### Design tokens & typography

- `app/assets/css/tokens.css` — every CSS custom property defined per mode: light (default), dark, high-contrast light, high-contrast dark. Typography tokens (`--al-font`, `--al-font-mono`, `--al-base-size`, font-size scale) plus `--focus-ring`.
- `app/assets/css/main.css` — Tailwind v4 `@import` + `@theme static` block; tokens mapped into `--ui-*` for Nuxt UI internals.
- `app/app.config.ts` — Nuxt UI v4 colour roles aliased to AccessLab tokens, button compound variants for segmented pickers, FieldGroup base styling, USwitch unchecked-track override.
- Self-hosted fonts: Figtree variable, Atkinson Hyperlegible, JetBrains Mono variable (all via `@fontsource*`), plus OpenDyslexic via the `open-dyslexic` package. Comic Sans is system-stack only.

### App shell

- `app.vue` — `<NuxtLayout>` wrapper, sets `<html lang="en">` via `useHead({ htmlAttrs })`, i18n-driven SEO meta.
- `app/layouts/default.vue` — studio three-pane shell: `grid-rows-[auto_1fr] h-dvh` outer, skip links, AppBar, AppSidebar, main (PreviewToolbar + iframe slot + CodeDrawer), AppInspector. `h-dvh` (not `min-h-dvh`) keeps the layout bounded; viewport overflow is impossible by construction.
- `app/layouts/learn.vue` — reading-mode shell: AppBar, local close button, desktop tree aside (LearnTree), article slot. No MobileBlocker — reading is deliberately mobile-usable.
- `app/error.vue` — 404 / generic error page; detects missing component slugs from `/components/*` paths.

### Inspector

- `app/components/AppInspector.vue` — `UTabs` (`:content="false"`) plus four teleport-target panels (`controls-panel`, `issues-panel`, `manual-panel`, `learn-panel`). Aside is `flex flex-col min-h-0`; inner div is `flex-1 min-h-0 overflow-y-auto`. Tab strip stays pinned; content scrolls within.
- `app/components/AppSidebar.vue` — flat `UNavigationMenu` (no accordion). Two groups: Buttons (6 items) and Form Inputs (4 items). Each item links to its component route.
- `app/components/AppBar.vue` — font family picker (4 options), size picker (4 options), high-contrast toggle, light/dark toggle. Reads composable refs via destructure so Vue auto-unwraps in the template; `setMode('light')` / `setMode('dark')` for direct mode switches.

### Preview pipeline

- `public/preview-shell.html` — iframe shell. Loads axe-core (`public/vendor/axe-core.min.js`), listens for `preview:render`, mounts HTML + CSS, waits for `document.fonts.ready`, posts overflow measurements and axe results. Delegated `click` listener for trigger-shaped elements (`TRIGGER_SELECTOR`) posts `demo:click`. Delegated `change` listener on `al-inspected-element` checkboxes also posts `demo:click` (for the `input-checkbox-switch` variant). `submit` listener cancels navigation and reports form payload.
- `app/components/PreviewIframe.vue` — sandboxed iframe (`allow-scripts allow-same-origin allow-forms`; the same-origin grant is intentional — axe-core needs DOM access; the iframe loads only `/preview-shell.html` from our own origin). Exposes `render(html, css?, rootFontSize?)`. Queues renders until the shell posts `preview:ready`.
- `app/components/ComponentStudio.vue` — mounts `<PreviewIframe>`, teleports per-component controls + IssuesPanel + ManualReviewPanel + LearnPanel into the inspector. Subscribes to iframe messages via `usePreviewMessage()` and surfaces them as toasts.
- `app/components/PreviewToolbar.vue` — title + Learn-link, variant picker chip, wrapper picker chip, count badges (critical / warnings / passing).
- `app/components/CodeDrawer.vue` — `UCollapsible`. Toggles HTML / CSS panes via `UFieldGroup`. Persistent height in localStorage; resize handle is keyboard-operable (Arrow/Home/End) with a 24-px effective hit area via a `::before` pseudo-element (passes WCAG 2.5.8). Scrollable code region is keyboard-accessible (`tabindex="0"` + `role="region"` + labelled).

### Composables (25 total)

The composable folder is split between **state/lifecycle drivers** and **typed helpers** over a shared `defineModel` ref.

**Audit pipeline**

- `useAxeAudit(iframeRef)` — postMessage bridge. Listens for `preview:ready`, `axe:result`, `axe:error`, `overflow:result`. Validates array payloads defensively. Uses VueUse `useEventListener` so cleanup is automatic.
- `useAxeResults()` — single source of truth for the `axe-results` `useState` slot.
- `useAllViolations()` — merges axe + custom + DOM violations.
- `useAxeCounts()` — critical / warning / passing counts across all three sources.
- `useCustomRules(rules, tagName)` — evaluates prop-based rules. Receives the component's tag so the AxeResult shape carries the real element name (not a hardcoded `<button>`).
- `useDomRules(rules)` — evaluates rules against `dom-measurement` shared state.

**Per-component lifecycle**

- `useInspectedComponent(definition, options)` — the heart of every component page. Owns `componentProps` (keyed `useState` per definition.id so navigation away preserves tweaks), runs a `useDebounceFn`-throttled render that calls `definition.render`, injects the `<style>${css}</style>${html}` payload into the iframe, applies context wrappers, resolves `CssLength` to flat px before passing to rules.
- `useInspectorTab()` — active-tab state + `focusPanel(tab)` (with `nextTick` + scroll-into-view) + `focusLearnTopic(id)` (delegates to `useReadMode().open()`).
- `useReadMode()` — `isOpen` / `activeTopicId` / `open(topicId)` / `switchTopic(topicId)` / `close()`. Stashes the return path in `useState('studio-return-path')` so closing the reader restores the studio location.
- `useStudioToolbar()` — shared state for the active component name + primary Learn topic + relevant concepts.
- `useSidebar()` — open/closed state for the left sidebar.
- `useIsBelowDesktop()` — `useMediaQuery('(max-width: 1023px)')`.

**Theme / font / preferences**

- `useTheme()` — plain composable (not Pinia). Delegates light/dark to `useColorMode()` (from `@nuxtjs/color-mode`); a single `watchEffect` mirrors mode to `.theme-light`/`.theme-dark` for tokens.css and stamps `.theme-high-contrast` independently. `setMode(value)` writes through `colorMode.preference`.
- `useFont()` — plain composable. Family + size persisted via VueUse `useLocalStorage`. Family is written via VueUse `useCssVar('--al-font')`; size is written via direct `documentElement.style.fontSize` (it's not a custom property).

**Studio model helpers**

- `useButtonControlsModel(model)` — typed `update<K>(key, value)` + `updateMany(patch)` over a `defineModel<Partial<P>>` ref. Direct-mutation pattern — more efficient than spread and is the idiomatic Vue 3.4+ approach.
- `useToggleableSection(model, config)` — `enabled` computed (true when any of the section's keys is non-null) + `toggle(value)` that delegates to caller-supplied `enable()` / `disable()` patches.
- `useNaturalSize(model, tagName)` — intrinsic-size probe used by Dimensions and Border sections.
- `useButtonStudioDefaults(tagName)` — combines `useBrowserDefaults` with hardcoded fallbacks; returns numeric defaults.
- `useBrowserDefaults(tagName)` — probes user-agent styles via an offscreen element with `all: revert`. Cached per tag in `useState`.
- `useUnitConversion()` — `CssLength` (`{ value, unit: 'px' | 'rem' }`) with `lengthToPx`, `fromPx`, slider variants, format helpers, `simulatedRootPx` for the rem demo.

**Other**

- `useContrast(fg, bg, options)` — WCAG2 luminance math, alpha-aware, returns `{ ratio, verdict, passes }`.
- `useManualReview(checklist)` — merges axe `incomplete` with the static checklist, manages checkbox state.
- `useRenderedHtml()` — shared state for the code drawer (`rendered-html`, `rendered-css`).
- `useInlineToClass()` — converts inline styles to a CSS rule block for the "Copy with classes" button.
- `useLearnTopics()` / `useLearnTopicTree()` — Nuxt Content access layer over `content/learn/*.md`. 16 topics keyed by frontmatter `topicId`, grouped by `category`.
- `usePreviewMessage(handlers)` — typed dispatch table over `useEventListener(window, 'message')`. Replaces the 8 manual `addEventListener` pairs that used to live across the controls files.
- `usePreviewIframeOutsideClick(callback)` — 3-line wrapper over `usePreviewMessage({ 'preview:pointerdown': callback })`.

### Inspected components

**Button family — 6 components.** All share `app/components/inspected/buttons/shared/{types, render, variants, wrappers}.ts`.

- `buttons/action-triggers` — `<button>` and `<button type="button">`. Rules: target-size AA/AAA, focusable-in-anchor, focus-not-visible, focus-low-contrast.
- `buttons/form-buttons` — six form-related variants (submit/reset across `<button>` and `<input>` plus `input-image`). Form-wrap-by-default and label-restore watchers in the controls composer.
- `buttons/toggle-buttons` — `aria-pressed` / `aria-checked` / `visual-only` behaviours. Rules: `toggle-state-missing`, `toggle-wrong-attribute`.
- `buttons/switches` — `role-switch` / `aria-pressed` / `none` behaviours plus pill+thumb visual styling. Three variants: `button-button`, `button`, `input-checkbox-switch` (the native-checkbox-with-`role="switch"` pattern). Rules: `switch-no-role`, `switch-wrong-attribute` — both skip when `renderAs === 'input-checkbox-switch'` because that markup hardcodes `role="switch"`. The demo toggles dark mode via an inline `onclick="toggleDarkMode()"` (shell-defined) — deliberately state-decoupled so the `none` behaviour flips the visual for mouse users while exposing nothing to assistive tech, the anti-pattern the page teaches.
- `buttons/disclosure-triggers` — `aria-expanded` correct / stuck-at-false / none. Optional `aria-controls`. Panel uses browser-native `hidden`.
- `buttons/menu-triggers` — `aria-haspopup` + `aria-expanded` combinations. Popup uses browser-native `hidden`. Keyboard contract deliberately unwired in the iframe; the Learn topic + manual checklist cover the production contract.

**Form-input family — 4 components.**

- `input` — text / email / tel / url / password / number / search. Label association options. Required + disabled + placeholder + help text. Font-size, colours, contrast badge, border.
- `checkbox` — single, group-with-fieldset, group-no-fieldset. Custom rule: `checkbox-group-no-fieldset` (the failure axe-core misses).
- `radio` — same group modes as checkbox plus label-association choices. Custom rule: `radio-group-no-fieldset`.
- `select` — three variants: `select-native`, `select-multiple`, `div-combobox` (broken-custom-select anti-pattern). Custom rules: `select-no-label`, `select-options-empty`, `select-not-keyboard`.

### Custom rules

- `rules/types.ts` — `Rule`, `DomRule`, `DomMeasurement`, `ViolationResult`, `ManualChecklistItem`.
- `rules/shared/` — cross-component rules: `vague-label`, `invisible-text`, `overflow` (DOM-based).
- `rules/buttons/shared/` — `target-size` (AA + AAA), `focus-visible`, `focusable-in-anchor`, plus the shared manual checklist.
- `rules/buttons/{toggle-buttons,switches,disclosure-triggers,menu-triggers}/` — pattern-specific rules.
- `rules/checkbox/` + `rules/radio/` — `group-no-fieldset` rule + manual checklist.
- `rules/select/` — `select-no-label`, `select-options-empty`, `select-not-keyboard` + manual checklist.

### Learn content

16 markdown files in `content/learn/` ingested via the Nuxt Content collection defined in `content.config.ts`. Frontmatter carries `topicId`, `category`, `order`, `summary`, `related`, `concepts`. The `concepts` enum is mirrored in `app/utils/learnConcepts.ts` — both lists must stay in sync (Zod validates on build).

Topics: accessibleName, buttonDisabledStates, buttonTypes, buttonValueAttribute, checkbox, disclosureTriggers, formWrapping, invisibleText, menuTriggers, nativeRendering, radio, remUnits, select, switches, toggleButtons, vagueLabel.

### Pages

- `pages/index.vue` — redirects `/` → `/components/buttons/action-triggers`.
- `pages/components/[component].vue` — dynamic flat route. Looks up the slug in the registry; redirects `'button'` (legacy) → `/components/buttons/action-triggers`; throws 404 for unknown slugs.
- `pages/components/buttons/[pattern].vue` — dynamic nested route for the button family. Looks up `buttons-${pattern}`.
- `pages/learn/index.vue` — redirects `/learn` → the first available topic.
- `pages/learn/[topicId].vue` — read-mode article body. Layout owns the chrome.

---

## Recent architectural shifts

These are the directional changes that the previous PROGRESS.md hadn't captured. They're worth knowing about because they set the patterns new code should follow.

### State management consolidated on `useState` + plain composables

- `@pinia/nuxt` and `pinia` uninstalled. `useTheme` and `useFont` rewritten as plain composables matching the existing `useSidebar` pattern. `AppBar.vue` destructures the refs at setup scope so the template auto-unwraps cleanly.
- Pattern: cross-component state lives in `useState('<key>', initial)`; setup-context composables wrap that state with a focused public API.

### VueUse adoption sweep

The codebase no longer hand-rolls lifecycle bookkeeping for events, timers, or debouncing.

- `useEventListener(window, 'message', handler)` everywhere we used to do `onMounted + onBeforeUnmount` pairs (8 sites).
- `useTimeoutFn` for the glow pulse + tally settle in `AnimatedCountBadge` and the copy-confirmation reset in `CodeDrawer`.
- `useDebounceFn` for the render debounce in `useInspectedComponent` (was `let renderTimer + setTimeout + clearTimeout`).
- `useWindowSize` for `CodeDrawer`'s max-height calc (reactive resize for free).
- `useCssVar` for `--al-font` in `useFont`.
- `useColorMode` (via `@nuxtjs/color-mode`, registered explicitly in `nuxt.config.ts`) is the source of truth for light/dark mode.

### Iframe message bridge centralised

`usePreviewMessage(handlerMap)` is the single composable for parent-side iframe-message dispatch. Each pattern-specific controls component declares its handler map (e.g. `'demo:click': () => { … }`) instead of repeating the listener boilerplate. `useAxeAudit` is the one exception — it uses `useEventListener` directly because it filters on `event.source !== iframe.contentWindow`, which `usePreviewMessage` deliberately doesn't enforce.

### Declarative iframe-interaction protocol (facts up, meaning on the host)

The fix for "preview-shell.html accumulates per-component branches" (refactoring backlog item 9). The shell now reports a trigger activation as a plain **`demo:activate` fact** when the trigger sits inside an element marked **`data-al-interaction`**; the component's own controls decide what it means (e.g. flip `disclosureExpanded` / `menuOpen`). The marker lives on the studio **wrapper**, not the trigger, so the copied button stays clean semantic markup.

Why it matters: a **new** component needing a host-driven interaction (the common case — disclosure and menu triggers are open/close/active-state driven) adds the marker in its renderer plus a `usePreviewMessage({ "demo:activate": ... })` listener, and **never edits the shell**. The per-component logic grows on the host, where it is unit-testable, instead of in the shared static file.

The shell posts `demo:activate` then **falls through** to the submit/reset heuristic rather than returning, so "the trigger was activated" and "this is a submit-typed button with no form" stay independent facts — a type-less `<button>` both toggles its panel and surfaces the same "no form to submit to" lesson as everywhere else. `demo:click` is now posted only for un-migrated triggers.

Migrated so far: `buttons-disclosure-triggers`, `buttons-menu-triggers`. The remaining shell branches (switch-label forwarding, the div-combobox open/close/pick, the div-checkbox click forwarding) are existing in-iframe special cases — deliberately left for now and folded into the checkbox/select test batches (B8/B10), since migrating them is optional cleanup that changes behaviour on under-tested components.

### Type extraction for axe results

`~/types/axe.ts` owns `AxeResult`, `NodeResult`, `CheckResult`, `ImpactValue`, `AxeState`. `useAxeResults()` is the single state-initializer. `useAxeAudit` no longer redeclares the same `useState` key. Same shape across writer and readers by construction.

### `defineModel` everywhere

Every controls component now uses `defineModel<Partial<P>>({ required: true })` + `useButtonControlsModel(model)`. The four legacy `defineProps<{ modelValue }>` + `defineEmits<{ 'update:modelValue' }>` components (LengthValueInput, LengthControl, SplitSpacingControl, InputControls) were migrated.

### `IssueSection` + auto-expand

`IssuesPanel.vue` shrank from 423 lines to 39 by extracting `IssueSection.vue` for the critical / warning / passing sections (which were ~90 lines of duplicated markup each). Sections auto-expand the first time a violation arrives, and respect any subsequent user toggle (a manual collapse sticks; the section never re-opens automatically against the user's intent).

### `ColorPickerRow` atom

The three-times-duplicated colour-picker block in `InputControls.vue` is now a single `<ColorPickerRow v-model="color" :label="…">` atom under `app/components/controls/`.

### Tailwind conversion

Every `<style scoped>` block that the AGENTS.md rule permits is gone. The two legitimate stays: `AnimatedCountBadge.vue` (keyframes + Vue Transition classes + `prefers-reduced-motion` overrides) and `pages/learn/[topicId].vue` (`:deep()` selectors targeting markdown-emitted elements that can't carry classes).

### Lint configuration

Superseded 10 June 2026: **Prettier now owns formatting; ESLint checks correctness only.** The earlier ESLint-stylistic formatting rules (double quotes, semicolons, trailing commas, etc.) fought the editor's Prettier format-on-save — every save re-broke the lint baseline. The stylistic block is removed from `nuxt.config.ts`; `eslint-config-prettier` is appended last in `eslint.config.mjs` so no formatting rule survives; Prettier config lives in `.prettierrc.json` (printWidth 100, one attribute per line in Vue templates, otherwise defaults that match the existing style). The codebase migrates to Prettier formatting piecemeal as files are touched — no project-wide reformat. `eslint.config.mjs` still disables `vue/no-multiple-template-root` (a Vue-2-era rule that misfires on Vue 3 fragments).

### Console-warning sweep

- `<html lang="en">` set via `useHead({ htmlAttrs })`.
- Code-drawer scrollable region: `tabindex="0"` + `role="region"` + locale-driven `aria-label`.
- Sidebar flattened (was the source of the `<span aria-controls>` Nuxt UI bug).
- `@nuxt/hints` removed (eliminated the `__nuxt_hints/lazy-load` 404 + lazy-load info noise).
- Iframe sandbox attributes documented inline — we accept `allow-scripts allow-same-origin` because axe needs DOM access; we control the iframe source.

### Layout fix

The outer container is `h-dvh` (not `min-h-dvh`). Combined with `min-h-0` on the inspector aside, the studio is bounded to viewport height by construction; the inspector content scrolls internally, not the whole page.

### Baseline repair + commit gate (10 June 2026)

A codebase audit found the baseline broken on a clean working tree (one type error, 29 lint errors) — changes had been committed without running the checks AGENTS.md requires. Fixes applied:

- Type error in `RadioControls.vue` (indexed access doesn't narrow; the picked item is now null-checked directly).
- `lint --fix` sweep, which also exposed a real bug: `app.vue`'s `ogTitle` was the literal string `'t("app.title")'` instead of the translated value. Fixed.
- New committed pre-commit hook at `.githooks/pre-commit` runs `lint` + `typecheck` before every commit. `postinstall` points `core.hooksPath` at the directory so every contributor gets it after `corepack pnpm install`. Emergency bypass: `git commit --no-verify`.
- CI now also runs the test suite (`.github/workflows/ci.yml`).
- First shared render utilities extracted: `app/utils/escapeHtml.ts`, `app/utils/formatCssLength.ts`, `app/utils/valueFromLabel.ts` replace per-file private copies in the four form-input `render.ts` files. `useUnitConversion().formatLength` now delegates to `formatCssLength`, removing a keep-in-sync comment obligation.

---

## Remaining work

### Components

The studio covers a fixed set of ten inspected components (six button-family patterns + four form inputs). The earlier placeholder stubs (accordion, carousel, modal, menu, tooltip, tabs), the `placeholders.ts` registry spread, and the `ComingSoon` page were removed — there is no longer a placeholder mechanism, and those slugs now 404 like any unknown component.

The file picker (`<input type="file">` + label-wrap pattern) was scoped for the button family but parked — the trigger is a `<label>`, not a `<button>`, so it would need a new render branch and `'label-file'` renderAs.

### Tests

Vitest is wired (`pnpm test`, `pnpm test:unit`, `pnpm test:nuxt`, `pnpm test:coverage`), `vitest.config.ts` defines `unit` and `nuxt` projects, but `test/` is mostly scaffolding. Highest-value first tests:

- Pure logic: `useContrast` (parsing, luminance, verdict thresholds), `useUnitConversion` (px↔rem round-trips, slider-reference vs simulated-root distinction), rule evaluators (each `rules/**/*.ts` has a single-function contract).
- Component-level: contrast badge classification, the auto-expand behaviour in IssueSection, the click-bridge → state-flip cycle for switches/toggles/disclosure/menu.
- End-to-end: axe-playwright across every component route. AGENTS.md says CI requires it; the gate isn't wired yet.

### Polish + user-testing prep

Identified during the most recent end-to-end pass, in priority order:

1. `packageManager` in package.json is `pnpm@10.33.4` but a Homebrew-installed pnpm 8 ignores it. Contributors keep hitting store mismatches. Document the corepack workaround in README or add an `engines` entry.
2. Bundle audit (`pnpm build` + check static output sizes) — never run after the VueUse sweep; want to confirm tree-shaking.
3. System-mode toggle in the AppBar (color-mode supports it; UI only exposes Light/Dark).
4. Draft a structured user-testing script so feedback across testers is comparable.

### Refactoring backlog (codebase audit, 10 June 2026)

A full audit for duplication, modularity, and convention drift. The button family and studio shell follow the documented plan; the form-input family (input, checkbox, radio, select) was built in parallel by different sessions and forked several conventions. In priority order:

1. **Form-input controls forked the model-update convention.** All four controls components define a local `update` that replaces the model with a spread (`model.value = { ...model.value, [key]: value }`) instead of using `useButtonControlsModel`'s direct mutation. The "two back-to-back writes race" worked around in `CheckboxControls.vue` exists _because_ of the replacement-write pattern; direct mutation does not race. Migrate all four, then rename the composable `useControlsModel` — it was never button-specific.
2. **Renderer duplication.** The shared `escapeHtml` / `formatCssLength` / `valueFromLabel` utilities now exist (see above), but `styleAttr` is still copied in all four form-input `render.ts` files, and the label-association switch (`for-id` / `wrapping` / `aria-label` / `none`) is re-implemented in input, checkbox, and radio — inside `checkbox/render.ts` the `wrapping` case even rebuilds by hand what its own `inputTag` helper does. Extract a shared style-attribute builder (over a shared style-slice type, see item 8) and a shared label-association helper.
3. **Hardcoded English content in `IssueSection.vue`.** The `TAG_WHY` and `PRINCIPLE_WHY` maps (~30 user-facing strings) violate the i18n-first rule; the pure helpers (`formatRuleId`, `classificationFromTags`, `parseFailureSummary`, `tagWhy`) belong in `app/utils/` where they are testable. The component is 347 lines because it holds content, parsing, and presentation at once.
4. **`InputControls.vue` (512 lines) hand-rolls section atoms.** Two fieldsets share the identical legend `t('controls.input.attributes')` — confusing, and a duplicate accessible name in an app held to AAA. The font-size block hand-rolls switch + slider + `LengthValueInput` instead of using `LengthControl` / `useToggleableSection`. Extract form-input section components (label association, attributes, style) the way the button family has `ButtonStudio/sections/`.
5. **Repeated control boilerplate.** The card checkbox incantation (`variant="card" color="primary" size="md" :ui="CONTROL_CARD_UI"`) appears ~20 times; the Learn-link legend block (anchor + `i-lucide-arrow-up-right` + `focusLearnTopic`) ~35 times. Extract `ControlCardCheckbox` and `SectionLegend` atoms under `app/components/controls/`.
6. **`ButtonStudio/sections/` is misnamed.** All four form-input controls import `ResetDefaultsSection` from it; it has become the studio-wide section library. Rename (e.g. `app/components/studio/sections/`) and update AGENTS.md.
7. **Inconsistent render contract.** `renderRadio` returns a plain string; its three siblings return `RenderedFragment`. Normalise to `RenderedFragment` and return optional fields as `undefined` instead of building conditional object shapes.
8. **Shared prop slices re-declared per definition.** `fontSize` / `bg` / `fgText` / `borderColor` and the label-association union are repeated in all four form-input definitions. Extract shared types in `app/types/`.
9. **`preview-shell.html` accumulates per-component branches** (switch-label forwarding, checkbox `indeterminate`, child-index routing, the combobox open/close/pick logic). **Partially resolved** — the declarative `data-al-interaction` → `demo:activate` protocol is in place (see "Declarative iframe-interaction protocol" above), so new host-driven components (the common case) ship their behaviour via a marker + host listener and never edit the shell. The forward-looking goal — no shell growth for new components — is met. The **existing** in-iframe branches (switch-label forwarding, div-combobox open/close/pick, div-checkbox forwarding) remain and are deliberately deferred: migrating them is optional cleanup that changes behaviour on under-tested components, so it's folded into the checkbox/select test batches (B8/B10) to land under a net.
10. **`VariantPicker.vue` still uses `defineProps` + `defineEmits("update:modelValue")`** — the last straggler from the `defineModel` migration.

### Known dev-console noise (accepted)

- `[intlify] Not found parent scope` — informational, fires during async router middleware resolution. Harmless.
- `Cannot load payload /_payload.json` — expected for `ssr: false` routes; NuxtLink prefetch tries anyway.
- Chrome iframe `allow-scripts allow-same-origin` warning — intentional tradeoff for axe-core. Documented inline.

---

## Codebase onboarding guide

### File map

```
access-lab/
├── AGENTS.md                       # Conventions + operational quick-start. Read every session.
├── NOTES.md                        # General + AI Agent notes. Companion to this file.
├── PROGRESS.md                     # This file. State of the build.
├── README.md                       # Product-facing project description.
├── nuxt.config.ts                  # Modules, i18n, route rules, color-mode, lint config.
├── content.config.ts               # Nuxt Content collection schema (Learn topics).
├── eslint.config.mjs               # Custom ESLint overrides on top of @nuxt/eslint.
├── .prettierrc.json                # Disables Prettier's HTML-in-markdown reflow.
├── package.json                    # Dependencies + scripts. packageManager: pnpm@10.33.4.
├── vitest.config.ts                # vitest project layout (unit + nuxt).
├── content/
│   └── learn/                      # 16 Learn topic markdown files.
├── i18n/
│   └── locales/en/                 # common.json, controls.json, components.json, learn.json.
├── public/
│   ├── preview-shell.html          # Iframe document. Loads axe, bridges postMessage.
│   └── vendor/axe-core.min.js      # axe-core 4.11.4, served locally.
├── design-system/                  # Visual reference: CSS specimen + PNGs. Not runtime.
├── research/                       # Background notes (contrast-calculation.md etc).
├── test/                           # Scaffolding only.
└── app/                            # Nuxt srcDir.
    ├── app.vue                     # Root: NuxtLayout + htmlAttrs.lang + SEO meta.
    ├── app.config.ts               # Nuxt UI theming.
    ├── error.vue                   # Error page.
    ├── assets/css/
    │   ├── tokens.css              # CSS custom properties per mode.
    │   └── main.css                # Tailwind v4 @import + @theme static.
    ├── types/
    │   ├── component.ts            # ComponentDefinition<P>, ControlSchema, ComponentId.
    │   ├── button.ts               # BaseButtonProps + Content/Style/Aria/Focus sub-types.
    │   ├── axe.ts                  # AxeResult, AxeState — shared writer + reader types.
    │   └── typography.ts           # FontSize.
    ├── utils/
    │   ├── domIds.ts               # Stable DOM ids (inspector panels, iframe id).
    │   ├── focusPreviewContent.ts  # Focus management for the preview iframe.
    │   ├── learnCategories.ts      # Learn topic category order (sidebar tree).
    │   ├── learnConcepts.ts        # Closed-vocabulary concept tag list.
    │   ├── prettifyCss.ts          # CSS pretty-printer (display only).
    │   └── prettifyHtml.ts         # HTML pretty-printer (display only).
    ├── composables/                # 25 files — see Composables section above.
    ├── components/
    │   ├── ComponentStudio.vue     # Mounts iframe + teleports all 4 panels.
    │   ├── PreviewIframe.vue       # Sandboxed iframe + render queue.
    │   ├── PreviewToolbar.vue      # Title + variant + wrapper + count badges.
    │   ├── CodeDrawer.vue          # HTML/CSS panes + copy buttons + drag-resize.
    │   ├── AppBar.vue              # Font, size, contrast, light/dark.
    │   ├── AppSidebar.vue          # Flat nav (buttons + form-inputs).
    │   ├── AppInspector.vue        # UTabs + 4 teleport-target panels.
    │   ├── VariantPicker.vue       # UPopover variant chip.
    │   ├── WrapperToggles.vue      # UPopover wrapper chip.
    │   ├── ContrastBadge.vue       # Ratio + verdict + icon.
    │   ├── AnimatedCountBadge.vue  # Counter pill with tally + glow.
    │   ├── IssuesPanel.vue         # Thin: composes 3× IssueSection.
    │   ├── IssueSection.vue        # Per-section card list + helpers.
    │   ├── ManualReviewPanel.vue   # UCheckbox checklist + progress badge.
    │   ├── LearnPanel.vue          # Inspector picker (pinned + categorised).
    │   ├── LearnTree.vue           # Read-mode tree (UContentNavigation).
    │   ├── MobileBlocker.vue       # Below-lg overlay.
    │   ├── RootEmSlider.vue        # Simulated rem-baseline slider.
    │   ├── LengthValueInput.vue    # Number + unit input (px / rem).
    │   ├── content/proseA.vue      # Nuxt Content prose override (external-link icon).
    │   ├── controls/
    │   │   ├── LengthControl.vue   # Slider + value input.
    │   │   ├── SplitSpacingControl.vue # Merge / split 4-sided.
    │   │   └── ColorPickerRow.vue  # Swatch + label + hex input atom.
    │   ├── ButtonStudio/sections/  # 11 sections: Reset, Content, Aria, Text,
    │   │                           # Dimensions, Border, Colours, Focus,
    │   │                           # ToggleState, SwitchState, DisclosureState, MenuState.
    │   └── inspected/
    │       ├── index.ts            # ComponentId → ComponentDefinition registry.
    │       ├── buttons/            # shared/ + 6 pattern dirs.
    │       ├── input/              # definition + render + InputControls.vue.
    │       ├── checkbox/           # definition + render + wrappers + CheckboxControls.vue.
    │       ├── radio/              # definition + render + wrappers + RadioControls.vue.
    │       └── select/             # definition + render + wrappers + SelectControls.vue.
    ├── rules/
    │   ├── types.ts                # Rule / DomRule / ViolationResult / ManualChecklistItem.
    │   ├── shared/                 # vague-label, invisible-text, overflow.
    │   ├── buttons/                # shared/ + 4 pattern dirs.
    │   ├── checkbox/               # group-no-fieldset + manual checklist.
    │   ├── radio/                  # group-no-fieldset + manual checklist.
    │   ├── select/                 # 3 select rules + manual checklist.
    │   ├── input/                  # axe-rules.md (notes only — input rides on axe).
    │   └── a11yproject/rules.json  # Reference: a11yproject checklist as JSON.
    ├── layouts/
    │   ├── default.vue             # Studio shell.
    │   └── learn.vue               # Reading-mode shell.
    └── pages/
        ├── index.vue               # → /components/buttons/action-triggers.
        ├── components/
        │   ├── [component].vue     # Flat route. Form inputs + legacy 'button' redirect.
        │   └── buttons/[pattern].vue # Nested button-family route.
        └── learn/
            ├── index.vue           # → first topic.
            └── [topicId].vue       # Read-mode article body.
```

### Recommended reading order

Read for context first, then trace a single user interaction end-to-end.

**Context**

1. `AGENTS.md` — conventions, the i18n no-`<` rule, the defineModel-of-the-bag pattern, the Nuxt UI-first rule. Read every session.
2. `PROGRESS.md` (this file) — current state and recent shifts.
3. `NOTES.md` — warnings, gotchas, AI-agent-optimised summary.

**Shell**

4. `app/layouts/default.vue` — outer grid, skip links, teleport targets.
5. `app/components/AppInspector.vue` — `UTabs` + 4 teleport panels.
6. `app/components/AppSidebar.vue` — flat nav.

**Design system**

7. `app/assets/css/tokens.css` — colour source of truth.
8. `app/assets/css/main.css` — Tailwind `@theme static` + `--ui-*` mapping.
9. `app/app.config.ts` — Nuxt UI colour aliases + button compound variants.

**Core runtime**

10. `app/composables/useInspectedComponent.ts` — page lifecycle driver. Watch this closely; everything else flows through it.
11. `app/components/ComponentStudio.vue` — mounts iframe + teleports panels + receives messages.
12. `app/components/PreviewIframe.vue` + `public/preview-shell.html` — the iframe boundary.

**Component contract**

13. `app/types/component.ts` — `ComponentDefinition<P>`.
14. `app/components/inspected/index.ts` — registry.
15. `app/components/inspected/buttons/action-triggers/definition.ts` — simplest button-family example. Follow imports into `shared/`.
16. `app/components/inspected/buttons/shared/render.ts` — the 500-line workhorse renderer.

**Audit pipeline**

17. `app/composables/useAxeAudit.ts` — postMessage bridge.
18. `app/composables/useAxeResults.ts` — `useAllViolations` + `useAxeCounts`.
19. `app/composables/useCustomRules.ts` + `useDomRules.ts` — the rule engines.
20. `app/rules/buttons/shared/target-size.ts` — example rule (AA + AAA together).
21. `app/components/IssueSection.vue` — section rendering with auto-expand.

**Controls architecture**

22. `app/composables/useButtonControlsModel.ts` — typed update helper.
23. `app/components/ButtonStudio/sections/ContentSection.vue` — example section.
24. `app/components/inspected/buttons/action-triggers/ActionTriggerControls.vue` — composes sections.

**Reader**

25. `app/composables/useReadMode.ts` — open / switchTopic / close.
26. `app/layouts/learn.vue` — reading shell.
27. `app/pages/learn/[topicId].vue` — article body.
28. `app/composables/useLearnTopics.ts` — Nuxt Content access layer.

### Architectural patterns to internalise

- **Token chain.** `tokens.css` → `@theme static` → `app.config.ts` → `--ui-*` overrides. Every colour flows through this; no shortcuts.
- **Iframe boundary.** App UI = Nuxt UI. Inspected components = bare HTML in the iframe. They communicate exclusively via `postMessage` with origin checking. The iframe is sandboxed; `allow-scripts allow-same-origin` is intentional for axe.
- **`defineModel` of the bag.** A single `Partial<BaseButtonProps>` ref passes through every control section via `defineModel`. Sections read/write through `useButtonControlsModel(model).update(key, value)` — direct mutation, not spread.
- **Three-engine audit.** axe-core in iframe + prop-based rules on the host + DOM-rules on iframe-side measurements. Three `useState` keys, merged by `useAllViolations()`. The Issues panel and toolbar badges consume the merge.
- **Teleport for cross-layout injection.** `ComponentStudio` teleports controls + 3 panels into stable-id targets in the layout. The layout owns DOM structure; the page owns content.
- **VueUse for lifecycle.** Never `setTimeout` directly; never `addEventListener` directly. `useEventListener`, `useTimeoutFn`, `useDebounceFn` give automatic cleanup.
- **`useState` for cross-component state.** Pinia is gone. Composables that wrap `useState` are the canonical state-sharing primitive.
- **Nuxt UI-first.** Every piece of app chrome uses Nuxt UI. Raw HTML appears only in the iframe and in popover trigger buttons.
- **i18n-first.** No hardcoded English strings. Markup in Learn prose only — and via markdown, not via `<` in JSON.
