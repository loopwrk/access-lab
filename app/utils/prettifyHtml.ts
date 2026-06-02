const VOID_TAGS = new Set([
  "area",
  "base",
  "br",
  "col",
  "embed",
  "hr",
  "img",
  "input",
  "link",
  "meta",
  "source",
  "track",
  "wbr",
]);

const INDENT = "  ";
const MAX_LINE = 80;
const ATTR_WRAP_THRESHOLD = 3;

export function prettifyHtml(html: string): string {
  const trimmed = html.trim();
  if (!trimmed) return "";

  // SSR fallback: DOMParser is browser-only.
  if (typeof DOMParser === "undefined") return trimmed;

  const doc = new DOMParser().parseFromString(trimmed, "text/html");
  const lines: string[] = [];
  for (const node of Array.from(doc.body.childNodes)) {
    formatNode(node, 0, lines);
  }
  return lines.join("\n").replace(/[ \t]+$/gm, "");
}

function formatNode(node: Node, depth: number, lines: string[]): void {
  const indent = INDENT.repeat(depth);

  if (node.nodeType === Node.TEXT_NODE) {
    const text = (node.textContent ?? "").trim();
    if (text) lines.push(indent + escapeText(text));
    return;
  }

  if (node.nodeType === Node.COMMENT_NODE) {
    lines.push(indent + `<!--${node.textContent ?? ""}-->`);
    return;
  }

  if (node.nodeType !== Node.ELEMENT_NODE) return;

  const el = node as Element;
  const tag = el.tagName.toLowerCase();

  if (VOID_TAGS.has(tag)) {
    emitOpenTag(el, depth, true, lines);
    return;
  }

  const childNodes = Array.from(el.childNodes).filter(
    (c) =>
      c.nodeType !== Node.TEXT_NODE || (c.textContent ?? "").trim().length > 0,
  );

  // Empty element: <tag></tag> on one line, attributes still wrap if many.
  if (childNodes.length === 0) {
    emitOpenTag(el, depth, false, lines, `</${tag}>`);
    return;
  }

  // Text-only children: try a single-line form first.
  const allText = childNodes.every((c) => c.nodeType === Node.TEXT_NODE);
  if (allText) {
    const text = escapeText((el.textContent ?? "").trim());
    const singleLine = indent + buildInlineOpenTag(el) + text + `</${tag}>`;
    if (
      singleLine.length <= MAX_LINE &&
      !buildInlineOpenTag(el).includes("\n")
    ) {
      lines.push(singleLine);
      return;
    }
  }

  // Block: open tag, indented children, close tag.
  emitOpenTag(el, depth, false, lines);
  for (const child of childNodes) {
    formatNode(child, depth + 1, lines);
  }
  lines.push(indent + `</${tag}>`);
}

function buildInlineOpenTag(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const attrs = Array.from(el.attributes);
  if (!attrs.length) return `<${tag}>`;
  const parts = attrs.map(formatAttr);
  return `<${tag} ${parts.join(" ")}>`;
}

function emitOpenTag(
  el: Element,
  depth: number,
  selfClose: boolean,
  lines: string[],
  trailing: string = "",
): void {
  const tag = el.tagName.toLowerCase();
  const indent = INDENT.repeat(depth);
  const attrs = Array.from(el.attributes);
  const tagClose = selfClose ? " />" : ">";

  if (!attrs.length) {
    lines.push(indent + `<${tag}${tagClose}${trailing}`);
    return;
  }

  const attrStrings = attrs.map(formatAttr);
  const inline = `<${tag} ${attrStrings.join(" ")}${tagClose}${trailing}`;

  const shouldWrap =
    attrs.length >= ATTR_WRAP_THRESHOLD ||
    depth * INDENT.length + inline.length > MAX_LINE;

  if (!shouldWrap) {
    lines.push(indent + inline);
    return;
  }

  // Wrap: tag on its own line, attrs aligned one level deeper, closing
  // bracket on its own line at the original depth.
  const attrIndent = INDENT.repeat(depth + 1);
  lines.push(indent + `<${tag}`);
  for (const a of attrStrings) {
    lines.push(attrIndent + a);
  }
  lines.push(indent + (selfClose ? "/>" : ">") + trailing);
}

function formatAttr(attr: Attr): string {
  if (attr.value === "") return attr.name;
  return `${attr.name}="${escapeAttrValue(attr.value)}"`;
}

// DOMParser decodes entities on parse, so we re-encode the characters
// that would otherwise be invalid (or ambiguous) when written back into
// raw HTML.
function escapeAttrValue(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

function escapeText(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
