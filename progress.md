# Progress vs plan.md

## Completed

### Design token foundation (plan §9.1, §9.2)
- [x] `app/assets/css/tokens.css` — all 28 token properties per mode: light (default), dark, high-contrast light, high-contrast dark. Includes typography tokens (`--al-font`, `--al-font-mono`, `--al-base-size`) and `--focus-ring`.
- [x] `app/assets/css/main.css` — replaced green Nuxt UI starter palette with `@theme static` block referencing CSS custom properties from tokens.css. `--ui-text-inverted` wired to `--on-brand` in light + dark.
- [x] `app/app.config.ts` — mapped Nuxt UI color roles (`primary`, `neutral`, `error`, `warning`, `success`, `info`) to AccessLab brand/semantic tokens. Default button size set to `lg`. FieldGroup `base` slot extended with a 1px `--border-strong` border. Button compound variants for segmented-picker pattern — see AGENTS.md "Segmented-picker pattern".

### Typography (plan §10)
- [x] Self-hosted fonts via `@fontsource` packages (Atkinson Hyperlegible, Figtree variable, JetBrains Mono variable) and `open-dyslexic` package.
- [x] `composables/useFont.ts` — font family + size switching, persisted to localStorage.
- [x] Font-size tokens in `tokens.css` (`--al-font-size-caption`, `--al-font-size-detail`, `--al-font-size-body`, `--al-font-size-nav`, `--al-font-size-heading`, `--al-font-size-brand`, `--al-font-size-display`).
- [x] All layout font-sizes converted from hardcoded `px` to `rem` via token `var()` references.

### Composables (plan §4.3, §9.3, §10.3)
- [x] `composables/useTheme.ts` — theme switching (light/dark + high-contrast) via Pinia + VueUse. Applies `.light`, `.dark`, `.theme-light`, `.theme-dark`, `.theme-high-contrast` classes on `<html>`.
- [x] `composables/useFont.ts` — font family + size switching, persisted to localStorage.
- [x] `composables/useAxeAudit.ts` — bridge: iframe → axe → reactive issues (violations/passes/incomplete, ready state, error handling).
- [x] `composables/useAxeResults.ts` — shared state accessor for axe-results, `useAllViolations()` merges axe + custom violations, `useAxeCounts()` computes critical/warning/passing counts from both sources.
- [x] `composables/useCustomRules.ts` — custom rule engine composable. Evaluates rules against component props, stores in `custom-violations` shared state.
- [x] `composables/useManualReview.ts` — reads `incomplete` array from axe results, manages checkbox state, computes progress. Persists check states in shared state (prunes stale entries when audit re-runs).

### App shell (plan §3.1, §3.2, §4.3)
- [x] `app.vue` — `<NuxtLayout>` wrapper with AccessLab SEO meta (i18n-driven).
- [x] `app/layouts/default.vue` — three-pane shell with skip links, app bar (brand, breadcrumb, font/size/HC/theme controls, sidebar toggle), collapsible sidebar (UNavigationMenu), preview toolbar with counter pills (UBadge), code drawer (UCollapsible), tabbed inspector (UTabs). All text i18n-driven.
- [x] `components/ControlsPanel.vue` — label input (UInput) + sliders (USlider) for width/height/padding/font-size, v-model driven, padding split/merge toggle. Teleported into `#controls-panel` slot by index.vue.
- [x] `components/IssuesPanel.vue` — live axe violations display. Three collapsible sections (Critical/Warnings/Passing) with UCard cards, failure summary parsed into directives + bullet lists, tag-based "why it matters" callout, learn-more links. Teleported into `#issues-panel`.
- [x] `components/ManualReviewPanel.vue` — human-review checklist from axe `incomplete` results. UCheckbox card items with axe messages + Deque docs links, progress badge, check all/clear all controls. Teleported into `#manual-panel`.

### Preview iframe (plan §5)
- [x] `public/preview-shell.html` — iframe shell, loads axe-core, listens for `preview:render` postMessage, runs `axe.run()` after `document.fonts.ready`, posts results back.
- [x] `composables/useAxeAudit.ts` — listens for axe results, exposes violations/passes/incomplete reactively.
- [x] `components/PreviewIframe.vue` — sandboxed iframe, renders preview-shell, exposes `render()` with race-condition-safe queue (pending render flushed when `isReady`).

### Phase 1 components (plan §7, §8.1)
- [x] `components/inspected/button/render.ts` — Button HTML render function. No defaults (pure props → HTML). Props: label, width, height, padding, fontSize, bg, fg.

### Custom rules (plan §6.3)
- [x] `rules/types.ts` — `Rule` and `ViolationResult` interfaces.
- [x] `rules/button/target-size.ts` — AA (24×24) and AAA (44×44) button target size rules.

### Pages
- [x] `pages/index.vue` — button demo page. Mounts `<PreviewIframe>` and `<ControlsPanel>` (teleported to inspector), watches `buttonProps` with 10ms debounce, calls `previewRef.render(renderButton(props))`.

### Routing
- [x] `pages/index.vue` — replaced Nuxt starter template.

### Project setup
- [x] `AGENTS.md` — created for AI assistant session orientation.
- [x] Open questions resolved (plan §16) — all 6 decided.
- [x] Build infrastructure — `@types/node` added, workspace config fixed, lint errors resolved.
- [x] Nuxt i18n v10 integrated — all UI text extracted to `i18n/locales/en.json`, `useI18n()` / `$t()` wired. Config inline in `nuxt.config.ts` (no separate `i18n.config.ts`).

### Conventions established
- [x] Tailwind-first CSS approach — use Tailwind utility classes for all styling. Use `text-(length:--token)` syntax for font-size CSS variables (Tailwind v4 `text-` is ambiguous between color and size). Only write `<style>` for pseudo-elements or complex keyframe animations.
- [x] All new UI text goes through i18n (`en.json` + `$t()`). No hardcoded English strings.
- [x] Teleport pattern: page owns state + watch, controls teleported into layout's inspector slot.

## In progress

Nothing currently in progress.

## Remaining (next steps)

### Composables
- [ ] `composables/useComponentProps.ts`
- [ ] `composables/useContrast.ts` — WCAG luminance math, AAA verdict

### App shell (split out from layout)
- [ ] `components/ContrastBadge.vue` — live contrast ratio display

### Phase 1 components
- [ ] `components/inspected/button/definition.ts` — props schema, manual review items, learn copy
- [ ] `components/inspected/accordion/`
- [ ] `components/inspected/carousel/`
- [ ] `components/inspected/modal/`
- [ ] `components/inspected/menu/`
- [ ] `components/inspected/tooltip/`
- [ ] `components/inspected/tabs/`
- [ ] `components/inspected/form-field/` (Input first)

### Custom rules (plan §6.3)
- [ ] `rules/engine.ts`
- [ ] rules for remaining 7 components

### Routing
- [ ] `pages/components/[component].vue` — dynamic route

### Tests (plan §13)
- [ ] Unit tests for contrast composable, rule evaluators, prop validators
- [ ] Component tests for AppShell, sidebar, theme switch, iframe handler
- [ ] a11y tests via axe-playwright

### Colour picker + live contrast (plan §3.3)
- [ ] Colour inputs (bg/fg) in ControlsPanel
- [ ] `useContrast.ts` wired to display live contrast ratio badge
