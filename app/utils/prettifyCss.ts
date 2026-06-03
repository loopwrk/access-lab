// Tiny pretty-printer for the minified CSS the studio injects. Handles
// the shapes we actually emit: simple rules, pseudo-class rules,
// pseudo-element rules. Not a general-purpose CSS formatter — no media
// queries, no nested at-rules, no comments.
export function prettifyCss(css: string): string {
  if (!css.trim()) return "";

  const out: string[] = [];
  const rules = css.split("}").filter((r) => r.trim());

  for (const rule of rules) {
    const braceIndex = rule.indexOf("{");
    if (braceIndex === -1) continue;
    const selector = rule.slice(0, braceIndex).trim();
    const body = rule.slice(braceIndex + 1).trim();
    const declarations = body
      .split(";")
      .map((d) => d.trim())
      .filter(Boolean);

    if (!declarations.length) continue;

    out.push(`${selector} {`);
    for (const decl of declarations) {
      out.push(`  ${decl};`);
    }
    out.push("}");
    out.push("");
  }

  return out.join("\n").trimEnd();
}
