import type { CssLength } from "~/composables/useUnitConversion";

export interface ButtonContentProps {
  renderAs?: string;
  label?: string;
  value?: string;
  name?: string;
  src?: string;
  alt?: string;
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
  disabled?: boolean;
  contentType?: "text" | "icon";
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
  ButtonFocusProps {}
