export function useStudioToolbar() {
  const activeComponentName = useState<string | null>(
    "al-studio-toolbar-name",
    () => null,
  );

  const activeLearnTopicId = useState<string | null>(
    "al-studio-toolbar-learn-topic",
    () => null,
  );

  return { activeComponentName, activeLearnTopicId };
}
