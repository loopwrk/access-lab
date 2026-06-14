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

    const otherAttrs = [beforeStyle.trim(), afterStyle.trim()]
      .filter(Boolean)
      .join(" ");

    // Merge into an existing class attribute rather than appending a second
    // one. A duplicate `class` is invalid HTML: the parser keeps the first
    // and silently drops the rest, which previously meant the extracted
    // `my-component` class (and with it every style) vanished on paste.
    const classMatch = otherAttrs.match(/class="([^"]*)"/);
    let mergedAttrs: string;
    if (classMatch) {
      const existing = classMatch[1] ?? "";
      const mergedClass = existing ? `${existing} ${className}` : className;
      mergedAttrs = otherAttrs.replace(/class="[^"]*"/, `class="${mergedClass}"`);
    } else {
      mergedAttrs = otherAttrs ? `${otherAttrs} class="${className}"` : `class="${className}"`;
    }

    const openTag = `<${tagName} ${mergedAttrs}>`;

    const newHtml = html.replace(
      /<(\w+)\b[^>]*?\s+style="[^"]*"[^>]*?>/,
      openTag,
    );

    return { html: newHtml, css, className };
  }

  return { convert };
}
