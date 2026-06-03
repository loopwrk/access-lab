/**
 * Iframe-message bridge for the preview shell.
 *
 * The preview iframe (`/preview-shell.html`) posts typed messages back to
 * the host: `demo:click`, `form:submitted`, `axe:result`, etc. Almost every
 * caller does the same thing — attach a `message` listener, filter on
 * `event.data?.type`, dispatch. This composable wraps that with VueUse's
 * `useEventListener` so the cleanup is automatic and the dispatch table
 * stays declarative.
 *
 * Pass a handler map keyed by message type. Each handler receives the
 * full `event.data` payload (typed as `any` because the preview-shell
 * message contract is not centralised; callers cast as needed).
 *
 * For consumers that need iframe-source filtering (e.g. `useAxeAudit`,
 * which guards against unrelated postMessage senders), use
 * `useEventListener(window, 'message', ...)` directly with the source
 * check — this composable trusts any sender, which is correct for the
 * studio's single-iframe setup but wrong for a multi-iframe page.
 */
export type PreviewMessageHandlers = Record<string, (data: any) => void>

export function usePreviewMessage(handlers: PreviewMessageHandlers) {
  useEventListener(window, 'message', (event: MessageEvent) => {
    const type = event.data?.type
    if (typeof type !== 'string') return
    const handler = handlers[type]
    if (handler) handler(event.data)
  })
}
