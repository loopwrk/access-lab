export interface InlineToClassResult {
  html: string;
  css: string;
  className: string;
}

export function useInlineToClass() {
  function convert(html: string): InlineToClassResult | null {
    const tagMatch = html.match(/<(\w+)\b([^>]*?)\s+style="([^"]*)"([^>]*?)>/);
    if (!tagMatch) return null;

    const tagName = tagMatch[1] ?? "";
    const beforeStyle = tagMatch[2] ?? "";
    const styleStr = tagMatch[3] ?? "";
    const afterStyle = tagMatch[4] ?? "";

    const properties = styleStr
      .split(";")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => `  ${s};`);

    const className = "my-component";
    const css = [`.${className} {`, ...properties, "}"].join("\n");

    const openTagAttrs = [beforeStyle.trim(), afterStyle.trim()]
      .filter(Boolean)
      .join(" ");

    const openTag = openTagAttrs
      ? `<${tagName} ${openTagAttrs} class="${className}">`
      : `<${tagName} class="${className}">`;

    const newHtml = html.replace(
      /<(\w+)\b[^>]*?\s+style="[^"]*"[^>]*?>/,
      openTag,
    );

    return { html: newHtml, css, className };
  }

  return { convert };
}
