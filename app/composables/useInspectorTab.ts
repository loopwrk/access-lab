export type InspectorTab = "controls" | "issues" | "manual" | "learn";

export function useInspectorTab() {
  const activeTab = useState<InspectorTab>("inspector-tab", () => "controls");

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
    setActive,
    focusPanel,
    focusLearnTopic,
  };
}
