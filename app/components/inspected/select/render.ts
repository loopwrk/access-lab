import type { SelectProps } from "./definition";
import type { RenderedFragment } from "~/types/component";
import { escapeHtml } from "~/utils/escapeHtml";
import { formatCssLength } from "~/utils/formatCssLength";
import { valueFromLabel } from "~/utils/valueFromLabel";

function styleAttr(props: Partial<SelectProps>): string {
  const decls: string[] = [];
  if (props.fontSize)
    decls.push(`font-size:${formatCssLength(props.fontSize)}`);
  if (props.bg) decls.push(`background:${props.bg}`);
  if (props.fgText) decls.push(`color:${props.fgText}`);
  if (props.borderColor) decls.push(`border-color:${props.borderColor}`);
  return decls.length ? ` style="${decls.join(";")}"` : "";
}

const PLACEHOLDER_LABEL = "--Please choose an option--";

function placeholderOptionHtml(selected: string): string {
  const isSelected = selected === "";
  return `<option value="" disabled${isSelected ? " selected" : ""}>${escapeHtml(PLACEHOLDER_LABEL)}</option>`;
}

function renderOptions(options: string[], selected: string): string {
  return options
    .map((label) => {
      const value = valueFromLabel(label);
      const isSelected = label === selected;
      return `<option value="${escapeHtml(value)}"${
        isSelected ? " selected" : ""
      }>${escapeHtml(label)}</option>`;
    })
    .join("");
}

function renderSelectAttrs(
  props: Partial<SelectProps>,
  extraAttrs: string[] = [],
): string {
  // `al-inspected-element` marks the rendered <select> so the iframe
  // change bridge forwards picks back to the host model. Without it,
  // selecting an option inside the preview had no effect — the next
  // re-render overwrote the user's choice.
  const attrs: string[] = ["class=\"al-inspected-element\"", ...extraAttrs];
  if (props.name) attrs.push(`name="${escapeHtml(props.name)}"`);
  if (props.labelAssociation === "for-id") attrs.push("id=\"al-select\"");
  if (props.required) attrs.push("required");
  if (props.disabled) attrs.push("disabled");
  if (props.labelAssociation === "aria-label" && props.label) {
    attrs.push(`aria-label="${escapeHtml(props.label)}"`);
  }
  return attrs.join(" ");
}

// Inline-style fragment that stacks the label above the control.
// Applied to the label (for-id) or its inner text span (wrapping)
// so the visible label sits on its own line, with the select
// dropping onto the next. The preview shell's flex `#mount` then
// receives a single wrapping <div> so the children stack as normal
// block layout rather than becoming side-by-side flex items.
const LABEL_BLOCK_STYLE = "display:block;margin-bottom:4px";

function wrapWithLabel(
  props: Partial<SelectProps>,
  selectMarkup: string,
): string {
  const association = props.labelAssociation ?? "for-id";
  const safeLabel = escapeHtml(props.label ?? "");

  switch (association) {
    case "wrapping":
      // Inner span turns the label text into its own block so the
      // wrapping <label> still owns the input semantically while the
      // visual stacks label-on-top.
      return `<label><span style="${LABEL_BLOCK_STYLE}">${safeLabel}</span>${selectMarkup}</label>`;
    case "for-id":
      return `<label for="al-select" style="${LABEL_BLOCK_STYLE}">${safeLabel}</label>${selectMarkup}`;
    case "aria-label":
    case "none":
    default:
      return selectMarkup;
  }
}

function renderNativeSelect(
  props: Partial<SelectProps>,
  extraAttrs: string[] = [],
  options: { allowPlaceholder?: boolean } = {},
): string {
  const style = styleAttr(props);
  const items = props.options?.length ? props.options : [];
  const selected = props.selectedOption ?? "";
  const attrs = renderSelectAttrs(props, extraAttrs);
  const placeholderHtml
    = options.allowPlaceholder && props.hasPlaceholder
      ? placeholderOptionHtml(selected)
      : "";
  const optionsHtml = renderOptions(items, selected);
  return wrapWithLabel(
    props,
    `<select ${attrs}${style}>${placeholderHtml}${optionsHtml}</select>`,
  );
}

const DIV_COMBOBOX_CSS
  = `.al-div-combobox-trigger{display:inline-flex;align-items:center;justify-content:space-between;gap:0.4em;min-width:8em;padding:0.25em 0.5em;border:1px solid #888;background:#fff;cursor:pointer;font-family:Arial,Helvetica,sans-serif;user-select:none;}`
    + `.al-div-combobox-trigger:focus-visible{outline:2px solid #1d4ed8;outline-offset:2px;}`
    + `.al-div-combobox-popup{margin-top:2px;border:1px solid #888;background:#fff;padding:0.25em 0;display:inline-flex;flex-direction:column;min-width:8em;box-shadow:0 4px 12px rgb(0 0 0 / 0.12);font-family:Arial,Helvetica,sans-serif;}`
    + `.al-div-combobox-popup[hidden]{display:none;}`
    + `.al-div-combobox-popup [data-option]{padding:0.3em 0.6em;cursor:pointer;}`
    + `.al-div-combobox-popup [data-option]:hover{background:#eef;}`;

const COMBOBOX_POPUP_ID = "al-combobox-popup";

function renderDivCombobox(props: Partial<SelectProps>): string {
  const style = styleAttr(props);
  const safeLabel = escapeHtml(props.label ?? "");
  const selected = props.selectedOption ?? "";
  const display = selected ? escapeHtml(selected) : "Choose an option";
  const options = props.options?.length ? props.options : [];
  const wantsAriaControls = props.comboboxAriaControls === true;
  const wantsListboxRole = props.comboboxListboxRole === true;

  const triggerAttrs = [
    `class="al-div-combobox-trigger al-inspected-element"`,
    `role="combobox"`,
    `aria-expanded="false"`,
    `tabindex="0"`,
  ];
  if (wantsAriaControls) {
    triggerAttrs.push(`aria-controls="${COMBOBOX_POPUP_ID}"`);
  }
  if (props.labelAssociation === "aria-label" && props.label) {
    triggerAttrs.push(`aria-label="${escapeHtml(props.label)}"`);
  }
  const trigger
    = `<div ${triggerAttrs.join(" ")}${style}>`
      + `<span>${display}</span>`
      + `<span aria-hidden="true">▾</span>`
      + `</div>`;

  // role="listbox" + role="option" travel together — a listbox whose
  // children are not options is semantically empty to assistive
  // technology (axe flags it via `aria-required-children`). When the
  // user opts into the listbox role, the children get role="option"
  // automatically so the pattern is correct end-to-end.
  const optionRoleAttr = wantsListboxRole ? ` role="option"` : "";
  const optionRows = options
    .map((label) => {
      const value = valueFromLabel(label);
      return `<div data-option="${escapeHtml(value)}"${optionRoleAttr}>${escapeHtml(label)}</div>`;
    })
    .join("");
  // Popup sits as the trigger's NEXT sibling so the iframe click
  // bridge can find it via `trigger.nextElementSibling`. Initially
  // hidden — the click/keyboard handler toggles `[hidden]`. An `id`
  // is always emitted so toggling `aria-controls` on the trigger
  // doesn't require re-rendering the popup itself.
  const popupAttrs = [
    `class="al-div-combobox-popup"`,
    `id="${COMBOBOX_POPUP_ID}"`,
  ];
  if (wantsListboxRole) popupAttrs.push(`role="listbox"`);
  popupAttrs.push("hidden");
  const popup = `<div ${popupAttrs.join(" ")}>${optionRows}</div>`;
  const triggerWithPopup = `${trigger}${popup}`;

  if (props.labelAssociation === "wrapping") {
    return `<label><span style="${LABEL_BLOCK_STYLE}">${safeLabel}</span>${triggerWithPopup}</label>`;
  }
  if (props.labelAssociation === "for-id") {
    return `<label style="${LABEL_BLOCK_STYLE}">${safeLabel}</label>${triggerWithPopup}`;
  }
  return triggerWithPopup;
}

export function renderSelect(props?: Partial<SelectProps>): RenderedFragment {
  if (!props) return { html: "<select></select>" };

  let body: string;
  let css: string | undefined;
  switch (props.renderAs) {
    case "select-multiple":
      // No placeholder option — every entry of a multi-select is
      // visible at once, so a "please choose" row would just be
      // dead-weight markup.
      body = renderNativeSelect(props, ["multiple"]);
      break;
    case "div-combobox":
      body = renderDivCombobox(props);
      css = DIV_COMBOBOX_CSS;
      break;
    case "select-native":
    default:
      body = renderNativeSelect(props, [], { allowPlaceholder: true });
      break;
  }

  // Single root element so the preview shell's flex `#mount` doesn't
  // turn a sibling pair (label + select) into side-by-side flex
  // items. The wrapping <div> is layout-only; semantics still live
  // on the inner <label>/<select> pair.
  const html = `<div>${body}</div>`;
  return css ? { html, css } : { html };
}
