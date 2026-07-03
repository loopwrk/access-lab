export type InspectorTab = "controls" | "issues" | "manual" | "learn";

export function useInspectorTab() {
  const activeTab = useState<InspectorTab>("inspector-tab", () => "controls");

  return { activeTab };
}
