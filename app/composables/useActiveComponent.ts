import type { ComponentDefinition } from "~/types/component";

export function useActiveComponent() {
  const activeComponentName = useState<string | null>(
    "al-active-component-name",
    () => null,
  );

  const activeLearnTopicId = useState<string | null>(
    "al-active-component-learn-topic",
    () => null,
  );

  /**
   * Concept tags declared by the active component's definition. Kept
   * for documentation / potential future search use but no longer
   * drives the LearnPanel pinning - see `activeRelatedLearnTopicIds`
   * below.
   */
  const activeRelevantConcepts = useState<LearnConceptId[]>(
    "al-active-component-relevant-concepts",
    () => [],
  );

  /**
   * Curated Learn topic ids declared by the active component's
   * definition (`relatedLearnTopicIds`). The LearnPanel reads this
   * directly - explicit author choice replaces the previous concept-
   * tag overlap matching, which was too eager.
   */
  const activeRelatedLearnTopicIds = useState<string[]>(
    "al-active-component-related-topic-ids",
    () => [],
  );

  /**
   * Adopt a definition as the active component. ComponentStudio calls this
   * on mount (and clearActiveComponent on unmount), so the four refs above
   * always change together - readers like PreviewToolbar and LearnPanel
   * never see a half-updated component.
   */
  function setActiveComponent(definition: ComponentDefinition) {
    activeComponentName.value = definition.name;
    activeLearnTopicId.value = definition.primaryLearnTopicId ?? null;
    activeRelevantConcepts.value = definition.relevantConcepts ?? [];
    activeRelatedLearnTopicIds.value = definition.relatedLearnTopicIds ?? [];
  }

  function clearActiveComponent() {
    activeComponentName.value = null;
    activeLearnTopicId.value = null;
    activeRelevantConcepts.value = [];
    activeRelatedLearnTopicIds.value = [];
  }

  return {
    activeComponentName,
    activeLearnTopicId,
    activeRelevantConcepts,
    activeRelatedLearnTopicIds,
    setActiveComponent,
    clearActiveComponent,
  };
}
