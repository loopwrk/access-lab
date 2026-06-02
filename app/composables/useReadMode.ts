export function useReadMode() {
  const activeTopicId = useState<string | null>("read-mode-topic", () => null);

  function open(topicId: string) {
    activeTopicId.value = topicId;
  }

  function close() {
    activeTopicId.value = null;
  }

  const isOpen = computed(() => activeTopicId.value !== null);

  return { activeTopicId, isOpen, open, close };
}
