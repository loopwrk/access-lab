import type { RadioProps } from "./definition";
import type { RenderedFragment } from "~/types/component";
import { associateLabel } from "~/utils/associateLabel";
import { escapeAttribute, escapeHtml } from "~/utils/escapeHtml";
import { inlineStyleAttribute } from "~/utils/inlineStyleAttribute";
import { valueFromLabel } from "~/utils/valueFromLabel";

interface InputAttrs {
  id: string;
  name: string;
  value: string;
  checked: boolean;
  required: boolean;
  disabled: boolean;
  ariaLabel?: string;
  childIndex: number;
  style: string;
}

function inputTag(attrs: InputAttrs): string {
  const parts: string[] = [
    "type=\"radio\"",
    `id="${attrs.id}"`,
    `name="${escapeAttribute(attrs.name)}"`,
    `value="${escapeAttribute(attrs.value)}"`,
    // `data-al-child-index` routes the change event through the
    // iframe's `demo:click-child` bridge so the host knows which
    // option the user picked and can update `selectedItem` to match.
    `data-al-child-index="${attrs.childIndex}"`,
  ];
  if (attrs.checked) parts.push("checked");
  if (attrs.required) parts.push("required");
  if (attrs.disabled) parts.push("disabled");
  if (attrs.ariaLabel)
    parts.push(`aria-label="${escapeAttribute(attrs.ariaLabel)}"`);
  return `<input ${parts.join(" ")}${attrs.style} />`;
}

function renderSingleRadio(
  props: Partial<RadioProps>,
  id: string,
  labelText: string,
  isSelected: boolean,
  childIndex: number,
): string {
  const baseAttrs: InputAttrs = {
    id,
    name: props.name ?? "",
    value: valueFromLabel(labelText),
    checked: isSelected,
    required: props.required === true,
    disabled: props.disabled === true,
    childIndex,
    style: inlineStyleAttribute(props),
  };

  return associateLabel({
    association: props.labelAssociation,
    controlId: id,
    labelText,
    renderControl: (ariaLabelText) =>
      inputTag(
        ariaLabelText === undefined ? baseAttrs : { ...baseAttrs, ariaLabel: ariaLabelText },
      ),
  });
}

export function renderRadio(props?: Partial<RadioProps>): RenderedFragment {
  if (!props) return { html: "<input type=\"radio\" />" };

  const groupMode = props.groupMode ?? "group-with-fieldset";
  const items = props.groupItems?.length ? props.groupItems : [];
  const selected = props.selectedItem ?? "";

  const rows = items
    .map((itemLabel, index) => {
      // `required` on a radio is group-level; emitting it on every
      // input is redundant. First one carries the attribute.
      const itemProps: Partial<RadioProps> = {
        ...props,
        required: props.required === true && index === 0,
      };
      return `<div>${renderSingleRadio(
        itemProps,
        `al-radio-${index}`,
        itemLabel,
        itemLabel === selected,
        index,
      )}</div>`;
    })
    .join("");

  if (groupMode === "group-with-fieldset") {
    const legend = escapeHtml(props.label ?? "");
    return { html: `<fieldset><legend>${legend}</legend>${rows}</fieldset>` };
  }

  const heading = escapeHtml(props.label ?? "");
  return { html: `<p style="font-weight: 600; margin: 0 0 0.4em;">${heading}</p>${rows}` };
}
