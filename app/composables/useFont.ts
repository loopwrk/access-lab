import type { FontSize } from "~/types/typography";
import type { FontOption } from "~/utils/displayControlOptions";
import {
  fontOptions,
  detectUnavailableSystemFonts,
  filterAvailableFonts,
} from "~/utils/displayControlOptions";
import { isFontAvailable } from "~/utils/isFontAvailable";

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

  // System fonts (e.g. Comic Sans MS) that this device cannot render. It starts
  // empty so the server render and the first client paint agree on the full
  // option list; detection runs after mount, so the reactive removal happens
  // post-hydration and never causes a mismatch.
  const unavailableSystemFonts = useState<string[]>("unavailable-system-fonts", () => []);

  onMounted(() => {
    unavailableSystemFonts.value = detectUnavailableSystemFonts(fontOptions, isFontAvailable);

    const activeOption = fontOptions.find((option) => option.value === family.value);
    if (
      activeOption?.requiresSystemFont &&
      unavailableSystemFonts.value.includes(activeOption.requiresSystemFont)
    ) {
      family.value = defaultFont;
    }
  });

  const availableFontOptions = computed<FontOption[]>(() =>
    filterAvailableFonts(fontOptions, unavailableSystemFonts.value),
  );

  function setFont(f: string) {
    family.value = f;
  }

  function setSize(s: string) {
    size.value = s as FontSize;
  }

  return {
    family,
    size,
    availableFontOptions,
    setFont,
    setSize,
  };
}
