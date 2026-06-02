/**
 * Read-mode state, expressed as the `/learn/<topicId>` route.
 *
 * Promoted from a query-param overlay to a real route so that:
 *   - shared links describe the article, not the studio page that
 *     happened to be open when the user hit "Read mode",
 *   - refresh keeps you on the same article,
 *   - browser back collapses the reader naturally,
 *   - the URL becomes a first-class identifier for the topic.
 *
 * The public surface (`isOpen`, `activeTopicId`, `open`, `close`,
 * `switchTopic`) is what callers use; the routing details stay in
 * this file so components don't need to know about them.
 */
const LEARN_ROUTE_PREFIX = '/learn/'

export function useReadMode() {
  const route = useRoute()
  const router = useRouter()
  const returnPath = useStudioReturnPath()

  const isOpen = computed(() => route.path.startsWith(LEARN_ROUTE_PREFIX))

  const activeTopicId = computed<string | null>(() => {
    if (!isOpen.value) return null
    const raw = route.params.topicId
    const value = Array.isArray(raw) ? raw[0] : raw
    return typeof value === 'string' && value.length > 0 ? value : null
  })

  /**
   * Entry point from the studio: stash where we are now so `close()`
   * can put us back, then navigate. We push (not replace) so the
   * browser back button cleanly returns to the studio.
   *
   * Guarded against re-stashing if called while already in /learn —
   * use `switchTopic` for that, which doesn't touch the stash.
   */
  function open(topicId: string) {
    if (!isOpen.value) {
      returnPath.value = route.fullPath
    }
    router.push(`${LEARN_ROUTE_PREFIX}${topicId}`)
  }

  /**
   * Used by the in-reader tree to swap topics without bloating
   * history (otherwise back-button users would have to step through
   * every topic they browsed). Stash is left alone — the return
   * target is wherever they came from originally.
   */
  function switchTopic(topicId: string) {
    router.replace(`${LEARN_ROUTE_PREFIX}${topicId}`)
  }

  /**
   * Pop the stash and navigate back. If we have no stash (deep-link
   * entry, hard refresh) we send the user to `/` — the studio's own
   * redirect chain picks a sensible default component from there.
   */
  function close() {
    const target = returnPath.value ?? '/'
    returnPath.value = null
    router.push(target)
  }

  return { activeTopicId, isOpen, open, close, switchTopic }
}
