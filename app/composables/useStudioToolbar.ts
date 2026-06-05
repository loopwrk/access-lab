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
   * Concept tags declared by the active component's definition. Kept
   * for documentation / potential future search use but no longer
   * drives the LearnPanel pinning — see `activeRelatedLearnTopicIds`
   * below. Set by `ComponentStudio` on mount, cleared on unmount.
   */
  const activeRelevantConcepts = useState<LearnConceptId[]>(
    "al-studio-toolbar-relevant-concepts",
    () => [],
  );

  /**
   * Curated Learn topic ids declared by the active component's
   * definition (`relatedLearnTopicIds`). The LearnPanel reads this
   * directly — explicit author choice replaces the previous concept-
   * tag overlap matching, which was too eager.
   */
  const activeRelatedLearnTopicIds = useState<string[]>(
    "al-studio-toolbar-related-topic-ids",
    () => [],
  );

  return {
    activeComponentName,
    activeLearnTopicId,
    activeRelevantConcepts,
    activeRelatedLearnTopicIds,
  };
}
