import { escapeHtml } from "~/utils/escapeHtml";

/** The four ways a form control can get (or deliberately lack) an accessible name. */
export type LabelAssociation = "for-id" | "wrapping" | "aria-label" | "none";

interface AssociateLabelOptions {
  /** Falls back to "for-id", matching every renderer's default. */
  association: LabelAssociation | undefined;
  /** The control's DOM id, referenced by `<label for>` in for-id mode. */
  controlId: string;
  /** Raw (unescaped) visible label text. */
  labelText: string;
  /**
   * Renders the control element. Receives the raw aria-label text when
   * the aria-label mode is active so the renderer can embed it; in
   * every other mode it is called with no argument.
   */
  renderControl: (ariaLabelText?: string) => string;
  /**
   * Inline style attribute for the `<label>` (with leading space). Applied to
   * the `<label>` in both label-bearing modes (for-id and wrapping) and in
   * both positions (before / after).
   */
  labelStyle?: string;
  /**
   * Where the visible label text sits relative to the control.
   * Checkbox and radio put it after; text inputs put it before.
   */
  labelPosition?: "before" | "after";
}

/**
 * Apply one of the four label-association strategies to a rendered
 * form control. This is the shared switch behind the input, checkbox,
 * and radio renderers — the markup shapes (and their failure modes,
 * like "none" producing a control with no accessible name) are the
 * lesson the studio teaches, so they must stay identical across
 * components.
 */
export function associateLabel(options: AssociateLabelOptions): string {
  const association = options.association ?? "for-id";
  const safeLabel = escapeHtml(options.labelText);
  const labelStyle = options.labelStyle ?? "";
  const labelFirst = options.labelPosition === "before";

  switch (association) {
    case "wrapping":
      return labelFirst
        ? `<label${labelStyle}>${safeLabel} ${options.renderControl()}</label>`
        : `<label${labelStyle}>${options.renderControl()} ${safeLabel}</label>`;

    case "aria-label":
      return options.renderControl(options.labelText);

    case "none":
      return options.renderControl();

    case "for-id":
    default:
      return labelFirst
        ? `<label for="${options.controlId}"${labelStyle}>${safeLabel}</label>${options.renderControl()}`
        : `${options.renderControl()} <label for="${options.controlId}"${labelStyle}>${safeLabel}</label>`;
  }
}
