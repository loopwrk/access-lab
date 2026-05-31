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

### Stage 5 — Disclosure triggers

- [x] `shared/types.ts` — `'none' | 'aria-expanded' | 'out-of-sync'` `DisclosureBehaviour` + `disclosureExpanded` / `disclosureShowControls` / `disclosurePanelText` props.
- [x] `shared/render.ts` — `disclosureAttrs` emits `aria-expanded` (correct or stuck-at-false) and optional `aria-controls="al-disclosure-panel"`. When `disclosureBehaviour` is set, the renderer wraps the trigger in `<div class="al-disclosure-wrap">...<div id="al-disclosure-panel" hidden?>...</div></div>`. Panel visibility uses the browser-native `hidden` attribute so collapsed panels stay out of the accessibility tree.
- [x] `rules/buttons/disclosure-triggers/{disclosure-no-state,disclosure-state-out-of-sync}.ts` — both SC 4.1.2 Level A.
- [x] `components/ButtonStudio/sections/DisclosureStateSection.vue` — 3-option segmented control + `aria-controls` switch + Learn-link.
- [x] `components/inspected/buttons/disclosure-triggers/{definition,DisclosureControls}.{ts,vue}` — variants `['button-button', 'button']`; iframe click-bridge flips `disclosureExpanded`; default panel copy demonstrates a typical reveal-on-demand block.
- [x] `types/component.ts` + `inspected/index.ts` + `inspected/placeholders.ts` + `layouts/default.vue` — registry + nav entry (fifth child under Buttons).
- [x] `components/LearnTopic/DisclosureTriggers.vue` + `useLearnTopics.ts` — category `interaction`. i18n strings under `learn.disclosureTriggers.*`, controls strings under `controls.disclosureBehaviour*`, nav string `nav.buttonsDisclosureTriggers`.

### Stage 6 — Menu triggers

- [x] `shared/types.ts` — `MenuBehaviour = 'none' | 'aria-expanded-haspopup' | 'haspopup-only' | 'expanded-only'` + `menuOpen` / `menuShowControls` / `menuItems` props.
- [x] `shared/render.ts` — `menuAttrs` emits `aria-haspopup="menu"` and/or `aria-expanded` per behaviour, plus optional `aria-controls="al-menu-popup"`. Wrap branch produces `<div class="al-menu-wrap">` containing the trigger and a sibling `<ul id="al-menu-popup" role="menu" hidden?>` populated from `menuItems` (default `['Profile', 'Settings', 'Sign out']`). Popup visibility uses the browser-native `hidden` attribute, with the `[hidden]{display:none}` CSS rule surfaced in the CSS pane for the same teaching reason as the disclosure pattern.
- [x] **Keyboard contract deliberately unwired.** The studio renders bare markup with no arrow-key, Home/End, Escape, outside-click, or roving-tabindex handlers — the iframe shows exactly what the browser does for free given the markup and prop state. The Learn topic and a new `rules/buttons/menu-triggers/manual-checklist.ts` (composed on top of `buttonManualChecklist`) cover the production keyboard contract.
- [x] `rules/buttons/menu-triggers/{menu-no-haspopup,menu-no-expanded}.ts` — both SC 4.1.2 Level A.
- [x] `components/ButtonStudio/sections/MenuStateSection.vue` — 4-option segmented control + `aria-controls` switch + Learn-link.
- [x] `components/inspected/buttons/menu-triggers/{definition,MenuTriggerControls}.{ts,vue}` — variants `['button-button', 'button']`; iframe click-bridge flips `menuOpen`; `contextWrappers: [linkWrapper]` only (form wrapper omitted to avoid the implicit-submit demo).
- [x] `types/component.ts` + `inspected/index.ts` + `inspected/placeholders.ts` + `layouts/default.vue` — registry + nav entry (sixth child under Buttons).
- [x] `components/LearnTopic/MenuTriggers.vue` + `useLearnTopics.ts` — category `interaction`. Sections: pattern, why both attributes are needed, full keyboard contract, anti-patterns (no ARIA / half-wired / click-only), menu vs. select decision rule.
- [x] i18n: `nav.buttonsMenuTriggers`, `controls.menuBehaviour*`, `controls.menuShowControls`, `learn.menuTriggers.*`.

## Remaining (next steps)

### Stage 7 — File picker (deferred)

- Parked. Full notes in `plan.md` §18 "Button-element scope". Diverges from the rest of the button family because the trigger is a `<label>`, not a `<button>`.

### Other components (plan §7)

- [ ] 7 remaining components: accordion, carousel, modal, menu, tooltip, tabs, form-field (each needs definition + render + controls + rules + manual checklist).

### Tests (plan §13)

- [ ] Unit tests for contrast composable, rule evaluators, prop validators.
- [ ] Component tests for AppShell, sidebar, theme switch, iframe handler.
- [ ] a11y tests via axe-playwright.

---

## Codebase onboarding guide

This section is a map of the codebase for developers joining the project. It describes the folder structure, what each piece does, and the recommended order for reading through the code to build a working mental model.

### File/folder map

```
accesslab/
├── plan.md                          # Project brief & technical scope — read first
├── AGENTS.md                        # Operational conventions — read second
├── progress.md                      # This file — completion checklist + onboarding
├── nuxt.config.ts                   # Nuxt 4 config: modules, i18n, route rules, ssr:false
├── package.json                     # Dependencies & scripts
├── public/
│   ├── preview-shell.html           # Iframe shell: loads axe, bridges postMessage, handles events
│   └── vendor/
│       └── axe-core.min.js          # axe-core v4.11.4, served locally
├── i18n/
│   └── locales/en/                  # All user-facing English strings (4 namespace files)
├── test/
│   └── unit/                        # Unit test directory (scaffolding only)
└── app/                             # Nuxt srcDir — all application code lives here
    ├── app.vue                      # Root: NuxtLayout + SEO meta
    ├── app.config.ts                # Nuxt UI v4 theming: colour roles, button variants, FieldGroup
    ├── error.vue                    # Custom 404/error page with missing-slug detection
    ├── assets/css/
    │   ├── tokens.css               # CSS custom properties for light/dark/high-contrast modes
    │   ├── main.css                 # Tailwind v4 @import + @theme static + --ui-* overrides
    │   └── learn.css                # Learn panel content styling
    ├── types/
    │   ├── component.ts             # ComponentDefinition<P>, ControlSchema, ComponentId union
    │   ├── button.ts                # BaseButtonProps composed from Content/Style/Aria/Focus sub-types
    │   └── typography.ts            # FontSize type
    ├── utils/
    │   ├── domIds.ts                # Stable DOM id constants (inspector panels, iframe id)
    │   ├── prettifyCss.ts           # CSS pretty-printer for the code drawer
    │   └── focusPreviewContent.ts   # Focus management for the preview iframe
    ├── composables/                  # Reactive state, behaviours, and bridges
    │   ├── useTheme.ts              # Pinia store: light/dark + high-contrast, localStorage persistence
    │   ├── useFont.ts               # Pinia store: font family + size, localStorage persistence
    │   ├── useAxeAudit.ts           # postMessage bridge: iframe → reactive axe results + DOM measurements
    │   ├── useAxeResults.ts         # Shared state access: useAllViolations() merges axe+custom+DOM
    │   ├── useCustomRules.ts        # Prop-based rule engine → 'custom-violations' shared state
    │   ├── useDomRules.ts           # DOM-measurement-based rule engine → 'dom-violations' shared state
    │   ├── useInspectedComponent.ts # Page lifecycle: props ref, debounced render, rule registration
    │   ├── useInspectorTab.ts       # Inspector tab navigation + focus management + Learn topic focus
    │   ├── useContrast.ts           # WCAG2 luminance math: hex/rgba parsing, ratio, verdict
    │   ├── useManualReview.ts       # Merges axe incomplete + static checklist, manages checkbox state
    │   ├── useRenderedHtml.ts       # Shared state for code drawer (rendered-html, rendered-css)
    │   ├── useLearnTopics.ts        # Learn topic registry: 14 topics with async components
    │   ├── useBrowserDefaults.ts    # Probes user-agent styles via hidden DOM element, caches per tag
    │   ├── useUnitConversion.ts     # px↔rem conversion, CssLength type, simulatedRootPx
    │   ├── useInlineToClass.ts      # Inline style → CSS class conversion for "Copy with classes"
    │   ├── useButtonControlsModel.ts# Typed update(key, value) helper over a defineModel ref
    │   ├── useToggleableSection.ts  # Enable/restore/clear pattern for USwitch-gated sections
    │   ├── useNaturalSize.ts        # Intrinsic-size probe lifted out of ButtonControls
    │   ├── useButtonStudioDefaults.ts# Combines useBrowserDefaults + hardcoded fallbacks
    │   ├── useStudioToolbar.ts      # Shared state for toolbar (component name, active learn topic)
    │   └── usePreviewIframeOutsideClick.ts # Forwards iframe clicks as "outside clicks" for popovers
    ├── components/
    │   ├── ComponentStudio.vue       # Mounts preview + teleports all 4 inspector panels + toasts
    │   ├── PreviewIframe.vue         # Sandboxed iframe, render() queue, exposes axe results
    │   ├── PreviewToolbar.vue        # Toolbar: title, variant/wrapper pickers, counter badges
    │   ├── CodeDrawer.vue            # Collapsible code drawer with HTML/CSS panes + copy buttons
    │   ├── AppBar.vue                # Top bar: font/size/HC/theme controls + sidebar toggle
    │   ├── AppSidebar.vue            # Collapsible sidebar with UNavigationMenu
    │   ├── AppInspector.vue          # Right panel: tabbed inspector (Controls/Issues/Manual/Learn)
    │   ├── VariantPicker.vue         # UPopover markup-variant picker (e.g. <button> vs <input>)
    │   ├── WrapperToggles.vue        # UPopover context-wrapper picker (e.g. wrap in <form>)
    │   ├── ContrastBadge.vue         # Live contrast ratio with verdict + icon
    │   ├── AnimatedCountBadge.vue    # Animated counter pill (critical/warning/passing)
    │   ├── IssuesPanel.vue           # Live violations display (axe + custom + DOM), collapsible sections
    │   ├── ManualReviewPanel.vue     # Human-review checklist with UCheckbox items
    │   ├── LearnPanel.vue            # Topic index → detail navigation, lazy-loaded content
    │   ├── ControlsIntro.vue         # Intro content for Controls tab (before a component is selected)
    │   ├── ComingSoon.vue            # Placeholder page for unimplemented components
    │   ├── MobileBlocker.vue         # Mobile disclaimer overlay
    │   ├── RootEmSlider.vue          # Global rem-baseline slider for rem-demo mode
    │   ├── LengthValueInput.vue      # Numeric input + unit picker for LengthControl
    │   ├── controls/
    │   │   ├── LengthControl.vue     # Reusable slider + value-input atom
    │   │   └── SplitSpacingControl.vue # Merge/split 4-sided spacing (padding/border)
    │   ├── ButtonStudio/             # Button-family control sections
    │   │   └── sections/             # 11 sections: Content, Text, Dims, Border, Colours,
    │   │                             #   Aria, Focus, ToggleState, SwitchState,
    │   │                             #   DisclosureState, MenuState
    │   ├── LearnTopic/               # 14 Learn topic .vue files (lazy-loaded)
    │   └── inspected/                # Components users inspect in the studio
    │       ├── index.ts              # Registry: maps ComponentId → ComponentDefinition
    │       ├── placeholders.ts        # 7 placeholder definitions for future components
    │       ├── buttons/
    │       │   ├── shared/           # Shared types, render, variants, wrappers
    │       │   ├── action-triggers/  # Stage 2: <button> and <button type="button">
    │       │   ├── form-buttons/     # Stage 2: submit/reset across <button> and <input>
    │       │   ├── toggle-buttons/   # Stage 3: aria-pressed / aria-checked patterns
    │       │   ├── switches/         # Stage 4: role="switch" + aria-checked
    │       │   ├── disclosure-triggers/ # Stage 5: aria-expanded + aria-controls
    │       │   └── menu-triggers/    # Stage 6: aria-haspopup + aria-expanded
    │       └── input/                # Form input: label, placeholder, help text, type
    ├── rules/                         # Custom WCAG rules — prop-based + DOM-based
    │   ├── types.ts                  # Rule, DomRule, ViolationResult, ManualChecklistItem interfaces
    │   ├── shared/                   # Cross-component rules (vague-label, invisible-text, overflow)
    │   └── buttons/                  # Button-family rules
    │       ├── shared/               # target-size, focus-visible, focusable-in-anchor, manual-checklist
    │       ├── action-triggers/
    │       ├── form-buttons/
    │       ├── toggle-buttons/       # toggle-state-missing, toggle-wrong-attribute
    │       ├── switches/             # switch-no-role, switch-wrong-attribute
    │       ├── disclosure-triggers/  # disclosure-no-state, disclosure-state-out-of-sync
    │       └── menu-triggers/        # menu-no-haspopup, menu-no-expanded, manual-checklist
    ├── layouts/
    │   └── default.vue               # Three-pane shell: skip links, app bar, sidebar, main, inspector
    └── pages/
        ├── index.vue                 # Redirects / → /components/buttons/action-triggers
        └── components/
            ├── [component].vue       # Dynamic flat route — redirects 'button' to buttons/action-triggers
            └── buttons/
                └── [pattern].vue     # Dynamic nested route — looks up 'buttons-{pattern}' in registry
```

### Recommended reading order

Start with the big-picture documents, then trace a single user interaction end-to-end.

#### First — context (the "what" and "why")

1. **`plan.md`** — The single source of truth. Covers product scope, audience, technical stack, component contract, and the thinking behind every architectural decision.
2. **`AGENTS.md`** — Operational conventions: commands, where to find things, token chain, Nuxt UI-first, defineModel bag pattern, i18n rules, naming rules. Read it every session.
3. **`progress.md`** (this file) — What's done, what's next, and this onboarding section.

#### Second — the app shell (the "where")

4. **`app/layouts/default.vue`** — The three-pane grid. See how skip links, the app bar, sidebar, main slot (preview area), code drawer, and inspector are arranged. Note the teleport targets (`#controls-panel`, `#issues-panel`, etc.) — these are where `ComponentStudio` injects content.
5. **`app/components/AppBar.vue`** — The top bar: font/size/HC/theme segmented pickers. Shows the Pinia store consumption pattern (`useTheme()`, `useFont()`).
6. **`app/components/AppSidebar.vue`** — Collapsible `UNavigationMenu` with the accordion pattern for nested button entries.
7. **`app/components/AppInspector.vue`** — Right panel with `UTabs`. Each tab panel is a div with a stable `id` — the teleport targets listed in `utils/domIds.ts`.

#### Third — the design system (the "how it looks")

8. **`app/assets/css/tokens.css`** — All CSS custom properties, scoped per mode (`.theme-light`, `.theme-dark`, `.theme-high-contrast`). This is the colour source of truth.
9. **`app/assets/css/main.css`** — Tailwind v4 `@import`, `@theme static` block (maps tokens into Tailwind variables), `--ui-*` overrides (wires tokens into Nuxt UI internals).
10. **`app/app.config.ts`** — Nuxt UI colour role aliases (`primary: 'accesslab'`), button compound variants for segmented pickers, FieldGroup base styling.

#### Fourth — the core runtime (the "how it works")

11. **`app/composables/useInspectedComponent.ts`** — The per-page lifecycle driver. Watch this closely: it seeds `componentProps` from `definition.defaultProps`, watches for changes, debounces renders, calls `definition.render()`, applies context wrappers, resolves `CssLength` units, and evaluates custom rules. This is the beating heart of every component page.
12. **`app/components/ComponentStudio.vue`** — Mounts `<PreviewIframe>`, teleports the controls panel + Issues + Manual + Learn into the inspector, listens for `postMessage` from the iframe (click/form toasts). The bridge between the page route and the layout.
13. **`app/components/PreviewIframe.vue`** — Owns the `<iframe>`, exposes `render(html, css?, rootFontSize?)`, queues renders until the shell is ready, delegates axe to `useAxeAudit`.
14. **`public/preview-shell.html`** — The iframe's internal script. Loads axe-core, listens for `preview:render`, waits for `document.fonts.ready`, runs `axe.run()`, posts results back. Also: DOM overflow measurement, click/change/submit/reset event forwarding, `preview:pointerdown` for outside-click detection.

#### Fifth — the component definition contract (the "what a component is")

15. **`app/types/component.ts`** — `ComponentDefinition<P>`, `ControlSchema`, `ComponentVariant`, `ContextWrapper`, `RenderedFragment`. Every inspected component conforms to this.
16. **`app/components/inspected/index.ts`** — The registry. Maps `ComponentId` → `ComponentDefinition`. Real definitions override placeholder spreads.
17. **`app/components/inspected/buttons/action-triggers/definition.ts`** — The simplest button-family definition. Follow the imports: `renderButton` (shared/render), `variants` (shared/variants), `formWrapper`/`linkWrapper` (shared/wrappers), rules from `rules/buttons/shared/`. Note `controlsComponent: defineAsyncComponent(...)` — this async import is the code-splitting mechanism.

#### Sixth — the button family shared core (the "what the button studio shares")

18. **`app/components/inspected/buttons/shared/types.ts`** — `BaseButtonProps` (composes Content/Style/Aria/Focus sub-types), `ButtonRenderAs` union, toggle/switch/disclosure/menu behaviour enums.
19. **`app/components/inspected/buttons/shared/render.ts`** — The 515-line workhorse. Takes `Partial<ButtonProps>` and returns `{ html, css? }`. Contains element renderers (`renderNativeButton`, `renderInputButton`, etc.), ARIA attribute assemblers (`toggleAttrs`, `switchAttrs`, `disclosureAttrs`, `menuAttrs`), style builders, and the CSS generation logic (studio rules gated by user override checks).
20. **`app/components/inspected/buttons/shared/variants.ts`** — `ALL_VARIANTS` record + `variants(keys)` filter. Each variant has a label, description, status, section heading, and optional `seeAlsoTopicId`.
21. **`app/components/inspected/buttons/shared/wrappers.ts`** — Three `ContextWrapper` objects: `formWrapper`, `linkWrapper`, `buttonWrapper`. Each has a `wrap(html)` function and optional `availableFor(renderAs)` filter.

#### Seventh — the audit pipeline (the "how violations are found")

22. **`app/composables/useAxeAudit.ts`** — Listens for `postMessage` from the iframe, stores axe results + DOM measurements in shared state. Also resets readiness on mount.
23. **`app/composables/useAxeResults.ts`** — `useAllViolations()` merges three sources (axe `violations`, `custom-violations`, `dom-violations`) into a single reactive array. `useAxeCounts()` computes critical/warning/passing counts. The Issues panel and toolbar badges consume these.
24. **`app/composables/useCustomRules.ts`** — Takes `Rule[]`, exposes `evaluate(props)`, writes to `custom-violations` shared state.
25. **`app/composables/useDomRules.ts`** — Same pattern but watches `dom-measurement` shared state (set by `useAxeAudit` when the iframe posts overflow data).
26. **`app/rules/types.ts`** — `Rule`, `DomRule`, `ViolationResult`, `ManualChecklistItem` interfaces.
27. **`app/rules/shared/vague-label.ts`** — Example of a prop-based rule. Checks if the label is in a set of vague words. Returns `ViolationResult | null`.
28. **`app/rules/buttons/shared/target-size.ts`** — Two rules in one file: AA (24px severe) and AAA (44px moderate). Shows how rules can reference each other (AAA only fires if AA doesn't).
29. **`app/components/IssuesPanel.vue`** — Renders the merged violation list. Three collapsible sections (Critical/Warnings/Passing), failure summary parsing, learn-more links.

#### Eighth — the controls architecture (the "how the user tunes props")

30. **`app/composables/useButtonControlsModel.ts`** — The typed `update<K>(key, value)` helper. Direct mutation on the `defineModel` ref — more efficient than spread.
31. **`app/components/ButtonStudio/sections/ContentSection.vue`** — Example section. Import pattern: `defineModel<Partial<BaseButtonProps>>`, `useButtonControlsModel(model)`, `focusLearnTopic` for Learn-links. See how it reads `renderAs` to conditionally show/hide fields.
32. **`app/components/controls/LengthControl.vue`** — Reusable `USlider` + `LengthValueInput`. Classic `defineProps`/`defineEmits` (not defineModel — intentionally simpler for reusable atoms).
33. **`app/components/inspected/buttons/action-triggers/ActionTriggerControls.vue`** — A full controls composer. Imports sections, wires them to the shared `defineModel` ref. Shows the per-page composition pattern.

#### Ninth — the code drawer and Learn panel (the "how users consume output")

34. **`app/components/CodeDrawer.vue`** — `UCollapsible` with HTML/CSS pane toggle. Reads `renderedHtml`/`renderedCss` from `useRenderedHtml()`. Copy buttons (inline + classes) with feedback.
35. **`app/components/LearnPanel.vue`** — Topic index → detail navigation. Uses `useLearnTopics()` for the topic registry.
36. **`app/composables/useLearnTopics.ts`** — Registry of all 14 Learn topics with `defineAsyncComponent` imports. Each topic is categorised (`foundations`, `text-and-labels`, `interaction`, `visual`).
37. **`app/components/LearnTopic/NativeRendering.vue`** — Example topic. All prose in i18n keys, markup via `<i18n-t>` with named slots, related topics at the bottom.

#### Tenth — the remaining pieces (read as needed)

38. **`app/composables/useTheme.ts`** / **`useFont.ts`** — Pinia stores with `useLocalStorage` persistence and `watchEffect` DOM sync.
39. **`app/composables/useContrast.ts`** — WCAG2 luminance math. Alpha-aware, used by `ContrastBadge` and `focusLowContrast` rule.
40. **`app/components/ContrastBadge.vue`** — Pure display component: ratio number + verdict + icon.
41. **`app/components/AnimatedCountBadge.vue`** — Animated counter pill with tally transition + glow pulse. Respects `prefers-reduced-motion`.
42. **`app/components/VariantPicker.vue`** / **`WrapperToggles.vue`** — `UPopover` pattern with status badges, section headers, and outside-click handling (including the iframe).
43. **`app/error.vue`** — Custom error page: 404 detection, component-slug extraction, `clearError` redirect.
44. **`app/pages/components/[component].vue`** / **`pages/components/buttons/[pattern].vue`** — Thin route handlers: look up definition from registry, render `ComingSoon` or `ComponentStudio`.
45. **`app/composables/useManualReview.ts`** — Merges static checklist + axe incomplete items, manages checkbox state with immutable spread updates.

### Key architectural patterns to internalize

- **The token chain**: `tokens.css` → `@theme static` → `app.config.ts` → `--ui-*` overrides. Every colour flows through this, no shortcuts.
- **The iframe boundary**: App UI = Nuxt UI. Inspected components = bare HTML in the iframe. They communicate exclusively via `postMessage` with origin checking.
- **The defineModel bag pattern**: A single `Partial<BaseButtonProps>` ref passes through every control section via `defineModel`. Sections read/write through `useButtonControlsModel(model).update(key, value)` — direct mutation, not spread.
- **The audit pipeline**: Three independent engines (axe-core in iframe, custom rules on props, DOM rules on measurements) write to three separate `useState` keys. `useAllViolations()` merges them into one reactive array consumed by the Issues panel and toolbar badges.
- **Teleport for cross-layout injection**: Page-level `ComponentStudio` teleports content into layout-defined targets. The layout owns the DOM structure; the page owns the content.
- **Async components for code splitting**: Every controls panel and Learn topic is loaded via `defineAsyncComponent`. This breaks import cycles and keeps the initial bundle small.
- **Nuxt UI-first**: Every piece of app chrome uses the corresponding Nuxt UI component. Raw HTML only appears in the iframe and in popover trigger buttons.
- **i18n-first**: No hardcoded English strings. All text through `useI18n()` / `$t()`. Markup in Learn prose uses `<i18n-t>` with named slots.
