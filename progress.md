# Progress vs plan.md

## Completed

### Design token foundation (plan §9.1, §9.2)
- [x] `app/assets/css/tokens.css` — all 28 token properties per mode: light (default), dark, high-contrast light, high-contrast dark. Includes typography tokens (`--al-font`, `--al-font-mono`, `--al-base-size`) and `--focus-ring`.
- [x] `app/assets/css/main.css` — replaced green Nuxt UI starter palette with `@theme static` block referencing CSS custom properties from tokens.css.
- [x] `app/app.config.ts` — mapped Nuxt UI color roles (`primary`, `neutral`, `error`, `warning`, `success`, `info`) to AccessLab brand/semantic tokens. Default button size set to `lg`.

### Project setup
- [x] `AGENTS.md` — created for AI assistant session orientation.
- [x] Open questions resolved (plan §16) — all 6 decided and documented in plan.md and AGENTS.md.
- [x] Build infrastructure — `@types/node` added, workspace config fixed, lint errors resolved.
- [x] `pnpm typecheck`, `pnpm lint`, `pnpm test` all passing.

## In progress

Nothing currently in progress.

## Remaining (next steps)

### Composables (plan §4.3, §9.3, §10.3)
- [x] `composables/useTheme.ts`
- [ ] `composables/useFont.ts`
- [ ] `composables/useAxeAudit.ts`
- [ ] `composables/useManualReview.ts`
- [ ] `composables/useComponentProps.ts`
- [ ] `composables/useContrast.ts`

### App shell (plan §3.1, §3.2, §4.3)
- [x] `app.vue` — updated to `<NuxtLayout>` wrapper with AccessLab SEO meta
- [x] `app/layouts/default.vue` — three-pane shell: app bar, collapsible sidebar, preview area, code drawer, tabbed inspector
- [ ] `components/AppShell.vue` (covered by layout)
- [ ] `components/AppBar.vue`
- [ ] `components/ComponentSidebar.vue`
- [ ] `components/FrameworkPicker.vue`
- [ ] `components/PreviewIframe.vue`
- [ ] `components/ControlsPanel.vue`
- [ ] `components/IssuesPanel.vue`
- [ ] `components/ManualReviewPanel.vue`
- [ ] `components/LearnPanel.vue`
- [ ] `components/CodePanel.vue`
- [ ] `components/ContrastBadge.vue`
- [ ] `components/a11y/SkipLinks.vue`
- [ ] `components/a11y/FocusRing.vue`

### Preview iframe (plan §5)
- [ ] `public/preview-shell.html`

### Routing (plan §4.3)
- [ ] `pages/index.vue` — replace starter landing with redirect or AccessLab landing
- [ ] `pages/components/[component].vue` — dynamic route

### Phase 1 components (plan §7, §8.1)
- [ ] `components/inspected/button/` — definition, render, rules, manual review, learn
- [ ] `components/inspected/accordion/`
- [ ] `components/inspected/carousel/`
- [ ] `components/inspected/modal/`
- [ ] `components/inspected/menu/`
- [ ] `components/inspected/tooltip/`
- [ ] `components/inspected/tabs/`
- [ ] `components/inspected/form-field/` (Input first)

### Custom rules (plan §6.3)
- [ ] `rules/engine.ts`
- [ ] `rules/button/*.ts`
- [ ] rules for remaining 7 components

### Tests (plan §13)
- [ ] Unit tests for contrast composable, rule evaluators, prop validators
- [ ] Component tests for AppShell, sidebar, theme switch, iframe handler
- [ ] a11y tests via axe-playwright
