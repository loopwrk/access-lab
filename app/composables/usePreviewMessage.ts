import type { HostBoundMessage, HostBoundMessageOf } from "~/types/preview-messages";

/**
 * Iframe-message bridge for the preview shell.
 *
 * The preview iframe (`/preview-shell.html`) posts messages back to the host:
 * `demo:click`, `form:submitted`, `select:change`, etc. Almost every caller does
 * the same thing — attach a `message` listener, filter on `event.data?.type`,
 * dispatch. This composable wraps that with VueUse's `useEventListener` so the
 * cleanup is automatic and the dispatch table stays declarative.
 *
 * Pass a handler map keyed by message type (a `PREVIEW_MESSAGE` value or the
 * literal wire string — both are checked against the contract in
 * `~/types/preview-messages`, so a key typo is a compile error). Each handler
 * receives its own precisely-typed message payload.
 *
 * For consumers that need iframe-source filtering (e.g. `useAxeAudit`, which
 * guards against unrelated postMessage senders), use `useEventListener(window,
 * "message", ...)` directly with the source check — this composable trusts any
 * sender, which is correct for the studio's single-iframe setup but wrong for a
 * multi-iframe page.
 */
export type PreviewMessageHandlers = {
  [Type in HostBoundMessage["type"]]?: (message: HostBoundMessageOf<Type>) => void;
};

export function usePreviewMessage(handlers: PreviewMessageHandlers) {
  useEventListener(window, "message", (event: MessageEvent) => {
    const type = (event.data as { type?: unknown } | undefined)?.type;
    if (typeof type !== "string") return;
    // Dynamic dispatch: TS can't correlate the runtime string key with the
    // matching handler variant, so this is the one sanctioned cast — at the
    // message-decoder boundary (see AGENTS "no any outside iframe decoders").
    const lookup = handlers as Record<string, ((message: HostBoundMessage) => void) | undefined>;
    const handler = lookup[type];
    if (handler) handler(event.data as HostBoundMessage);
  });
}
