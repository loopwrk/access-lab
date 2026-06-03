export function useStudioToolbar() {
  const activeComponentName = useState<string | null>(
    "al-studio-toolbar-name",
    () => null,
  );

  const activeLearnTopicId = useState<string | null>(
    "al-studio-toolbar-learn-topic",
    () => null,
  );

  /**
   * Concept tags declared by the active component's definition, used
   * by `LearnPanel` to pin matching articles at the top of the
   * picker. Set by `ComponentStudio` on mount, cleared on unmount.
   * The panel does the topic-side intersection itself — the toolbar
   * just propagates the component-side signal so panels (or any
   * future surface that wants pinned topics) don't need a reference
   * to the active definition.
   */
  const activeRelevantConcepts = useState<LearnConceptId[]>(
    "al-studio-toolbar-relevant-concepts",
    () => [],
  );

  return { activeComponentName, activeLearnTopicId, activeRelevantConcepts };
}
