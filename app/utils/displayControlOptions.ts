import type { FontSize } from "~/types/typography";
export interface FontOption {
  label: string;
  value: string;
  family: string;
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
    value: '"Comic Sans MS", "Comic Sans", cursive',
    family: '"Comic Sans MS", "Comic Sans", cursive',
  },
];

export const sizeOptions: SizeOption[] = [
  { label: "S", value: "100%" },
  { label: "M", value: "112.5%" },
  { label: "L", value: "131.25%" },
  { label: "XL", value: "150%" },
];
