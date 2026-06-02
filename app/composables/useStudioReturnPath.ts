/**
 * Tiny in-memory stash for "where in the studio was the user before
 * they opened a learn topic".
 *
 * Set by `useReadMode().open()` right before it navigates to `/learn/*`,
 * read by `close()` when the user backs out. Lives in `useState` so
 * it survives across components within a session but resets on hard
 * refresh — which is the correct behaviour: a fresh page load means
 * we genuinely don't know where the visitor came from, so `close()`
 * falls back to `/`.
 *
 * Deliberately not persisted to localStorage. Stale paths from an old
 * session leading somewhere unexpected would be more confusing than a
 * predictable `/` fallback.
 */
export function useStudioReturnPath() {
  return useState<string | null>('studio-return-path', () => null)
}
