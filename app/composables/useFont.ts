import { useLocalStorage } from "@vueuse/core";
import type { FontSize } from "~/types/typography";

const defaultFont = "OpenDyslexicRegular";
const defaultSize: FontSize = "100%";

export const useFont = defineStore("font", () => {
  const family = useLocalStorage<string>("al-font-family", defaultFont);
  const size = useLocalStorage<FontSize>("al-font-size", defaultSize);

  watchEffect(() => {
    if (!import.meta.client) return;
    const html = document.documentElement;
    html.style.setProperty("--al-font", family.value);
    html.style.fontSize = size.value;
  });

  function setFont(f: string) {
    family.value = f;
  }

  function setSize(s: string) {
    size.value = s as FontSize;
  }

  return {
    family,
    size,
    setFont,
    setSize,
  };
});
