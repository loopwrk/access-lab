import type { AxeResult } from "~/types/axe";
import type { DomMeasurement } from "~/rules/types";

/**
 * The message contract for the preview-iframe boundary.
 *
 * Two documents talk across this boundary with `window.postMessage`:
 *   - the host app (TypeScript) - `PreviewIframe`, `useAxeAudit`,
 *     `usePreviewMessage`, the per-component controls;
 *   - the iframe shell (`public/preview-shell.html`) - plain, build-free
 *     HTML + vanilla JS.
 *
 * The shell cannot import this module (it is served statically, with no build
 * step), so it hardcodes the wire strings. **This file is the canonical source
 * of truth for the host side**, and the drift-guard test
 * (`test/unit/preview-message-contract.test.ts`) reads the shell as text and
 * asserts its strings and these constants agree - so a message renamed in one
 * place fails the test until the other is updated.
 *
 * Why a `const` map of strings rather than a bare string-literal union: the host
 * can reference `PREVIEW_MESSAGE.AXE_RESULT` instead of `"axe:result"`, so a
 * typo is a compile error, not a handler that silently never fires.
 */
export const PREVIEW_MESSAGE = {
  // ── Host → iframe ──────────────────────────────────────────────
  /** Render an HTML (+ optional CSS, root font-size) fragment in the shell. */
  RENDER_IN_PREVIEW: "preview:render",

  // ── iframe → host: lifecycle ───────────────────────────────────
  /** The shell has loaded and is ready to receive renders. */
  SHELL_READY: "preview:ready",
  /** A pointerdown happened inside the iframe (drives outside-click dismissal). */
  POINTER_DOWN: "preview:pointerdown",

  // ── iframe → host: audit + measurement ─────────────────────────
  /** axe-core finished: violations / passes / incomplete. */
  AXE_RESULT: "axe:result",
  /** axe-core threw while running. */
  AXE_ERROR: "axe:error",
  /** Post-layout box measurements for the DOM-measurement rules. */
  DOM_MEASUREMENT: "dom:measurement",

  // ── iframe → host: interaction ─────────────────────────────────
  /** A trigger-shaped element was clicked (generic, un-migrated components). */
  DEMO_CLICK: "demo:click",
  /** A trigger inside a `data-al-interaction` region was activated (host assigns meaning). */
  DEMO_ACTIVATE: "demo:activate",
  /** An option marked `data-al-pick` was committed (host assigns meaning). */
  DEMO_PICK: "demo:pick",
  /** A child control (checkbox/radio in a group) changed, identified by index. */
  DEMO_CLICK_CHILD: "demo:click-child",
  /** A native `<select>` changed. */
  SELECT_CHANGE: "select:change",

  // ── iframe → host: forms ───────────────────────────────────────
  /** A form was submitted (cancelled), with its FormData payload. */
  FORM_SUBMITTED: "form:submitted",
  /** A form was reset. */
  FORM_RESET: "form:reset",
  /** A submit-typed trigger fired with no surrounding form. */
  FORM_SUBMIT_MISSING_FORM: "form:submitMissingForm",
  /** A reset-typed trigger fired with no surrounding form. */
  FORM_RESET_MISSING_FORM: "form:resetMissingForm",
} as const;

/** Every wire string in the contract (e.g. `"axe:result"`). */
export type PreviewMessageType = (typeof PREVIEW_MESSAGE)[keyof typeof PREVIEW_MESSAGE];

// ────────────────────────────────────────────────────────────────
// Host → iframe
// ────────────────────────────────────────────────────────────────

export interface RenderMessage {
  type: typeof PREVIEW_MESSAGE.RENDER_IN_PREVIEW;
  html: string;
  css: string;
  /** CSS px for the iframe root, so rem-based styles resolve against the studio's base. */
  rootFontSize?: number;
}

/** Discriminated union of everything the host posts into the iframe. */
export type IframeBoundMessage = RenderMessage;

// ────────────────────────────────────────────────────────────────
// iframe → host
// ────────────────────────────────────────────────────────────────

export interface ReadyMessage {
  type: typeof PREVIEW_MESSAGE.SHELL_READY;
}

export interface PointerDownMessage {
  type: typeof PREVIEW_MESSAGE.POINTER_DOWN;
}

export interface AxeResultMessage {
  type: typeof PREVIEW_MESSAGE.AXE_RESULT;
  violations: AxeResult[];
  passes: AxeResult[];
  incomplete: AxeResult[];
}

export interface AxeErrorMessage {
  type: typeof PREVIEW_MESSAGE.AXE_ERROR;
  message: string;
}

export interface DomMeasurementMessage {
  type: typeof PREVIEW_MESSAGE.DOM_MEASUREMENT;
  measurement: DomMeasurement;
}

export interface DemoClickMessage {
  type: typeof PREVIEW_MESSAGE.DEMO_CLICK;
}

export interface DemoActivateMessage {
  type: typeof PREVIEW_MESSAGE.DEMO_ACTIVATE;
  /** The `data-al-interaction` attribute value; `null` when the marker has no value. */
  interaction: string | null;
}

export interface DemoPickMessage {
  type: typeof PREVIEW_MESSAGE.DEMO_PICK;
  /** The committed `data-al-pick` value; for the select, the chosen option's label. */
  value: string;
}

export interface DemoClickChildMessage {
  type: typeof PREVIEW_MESSAGE.DEMO_CLICK_CHILD;
  index: number;
}

export interface SelectChangeMessage {
  type: typeof PREVIEW_MESSAGE.SELECT_CHANGE;
  value: string;
  label: string;
  values: string[];
  labels: string[];
}

export interface FormSubmittedMessage {
  type: typeof PREVIEW_MESSAGE.FORM_SUBMITTED;
  entries: { name: string; value: string }[];
  /** A `<button>` with no `type` triggered it - the implicit-submit pitfall. */
  wasImplicitSubmit: boolean;
  /** An `<input type="image">` triggered it. */
  wasImageSubmit: boolean;
}

export interface FormResetMessage {
  type: typeof PREVIEW_MESSAGE.FORM_RESET;
}

export interface FormSubmitMissingFormMessage {
  type: typeof PREVIEW_MESSAGE.FORM_SUBMIT_MISSING_FORM;
}

export interface FormResetMissingFormMessage {
  type: typeof PREVIEW_MESSAGE.FORM_RESET_MISSING_FORM;
}

/** Discriminated union of everything the iframe posts back to the host. */
export type HostBoundMessage =
  | ReadyMessage
  | PointerDownMessage
  | AxeResultMessage
  | AxeErrorMessage
  | DomMeasurementMessage
  | DemoClickMessage
  | DemoActivateMessage
  | DemoPickMessage
  | DemoClickChildMessage
  | SelectChangeMessage
  | FormSubmittedMessage
  | FormResetMessage
  | FormSubmitMissingFormMessage
  | FormResetMissingFormMessage;

/** Either direction. */
export type PreviewMessage = HostBoundMessage | IframeBoundMessage;

/**
 * Narrow `HostBoundMessage` to the single variant for a given type, so a
 * handler map can type each callback's payload precisely:
 *
 *   const handlers: { [T in HostBoundMessage["type"]]?: (m: HostBoundMessageOf<T>) => void }
 */
export type HostBoundMessageOf<T extends HostBoundMessage["type"]> = Extract<
  HostBoundMessage,
  { type: T }
>;

/**
 * Compile-time completeness guard. Every wire string in PREVIEW_MESSAGE must be
 * the discriminant of exactly one message interface, and every interface must
 * map back to a real constant. Rename a constant without updating its interface
 * (or point an interface at the wrong one) and one of these stops compiling,
 * naming the offending message. This catches the failure the runtime drift-guard
 * test cannot - that test only compares wire strings, so two interfaces sharing a
 * (valid) constant, or a constant no interface uses, slip past it.
 */
type ExpectNever<T extends never> = T;
type AllMessageTypes = (HostBoundMessage | IframeBoundMessage)["type"];
/** A PREVIEW_MESSAGE value that no message interface represents. */
type _NoUnusedConstant = ExpectNever<Exclude<PreviewMessageType, AllMessageTypes>>;
/** A message interface whose `type` is not in PREVIEW_MESSAGE. */
type _NoOrphanInterface = ExpectNever<Exclude<AllMessageTypes, PreviewMessageType>>;
