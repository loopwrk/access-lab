export type InspectorTab = "controls" | "issues" | "manual" | "learn";

export function useInspectorTab() {
  const activeTab = useState<InspectorTab>("inspector-tab", () => "controls");

  /**
   * Open a learn topic in the reader. Name preserved from when this
   * function "focused" the topic inside the inspector panel — call
   * sites across the studio (control labels, issues panel, toasts,
   * preview toolbar) all use this single entry point so swapping
   * the behaviour here propagates without touching them.
   *
   * Now that the inspector's Learn panel is a picker (not a reader),
   * the only place articles render is `/learn/<topicId>`. This just
   * forwards to that — `useReadMode().open()` handles stashing the
   * current studio path so the close button can restore it.
   */
  function focusLearnTopic(topicId: string) {
    const { open } = useReadMode();
    open(topicId);
  }

  return {
    activeTab,
    focusLearnTopic,
  };
}
