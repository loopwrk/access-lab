export type InspectorTab = "controls" | "issues" | "manual" | "learn";

export function useInspectorTab() {
  const activeTab = useState<InspectorTab>("inspector-tab", () => "controls");

  const activeLearnTopic = useState<string | null>(
    "active-learn-topic",
    () => null,
  );

  function setActive(tab: InspectorTab) {
    activeTab.value = tab;
  }

  /**
   * Switch tabs and move focus into the target panel on the next tick.
   * Important for keyboard + screen-reader users — without this, focus
   * stays on the now-hidden trigger and the user loses their place.
   */
  async function focusPanel(tab: InspectorTab, focusId?: string) {
    setActive(tab);
    await nextTick();
    const target = document.getElementById(focusId ?? INSPECTOR_PANEL_IDS[tab]);
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function focusLearnTopic(topicId: string) {
    activeLearnTopic.value = topicId;
    setActive("learn");
    await nextTick();
    const target = document.getElementById(`topic-${topicId}`);
    if (!target) return;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function clearLearnTopic() {
    activeLearnTopic.value = null;
  }

  return {
    activeTab,
    activeLearnTopic,
    setActive,
    focusPanel,
    focusLearnTopic,
    clearLearnTopic,
  };
}
