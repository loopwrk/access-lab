import type { DomMeasurement } from "~/rules/types";
import type { AxeResult } from "~/types/axe";

export function useAxeAudit(iframeRef: {
  readonly value: HTMLIFrameElement | null;
}) {
  const state = useAxeResults();

  const violations = computed(() => state.value.violations);
  const passes = computed(() => state.value.passes);
  const incomplete = computed(() => state.value.incomplete);
  const isReady = computed(() => state.value.isReady);
  const errorMessage = computed(() => state.value.errorMessage);

  // DOM-rule measurement posted by the iframe after each render. Stored
  // here so rules can react via watch in useDomRules — keeps useAxeAudit
  // ignorant of which DOM rules are registered.
  const measurement = useState<DomMeasurement | null>(
    "dom-measurement",
    () => null,
  );

  function handler(event: MessageEvent) {
    const iframe = iframeRef.value;
    if (!iframe || event.source !== iframe.contentWindow) return;

    const data = event.data;
    if (!data || typeof data.type !== "string") return;

    switch (data.type) {
      case "preview:ready":
        state.value.isReady = true;
        break;
      case "axe:result":
        state.value.violations = (data.violations || []) as AxeResult[];
        state.value.passes = (data.passes || []) as AxeResult[];
        state.value.incomplete = (data.incomplete || []) as AxeResult[];
        state.value.errorMessage = null;
        break;
      case "axe:error":
        state.value.errorMessage = data.message;
        break;
      case "overflow:result":
        measurement.value = data.measurement;
        break;
    }
  }

  onMounted(() => {
    // Reset readiness + stale results when a new PreviewIframe mounts.
    // `axe-results` is shared via useState so it survives route changes
    // (the layout's counter pills read it). Without this reset, the
    // second time a user lands on a studio route, `isReady` is still
    // `true` from the previous iframe — so render() fires postMessage
    // before the new iframe shell has attached its message listener,
    // the message is lost, and the new `preview:ready` flip doesn't
    // re-trigger PreviewIframe's watch (no value change).
    state.value.isReady = false;
    state.value.violations = [];
    state.value.passes = [];
    state.value.incomplete = [];
    state.value.errorMessage = null;
    measurement.value = null;
    window.addEventListener("message", handler);
  });
  onBeforeUnmount(() => window.removeEventListener("message", handler));

  return {
    violations,
    passes,
    incomplete,
    isReady,
    errorMessage,
  };
}
