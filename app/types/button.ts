import type { CssLength } from "~/composables/useUnitConversion";

export interface ButtonContentProps {
  renderAs?: string;
  label?: string;
  value?: string;
  name?: string;
  src?: string;
  alt?: string;
  /** Whether the visible content is the label text or an icon glyph. */
  contentType?: "text" | "icon";
}

export interface ButtonStyleProps {
  width?: CssLength;
  height?: CssLength;
  padding?: CssLength;
  paddingTop?: CssLength;
  paddingRight?: CssLength;
  paddingBottom?: CssLength;
  paddingLeft?: CssLength;
  borderWidth?: CssLength;
  borderTopWidth?: CssLength;
  borderRightWidth?: CssLength;
  borderBottomWidth?: CssLength;
  borderLeftWidth?: CssLength;
  fontSize?: CssLength;
  bg?: string;
  fgText?: string;
  borderColor?: string;
}

export interface ButtonAriaProps {
  ariaLabel?: string;
}

export interface ButtonStateProps {
  disabled?: boolean;
}

export interface ButtonFocusProps {
  focusRingEnabled?: boolean;
  focusRingWidth?: CssLength;
  focusRingColor?: string;
  focusRingOffset?: CssLength;
}

export interface BaseButtonProps
  extends ButtonContentProps,
  ButtonStyleProps,
  ButtonAriaProps,
  ButtonStateProps,
  ButtonFocusProps {}
