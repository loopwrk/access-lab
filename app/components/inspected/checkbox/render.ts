import type { CheckboxProps } from "./definition";
import type { RenderedFragment } from "~/types/component";
import { associateLabel } from "~/utils/associateLabel";
import { escapeAttribute, escapeHtml } from "~/utils/escapeHtml";
import { inlineStyleAttribute } from "~/utils/inlineStyleAttribute";

interface InputAttrs {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  required: boolean;
  disabled: boolean;
  ariaLabel?: string;
  style: string;
}

// CSS for the `div-checkbox` variant. Builds a checkbox-shaped square
// using `::before` with an inline SVG checkmark for the checked state.
// `[aria-checked="true"]` drives the ticked visual; `[aria-checked="mixed"]`
// drives the indeterminate dash. The inspected element class lets the
// iframe shell post `demo:click` when the box is clicked.
const DIV_CHECKBOX_CSS
  = `.al-div-checkbox{display:inline-flex;align-items:center;gap:0.5em;cursor:pointer;user-select:none;font-family:Arial,Helvetica,sans-serif;outline:none;padding:0.2em 0.3em;}`
    + `.al-div-checkbox::before{content:'';display:inline-block;width:1em;height:1em;border:2px solid #444;border-radius:2px;background:#fff;flex-shrink:0;box-sizing:border-box;}`
    + `.al-div-checkbox[aria-checked="true"]::before{background:#1d4ed8 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3E%3Cpath d='M6.5 12.1 3.2 8.8l1.4-1.4 1.9 1.9 4.9-4.9 1.4 1.4z'/%3E%3C/svg%3E") center/contain no-repeat;border-color:#1d4ed8;}`
    + `.al-div-checkbox[aria-checked="mixed"]::before{background:#1d4ed8 url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16' fill='white'%3E%3Crect x='3' y='7' width='10' height='2' rx='0.5'/%3E%3C/svg%3E") center/contain no-repeat;border-color:#1d4ed8;}`
    + `.al-div-checkbox:focus-visible{outline:2px solid #1d4ed8;outline-offset:2px;}`
    + `.al-div-checkbox[aria-disabled="true"]{opacity:0.5;cursor:not-allowed;}`
    + `.al-parent-children{display:inline-flex;flex-direction:column;align-items:flex-start;gap:0.4em;font-family:Arial,Helvetica,sans-serif;}`
    + `.al-parent-children fieldset{border:1px dashed #999;border-radius:4px;margin:0 0 0 1.2em;padding:0.4em 0.8em;display:flex;flex-direction:column;gap:0.3em;}`
    + `.al-parent-children legend{padding:0 0.3em;color:#555;font-size:0.85em;}`;

function inputTag(
  attrs: InputAttrs,
  indeterminate: boolean,
  ariaChecked: boolean,
  inspected: boolean,
  childIndex: number | null,
): string {
  const parts: string[] = [
    "type=\"checkbox\"",
    `id="${attrs.id}"`,
    `name="${escapeAttribute(attrs.name)}"`,
    `value="${escapeAttribute(attrs.value)}"`,
  ];
  if (inspected) parts.push(`class="al-inspected-element"`);
  if (attrs.checked) parts.push("checked");
  if (attrs.required) parts.push("required");
  if (attrs.disabled) parts.push("disabled");
  // aria-checked on a native checkbox is the redundant pattern the
  // `checkbox-aria-checked-redundant` rule warns about. The render
  // still honours the prop so the user can see the resulting markup.
  if (ariaChecked) parts.push(`aria-checked="${attrs.checked}"`);
  if (attrs.ariaLabel)
    parts.push(`aria-label="${escapeAttribute(attrs.ariaLabel)}"`);
  // `indeterminate` is JS-only — see preview-shell.html for the
  // post-render hook that reads this marker.
  if (indeterminate) parts.push("data-al-indeterminate");
  // Children of the parent-with-children pattern carry their index so
  // the iframe click bridge knows which entry of `childChecked` to
  // flip when the user clicks one of them.
  if (childIndex !== null) parts.push(`data-al-child-index="${childIndex}"`);
  return `<input ${parts.join(" ")}${attrs.style} />`;
}

/**
 * Render the native input-checkbox variant using the chosen label-
 * association strategy. `id` lets group rendering pass distinct ids
 * to each row.
 */
function renderNativeCheckboxRow(
  props: Partial<CheckboxProps>,
  id: string,
  labelText: string,
  options: {
    checked?: boolean;
    indeterminate?: boolean;
    forceInspected?: boolean;
    childIndex?: number;
  } = {},
): string {
  const ariaChecked = props.ariaChecked === true;
  const inspected = options.forceInspected ?? true;
  const childIndex = options.childIndex ?? null;

  const baseAttrs: InputAttrs = {
    id,
    name: props.name ?? "",
    value: props.value ?? "",
    checked: options.checked ?? props.checked === true,
    required: props.required === true,
    disabled: props.disabled === true,
    style: inlineStyleAttribute(props),
  };
  const indeterminate = options.indeterminate ?? props.indeterminate === true;

  return associateLabel({
    association: props.labelAssociation,
    controlId: id,
    labelText,
    renderControl: (ariaLabelText) =>
      inputTag(
        ariaLabelText === undefined ? baseAttrs : { ...baseAttrs, ariaLabel: ariaLabelText },
        indeterminate,
        ariaChecked,
        inspected,
        childIndex,
      ),
  });
}

/**
 * Render the `div-checkbox` variant — a styled `<div>` with
 * `role="checkbox"` and `aria-checked`. The visible label is the
 * div's text content (the accessible name comes from there). The
 * `al-inspected-element` class lets the iframe shell post
 * `demo:click` on click so the studio's `checked` state flips.
 *
 * `aria-checked="mixed"` is emitted when `indeterminate` wins — that
 * is the ARIA-canonical way to express the partial state on a custom
 * checkbox. Unlike the native `<input type="checkbox">`, a div has no
 * separate IDL property to fall back to, so the visual + state come
 * from the same attribute.
 *
 * The `forceInspected` argument lets the parent of a parent-with-
 * children layout claim the inspected-element marker while the
 * children stay as plain rows.
 */
function renderDivCheckboxRow(
  props: Partial<CheckboxProps>,
  labelText: string,
  options: {
    checked?: boolean;
    indeterminate?: boolean;
    forceInspected?: boolean;
    childIndex?: number;
  } = {},
): string {
  const checked = options.checked ?? props.checked === true;
  const indeterminate = options.indeterminate ?? props.indeterminate === true;
  const disabled = props.disabled === true;
  const ariaChecked = props.ariaChecked !== false; // div needs aria-checked
  const safeLabel = escapeHtml(labelText);
  const inspected = options.forceInspected ?? true;
  const childIndex = options.childIndex ?? null;
  const association = props.labelAssociation ?? "for-id";

  const classes = inspected
    ? "al-div-checkbox al-inspected-element"
    : "al-div-checkbox";
  const attrs: string[] = [
    `class="${classes}"`,
    `role="checkbox"`,
    `tabindex="${disabled ? "-1" : "0"}"`,
  ];
  if (ariaChecked) {
    // Tri-state wins over the boolean — the indeterminate dash and the
    // ticked state are mutually exclusive in the ARIA model. See the
    // `checkbox-checked-and-indeterminate` rule + the "Checkbox tri-
    // state" Learn topic for the reasoning.
    const value = indeterminate ? "mixed" : String(checked);
    attrs.push(`aria-checked="${value}"`);
  }
  if (disabled) attrs.push(`aria-disabled="true"`);
  if (childIndex !== null) attrs.push(`data-al-child-index="${childIndex}"`);

  // The four label-association modes map onto `<div role="checkbox">`
  // via the equivalent ARIA naming patterns:
  //   - for-id          → external <label id="…"> + aria-labelledby
  //   - wrapping        → name from text content (text inside the div)
  //   - aria-label      → aria-label attribute, no inner text
  //   - none            → no name at all (anti-pattern)
  // The picker labels are also renamed per-variant in CheckboxControls
  // so the user sees the ARIA-appropriate names when div-checkbox is
  // active (e.g. "aria-labelledby (recommended)" instead of "label
  // for/id (recommended)").
  switch (association) {
    case "for-id": {
      // `<label for="x">` doesn't associate with a div, so the
      // external-label pattern uses `aria-labelledby` instead. Click
      // the label is decorative — only the div itself toggles state
      // (the iframe bridge fires `demo:click` on the inspected div).
      const labelId
        = childIndex !== null
          ? `al-div-checkbox-label-${childIndex}`
          : "al-div-checkbox-label";
      attrs.push(`aria-labelledby="${labelId}"`);
      return `<div ${attrs.join(" ")}></div> <label id="${labelId}">${safeLabel}</label>`;
    }

    case "aria-label":
      attrs.push(`aria-label="${escapeAttribute(labelText)}"`);
      return `<div ${attrs.join(" ")}></div>`;

    case "none":
      return `<div ${attrs.join(" ")}></div>`;

    case "wrapping":
    default:
      // Name-from-content pattern: the text sits inside the div and
      // ARIA's name-calculation algorithm picks it up via the
      // role=checkbox subtree. The current default; mirrors what the
      // old render did before this fix.
      return `<div ${attrs.join(" ")}>${safeLabel}</div>`;
  }
}

/**
 * Render a single inspected checkbox row, dispatching on variant. The
 * `options` argument lets callers override the row's state — used by
 * the parent-with-children layout, where the children must render
 * their own fixed pattern instead of inheriting `props.checked`.
 */
function renderRow(
  props: Partial<CheckboxProps>,
  id: string,
  labelText: string,
  options: {
    checked?: boolean;
    indeterminate?: boolean;
    forceInspected?: boolean;
    childIndex?: number;
  } = {},
): string {
  if (props.renderAs === "div-checkbox") {
    return renderDivCheckboxRow(props, labelText, options);
  }
  return renderNativeCheckboxRow(props, id, labelText, options);
}

/**
 * Lookup the checked state for a single child by index. Reads from
 * `props.childChecked` so the per-child state is part of the model —
 * the iframe click bridge flips entries here and the parent
 * auto-syncs to the result. Falls back to the deterministic pattern
 * (first child checked) when the array is missing or short, so the
 * default demo state still demonstrates an "indeterminate" parent.
 */
function isChildChecked(props: Partial<CheckboxProps>, index: number): boolean {
  const arr = props.childChecked;
  if (Array.isArray(arr) && index < arr.length) return arr[index] === true;
  return index === 0;
}

/**
 * Canonical production-style JS for the "select all" parent pattern,
 * shown in the code drawer's JS tab when group mode is
 * `parent-with-children`. Two variants — the native input pattern
 * uses the `indeterminate` IDL property; the div-checkbox pattern
 * uses `aria-checked="mixed"` and has to re-implement the keyboard
 * contract by hand.
 *
 * The JS is intentionally not what the studio actually runs — the
 * studio's interactivity is driven from the host via the iframe
 * message bridge. The JS pane shows what a developer would write to
 * make the rendered markup behave correctly on its own, the same
 * approach as the switches component's JS pane (NOTES.md "JS tab
 * rollout").
 */
const PARENT_CHILDREN_NATIVE_JS = `const parent = document.getElementById("select-all");
const children = document.querySelectorAll(
  '#options input[type="checkbox"]'
);

// Parent → children: cascade to all and clear the partial visual.
parent.addEventListener("change", () => {
  parent.indeterminate = false;
  for (const child of children) {
    child.checked = parent.checked;
  }
});

// Children → parent: recompute the derived state.
for (const child of children) {
  child.addEventListener("change", () => {
    const ticked = [...children].filter((c) => c.checked).length;
    if (ticked === 0) {
      parent.checked = false;
      parent.indeterminate = false;
    } else if (ticked === children.length) {
      parent.checked = true;
      parent.indeterminate = false;
    } else {
      parent.checked = false;
      parent.indeterminate = true;
    }
  });
}`;

const PARENT_CHILDREN_DIV_JS = `const parent = document.getElementById("select-all");
const children = document.querySelectorAll(
  '#options [role="checkbox"]'
);

function setState(el, value) {
  // value: "true" | "false" | "mixed"
  el.setAttribute("aria-checked", value);
}

// Parent → children: cascade. "mixed" only ever comes from children.
parent.addEventListener("click", () => {
  const next = parent.getAttribute("aria-checked") === "true"
    ? "false"
    : "true";
  setState(parent, next);
  for (const child of children) setState(child, next);
});

// Children → parent: recompute.
for (const child of children) {
  child.addEventListener("click", () => {
    const cur = child.getAttribute("aria-checked") === "true";
    setState(child, String(!cur));
    const ticked = [...children].filter(
      (c) => c.getAttribute("aria-checked") === "true",
    ).length;
    if (ticked === 0) setState(parent, "false");
    else if (ticked === children.length) setState(parent, "true");
    else setState(parent, "mixed");
  });
}

// Keyboard contract — native role="checkbox" on a <div> does not
// inherit Space activation. Wire it up by hand on the parent and
// every child.
for (const box of [parent, ...children]) {
  box.addEventListener("keydown", (event) => {
    if (event.key === " " || event.key === "Enter") {
      event.preventDefault();
      box.click();
    }
  });
}`;

/**
 * Render the inspected checkbox.
 *
 * Two render variants:
 *   - 'input-checkbox' (default): a native `<input type="checkbox">`
 *     with optional label-association strategies.
 *   - 'div-checkbox': a styled `<div role="checkbox" aria-checked>` —
 *     the custom pattern that needs `aria-checked` to expose its
 *     state. Demonstrates why ARIA matters when the native semantics
 *     are not available.
 *
 * Four group modes, independent of the render variant:
 *   - 'single' renders one labelled checkbox.
 *   - 'group-with-fieldset' wraps multiple checkboxes in <fieldset>
 *     with the `label` prop becoming the <legend> text. This is the
 *     correct pattern for related choices.
 *   - 'group-no-fieldset' renders the same set without the fieldset
 *     wrapper. Visually identical to sighted users; assistive tech
 *     loses the group relationship entirely. axe-core does NOT catch
 *     this — our `checkbox-group-no-fieldset` rule does.
 *   - 'parent-with-children' renders a "select all" parent box above
 *     a fieldset of children. The parent reflects the user-controlled
 *     `checked` and `indeterminate` props; the children follow a
 *     fixed pattern so the partial-state demo always has a reason
 *     to be mixed. See the Learn topic "Checkbox tri-state and the
 *     indeterminate trap" for the full explanation.
 */
export function renderCheckbox(
  props?: Partial<CheckboxProps>,
): RenderedFragment {
  if (!props) return { html: "<input type=\"checkbox\" />" };

  const groupMode = props.groupMode ?? "single";
  const isDiv = props.renderAs === "div-checkbox";

  let html: string;

  if (groupMode === "single") {
    html = renderRow(props, "al-checkbox", props.label ?? "");
  } else if (groupMode === "parent-with-children") {
    const items = props.groupItems?.length ? props.groupItems : [];
    // Children are independent options under the parent — they get
    // their own DOM ids and don't inherit the parent's `required`
    // or `disabled` flags. Those are parent-level concerns: applying
    // them to every child would misrepresent the validation rule
    // ("require every option" instead of "require at least the
    // parent") or wholesale-disable the choice. `ariaChecked` is
    // kept as-is — for the div-checkbox variant it is the only way
    // each child's state reaches assistive technology, and for the
    // native variant the redundancy rule already evaluates against
    // the parent's prop (it does not double-count for children).
    const childProps: Partial<CheckboxProps> = {
      ...props,
      required: false,
      disabled: false,
      // Children render via for/id pairs so each row stays
      // self-labelling regardless of what the parent uses.
      labelAssociation: "for-id",
    };
    const childRows = items
      .map(
        (itemLabel, index) =>
          `<div>${renderRow(
            childProps,
            `al-checkbox-child-${index}`,
            itemLabel,
            {
              checked: isChildChecked(props, index),
              indeterminate: false,
              forceInspected: false,
              childIndex: index,
            },
          )}</div>`,
      )
      .join("");

    const parent = renderRow(props, "al-checkbox", props.label ?? "");
    // Fixed group title. The children's <legend> is incidental scaffolding,
    // not form data — so it stays out of the way. (It used to borrow the
    // `value` attribute, which confusingly renamed the group whenever the
    // user edited the submitted value.)
    const childrenLegend = "Options";

    html
      = `<div class="al-parent-children">`
        + parent
        + `<fieldset><legend>${childrenLegend}</legend>${childRows}</fieldset>`
        + `</div>`;
  } else {
    const items = props.groupItems?.length ? props.groupItems : [];
    const rows = items
      .map(
        (itemLabel, index) =>
          `<div>${renderRow(props, `al-checkbox-${index}`, itemLabel, {
            checked: isChildChecked(props, index),
            childIndex: index,
          })}</div>`,
      )
      .join("");

    if (groupMode === "group-with-fieldset") {
      const legend = escapeHtml(props.label ?? "");
      html = `<fieldset><legend>${legend}</legend>${rows}</fieldset>`;
    } else {
      // group-no-fieldset: no surrounding fieldset/legend.
      // The visible "group title" still renders as a paragraph above
      // the checkboxes so sighted users see the same UI as the
      // correct pattern — that's the whole point of the anti-pattern
      // demo.
      const heading = escapeHtml(props.label ?? "");
      html = `<p style="font-weight: 600; margin: 0 0 0.4em;">${heading}</p>${rows}`;
    }
  }

  // Production-style JS only makes sense for the parent-with-children
  // pattern — every other group mode is either a standalone checkbox
  // (no extra JS needed beyond what the browser does for free) or a
  // sibling group (no parent state to derive). When set, the code
  // drawer auto-shows the JS pane.
  const js
    = groupMode === "parent-with-children"
      ? isDiv
        ? PARENT_CHILDREN_DIV_JS
        : PARENT_CHILDREN_NATIVE_JS
      : undefined;

  if (isDiv) {
    return js
      ? { html, css: DIV_CHECKBOX_CSS, js }
      : { html, css: DIV_CHECKBOX_CSS };
  }
  return js ? { html, js } : { html };
}
