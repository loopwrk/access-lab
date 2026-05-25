/**
 * Shared state for which tab the right-hand inspector is showing.
 *
 */
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
  async function focusPanel(tab: InspectorTab) {
    setActive(tab);
    await nextTick();
    const el = document.getElementById(`${tab}-panel`);
    el?.focus();
  }

  return { activeTab, setActive, focusPanel };
}
