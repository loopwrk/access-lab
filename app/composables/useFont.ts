import type { FontSize } from "~/types/typography";

const defaultFont = "Figtree Variable";
const defaultSize: FontSize = "100%";

export function useFont() {
  const family = useLocalStorage<string>("al-font-family", defaultFont);
  const size = useLocalStorage<FontSize>("al-font-size", defaultSize);

  const fontVar = useCssVar("--al-font");
  watchEffect(() => {
    fontVar.value = family.value;
  });
  watchEffect(() => {
    if (!import.meta.client) return;
    document.documentElement.style.fontSize = size.value;
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
}
