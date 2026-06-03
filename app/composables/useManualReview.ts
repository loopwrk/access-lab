interface StaticChecklistItem {
  id: string;
  title: string;
  wcagSc: string;
  description: string;
  url: string;
}

export interface ManualItem {
  id: string;
  title: string;
  message: string;
  checked: boolean;
  helpUrl?: string;
  source: "axe" | "static";
  wcagSc?: string;
}

export function useManualReview(staticItems?: StaticChecklistItem[]): {
  items: ComputedRef<ManualItem[]>;
  setChecked: (itemId: string, value: boolean) => void;
  checkAll: () => void;
  uncheckAll: () => void;
  checkedCount: ComputedRef<number>;
  totalCount: ComputedRef<number>;
  progressPercent: ComputedRef<number>;
} {
  const axeState = useAxeResults();
  const checkedState = useState<Record<string, boolean>>(
    "manual-checked",
    () => ({}),
  );

  const axeItems = computed<ManualItem[]>(() =>
    axeState.value.incomplete.map((result) => {
      const message
        = result.nodes[0]?.none[0]?.message
          || result.nodes[0]?.failureSummary
          || result.description;

      return {
        id: result.id,
        title: result.id,
        message,
        checked: checkedState.value[result.id] ?? false,
        helpUrl: result.helpUrl,
        source: "axe" as const,
      };
    }),
  );

  const staticManualItems = computed<ManualItem[]>(() =>
    (staticItems ?? []).map((item) => ({
      id: item.id,
      title: item.title,
      message: item.description,
      checked: checkedState.value[item.id] ?? false,
      helpUrl: item.url,
      source: "static" as const,
      wcagSc: item.wcagSc,
    })),
  );

  const items = computed<ManualItem[]>(() => [
    ...staticManualItems.value,
    ...axeItems.value,
  ]);

  function setChecked(itemId: string, value: boolean) {
    checkedState.value = {
      ...checkedState.value,
      [itemId]: value,
    };
  }

  function checkAll() {
    const all: Record<string, boolean> = {};
    for (const item of items.value) {
      all[item.id] = true;
    }
    checkedState.value = all;
  }

  function uncheckAll() {
    checkedState.value = {};
  }

  const checkedCount = computed(
    () => items.value.filter((i) => i.checked).length,
  );

  const totalCount = computed(() => items.value.length);

  const progressPercent = computed(() =>
    totalCount.value === 0
      ? 100
      : Math.round((checkedCount.value / totalCount.value) * 100),
  );

  return {
    items,
    setChecked,
    checkAll,
    uncheckAll,
    checkedCount,
    totalCount,
    progressPercent,
  };
}
