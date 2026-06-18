import { PREVIEW_MESSAGE, type HostBoundMessage } from "~/types/preview-messages";
import type { DomMeasurement } from "~/rules/types";
import type { AxeResult } from "~/types/axe";

function asAxeResults(value: unknown): AxeResult[] {
  return Array.isArray(value) ? (value as AxeResult[]) : [];
}

export function useAxeAudit(iframeRef: {
  readonly value: HTMLIFrameElement | null;
}) {
  const state = useAxeResults();

  const violations = computed(() => state.value.violations);
  const passes = computed(() => state.value.passes);
  const incomplete = computed(() => state.value.incomplete);
  const isReady = computed(() => state.value.isReady);
  const errorMessage = computed(() => state.value.errorMessage);

  const measurement = useState<DomMeasurement | null>(
    "dom-measurement",
    () => null,
  );

  function resetState() {
    state.value.isReady = false;
    state.value.violations = [];
    state.value.passes = [];
    state.value.incomplete = [];
    state.value.errorMessage = null;
    measurement.value = null;
  }

  function handler(event: MessageEvent) {
    const iframe = iframeRef.value;
    if (!iframe || event.source !== iframe.contentWindow) return;

    const data = event.data as HostBoundMessage | undefined;
    if (!data || typeof data.type !== "string") return;

    switch (data.type) {
      case PREVIEW_MESSAGE.SHELL_READY:
        state.value.isReady = true;
        break;
      case PREVIEW_MESSAGE.AXE_RESULT:
        state.value.violations = asAxeResults(data.violations);
        state.value.passes = asAxeResults(data.passes);
        state.value.incomplete = asAxeResults(data.incomplete);
        state.value.errorMessage = null;
        break;
      case PREVIEW_MESSAGE.AXE_ERROR:
        state.value.errorMessage = typeof data.message === "string" ? data.message : null;
        break;
      case PREVIEW_MESSAGE.DOM_MEASUREMENT:
        measurement.value = data.measurement;
        break;
    }
  }

  onMounted(resetState);
  useEventListener(window, "message", handler);

  return {
    violations,
    passes,
    incomplete,
    isReady,
    errorMessage,
  };
}
