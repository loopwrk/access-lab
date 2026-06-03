type Mode = "light" | "dark";
type Contrast = "normal" | "high";

export function useTheme() {
  const colorMode = useColorMode();
  const contrast = useLocalStorage<Contrast>("al-contrast", "normal");

  watchEffect(() => {
    if (!import.meta.client) return;
    const html = document.documentElement;
    const mode = colorMode.value;
    html.classList.toggle("theme-dark", mode === "dark");
    html.classList.toggle("theme-light", mode === "light");
    html.classList.toggle("theme-high-contrast", contrast.value === "high");
  });

  function setMode(value: Mode) {
    colorMode.preference = value;
  }

  function toggleMode() {
    setMode(colorMode.value === "light" ? "dark" : "light");
  }

  function toggleContrast() {
    contrast.value = contrast.value === "normal" ? "high" : "normal";
  }

  const mode = computed<Mode>(() =>
    colorMode.value === "dark" ? "dark" : "light",
  );
  const isDark = computed(() => colorMode.value === "dark");
  const isHighContrast = computed(() => contrast.value === "high");

  return {
    mode,
    contrast,
    setMode,
    toggleMode,
    toggleContrast,
    isDark,
    isHighContrast,
  };
}
