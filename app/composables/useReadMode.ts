const LEARN_ROUTE_PREFIX = "/learn/";

export function useReadMode() {
  const route = useRoute();
  const router = useRouter();
  const returnPath = useState<string | null>("studio-return-path", () => null);

  const isOpen = computed(() => route.path.startsWith(LEARN_ROUTE_PREFIX));

  const activeTopicId = computed<string | null>(() => {
    if (!isOpen.value) return null;
    const raw = route.params.topicId;
    const value = Array.isArray(raw) ? raw[0] : raw;
    return typeof value === "string" && value.length > 0 ? value : null;
  });

  function open(topicId: string) {
    if (!isOpen.value) {
      returnPath.value = route.fullPath;
    }
    router.push(`${LEARN_ROUTE_PREFIX}${topicId}`);
  }

  function switchTopic(topicId: string) {
    router.replace(`${LEARN_ROUTE_PREFIX}${topicId}`);
  }

  function close() {
    const target = returnPath.value ?? "/";
    returnPath.value = null;
    router.push(target);
  }

  return { activeTopicId, isOpen, open, close, switchTopic };
}

/**
 * Open a Learn topic in the reader - the single entry point the studio uses
 * (control labels, issues panel, toolbar, toasts). Resolves useReadMode
 * lazily at call time, so a component with a learn link never touches the
 * router during setup.
 */
export function openLearnTopic(topicId: string) {
  useReadMode().open(topicId);
}
