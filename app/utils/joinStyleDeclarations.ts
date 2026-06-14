/**
 * Join CSS declarations into an inline `style` value, formatted by a space after
 * the property colon and after each semicolon (`width: 24px; height: 24px`).
 */
export function joinStyleDeclarations(declarations: string[]): string {
  return declarations.map((decl) => decl.replace(/:\s*/, ": ")).join("; ");
}
