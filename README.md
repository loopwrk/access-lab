# AccessLab

AccessLab is a browser-based accessibility laboratory for developers. Users tune the properties of common UI components - buttons, accordions, carousels, modals, menus, tooltips, tabs, form fields etc, in real time. AccessLab instantly surfaces accessibility violations against WCAG&nbsp;2.2 and offers a structured manual review for the issues automated tools can't see.

Two things differentiate it from a generic accessibility checker:

1. **Live tuning, live feedback.** Properties (dimensions, padding, font size, colours, label text) are exposed as direct controls. Every adjustment re-runs the audit. The developer immediately understands cause and effect.
2. **Equal weight for what humans must check.** Tools like axe-core cover roughly 30–40% of WCAG criteria. The remaining ~60% - meaningful labels, sensible focus order, keyboard reachability, announced state changes, reflow at 400% zoom, cognitive load - is presented with the same visual prominence as automated findings.

AccessLab is, deliberately, also a _demonstration_. Because it teaches accessibility, it must itself reach WCAG&nbsp;2.2 Level&nbsp;AAA. Every choice in the codebase is held to the standard the product evangelises.

Accessibility is not always prioritised in mainstream teaching material and learning material is not always, for lack of better phrasing - accessible - given the dense documentation learners have to sift through. AccessLab offers an intuitive, learn-by-doing alternative.

---

## Project status

Mid-development, in a pre-user-testing polish window. Ten inspected components are currently included (six button-family patterns plus four form-input elements), the full Studio shell is working, and the three-engine audit pipeline (axe-core + prop-based custom rules + DOM-based rules) feeds the live Issues panel. A separate read-friendly view for learning topics that directly relate to the live, inspected components available to audit has been implemented. There are currently 16 custom written articles that explain topics in an accessible manner.

## The Studio layout

- **Left sidebar (collapsible).** Two groups: Buttons (six patterns) and Form Inputs (four elements). Each item routes to a dedicated component page; the highlighted entry tracks the current route. To be expanded on to include more HTML elements.
- **Centre - dominant preview.** The component renders inside an `<iframe>` with no inherited CSS from the host page apart from edge cases where the element is more likely to be styled in practice, such as a switch button (this is optional and can be toggled) - this matters: developers must see the component _as a browser sees it on a blank-slate HTML document_. Above the preview is a toolbar with: the component title (linking to the primary Learn topic), a variant picker chip (e.g. `<button type="button">` vs `<input type="submit">`), a wrapper picker chip (e.g. wrap in `<form>` or `<a href>`), and three live count badges (critical / warnings / passing).
- **Right inspector - tabbed.** Four tabs: `Controls` (every accessibility-relevant prop exposed as a direct control), `Issues` (live axe-core + custom-rule violations), `Manual` (the human-only checklist with progress indicator), and `Learn` (a topic picker pinning the articles most relevant to the active component).
- **Bottom - code drawer.** Collapsible HTML / CSS panes showing exactly what the rendered component emits, with copy buttons for both inline-style and class-extracted variants.

## Read Mode (Educational Articles)

Long-form learning lives at `/learn/<topicId>` - a dedicated reading route with its own layout, separate from the studio chrome. Sixteen articles cover the underlying patterns: button types, vague labels, native rendering, form wrapping, switches, disclosure triggers, menu triggers, and the rest.

**Where it appears.**

- From any control with a conceptual lesson behind it, the section label is a Learn-link (marked with `↗`). Clicking switches to read mode and stashes the current studio location.
- From the inspector's Learn tab, the topic picker pins the articles whose `concepts` overlap with the active component's `relevantConcepts`, then lists every category below.
- From the variant picker chip, each variant carries an optional "See also" link to its Learn topic.

**Articles are markdown.** Topics live under `content/learn/*.md` and are ingested via Nuxt Content.

**SSR.** Reading routes are server-rendered so crawlers see real HTML and deep links resolve fast. The studio routes (`/components/*`) are client-rendered only because they depend on a browser-side iframe + localStorage state with zero SEO value.

## Top app bar - accessibility controls

A persistent header carries:

- **AccessLab brand mark**
- **Font picker** (segmented control): Four available fonts. One standard, readable variable font and three optimised or preferred by people with dyslexia.
  - Figtree _(default)_
  - Atkinson Hyperlegible
  - OpenDyslexic
  - Comic Sans ([yes, really](https://www.boia.org/blog/does-comic-sans-benefit-people-with-dyslexia))
- **Text size** (4-step segmented control: S / M / L / XL - currently 87.5% / 100% / 112.5% / 131.25%)
- **High-contrast toggle** (forces pure black/white / yellow-on-black override)
- **Theme switcher** - Light / Dark

These are global, always reachable, and persisted across sessions (cookie + localStorage).

## Controls panel

For every inspected component, the Controls tab exposes the props that meaningfully affect accessibility. Sections are composed per-component from a shared library, so visiting a new component feels familiar:

- **Reset to browser defaults** - at the top of every component's controls. One click strips every override and shows what the bare element looks like in the current browser.
- **Content section** - label / aria-label / value / name / disabled. Each component picks the relevant subset.
- **Label association (form inputs)** - `for`/`id` vs wrapping vs `aria-label` vs none. The anti-patterns are present so the user can see what each choice produces.
- **Group mode (checkbox / radio)** - `<fieldset>` + `<legend>` vs visible heading only. The "no fieldset" path is an anti-pattern axe-core misses - a custom rule catches it.
- **Text section** - font-size with a USwitch to enable/disable, sliders + numeric inputs supporting px↔rem units.
- **Dimensions / Border** - width, height, padding (mergeable / splittable to 4-sided), border-width (same).
- **Colours** - background, text, border. Each row is a ColorPickerRow atom (swatch + label + hex input). A live ContrastBadge tracks the ratio + verdict (AAA / AA / AALarge / Fail).
- **Focus indicator** - width, offset, colour.
- **Pattern-specific sections** - Toggle State, Switch State, Disclosure State, Menu State. Each surfaces the ARIA contract for that pattern with both correct and incorrect choices on the same control.

A global rem-baseline slider lets the user simulate a non-default root font-size - the rem demo: every rem-based control resolves against that baseline, so the user sees what happens when their site's root is, say, 14px instead of 16.

## Live issues panel

Three collapsible sections - Critical, Warnings, Passing - each rendering a card per violation:

- The rule ID tinted by severity
- A human-readable title and short description tied to the current state
- An expandable "Why this matters" section revealing the WCAG criterion, who's affected, and the concrete fix
- A "Learn more" link to the matching article when available, or to an external article if no internal articles exist

## Manual review panel

Each item has a checkbox, a heading, and one or two sentences of guidance. Progress (`3 / 6 checked`) is shown at the top. Manual progress shows up in the same visual register as automated counts - equal weight, equal prominence.

## Learn Panel

The inspector's Learn tab is a navigation surface, not a reader. It shows topics most relevant to the active component (pinned via overlapping `concepts` tags), followed by the full library grouped by category. Clicking a topic opens the article at `/learn/<topicId>` in Read Mode - see the dedicated Read Mode section above.

## Generated HTML panel

A collapsible and drag-resizable code drawer at the bottom of the preview area shows the exact markup and CSS being rendered, with two toggleable panes:

- **HTML pane** - the component markup, pretty-printed.
- **CSS pane** - any studio-injected styles (only present when the component renders with non-trivial layout rules, e.g. the pill+thumb switch). The CSS pane drops declarations whenever the user has set a competing inline style.

Each pane has two copy buttons: **Copy inline** copies the exact markup, and **Copy with classes** converts inline `style=` attributes into a generated CSS class block (so the developer can paste the result into a project with existing styles).

---

## Technical foundation

- **Framework:** Nuxt 4.4.5
- **UI primitives:** Nuxt UI 4.7 plus Tailwind CSS 4.3 and Tailwind Variants. The implementation extends Nuxt UI's `app.config.ts` theming surface and `@theme static` CSS variables.
- **Styling:** Tailwind CSS v4 with CSS-first `@theme static` configuration (no `tailwind.config.ts`).
- **State:** `useState('<key>', init)` for cross-component reactive state, wrapped by setup-context composables that expose the public API. No Pinia.
- **Accessibility engine:** `axe-core 4.11.4` running inside the preview iframe, complemented by a prop-based custom-rule engine and a DOM-measurement-based engine in the host.
- **Persistence:** LocalStorage for personal preferences (theme, font, font-size, control-settings, code-drawer height, contrast). Cookie for color-mode preference (so SSR can pre-render the right theme on `/learn/*`).
- **Build target:** Static (`nuxt generate`). Hybrid rendering: `/components/**` is `ssr: false`, `/learn/**` is `ssr: true`.

## Local setup

### Prerequisites

- **Node.js** - currently runs on Node 24; 22 LTS should also work. There's no `.nvmrc` pin (yet).
- **pnpm 10.33.4** - pinned via `packageManager` in `package.json`. Do **not** install pnpm globally via Homebrew (the v8 it ships ignores the pin and produces store mismatches). Use `corepack`:

```bash
corepack enable
corepack prepare pnpm@10.33.4 --activate
```

After that, `corepack pnpm <cmd>` always uses the pinned version. Bare `pnpm` will work if your global pnpm matches v10, but the safe pattern across machines is to prefix everything with `corepack`.

### First-time install

```bash
corepack pnpm install
```

### Dev server

```bash
corepack pnpm dev
```

Open `http://localhost:3000`. The studio routes to `/components/buttons/action-triggers` by default.

### Build

```bash
corepack pnpm build           # nuxt build (server + client bundles)
corepack pnpm preview         # preview the built output locally
```

Static-gen output lives in `.output/` and is deployable to any CDN - Nuxt 4's `nuxt generate` produces a self-contained directory tree.

### Quality checks

```bash
corepack pnpm typecheck       # vue-tsc strict, no any
corepack pnpm lint            # ESLint (Nuxt-flavoured + custom stylistic)
corepack pnpm lint --fix      # safe to run; ~3k auto-fixable stylistic rules
corepack pnpm test            # vitest (currently scaffolding only)
corepack pnpm test:unit       # unit project
corepack pnpm test:nuxt       # nuxt component-test project
corepack pnpm test:coverage   # with v8 coverage
```

---

## Future considerations / TODO

### Code export ("Copy with classes")

- **`al-inspected-element` leaks into the exported snippet.** "Copy with classes" emits the studio-internal `al-inspected-element` class (the hook for studio-injected CSS and the iframe click bridge) alongside the generated `my-component` class. It works, but that internal name is meaningless to a developer pasting the snippet into their project. Consider consolidating all styling into a single user-facing class - i.e. rewrite the studio CSS selectors (`.al-inspected-element:focus-visible` to `.my-component:focus-visible`, plus the compound `.al-inspected-element.al-pressed` / `.al-switch` selectors on stateful components) so the export references one clean class.

### UX polish

- **Manual review checklist audit for Button.** Review `app/rules/buttons/shared/manual-checklist.ts` to confirm it covers the new affordances (variant picker, value/name attributes, form wrapper, src/alt for image inputs). Add items where the studio has grown past the checklist.

### Forms-as-a-sidebar-entry

A future sidebar group dedicated to forms as a whole (rather than individual form elements) would unlock several deferred lessons. Items waiting on this:

- **The `form` attribute (cross-form association).** `<button form="someId">` lets a button submit a form it's not a descendant of. Rare in real code but spec-valid. Best demonstrated in a multi-element form playground.
- **Multi-submit form demo.** The button-value-attribute Learn topic describes the multi-submit pattern (`name="action" value="draft"` vs `value="publish"`) but the studio only renders one button. The lesson is conceptual where it could be hands-on.
- **Reset demo input.** The reset toast currently reads "Form reset (no inputs to clear)" because the form has nothing but the reset button. Adding a small editable input inside the form wrapper when reset variants are active would make the reset lesson observable.

### Button-element scope

- **Submission-override attributes.** `formaction`, `formmethod`, `formenctype`, `formnovalidate`, `formtarget` let submit buttons override their parent form's settings. `formnovalidate` in particular is a common "Save as Draft" pattern. Worth exposing once we have a richer form preview.
- **Stage 7 - File picker.** Last planned entry in the button-family sidebar group. Two behaviour options: `label-wraps-input` (correct - `<label>` wrapping a visually-hidden `<input type="file">`) and `button-triggers-hidden-input` (anti-pattern - visible `<button>` plus a `display:none` input plus JS `.click()`). Diverges from the rest of the button family because the trigger is a `<label>`, not a `<button>` - needs a `'label-file'` `renderAs` value and a new branch in the renderer.

### Size options

- "S" is too small and users might want a size larger than "XL" without having to zoom in. Remap so M → S, L → M, XL → L, XL is a new option larger than previously possible. Consider allowing the left nav bar and controls toolbar to grow horizontally by ~15–20%.
- Audit all elements and fix size consistencies.

### Light / Dark / High Contrast modes

- There are some colour-scheme issues on some elements and components. Audit every element and component used for each colour scheme and update as necessary.

### Form attributes

- Consider adding mock `action` and `method` attributes to form elements.

### Mobile simulation

- Add feat/mobile simulation to preview area

### Add screen-reader simulation

- Consider adding-screen reader simulation. As text-only for stage one and voice-only at a later stage
