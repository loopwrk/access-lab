/// <reference types="node" />

/**
 * Drift guard between the host's message contract and the iframe shell.
 *
 * `app/types/preview-messages.ts` is the canonical, typed contract for the host.
 * `public/preview-shell.html` is plain build-free HTML+JS that can't import it,
 * so it hardcodes the same wire strings. The host side is kept honest at compile
 * time (the `PREVIEW_MESSAGE` constants + the completeness guard in that module);
 * this test keeps the *shell* honest — it reads the shell as text and asserts the
 * set of wire strings it uses equals the set the contract declares.
 *
 * Rename or add a message on one side without the other and one of the two
 * assertions below fails, naming the offending string.
 *
 * Extraction is anchored deliberately:
 *   - posted messages      → `postMessage({ type: "..." })` (anchored to the call
 *     and `type`-first, so axe's `runOnly: { type: "tag" }` config isn't mistaken
 *     for a message)
 *   - the one listened-for  → `data.type === "..."` (NOT a bare `.type ===`, which
 *     would also catch `input.type === "text"` in the show-password handler)
 *
 * Lives in the `unit` (node) project, not `nuxt`: it only touches the filesystem
 * and a plain const, and Nuxt's Vite layer rewrites `import.meta.url` under
 * happy-dom, which breaks file-path resolution.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { PREVIEW_MESSAGE } from "../../app/types/preview-messages";

const shell = readFileSync(resolve(process.cwd(), "public/preview-shell.html"), "utf8");

function captures(re: RegExp): string[] {
  return [...shell.matchAll(re)].map((m) => m[1]).filter((s): s is string => s !== undefined);
}

const shellStrings = new Set<string>([
  ...captures(/postMessage\(\s*\{\s*type:\s*"([^"]+)"/g), // messages the shell posts
  ...captures(/\bdata\.type\s*===\s*"([^"]+)"/g), // the one message it listens for
]);
const contractStrings = new Set<string>(Object.values(PREVIEW_MESSAGE));

describe("preview message contract ↔ shell", () => {
  it("every wire string the shell uses is declared in PREVIEW_MESSAGE", () => {
    const unknownInShell = [...shellStrings].filter((s) => !contractStrings.has(s));
    expect(unknownInShell).toEqual([]);
  });

  it("every PREVIEW_MESSAGE string is actually used by the shell", () => {
    const unusedInContract = [...contractStrings].filter((s) => !shellStrings.has(s));
    expect(unusedInContract).toEqual([]);
  });
});
