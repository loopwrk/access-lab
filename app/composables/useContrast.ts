import type { MaybeRefOrGetter, ComputedRef } from "vue";

export type ContrastAlgorithm = "wcag2"; // future: | 'apca'

export type ContrastVerdict = "AAA" | "AA" | "AALarge" | "Fail";

export interface ContrastOptions {
  fontSizePx?: MaybeRefOrGetter<number | undefined>;
  bold?: MaybeRefOrGetter<boolean | undefined>;
  pageBackdrop?: MaybeRefOrGetter<string | undefined>;
  algorithm?: ContrastAlgorithm;
}

export interface ContrastResult {
  ratio: ComputedRef<number>;
  verdict: ComputedRef<ContrastVerdict>;
}

interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

interface Rgb {
  r: number;
  g: number;
  b: number;
}

/* ----------------------------------------------------------------------
 * Colour parsing
 * -------------------------------------------------------------------- */

const HEX_RE = /^#?([0-9a-f]{3,8})$/i;
const RGBA_RE
  = /^rgba?\(\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)\s*[,\s]\s*(\d+(?:\.\d+)?)\s*(?:[,/]\s*([\d.]+%?)\s*)?\)$/i;

function parseHex(input: string): Rgba | null {
  const m = HEX_RE.exec(input.trim());
  if (!m) return null;
  let s = m[1]!;
  if (![3, 4, 6, 8].includes(s.length)) return null;
  // Expand short forms: #fff → #ffffff, #fffa → #ffffffaa
  if (s.length === 3 || s.length === 4) {
    s = s
      .split("")
      .map((c) => c + c)
      .join("");
  }
  const r = parseInt(s.slice(0, 2), 16) / 255;
  const g = parseInt(s.slice(2, 4), 16) / 255;
  const b = parseInt(s.slice(4, 6), 16) / 255;
  const a = s.length === 8 ? parseInt(s.slice(6, 8), 16) / 255 : 1;
  return { r, g, b, a };
}

function parseRgbFunction(input: string): Rgba | null {
  const m = RGBA_RE.exec(input.trim());
  if (!m) return null;
  const r = Number(m[1]) / 255;
  const g = Number(m[2]) / 255;
  const b = Number(m[3]) / 255;
  let a = 1;
  if (m[4] !== undefined) {
    a = m[4].endsWith("%") ? Number(m[4].slice(0, -1)) / 100 : Number(m[4]);
  }
  return { r, g, b, a };
}

/** Parse any colour string we expect from the ColorPicker (hex or rgb/rgba). */
function parseColor(input: string): Rgba | null {
  if (!input) return null;
  return parseHex(input) ?? parseRgbFunction(input);
}

/**
 * Flatten an RGBA colour onto an opaque backdrop. Used to resolve
 * semi-transparent foregrounds / backgrounds into the opaque values
 *
 * See research/contrast-calculation.md §4.1
 */
function flatten(c: Rgba, backdrop: Rgb): Rgb {
  const a = c.a;
  return {
    r: c.r * a + backdrop.r * (1 - a),
    g: c.g * a + backdrop.g * (1 - a),
    b: c.b * a + backdrop.b * (1 - a),
  };
}

/* ----------------------------------------------------------------------
 * WCAG 2.x relative luminance + contrast ratio
 * See research/contrast-calculation.md §1 + §2.
 * -------------------------------------------------------------------- */

function srgbChannelToLinear(c: number): number {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function relativeLuminance({ r, g, b }: Rgb): number {
  const R = srgbChannelToLinear(r);
  const G = srgbChannelToLinear(g);
  const B = srgbChannelToLinear(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

function wcag2ContrastRatio(fg: Rgb, bg: Rgb): number {
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Round a contrast ratio to 2 decimal places — the WCAG-tooling convention
 * (axe-core, WebAIM). The badge displays this value AND every threshold
 * comparison (the verdict here, the custom rules via computeRatio) uses it, so
 * the number shown can never contradict the verdict — e.g. a raw 4.497 becomes
 * 4.50 and reads as AA, not "4.50 · AA (large text only)".
 */
function roundRatio(ratio: number): number {
  return Math.round(ratio * 100) / 100;
}

/* ----------------------------------------------------------------------
 * Verdict bucketing
 * -------------------------------------------------------------------- */

/**
 * Determine whether the rendered text qualifies as "large" per WCAG.
 * 18pt ≈ 24px regular, OR 14pt ≈ 18.67px when bold.
 */
function isLargeText(fontSizePx: number, bold: boolean): boolean {
  if (fontSizePx >= 24) return true;
  if (bold && fontSizePx >= 18.67) return true;
  return false;
}

function bucketVerdict(
  ratio: number,
  fontSizePx: number,
  bold: boolean,
): ContrastVerdict {
  const large = isLargeText(fontSizePx, bold);
  const aaThreshold = large ? 3 : 4.5;
  const aaaThreshold = large ? 4.5 : 7;

  if (ratio >= aaaThreshold) return "AAA";
  if (ratio >= aaThreshold) return "AA";
  if (!large && ratio >= 3) return "AALarge";
  return "Fail";
}

/* ----------------------------------------------------------------------
 * Algorithm facade
 * -------------------------------------------------------------------- */

const WHITE: Rgb = { r: 1, g: 1, b: 1 };

interface ResolvedOptions {
  fontSizePx: number;
  bold: boolean;
  pageBackdrop: string;
  algorithm: ContrastAlgorithm;
}

function computeRatio(
  fgStr: string,
  bgStr: string,
  options: ResolvedOptions,
): number {
  const fg = parseColor(fgStr);
  const bg = parseColor(bgStr);
  const backdrop = parseColor(options.pageBackdrop);

  if (!fg || !bg) return 1;

  const backdropRgb: Rgb = backdrop ? flatten(backdrop, WHITE) : WHITE;

  // Cascade: flatten bg first (might be translucent over backdrop), then
  // flatten fg over the resulting opaque bg. Order matters when both have
  // alpha — fg should be composited against what the user actually sees.
  const flatBg = flatten(bg, backdropRgb);
  const flatFg = flatten(fg, flatBg);

  switch (options.algorithm) {
    case "wcag2":
      return roundRatio(wcag2ContrastRatio(flatFg, flatBg));
    default: {
      // Exhaustiveness — TS will error here when a new algorithm is added.
      const _exhaustive: never = options.algorithm;
      void _exhaustive;
      return 1;
    }
  }
}

/* ----------------------------------------------------------------------
 * Composable
 * -------------------------------------------------------------------- */

/**
 * Reactive WCAG contrast calculation.
 *
 * @example
 * const { ratio, verdict } = useContrast(
 *   () => modelValue.fgText,
 *   () => modelValue.bg,
 *   { fontSizePx: () => modelValue.fontSize, bold: false }
 * )
 */
export function useContrast(
  fg: MaybeRefOrGetter<string>,
  bg: MaybeRefOrGetter<string>,
  options: ContrastOptions = {},
): ContrastResult {
  const algorithm = options.algorithm ?? "wcag2";

  const ratio = computed(() => {
    const resolved: ResolvedOptions = {
      fontSizePx: toValue(options.fontSizePx) ?? 16,
      bold: toValue(options.bold) ?? false,
      pageBackdrop: toValue(options.pageBackdrop) ?? "#ffffff",
      algorithm,
    };
    return computeRatio(toValue(fg), toValue(bg), resolved);
  });

  const verdict = computed<ContrastVerdict>(() =>
    bucketVerdict(
      ratio.value,
      toValue(options.fontSizePx) ?? 16,
      toValue(options.bold) ?? false,
    ),
  );

  return { ratio, verdict };
}

export const _internal = {
  parseColor,
  flatten,
  relativeLuminance,
  wcag2ContrastRatio,
  roundRatio,
  isLargeText,
  bucketVerdict,
  computeRatio,
};
