# Progress vs plan.md

## Completed

### Design token foundation (plan §9.1, §9.2)
- [x] `app/assets/css/tokens.css` — all 28 token properties per mode: light (default), dark, high-contrast light, high-contrast dark. Includes typography tokens (`--al-font`, `--al-font-mono`, `--al-base-size`) and `--focus-ring`.
- [x] `app/assets/css/main.css` — replaced green Nuxt UI starter palette with `@theme static` block referencing CSS custom properties from tokens.css. `--ui-text-inverted` wired to `--on-brand` in light + dark.
- [x] `app/assets/css/learn.css` — Learn panel styling.
- [x] `app/app.config.ts` — mapped Nuxt UI color roles (`primary`, `neutral`, `error`, `warning`, `success`, `info`) to AccessLab brand/semantic tokens. Default button size set to `lg`. FieldGroup `base` slot extended with a 1px `--border-strong` border. Button compound variants for segmented-picker pattern. Switch unchecked-track override with `--text-secondary`/30 opacity.

### Typography (plan §10)
- [x] Self-hosted fonts via `@fontsource` packages (Atkinson Hyperlegible, Figtree variable, JetBrains Mono variable) and `open-dyslexic` package.
- [x] `composables/useFont.ts` — font family + size switching, persisted to localStorage.
- [x] Font-size tokens in `tokens.css` (`--al-font-size-caption`, `--al-font-size-detail`, `--al-font-size-body`, `--al-font-size-nav`, `--al-font-size-heading`, `--al-font-size-brand`, `--al-font-size-display`).

### Composables (plan §4.3, §9.3, §10.3)
- [x] `composables/useTheme.ts` — theme switching (light/dark + high-contrast) via Pinia + VueUse. Applies `.light`, `.dark`, `.theme-light`, `.theme-dark`, `.theme-high-contrast` classes on `<html>`.
- [x] `composables/useFont.ts` — font family + size switching, persisted to localStorage (Pinia store).
- [x] `composables/useAxeAudit.ts` — bridge: iframe → axe → reactive issues (violations/passes/incomplete, ready state, error handling). Also captures DOM measurements (`overflow:result`).
- [x] `composables/useAxeResults.ts` — shared state accessor for axe-results, `useAllViolations()` merges axe + custom + DOM violations, `useAxeCounts()` computes critical/warning/passing counts from all three sources.
- [x] `composables/useCustomRules.ts` — prop-based custom rule engine. Evaluates rules against component props, stores in `custom-violations` shared state. Applied universally: `vague-label`, `invisible-text` + per-component rules.
- [x] `composables/useDomRules.ts` — DOM-based rule engine. Evaluates rules against iframe-side measurements (`scrollWidth`/`clientWidth` etc.), stores in `dom-violations` shared state. Applied: `contentOverflow`.
- [x] `composables/useManualReview.ts` — reads `incomplete` array from axe results + static per-component checklist, manages checkbox state, computes progress.
- [x] `composables/useInspectedComponent.ts` — full per-component page lifecycle: props ref (seeded from `defaultProps`), debounced render pipeline, custom rule registration, DOM rule registration, timer cleanup. Used by `ComponentStudio.vue`.
- [x] `composables/useInspectorTab.ts` — inspector tab navigation, focus management, learn topic focus.
- [x] `composables/useBrowserDefaults.ts` — probes user-agent styles via hidden DOM element with `all: revert`, returns all computed CSS properties as `Record<string, string>`. Used by `ControlsPanel` to seed defaults.
- [x] `composables/useContrast.ts` — WCAG2 luminance math: hex/rgba parsing, relative luminance, ratio calculation, verdict (AAA/AA/AALarge/Fail). Configurable threshold and bold detection.
- [x] `composables/useRenderedHtml.ts` — `useState('rendered-html')` shared state for the code drawer.
- [x] `composables/useInlineToClass.ts` — converts inline styles to CSS class blocks for the "Copy with classes" button.
- [x] `composables/useLearnTopics.ts` — topic registry for Learn panel (NativeRendering, InvisibleText, VagueLabel).

### App shell (plan §3.1, §3.2, §4.3)
- [x] `app.vue` — `<NuxtLayout>` wrapper with AccessLab SEO meta (i18n-driven).
- [x] `app/layouts/default.vue` — three-pane shell with skip links, app bar (brand, font/size/HC/theme controls, sidebar toggle), collapsible sidebar (UNavigationMenu with per-component links), preview toolbar with live counter pills (UBadge), code drawer with ProsePre + copy buttons, tabbed inspector (Controls/Issues/Manual/Learn). All text i18n-driven.
- [x] `app/error.vue` — custom 404/error page with NuxtLayout, component-slug detection, 404 illustration, `clearError` redirect.
- [x] `components/ComingSoon.vue` — placeholder page for unimplemented components.
- [x] `components/ComponentStudio.vue` — mounts `PreviewIframe` + teleports all four inspector panels. Calls `useInspectedComponent()`.
- [x] `components/ControlsPanel.vue` — label input + sliders (width/height/padding/border/font-size) + color pickers (bg/fgText/borderColor) + ARIA controls. USwitch toggles for every group. Browser-default seeding. Splittable padding/border.
- [x] `components/ControlsIntro.vue` — intro content for the Controls tab.
- [x] `components/IssuesPanel.vue` — live violations display. Three collapsible sections (Critical/Warnings/Passing) with UCard cards, failure summary parsed into directives + bullet lists, tag-based "why it matters" callout, individual check messages, learn-more links + learn-topic internal links.
- [x] `components/ManualReviewPanel.vue` — human-review checklist (static A11Y checklist + dynamic axe incomplete items). UCheckbox card items with WCAG SC references.
- [x] `components/LearnPanel.vue` — topic index → detail navigation. Three topics: NativeRendering, InvisibleText, VagueLabel (lazy-loaded).
- [x] `components/ContrastBadge.vue` — live contrast ratio badge with verdict (AAA/AA/AALarge/Fail) and icon.
- [x] `components/MobileBlocker.vue` — mobile disclaimer overlay.
- [x] `components/LearnTopic/NativeRendering.vue` — educational content about browser default rendering.
- [x] `components/LearnTopic/InvisibleText.vue` — educational content about matching foreground/background.
- [x] `components/LearnTopic/VagueLabel.vue` — educational content about vague button labels.

### Preview iframe (plan §5)
- [x] `public/preview-shell.html` — iframe shell, loads axe-core, listens for `preview:render` + measures DOM dimensions, posts `axe:result` and `overflow:result` back to host.
- [x] `components/PreviewIframe.vue` — sandboxed iframe, renders preview-shell, exposes `render()` with race-condition-safe queue.

### Phase 1 components (plan §7, §8.1)
- [x] `components/inspected/button/definition.ts` — full `ComponentDefinition`: `ButtonProps` type, default props, controls schema, rules, manual checklist, render.
- [x] `components/inspected/button/render.ts` — pure props → HTML, supports per-side padding/border, ARIA, content type.
- [x] `components/inspected/placeholders.ts` — 7 placeholder definitions (accordion, carousel, modal, menu, tooltip, tabs, form-field), each with correct tagName pre-assigned.
- [x] `components/inspected/index.ts` — typed component registry mapping `ComponentId` → `ComponentDefinition`. Spreads placeholders, overwrites button with real definition.

### Custom rules (plan §6.3)
- [x] `rules/types.ts` — `Rule`, `DomRule`, `DomMeasurement`, `ViolationResult`, `ManualChecklistItem` interfaces.
- [x] `rules/button/target-size.ts` — WCAG 2.5.5/2.5.8 target size (24×24 AA, 44×44 AAA).
- [x] `rules/shared/vague-label.ts` — detects vague button labels ("OK", "click here", etc.).
- [x] `rules/shared/invisible-text.ts` — detects when foreground matches background (gap axe-core skips).
- [x] `rules/shared/overflow.ts` — DOM-based content overflow detection.

### Type system
- [x] `types/component.ts` — `ComponentId` union, `ControlSchema` discriminated union (`text` | `slider` | `colour` | `segmented` | `group`), `ComponentDefinition<P>` generic interface.
- [x] `types/typography.ts` — `FontSize` type.

### Pages
- [x] `pages/index.vue` — redirects `/` → `/components/button`.
- [x] `pages/components/[component].vue` — dynamic route. Looks up definition from registry, renders `ComingSoon` or `ComponentStudio`, throws 404 for unknown slugs.

### Conventions established
- [x] Tailwind-first CSS approach — use Tailwind utility classes for all styling. Use `text-(length:--token)` syntax for font-size CSS variables. Only write `<style>` for pseudo-elements or complex keyframe animations.
- [x] All new UI text goes through i18n (`en.json` + `$t()`). No hardcoded English strings.
- [x] Nuxt UI-first — every piece of app UI uses the corresponding Nuxt UI component.
- [x] `postMessage` targets use `window.location.origin`, not `'*'`.

### Architectural decisions
- [x] **Event delegation in the iframe shell, not inline handlers in rendered markup.** `public/preview-shell.html` attaches single delegated listeners on the mount node for `click` (trigger-shaped elements) and `submit` (any form). Render functions therefore emit pure semantic markup — no `onclick`, no `onsubmit`. Rationale: the code drawer's copied HTML matches what a developer would actually write in their own project, which keeps AccessLab honest as a teaching tool. The shell's click listener uses a named `TRIGGER_SELECTOR` covering `button` and the three input button types; extend the selector when new component categories need demo feedback. The submit listener calls `preventDefault` so clicking a submit-typed button inside the form context wrapper does not navigate the iframe to a blank page.

## In progress

Nothing currently in progress.

## Remaining (next steps)

### Phase 1 components
- [ ] 7 remaining components: accordion, carousel, modal, menu, tooltip, tabs, form-field (each needs definition + render + controls + rules + manual checklist)

### Tests (plan §13)
- [ ] Unit tests for contrast composable, rule evaluators, prop validators
- [ ] Component tests for AppShell, sidebar, theme switch, iframe handler
- [ ] a11y tests via axe-playwright
