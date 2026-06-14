//  Colours only ever come from the constrained colour pickers (hex/rgb(). Needs updating to handle escape chars if free-text colour entry is ever added.

import type { CssLength } from "~/composables/useUnitConversion";
import { formatCssLength } from "~/utils/formatCssLength";

/**
 * The style props every form-input renderer exposes to the studio's
 * font-size and colour controls. Each component's props interface
 * includes these fields, so any `Partial<XProps>` satisfies it.
 */
export interface FormControlStyleProps {
  fontSize?: CssLength;
  bg?: string;
  fgText?: string;
  borderColor?: string;
}

/**
 * Build the inline `style` attribute (with a leading space) so it can
 * be concatenated straight into a rendered control's open tag. Returns
 * an empty string when no style props are set, keeping the markup in
 * the code drawer clean.
 */
export function inlineStyleAttribute(props: FormControlStyleProps): string {
  const declarations: string[] = [];
  if (props.fontSize) declarations.push(`font-size:${formatCssLength(props.fontSize)}`);
  if (props.bg) declarations.push(`background:${props.bg}`);
  if (props.fgText) declarations.push(`color:${props.fgText}`);
  if (props.borderColor) declarations.push(`border-color:${props.borderColor}`);
  return declarations.length ? ` style="${declarations.join(";")}"` : "";
}
