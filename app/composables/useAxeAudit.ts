import type { Ref } from "vue";

type ImpactValue = "minor" | "moderate" | "serious" | "critical" | null;

interface CheckResult {
  id: string;
  impact?: ImpactValue;
  message: string;
  data: unknown;
}

interface NodeResult {
  html: string;
  impact?: ImpactValue;
  target: string[];
  any: CheckResult[];
  all: CheckResult[];
  none: CheckResult[];
}

interface AxeResult {
  id: string;
  description: string;
  help: string;
  helpUrl: string;
  impact?: ImpactValue;
  tags: string[];
  nodes: NodeResult[];
}

export function useAxeAudit(iframeRef: {
  readonly value: HTMLIFrameElement | null;
}) {
  const violations = ref<AxeResult[]>([]);
  const passes = ref<AxeResult[]>([]);
  const incomplete = ref<AxeResult[]>([]);
  const isReady = ref(false);
  const errorMessage = ref<string | null>(null);

  const criticalCount = computed(
    () => violations.value.filter((v) => v.impact === "critical").length,
  );
  const warningCount = computed(
    () =>
      violations.value.filter((v) => v.impact && v.impact !== "critical")
        .length,
  );

  function handler(event: MessageEvent) {
    const iframe = iframeRef.value;
    if (!iframe || event.source !== iframe.contentWindow) return;

    const data = event.data;
    if (!data || typeof data.type !== "string") return;

    switch (data.type) {
      case "preview:ready":
        isReady.value = true;
        break;
      case "axe:result":
        violations.value = data.violations || [];
        passes.value = data.passes || [];
        incomplete.value = data.incomplete || [];
        errorMessage.value = null;
        break;
      case "axe:error":
        errorMessage.value = data.message;
        break;
    }
  }

  onMounted(() => window.addEventListener("message", handler));
  onBeforeUnmount(() => window.removeEventListener("message", handler));

  return {
    violations,
    passes,
    incomplete,
    isReady,
    errorMessage,
    criticalCount,
    warningCount,
    passingCount: computed(() => passes.value.length),
  };
}
