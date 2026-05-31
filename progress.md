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

### Button studio refactor — Stages 1 & 2 (IA split)

**Stage 1 — Scaffolding extraction (no behaviour change).**
- [x] `types/button.ts` — split into `ButtonContentProps` / `ButtonStyleProps` / `ButtonAriaProps` / `ButtonFocusProps`, composed via `BaseButtonProps`.
- [x] `composables/useButtonControlsModel.ts` — typed `update<K>(key, value)` helper over a `defineModel` ref.
- [x] `composables/useToggleableSection.ts` — generic enable/restore/clear pattern for sections with a USwitch (font-size, padding, border, colours, focus).
- [x] `composables/useNaturalSize.ts` — intrinsic-size probe lifted out of ButtonControls. Watches model, returns `naturalSize` ref + `browserDefaults`.
- [x] `composables/useButtonStudioDefaults.ts` — combines `useBrowserDefaults` + hardcoded fallbacks; returns `ButtonStudioDefaults` (numeric).
- [x] `components/controls/LengthControl.vue` — app-level reusable atom (slider + `LengthValueInput`).
- [x] `components/controls/SplitSpacingControl.vue` — app-level reusable atom (merge/split 4-sided control).
- [x] `components/ButtonStudio/sections/{Content,Aria,Text,Dimensions,Border,Colours,Focus}Section.vue` — each owns its UI + section-local state; reads `model` via `defineModel<Partial<BaseButtonProps>>`, writes through `useButtonControlsModel.update`.
- [x] All studio-control classes (`.control-group-title`, `.color-swatch`, `.control-label-link`, etc.) moved to `assets/css/main.css` under `@layer components`.

**Stage 2 — IA split into Action triggers + Form buttons.**
- [x] `components/inspected/buttons/shared/{types,render,variants,wrappers}.ts` — `ButtonRenderAs` union, `ButtonProps` interface, shared renderer, `variants(keys)` selector, `formWrapper` / `linkWrapper` / `buttonWrapper` (button wrapper gated by `availableFor: renderAs.startsWith('input-')`).
- [x] `components/inspected/buttons/action-triggers/{definition,ActionTriggerControls}.{ts,vue}` — `<button>` and `<button type="button">` variants only; no variant-switch effects; rules: target-size AA/AAA, focusable-in-anchor, focus-not-visible, focus-low-contrast.
- [x] `components/inspected/buttons/form-buttons/{definition,FormButtonControls}.{ts,vue}` — six form-related variants (submit/reset across `<button>` and `<input>` plus `input-image`); form-wrap-by-default + variant label restore + contentType clear-on-input watchers.
- [x] `rules/buttons/shared/{target-size,focus-visible,focusable-in-anchor,manual-checklist}.ts` — rules folder reorganised under `rules/buttons/`.
- [x] `pages/components/buttons/[pattern].vue` — dynamic nested route. Looks up `buttons-${pattern}` in the registry.
- [x] `pages/components/[component].vue` — redirects `/components/button` → `/components/buttons/action-triggers` so old bookmarks survive.
- [x] `types/component.ts` — removed `"button"` from `ComponentId`, added `"buttons-action-triggers"` and `"buttons-form-buttons"`.
- [x] `layouts/default.vue` — sidebar navigation switched to grouped accordion (parent "Buttons" with `type: 'trigger'`, three children, `collapsible` enabled on root `UNavigationMenu`). Old `inspected/button/` directory deleted.

### Container picker UX (chip extraction + nested-interactive rule)
- [x] `components/WrapperToggles.vue` — converted from per-wrapper toggles to a single-select dropdown styled to match `VariantPicker` (UPopover + brand-soft mono trigger button + simple list content, no descriptions/badges). Sentinel `"None"` option for empty wrappers array.
- [x] `layouts/default.vue` — merged `#preview-toolbar-variant` + `#preview-toolbar-wrappers` teleport targets into a single shared `.toolbar-chip` container so the row reads as one sentence (`MARKUP | <button type="button"> ▾ wrapped inside <form> ▾ | About <form> ↗`). Internal segment dividers drawn as `w-px bg-(--border)` spans inside `VariantPicker` / `WrapperToggles`. Stripped per-component borders from both pickers.
- [x] `components/ComponentStudio.vue` — `availableContextWrappers` computed filters wrappers by their `availableFor(renderAs)` predicate; clears `wrappers` when the selected wrapper is no longer available.
- [x] `types/component.ts` — `ContextWrapper` gained `availableFor?: (renderAs) => boolean`.
- [x] `rules/buttons/shared/focusable-in-anchor.ts` — new custom rule. Fires when `wrappers` includes `'link'` (the button is wrapped in `<a href>`). Closes the gap that axe-core's `nested-interactive` rule leaves open for the `link` role (axe only fires for roles with `childrenPresentational: true`).

### Stage 3 — Toggle buttons
- [x] `shared/types.ts` — added `toggleBehaviour?: 'none' | 'aria-pressed' | 'aria-checked' | 'visual-only'` + `togglePressed?: boolean` + `ToggleBehaviour` type.
- [x] `shared/render.ts` — emits `aria-pressed` / `aria-checked` attribute and the `al-pressed` class for visual feedback; injects an inset-shadow tint when pressed.
- [x] `components/ButtonStudio/sections/ToggleStateSection.vue` — segmented control (4 options) + initial-pressed switch + link to the toggle-buttons Learn topic.
- [x] `rules/buttons/toggle-buttons/{toggle-state-missing,toggle-wrong-attribute}.ts` — fires on visual-only (state-missing) and aria-checked (wrong-attribute). Both SC 4.1.2 Level A.
- [x] `components/inspected/buttons/toggle-buttons/{definition,ToggleButtonControls}.{ts,vue}` — variants `['button-button', 'button']`; iframe click-bridge listens for `demo:click` and flips `togglePressed`.
- [x] Registered in `inspected/index.ts`, third nav child under Buttons.

### Stage 4 — Switches
- [x] `shared/types.ts` — added `switchBehaviour?: 'none' | 'role-switch' | 'aria-pressed'` + `switchChecked?: boolean` + `switchPillStyling?: boolean` + `SwitchBehaviour` type.
- [x] `shared/render.ts` — emits `role="switch"` + `aria-checked` (or `aria-pressed` when behaviour is the wrong-attribute case). When `switchPillStyling: true`, the renderer:
  - wraps the button in `<div class="al-switch-wrap"><span id="al-switch-label">Label</span><button aria-labelledby="al-switch-label"></button></div>` (canonical APG external-label pattern);
  - injects pill+thumb CSS conditional on user not having set competing inline styles (no `!important`);
  - emits `font-family: Arial, Helvetica, sans-serif` on the wrapper;
  - applies an extra-strong inset tint when checked (≈25% black overlay = "gray-on-darker-gray" on press, matching Nuxt UI USwitch's feel without using a brand colour).
- [x] `components/ButtonStudio/sections/SwitchStateSection.vue` — segmented control (3 options) + pill-styling switch + link to the switches Learn topic. The "Initially on" control was removed — clicking the live switch is now the only way to set state.
- [x] `rules/buttons/switches/{switch-no-role,switch-wrong-attribute}.ts` — fires on `none` (no role) and `aria-pressed` (wrong attribute for a switch). Both SC 4.1.2 Level A.
- [x] `components/inspected/buttons/switches/{definition,SwitchControls}.{ts,vue}` — variants `['button-button', 'button']`; iframe click-bridge flips `switchChecked`; **state-driven notification toast** appears when on, removed when off, no other dismiss path (`close: false`, `duration: 0`); cleanup in `onBeforeUnmount`.
- [x] `types/component.ts` — `ComponentDefinition.suppressDemoClickToast?: boolean` flag added. Switches definition opts in so the generic "Click event fired" toast does not fire alongside the notification toast.
- [x] Registered in `inspected/index.ts`, fourth nav child under Buttons.

### Code drawer split — HTML / CSS panes
- [x] `types/component.ts` — `ComponentDefinition.render` now returns `string | RenderedFragment`. New `RenderedFragment` interface with `{ html: string, css?: string }`.
- [x] `components/inspected/buttons/shared/render.ts` — `renderButton` returns `RenderedFragment`. Studio CSS rules (focus ring, pressed tint, switch pill) are conditionally injected and the rule list collapses when nothing is needed. User inline styles override studio class declarations through normal cascade order (no `!important` battles); per-property gating on `props.padding` / `props.width` etc. drops studio rules from the CSS pane whenever the user has set a competing value.
- [x] `composables/useRenderedHtml.ts` — `useState('rendered-html')` + `useState('rendered-css')`. `setOutput(html, css)` writes both; `setHtml(html)` shim still works for callers that don't emit CSS.
- [x] `composables/useInspectedComponent.ts` — normalises the renderer's return shape, sends `<style>${css}</style>${html}` to the iframe (single document), passes `html` + `css` to `setOutput`.
- [x] `utils/prettifyCss.ts` — small pretty-printer (split on `}`, indent declarations, blank line between rules). Display-only; iframe gets the minified version.
- [x] `components/CodeDrawer.vue` — extracted from `default.vue`. Owns `codeView` state, `hasCss` + `prettifiedCss` computeds, and the `copyHtml` flow. Toggles between HTML and CSS panes via a small `UFieldGroup`; CSS button only renders when `hasCss` is true. Scoped CSS dropped — pure Tailwind classes (`border-t border-(--border) bg-(--surface)`, `max-h-[220px] overflow-auto`).
- [x] `layouts/default.vue` — drawer block replaced with `<CodeDrawer />`. State + CSS removed.

### Learn topics (Phase 5.1 — dead-anchor fix)
- [x] `components/LearnTopic/ToggleButtons.vue` — `aria-pressed` pattern, label stability, anti-patterns (visual-only, `aria-checked` on button, label-flip), switch vs. toggle decision rule. Related links to Switches and Accessible Name.
- [x] `components/LearnTopic/Switches.vue` — `role="switch"` + `aria-checked`, native `<input type="checkbox" role="switch">` alternative, label-click forwarding (WCAG 2.5.5 / 2.5.8 link), switch vs. checkbox decision rule, anti-patterns (no role, `aria-pressed`, label-flip). Related links to Toggle Buttons and Accessible Name.
- [x] `composables/useLearnTopics.ts` — registered both under `category: 'interaction'`. The dead `focusLearnTopic('toggle-buttons')` and `focusLearnTopic('switches')` anchors in the section components now resolve.
- [x] `i18n/locales/en/learn.json` — `learn.toggleButtons.*` and `learn.switches.*` blocks added.

### Switch label-click activation (Phase 5.2)
- [x] `public/preview-shell.html` — click delegate on the mount node. When a click hits anything inside `#al-switch-label`, forwards a synthetic click to the sibling `.al-inspected-element.al-switch` button. Matches the universal production affordance (iOS, Material, Bootstrap, GitHub) and helps SC 2.5.5 Target Size / 2.5.8 Target Size Minimum by extending the effective target area.

### checkbox-role-switch variant (Phase 5.3)
- [x] `shared/types.ts` — `'input-checkbox-switch'` added to `ButtonRenderAs`.
- [x] `shared/variants.ts` — variant entry added with `status: 'recommended'`, `seeAlsoTopicId: 'switches'`.
- [x] `i18n/locales/en/components.json` — `components.button.variants.input-checkbox-switch.{description,statusNote}` strings added.
- [x] `shared/render.ts` — `renderInputCheckboxSwitch` helper emits `<label for="al-switch-input"><span>Label</span><input id="al-switch-input" type="checkbox" role="switch" checked? /></label>`. The `<label for>` association gives free label-click activation via the browser. `isPilledSwitch` now requires a `<button>`-tag renderAs so the pill+thumb CSS (which uses `::before`) only runs for variants that can host pseudo-elements.
- [x] `public/preview-shell.html` — added a `change` listener on the mount node that posts `demo:click` whenever a `.al-inspected-element` checkbox toggles. `TRIGGER_SELECTOR` deliberately omits checkboxes, so the click and change paths don't double-fire.
- [x] `SwitchStateSection.vue` — pill-styling `UFormField` is hidden when `renderAs` is input-prefixed; the studio CSS check matches.
- [x] `switches/definition.ts` — `'input-checkbox-switch'` added to the variants array.

## Remaining (next steps)

### Stage 5 — Disclosure triggers (planned)
- [ ] `disclosureBehaviour?: 'none' | 'aria-expanded' | 'expanded-always-visible' | 'visual-only'` + `disclosureExpanded?: boolean` + `disclosureShowControls?: boolean` props.
- [ ] Renderer emits `aria-expanded` (+ optionally `aria-controls`) on the button and a sibling `<div id="al-disclosure-panel" hidden|''>...</div>` panel.
- [ ] `rules/buttons/disclosure/{disclosure-no-state,disclosure-state-out-of-sync}.ts`.
- [ ] `DisclosureStateSection`, `DisclosureControls.vue`, `definition.ts`, nav entry, Learn topic.

### Stage 6 — Menu triggers (planned)
- [ ] `aria-haspopup` + `aria-expanded` + `aria-controls`, focus management into the popup, Escape-to-close.

### Stage 7 — File picker (planned)
- [ ] `<label>` over hidden `<input type="file">` pattern vs. visible-button + hidden-input + JS `.click()` anti-pattern.

### Other components (plan §7)
- [ ] 7 remaining components: accordion, carousel, modal, menu, tooltip, tabs, form-field (each needs definition + render + controls + rules + manual checklist).

### Tests (plan §13)
- [ ] Unit tests for contrast composable, rule evaluators, prop validators.
- [ ] Component tests for AppShell, sidebar, theme switch, iframe handler.
- [ ] a11y tests via axe-playwright.
