# Progress

Current snapshot of what is built, what is in flight, and what remains. Update this file as the implementation moves. AGENTS.md covers conventions; this file covers state.

---

## Status

**Phase:** Mid-development, in a pre-user-testing polish window. New components are paused while existing surfaces are tightened, audited, and rough edges flattened. The next addition (after polish) will be product-driven by user-testing findings.

**What runs today:** the full Studio shell, all four inspector tabs (Controls, Issues, Manual, Learn), the three-engine audit pipeline (axe-core + prop-based custom rules + DOM-based rules), the Read Mode reader at `/learn/<topicId>`, and ten inspected components - six in the button family plus four form inputs.

**What's not done:** Part D of the test plan - Playwright end-to-end journeys plus the axe-playwright AAA gate on the app's own chrome. The unit and Nuxt-component suites are otherwise extensive: UNITTESTS.md Parts A through C are complete (359 unit + 242 Nuxt-component tests passing).

---

## Completed work

### Design tokens & typography

- `app/assets/css/tokens.css` - every CSS custom property defined per mode: light (default), dark, high-contrast light, high-contrast dark. Typography tokens (`--al-font`, `--al-font-mono`, `--al-base-size`, font-size scale) plus `--focus-ring`.
- `app/assets/css/main.css` - Tailwind v4 `@import` + `@theme static` block; tokens mapped into `--ui-*` for Nuxt UI internals.
- `app/app.config.ts` - Nuxt UI v4 colour roles aliased to AccessLab tokens, button compound variants for segmented pickers, FieldGroup base styling, USwitch unchecked-track override.
- Self-hosted fonts: Figtree variable, Atkinson Hyperlegible, JetBrains Mono variable (all via `@fontsource*`), plus OpenDyslexic via the `open-dyslexic` package. Comic Sans is system-stack only.

### App shell

- `app.vue` - `<NuxtLayout>` wrapper, sets `<html lang="en">` via `useHead({ htmlAttrs })`, i18n-driven SEO meta.
- `app/layouts/default.vue` - studio three-pane shell: `grid-rows-[auto_1fr] h-dvh` outer, skip links, AppBar, AppSidebar, main (PreviewToolbar + iframe slot + CodeDrawer), AppInspector. `h-dvh` (not `min-h-dvh`) keeps the layout bounded; viewport overflow is impossible by construction.
- `app/layouts/learn.vue` - reading-mode shell: AppBar, local close button, desktop tree aside (LearnTree), article slot. No MobileBlocker - reading is deliberately mobile-usable.
- `app/error.vue` - 404 / generic error page; detects missing component slugs from `/components/*` paths.

### Inspector

- `app/components/AppInspector.vue` - `UTabs` (`:content="false"`) plus four teleport-target panels (`controls-panel`, `issues-panel`, `manual-panel`, `learn-panel`). Aside is `flex flex-col min-h-0`; inner div is `flex-1 min-h-0 overflow-y-auto`. Tab strip stays pinned; content scrolls within.
- `app/components/AppSidebar.vue` - nested-accordion `UNavigationMenu` (vertical, `:highlight`). Two `type: "trigger"` groups: Buttons (6 items) and Form Inputs (4 items), each component a child link. Accepts a known axe `aria-allowed-attr` violation in exchange for the highlight line - see AGENTS.md "Sidebar nav".
- `app/components/AppBar.vue` - font family picker (4 options), size picker (4 options), high-contrast toggle, light/dark toggle. Reads composable refs via destructure so Vue auto-unwraps in the template; `setMode('light')` / `setMode('dark')` for direct mode switches.

### Preview pipeline

- `public/preview-shell.html` - iframe shell. Loads axe-core (`public/vendor/axe-core.min.js`), listens for `preview:render`, mounts HTML + CSS, waits for `document.fonts.ready`, posts overflow measurements and axe results. Delegated `click` listener for trigger-shaped elements (`TRIGGER_SELECTOR`) posts `demo:click`. Delegated `change` listener on `al-inspected-element` checkboxes also posts `demo:click` (for the `input-checkbox-switch` variant). `submit` listener cancels navigation and reports form payload.
- `app/components/PreviewIframe.vue` - sandboxed iframe (`allow-scripts allow-same-origin allow-forms`; the same-origin grant is intentional - axe-core needs DOM access; the iframe loads only `/preview-shell.html` from our own origin). Exposes `render(html, css?, rootFontSize?)`. Queues renders until the shell posts `preview:ready`.
- `app/components/ComponentStudio.vue` - mounts `<PreviewIframe>`, teleports per-component controls + IssuesPanel + ManualReviewPanel + LearnPanel into the inspector. Subscribes to iframe messages via `usePreviewMessage()` and surfaces them as toasts.
- `app/components/PreviewToolbar.vue` - title + Learn-link, variant picker chip, wrapper picker chip, count badges (critical / warnings / passing).
- `app/components/CodeDrawer.vue` - `UCollapsible`. Toggles HTML / CSS panes via `UFieldGroup`. Persistent height in localStorage; resize handle is keyboard-operable (Arrow/Home/End) with a 24-px effective hit area via a `::before` pseudo-element (passes WCAG 2.5.8). Scrollable code region is keyboard-accessible (`tabindex="0"` + `role="region"` + labelled).

### Composables (27 files)

The composable folder is split between **state/lifecycle drivers** and **typed helpers** over a shared `defineModel` ref.

**Audit pipeline**

- `useAxeAudit(iframeRef)` - postMessage bridge. Listens for `preview:ready`, `axe:result`, `axe:error`, `dom:measurement`. Validates array payloads defensively. Uses VueUse `useEventListener` so cleanup is automatic.
- `useAxeResults()` - single source of truth for the `axe-results` `useState` slot.
- `useAllViolations()` - merges axe + custom + DOM violations.
- `useAxeCounts()` - critical / warning / passing counts across all three sources.
- `useCustomRules(rules, tagName)` - evaluates prop-based rules. Receives the component's tag so the AxeResult shape carries the real element name (not a hardcoded `<button>`).
- `useDomRules(rules)` - evaluates rules against `dom-measurement` shared state.

**Per-component lifecycle**

- `useInspectedComponent(definition, options)` - the heart of every component page. Owns `componentProps` (keyed `useState` per definition.id so navigation away preserves tweaks), runs a `useDebounceFn`-throttled render that calls `definition.render`, injects the `<style>${css}</style>${html}` payload into the iframe, applies context wrappers, resolves `CssLength` to flat px before passing to rules.
- `useInspectorTab()` - active-tab state + `focusPanel(tab)` (with `nextTick` + scroll-into-view) + `focusLearnTopic(id)` (delegates to `useReadMode().open()`).
- `useReadMode()` - `isOpen` / `activeTopicId` / `open(topicId)` / `switchTopic(topicId)` / `close()`. Stashes the return path in `useState('studio-return-path')` so closing the reader restores the studio location.
- `useActiveComponent()` - shared state for the active component's name, primary Learn topic, relevant concepts, and related topic ids. Consumed by the toolbar and the Learn panel.
- `useSidebar()` - open/closed state for the left sidebar.
- `useIsBelowDesktop()` - `useMediaQuery('(max-width: 1023px)')`.

**Theme / font / preferences**

- `useTheme()` - plain composable (not Pinia). Delegates light/dark to `useColorMode()` (from `@nuxtjs/color-mode`); a single `watchEffect` mirrors mode to `.theme-light`/`.theme-dark` for tokens.css and stamps `.theme-high-contrast` independently. `setMode(value)` writes through `colorMode.preference`.
- `useFont()` - plain composable. Family + size persisted via VueUse `useLocalStorage`. Family is written via VueUse `useCssVar('--al-font')`; size is written via direct `documentElement.style.fontSize` (it's not a custom property).

**Studio model helpers**

- `useModelUpdater(model)` - typed `update<K>(key, value)` + `updateMany(patch)` over a `defineModel<Partial<P>>` ref. Direct-mutation pattern, more efficient than spread and the idiomatic Vue 3.4+ approach.
- `useToggleableSection(model, config)` - `enabled` computed (true when any of the section's keys is non-null) + `toggle(value)` that delegates to caller-supplied `enable()` / `disable()` patches.
- `useNaturalSize(model, tagName)` - intrinsic-size probe used by Dimensions and Border sections.
- `useButtonStudioDefaults(tagName)` - combines `useBrowserDefaults` with hardcoded fallbacks; returns numeric defaults.
- `useBrowserDefaults(tagName)` - probes user-agent styles via an offscreen element with `all: revert`. Cached per tag in `useState`.
- `useUnitConversion()` - `CssLength` (`{ value, unit: 'px' | 'rem' }`) with `lengthToPx`, `fromPx`, slider variants, format helpers, `simulatedRootPx` for the rem demo.

**Other**

- `useContrast(fg, bg, options)` - WCAG2 luminance math, alpha-aware, returns `{ ratio, verdict, passes }`.
- `useManualReview(checklist)` - merges axe `incomplete` with the static checklist, manages checkbox state.
- `useRenderedHtml()` - shared state for the code drawer (`rendered-html`, `rendered-css`).
- `useInlineToClass()` - converts inline styles to a CSS rule block for the "Copy with classes" button.
- `useLearnTopics()` / `useLearnTopicTree()` - Nuxt Content access layer over `content/learn/*.md`. 22 topics keyed by frontmatter `topicId`, grouped by `category`.
- `usePreviewMessage(handlers)` - typed dispatch table over `useEventListener(window, 'message')`. Replaces the 8 manual `addEventListener` pairs that used to live across the controls files.
- `usePreviewIframeOutsideClick(callback)` - 3-line wrapper over `usePreviewMessage({ 'preview:pointerdown': callback })`.
- `useVariantLabelSync(model, config)` - keeps a label prop in step with a variant prop (e.g. the input's field label tracks its `type`).
- `useOnboarding()` - drives the 4-step first-run onboarding modal (`isOpen` / `step` / `open` / `close` / `next` / `prev` / `goTo`); `hasSeen` is persisted via `useLocalStorage`.

### Inspected components

**Button family - 6 components.** All share `app/components/inspected/buttons/shared/{types, render, variants, wrappers}.ts`.

- `buttons/action-triggers` - `<button>` and `<button type="button">`. Rules: target-size AA/AAA, focusable-in-anchor, focus-not-visible, focus-low-contrast.
- `buttons/form-buttons` - six form-related variants (submit/reset across `<button>` and `<input>` plus `input-image`). Form-wrap-by-default and label-restore watchers in the controls composer.
- `buttons/toggle-buttons` - `aria-pressed` / `aria-checked` / `visual-only` behaviours. Rules: `toggle-state-missing`, `toggle-wrong-attribute`.
- `buttons/switches` - `role-switch` / `aria-pressed` / `none` behaviours plus pill+thumb visual styling. Three variants: `button-button`, `button`, `input-checkbox-switch` (the native-checkbox-with-`role="switch"` pattern). Rules: `switch-no-role`, `switch-wrong-attribute` - both skip when `renderAs === 'input-checkbox-switch'` because that markup hardcodes `role="switch"`. The demo toggles dark mode via an inline `onclick="toggleDarkMode()"` (shell-defined) - deliberately state-decoupled so the `none` behaviour flips the visual for mouse users while exposing nothing to assistive tech, the anti-pattern the page teaches.
- `buttons/disclosure-triggers` - `aria-expanded` correct / stuck-at-false / none. Optional `aria-controls`. Panel uses browser-native `hidden`.
- `buttons/menu-triggers` - `aria-haspopup` + `aria-expanded` combinations. Popup uses browser-native `hidden`. Keyboard contract deliberately unwired in the iframe; the Learn topic + manual checklist cover the production contract.

**Form-input family - 4 components.**

- `input` - text / email / tel / url / password / number / search. Label association options. Required + disabled + placeholder + help text. Font-size, colours, contrast badge, border.
- `checkbox` - single, group-with-fieldset, group-no-fieldset. Custom rule: `checkbox-group-no-fieldset` (the failure axe-core misses).
- `radio` - same group modes as checkbox plus label-association choices. Custom rule: `radio-group-no-fieldset`.
- `select` - three variants: `select-native`, `select-multiple`, `div-combobox` (broken-custom-select anti-pattern). Custom rules: `select-no-label`, `select-options-empty`, `select-not-keyboard`.

### Custom rules

- `rules/types.ts` - `Rule`, `DomRule`, `DomMeasurement`, `ViolationResult`, `ManualChecklistItem`.
- `rules/shared/` - cross-component rules: `vague-label`, `invisible-text`, `overflow` (DOM-based).
- `rules/buttons/shared/` - `target-size` (AA + AAA), `focus-visible`, `focusable-in-anchor`, plus the shared manual checklist.
- `rules/buttons/{toggle-buttons,switches,disclosure-triggers,menu-triggers}/` - pattern-specific rules.
- `rules/checkbox/` + `rules/radio/` - `group-no-fieldset` rule + manual checklist.
- `rules/select/` - `select-no-label`, `select-options-empty`, `select-not-keyboard` + manual checklist.

### Learn content

22 markdown files in `content/learn/` ingested via the Nuxt Content collection defined in `content.config.ts`. Frontmatter carries `topicId`, `category`, `order`, `summary`, `related`, `concepts`. The `concepts` enum is mirrored in `app/utils/learnConcepts.ts` - both lists must stay in sync (Zod validates on build).

Topics: accessibleName, buttonDisabledStates, buttonTypes, buttonValueAttribute, checkbox, checkboxIndeterminate, disclosureTriggers, formWrapping, imageButtonCoordinates, invisibleText, menuTriggers, nativeRendering, numberInput, passwordInput, radio, remUnits, select, switches, telInput, toggleButtons, toggleVsSwitch, vagueLabel.

### Pages

- `pages/index.vue` - redirects `/` → `/components/buttons/action-triggers`.
- `pages/components/[component].vue` - dynamic flat route. Looks up the slug in the registry; redirects `'button'` (legacy) → `/components/buttons/action-triggers`; throws 404 for unknown slugs.
- `pages/components/buttons/[pattern].vue` - dynamic nested route for the button family. Looks up `buttons-${pattern}`.
- `pages/learn/index.vue` - redirects `/learn` → the first available topic.
- `pages/learn/[topicId].vue` - read-mode article body. Layout owns the chrome.

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

`usePreviewMessage(handlerMap)` is the single composable for parent-side iframe-message dispatch. Each pattern-specific controls component declares its handler map (e.g. `'demo:click': () => { … }`) instead of repeating the listener boilerplate. `useAxeAudit` is the one exception - it uses `useEventListener` directly because it filters on `event.source !== iframe.contentWindow`, which `usePreviewMessage` deliberately doesn't enforce.

### Declarative iframe-interaction protocol (facts up, meaning on the host)

The fix for "preview-shell.html accumulates per-component branches" (refactoring backlog item 9). The shell now reports a trigger activation as a plain **`demo:activate` fact** when the trigger sits inside an element marked **`data-al-interaction`**; the component's own controls decide what it means (e.g. flip `disclosureExpanded` / `menuOpen`). The marker lives on the studio **wrapper**, not the trigger, so the copied button stays clean semantic markup.

Why it matters: a **new** component needing a host-driven interaction (the common case - disclosure and menu triggers are open/close/active-state driven) adds the marker in its renderer plus a `usePreviewMessage({ "demo:activate": ... })` listener, and **never edits the shell**. The per-component logic grows on the host, where it is unit-testable, instead of in the shared static file.

The shell posts `demo:activate` then **falls through** to the submit/reset heuristic rather than returning, so "the trigger was activated" and "this is a submit-typed button with no form" stay independent facts - a type-less `<button>` both toggles its panel and surfaces the same "no form to submit to" lesson as everywhere else. `demo:click` is now posted only for un-migrated triggers.

Migrated so far: `buttons-disclosure-triggers`, `buttons-menu-triggers`, and `select`'s `div-combobox`. The combobox's trigger toggle now posts `demo:activate`, its option commit posts the generic `demo:pick {value}` fact, and open/closed is the host-owned `comboboxOpen` prop (so opening re-renders + re-audits the visible listbox, exactly as disclosure/menu re-audit their revealed panel). Its deliberately-incomplete Enter/Space keyboard handling moved out of the shell to an inline `onkeydown` calling a shell-predefined `window.handleComboboxKeydown`, surfaced verbatim in the code drawer's JS tab - that incompleteness _is_ the `select-not-keyboard` lesson. To let a non-button widget join the protocol, the shell's activation handler now recognises ARIA widget triggers (`role="combobox"`) alongside native buttons, and a generic `data-al-pick` → `demo:pick` handler replaced the combobox-specific option branch. The switch-label forward became the generic `data-al-activates` click-proxy. The one remaining in-iframe special case is the div-checkbox click forwarding - deliberately kept (it routes child-index `demo:click-child`, not a host-owned boolean; same call as B8).

### Type extraction for axe results

`~/types/axe.ts` owns `AxeResult`, `NodeResult`, `CheckResult`, `ImpactValue`, `AxeState`. `useAxeResults()` is the single state-initializer. `useAxeAudit` no longer redeclares the same `useState` key. Same shape across writer and readers by construction.

### `defineModel` everywhere

Every controls component now uses `defineModel<Partial<P>>({ required: true })` + `useModelUpdater(model)`. The legacy `defineProps<{ modelValue }>` + `defineEmits<{ 'update:modelValue' }>` components (LengthValueInput, LengthControl, SplitSpacingControl, InputControls, and later VariantPicker) were migrated.

### `IssueSection` + auto-expand

`IssuesPanel.vue` shrank from 423 lines to 39 by extracting `IssueSection.vue` for the critical / warning / passing sections (which were ~90 lines of duplicated markup each). Sections auto-expand the first time a violation arrives, and respect any subsequent user toggle (a manual collapse sticks; the section never re-opens automatically against the user's intent).

### `ColorPickerRow` atom

The three-times-duplicated colour-picker block in `InputControls.vue` is now a single `<ColorPickerRow v-model="color" :label="…">` atom under `app/components/controls/`.

### Tailwind conversion

Every `<style scoped>` block that the AGENTS.md rule permits is gone. The two legitimate stays: `AnimatedCountBadge.vue` (keyframes + Vue Transition classes + `prefers-reduced-motion` overrides) and `pages/learn/[topicId].vue` (`:deep()` selectors targeting markdown-emitted elements that can't carry classes).

### Lint configuration

Superseded 10 June 2026: **Prettier now owns formatting; ESLint checks correctness only.** The earlier ESLint-stylistic formatting rules (double quotes, semicolons, trailing commas, etc.) fought the editor's Prettier format-on-save - every save re-broke the lint baseline. The stylistic block is removed from `nuxt.config.ts`; `eslint-config-prettier` is appended last in `eslint.config.mjs` so no formatting rule survives; Prettier config lives in `.prettierrc.json` (printWidth 100, one attribute per line in Vue templates, otherwise defaults that match the existing style). The codebase migrates to Prettier formatting piecemeal as files are touched - no project-wide reformat. `eslint.config.mjs` still disables `vue/no-multiple-template-root` (a Vue-2-era rule that misfires on Vue 3 fragments).

### Console-warning sweep

- `<html lang="en">` set via `useHead({ htmlAttrs })`.
- Code-drawer scrollable region: `tabindex="0"` + `role="region"` + locale-driven `aria-label`.
- Sidebar flattened (was the source of the `<span aria-controls>` Nuxt UI bug). **Later reverted** to a nested accordion for the vertical highlight line, accepting that axe `aria-allowed-attr` violation - see AGENTS.md "Sidebar nav".
- `@nuxt/hints` removed (eliminated the `__nuxt_hints/lazy-load` 404 + lazy-load info noise).
- Iframe sandbox attributes documented inline - we accept `allow-scripts allow-same-origin` because axe needs DOM access; we control the iframe source.

### Layout fix

The outer container is `h-dvh` (not `min-h-dvh`). Combined with `min-h-0` on the inspector aside, the studio is bounded to viewport height by construction; the inspector content scrolls internally, not the whole page.

### Baseline repair + commit gate (10 June 2026)

A codebase audit found the baseline broken on a clean working tree (one type error, 29 lint errors) - changes had been committed without running the checks AGENTS.md requires. Fixes applied:

- Type error in `RadioControls.vue` (indexed access doesn't narrow; the picked item is now null-checked directly).
- `lint --fix` sweep, which also exposed a real bug: `app.vue`'s `ogTitle` was the literal string `'t("app.title")'` instead of the translated value. Fixed.
- New committed pre-commit hook at `.githooks/pre-commit` runs `lint` + `typecheck` before every commit. `postinstall` points `core.hooksPath` at the directory so every contributor gets it after `corepack pnpm install`. Emergency bypass: `git commit --no-verify`.
- CI now also runs the test suite (`.github/workflows/ci.yml`).
- First shared render utilities extracted: `app/utils/escapeHtml.ts`, `app/utils/formatCssLength.ts`, `app/utils/valueFromLabel.ts` replace per-file private copies in the four form-input `render.ts` files. `useUnitConversion().formatLength` now delegates to `formatCssLength`, removing a keep-in-sync comment obligation.

---

## Remaining work

### Components

The studio covers a fixed set of ten inspected components (six button-family patterns + four form inputs). The earlier placeholder stubs (accordion, carousel, modal, menu, tooltip, tabs), the `placeholders.ts` registry spread, and the `ComingSoon` page were removed - there is no longer a placeholder mechanism, and those slugs now 404 like any unknown component.

The file picker (`<input type="file">` + label-wrap pattern) was scoped for the button family but parked - the trigger is a `<label>`, not a `<button>`, so it would need a new render branch and `'label-file'` renderAs.

### Tests

Vitest is wired with `unit` (node) and `nuxt` (happy-dom) projects (`pnpm test:unit` / `test:nuxt` / `test:coverage`). Coverage is extensive: UNITTESTS.md Parts A (shared foundations), B1-B10 (every component's render, rules, and controls), and C1-C11 (inspector UI + studio shell) are complete - 359 unit + 242 Nuxt-component tests. Remaining:

- Part D: Playwright end-to-end journeys through the studio, plus the axe-playwright AAA gate on the app's own chrome (the gate AGENTS.md calls for). The tooling install is gated on sign-off (UNITTESTS.md Batch D0).
- Known flake: the combined `corepack pnpm test` (both projects at once) intermittently fails a first `mountSuspended` cold-start; run the suites separately. See NOTES.md.

### Polish + user-testing prep

Identified during the most recent end-to-end pass, in priority order:

1. `packageManager` in package.json is `pnpm@10.33.4` but a Homebrew-installed pnpm 8 ignores it. Contributors keep hitting store mismatches. Document the corepack workaround in README or add an `engines` entry.
2. Bundle audit (`pnpm build` + check static output sizes) - never run after the VueUse sweep; want to confirm tree-shaking.
3. System-mode toggle in the AppBar (color-mode supports it; UI only exposes Light/Dark).
4. Draft a structured user-testing script so feedback across testers is comparable.

### Refactoring backlog (codebase audit, 10 June 2026)

A full audit for duplication, modularity, and convention drift. The button family and studio shell follow the documented plan; the form-input family (input, checkbox, radio, select) was built in parallel by different sessions and forked several conventions. In priority order:

1. **Form-input controls forked the model-update convention. - DONE.** All four controls (`Select`/`Radio`/`Checkbox`/`Input`) now use the shared `useModelUpdater(model)` (`update` / `updateMany`, direct mutation) instead of a local spread-replacement `update`. The replacement pattern was the *cause* of the "two back-to-back writes race" - so the combined-write workarounds and their warning comments in all four were removed (the writes are now plain `update` / `updateMany` calls). The composable keeps the name `useModelUpdater`: it was de-button-specified earlier this branch (was `useButtonControlsModel`), and the backlog's suggested `useControlsModel` was rejected as misleading - it returns updaters, not a model. `updateMany` (previously test-only) now has real callers (the checkbox parent-sync + input style writes).
2. **Renderer duplication. - DONE (one minor residual).** The copied `styleAttr` is gone - all four form-input renderers use the shared `~/utils/inlineStyleAttribute`. The label-association switch is now the shared `~/utils/associateLabel`, called by input, checkbox, and radio. Residual: `checkbox/render.ts` keeps a small association `switch` for its `div-checkbox` variant (the div can't use native `<label for>`/wrapping, so it needs bespoke aria-labelledby / name-from-content handling); that's genuinely div-specific, not duplication, and left as-is.
3. **Hardcoded English content in `IssueSection.vue`. - DONE (prior session).** The pure helpers (`formatRuleId`, `classificationFromTags`, `parseFailureSummary`, `issueWhyKey`) live in `~/utils/issueFormatting.ts` and are unit-tested (`issue-formatting.test.ts`). The `TAG_WHY` / `PRINCIPLE_WHY` content is now `TAG_WHY_KEYS` / `PRINCIPLE_WHY_KEYS` mapping to i18n keys under `issues.why.*` in `common.json`; the component (now ~175 lines) only picks a key and calls `t()`. (`classificationFromTags` still returns the literal `"Best Practice"` as both a type discriminant and a badge label - a tiny remaining hardcoded string if full localisation is ever pursued.)
4. **`InputControls.vue` decomposition. - DONE.** The "Style applies to" machinery (target state, per-target slice read/write, the `active*` computeds, the toggles, and the contrast badge) moved into a co-located composable `useInputStyleTarget(model)` (in `app/components/inspected/input/`), now unit-tested (`test/nuxt/use-input-style-target.test.ts`). The style markup moved into `InputStyleSection.vue`, which uses the shared `LengthControl` (retiring the hand-rolled slider + `LengthValueInput`). The duplicate accessible name is gone: the lone `aria-hidden` card was merged into the single "Attributes" fieldset (option 2). The previously-hardcoded "Style applies to" target labels are now i18n keys (`controls.input.styleTarget.*`). InputControls dropped from ~489 to ~227 lines (logic now in a 134-line composable + 130-line section). **Bug fixed in the move:** toggling a nested-target (label / placeholder / help-text) text colour off now removes the slice key; the old copy-then-skip-undefined merge kept the value, so the switch sprang back on. The new composable test covers it.
5. **Repeated control boilerplate. - DONE.** Three atoms under `app/components/controls/` now own the repeated markup: `ControlCardCheckbox` (the `variant="card"` toggle - flexible by attribute fall-through, always emits a clean boolean, supports a `#label` slot for rich labels), `LearnLink` (the `↗` learn-topic anchor + its `focusLearnTopic` call), and `SectionLegend` (the fieldset legend, composing `LearnLink` when given a `learnTopic`). Applied across the four form-input controls and the button-family sections - ~25 card checkboxes, ~18 learn-links, and the plain legends. Rendered DOM is byte-identical (tests unchanged + green). Three deliberate non-conversions: `ManualReviewPanel`'s `color="neutral"` review-item checkbox (not a control toggle), `ToggleStateSection`'s disabled-state link-label (intentionally has no `↗` icon - flagged as a possible future consistency tweak), and `ResetDefaultsSection`'s `<i18n-t>` legend (link embedded mid-sentence, not the simple title shape).
6. **`ButtonStudio/sections/` was misnamed. - DONE.** The studio-wide section library moved from `app/components/ButtonStudio/sections/` to `app/components/studio/sections/` (the then-empty `ButtonStudio/` directory was removed). All importers (the ten controls components plus `section-toggle-isolation.test.ts`), the AGENTS.md references (including the auto-import path-prefix example, now `StudioSectionsContentSection`), and the `main.css` comment were updated. The separate `useButtonStudioDefaults` composable kept its name; it is genuinely button-specific (intrinsic-size defaults for the button family).
7. **Inconsistent render contract. - DONE.** `renderRadio` now returns `RenderedFragment` (`{ html }`) like its three siblings, so every form-input renderer has one shape. `form-input-renderers.test.ts` reads `.html` to match (the renderCheckbox style).
8. **Shared prop slices re-declared per definition. - DONE (style slice).** `fontSize` / `bg` / `fgText` / `borderColor` are now the `FormInputStyleProps` interface in `app/types/formInputStyle.ts`, which all four form-input definitions `extends`. The label-association unions were intentionally **not** merged: they differ (input adds a `"title"` anti-pattern mode the others don't have), so a single shared union would misrepresent three of them.
9. **`preview-shell.html` accumulates per-component branches** (switch-label forwarding, checkbox `indeterminate`, child-index routing, the combobox open/close/pick logic). **Partially resolved** - the declarative `data-al-interaction` → `demo:activate` protocol is in place (see "Declarative iframe-interaction protocol" above), so new host-driven components (the common case) ship their behaviour via a marker + host listener and never edit the shell. The forward-looking goal - no shell growth for new components - is met. The **existing** in-iframe branches (switch-label forwarding, div-combobox open/close/pick, div-checkbox forwarding) remain and are deliberately deferred: migrating them is optional cleanup that changes behaviour on under-tested components, so it's folded into the checkbox/select test batches (B8/B10) to land under a net.

   **Message contract typed + drift-guarded (17 June 2026):** separately from the branch migration above, the iframe↔host message vocabulary is now a single typed source of truth - `app/types/preview-messages.ts` holds the `PREVIEW_MESSAGE` constants, per-message payload interfaces, the `HostBoundMessage` / `IframeBoundMessage` unions, and a compile-time completeness guard (every constant must map to exactly one message interface and vice-versa). A runtime drift-guard test (`test/unit/preview-message-contract.test.ts`) reads `public/preview-shell.html` and asserts its wire strings and the contract agree, since the shell can't import the module. Consumers migrated: `usePreviewMessage` (its handler map is now typed per message - typo'd keys are compile errors and each handler's payload is auto-typed), `useAxeAudit`, `PreviewIframe`, and `ComponentStudio` (its duplicate local `FormSubmittedMessage` interface removed); the other `usePreviewMessage` callers gained type-safety with no edits. **Branch migration - done (switch-label, div-combobox):** the switch-label forward became the generic `data-al-activates` click-proxy, and the div-combobox moved onto `demo:activate` (trigger toggle) + the new generic `demo:pick {value}` fact (option commit), with open-state host-owned and the incomplete-keyboard lesson as an inline `onkeydown` → `window.handleComboboxKeydown`. See "Declarative iframe-interaction protocol" above. The only legacy in-iframe branch left is the div-checkbox child-index click forwarding, deliberately kept (it routes `demo:click-child`, not a host-owned boolean - same call as B8); not worth migrating unless re-scoped.

10. **`VariantPicker.vue` used `defineProps` + `defineEmits`. - DONE.** Migrated to `defineModel<string>`: the `modelValue` prop and the `update:modelValue` emit are replaced by one model ref (`select()` assigns `modelValue.value`). The parent already bound `v-model`, so no caller changed, and `defineModel` still emits `update:modelValue` under the hood, so `variant-picker.test.ts` passes unchanged. This was the last `defineModel` straggler, so the refactoring backlog (items 1-10) is now complete.

### Known dev-console noise (accepted)

- `[intlify] Not found parent scope` - informational, fires during async router middleware resolution. Harmless.
- `Cannot load payload /_payload.json` - expected for `ssr: false` routes; NuxtLink prefetch tries anyway.
- Chrome iframe `allow-scripts allow-same-origin` warning - intentional tradeoff for axe-core. Documented inline.

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
    │   ├── axe.ts                  # AxeResult, AxeState - shared writer + reader types.
    │   └── typography.ts           # FontSize.
    ├── utils/
    │   ├── domIds.ts               # Stable DOM ids (inspector panels, iframe id).
    │   ├── focusPreviewContent.ts  # Focus management for the preview iframe.
    │   ├── learnCategories.ts      # Learn topic category order (sidebar tree).
    │   ├── learnConcepts.ts        # Closed-vocabulary concept tag list.
    │   ├── prettifyCss.ts          # CSS pretty-printer (display only).
    │   └── prettifyHtml.ts         # HTML pretty-printer (display only).
    ├── composables/                # 25 files - see Composables section above.
    ├── components/
    │   ├── ComponentStudio.vue     # Mounts iframe + teleports all 4 panels.
    │   ├── PreviewIframe.vue       # Sandboxed iframe + render queue.
    │   ├── PreviewToolbar.vue      # Title + variant + wrapper + count badges.
    │   ├── CodeDrawer.vue          # HTML/CSS panes + copy buttons + drag-resize.
    │   ├── AppBar.vue              # Font, size, contrast, light/dark.
    │   ├── AppSidebar.vue          # Nested-accordion nav (buttons + form-inputs).
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
    │   ├── studio/sections/  # 11 sections: Reset, Content, Aria, Text,
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
    │   ├── input/                  # axe-rules.md (notes only - input rides on axe).
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

1. `AGENTS.md` - conventions, the i18n no-`<` rule, the defineModel-of-the-bag pattern, the Nuxt UI-first rule. Read every session.
2. `PROGRESS.md` (this file) - current state and recent shifts.
3. `NOTES.md` - warnings, gotchas, AI-agent-optimised summary.

**Shell**

4. `app/layouts/default.vue` - outer grid, skip links, teleport targets.
5. `app/components/AppInspector.vue` - `UTabs` + 4 teleport panels.
6. `app/components/AppSidebar.vue` - nested-accordion nav.

**Design system**

7. `app/assets/css/tokens.css` - colour source of truth.
8. `app/assets/css/main.css` - Tailwind `@theme static` + `--ui-*` mapping.
9. `app/app.config.ts` - Nuxt UI colour aliases + button compound variants.

**Core runtime**

10. `app/composables/useInspectedComponent.ts` - page lifecycle driver. Watch this closely; everything else flows through it.
11. `app/components/ComponentStudio.vue` - mounts iframe + teleports panels + receives messages.
12. `app/components/PreviewIframe.vue` + `public/preview-shell.html` - the iframe boundary.

**Component contract**

13. `app/types/component.ts` - `ComponentDefinition<P>`.
14. `app/components/inspected/index.ts` - registry.
15. `app/components/inspected/buttons/action-triggers/definition.ts` - simplest button-family example. Follow imports into `shared/`.
16. `app/components/inspected/buttons/shared/render.ts` - the 500-line workhorse renderer.

**Audit pipeline**

17. `app/composables/useAxeAudit.ts` - postMessage bridge.
18. `app/composables/useAxeResults.ts` - `useAllViolations` + `useAxeCounts`.
19. `app/composables/useCustomRules.ts` + `useDomRules.ts` - the rule engines.
20. `app/rules/buttons/shared/target-size.ts` - example rule (AA + AAA together).
21. `app/components/IssueSection.vue` - section rendering with auto-expand.

**Controls architecture**

22. `app/composables/useModelUpdater.ts` - typed update helper.
23. `app/components/studio/sections/ContentSection.vue` - example section.
24. `app/components/inspected/buttons/action-triggers/ActionTriggerControls.vue` - composes sections.

**Reader**

25. `app/composables/useReadMode.ts` - open / switchTopic / close.
26. `app/layouts/learn.vue` - reading shell.
27. `app/pages/learn/[topicId].vue` - article body.
28. `app/composables/useLearnTopics.ts` - Nuxt Content access layer.

### Architectural patterns to internalise

- **Token chain.** `tokens.css` → `@theme static` → `app.config.ts` → `--ui-*` overrides. Every colour flows through this; no shortcuts.
- **Iframe boundary.** App UI = Nuxt UI. Inspected components = bare HTML in the iframe. They communicate exclusively via `postMessage` with origin checking. The iframe is sandboxed; `allow-scripts allow-same-origin` is intentional for axe.
- **`defineModel` of the bag.** A single `Partial<BaseButtonProps>` ref passes through every control section via `defineModel`. Sections read/write through `useModelUpdater(model).update(key, value)` - direct mutation, not spread.
- **Three-engine audit.** axe-core in iframe + prop-based rules on the host + DOM-rules on iframe-side measurements. Three `useState` keys, merged by `useAllViolations()`. The Issues panel and toolbar badges consume the merge.
- **Teleport for cross-layout injection.** `ComponentStudio` teleports controls + 3 panels into stable-id targets in the layout. The layout owns DOM structure; the page owns content.
- **VueUse for lifecycle.** Never `setTimeout` directly; never `addEventListener` directly. `useEventListener`, `useTimeoutFn`, `useDebounceFn` give automatic cleanup.
- **`useState` for cross-component state.** Pinia is gone. Composables that wrap `useState` are the canonical state-sharing primitive.
- **Nuxt UI-first.** Every piece of app chrome uses Nuxt UI. Raw HTML appears only in the iframe and in popover trigger buttons.
- **i18n-first.** No hardcoded English strings. Markup in Learn prose only - and via markdown, not via `<` in JSON.
