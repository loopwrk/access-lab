import type { FontSize } from "~/types/typography";
export interface FontOption {
  label: string;
  value: string;
  family: string;
  /**
   * A system font this option depends on. When set, the option is hidden on
   * devices where that font is not installed (e.g. Comic Sans MS on iOS and
   * Android), so the picker never offers a choice that would render as an
   * unreadable fallback.
   */
  requiresSystemFont?: string;
}

export interface SizeOption {
  label: string;
  value: FontSize;
}

export const fontOptions: FontOption[] = [
  { label: "Figtree", value: "Figtree Variable", family: "Figtree Variable" },
  { label: "Dyslexic", value: "OpenDyslexicRegular", family: "OpenDyslexicRegular" },
  { label: "Atkinson", value: "Atkinson Hyperlegible", family: "Atkinson Hyperlegible" },
  {
    label: "Comic Sans",
    value: '"Comic Sans MS", "Comic Sans", "Comic Neue", sans-serif',
    family: '"Comic Sans MS", "Comic Sans", "Comic Neue", sans-serif',
    requiresSystemFont: "Comic Sans MS",
  },
];

export function detectUnavailableSystemFonts(
  options: FontOption[],
  isAvailable: (fontName: string) => boolean,
): string[] {
  const requiredFonts = [
    ...new Set(
      options
        .map((option) => option.requiresSystemFont)
        .filter((fontName): fontName is string => Boolean(fontName)),
    ),
  ];
  return requiredFonts.filter((fontName) => !isAvailable(fontName));
}

export function filterAvailableFonts(
  options: FontOption[],
  unavailableSystemFonts: string[],
): FontOption[] {
  return options.filter(
    (option) =>
      !option.requiresSystemFont || !unavailableSystemFonts.includes(option.requiresSystemFont),
  );
}

export const sizeOptions: SizeOption[] = [
  { label: "S", value: "100%" },
  { label: "M", value: "112.5%" },
  { label: "L", value: "131.25%" },
  { label: "XL", value: "150%" },
];
