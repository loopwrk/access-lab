export const ONBOARDING_STEP_COUNT = 4;

export function useOnboarding() {
  const hasSeen = useLocalStorage("al-onboarding-seen", false);
  const isOpen = useState<boolean>("al-onboarding-open", () => false);
  const step = useState<number>("al-onboarding-step", () => 0);

  function clampStep(value: number) {
    return Math.min(Math.max(value, 0), ONBOARDING_STEP_COUNT - 1);
  }

  function open() {
    step.value = 0;
    isOpen.value = true;
  }

  function close() {
    isOpen.value = false;
    hasSeen.value = true;
  }

  function goTo(value: number) {
    step.value = clampStep(value);
  }

  function next() {
    step.value = clampStep(step.value + 1);
  }

  function prev() {
    step.value = clampStep(step.value - 1);
  }

  return { isOpen, step, hasSeen, stepCount: ONBOARDING_STEP_COUNT, open, close, next, prev, goTo };
}
