/// <reference types="node" />

/**
 * Drift guard: every Learn-topic id referenced in app code resolves to a real
 * article in `content/learn/`. Topic ids are plain author-defined strings
 * (markdown frontmatter), so a typo never errors anywhere - the learn link or
 * pinned article just silently vanishes (`component.ts` documents this trap on
 * `relatedLearnTopicIds`). This test makes the honour system enforceable and
 * names the offending file when an id breaks.
 *
 * Scope - the literal shapes ids are declared in:
 *   - `learnTopicId` / `seeAlsoTopicId` / `primaryLearnTopicId` fields
 *   - `relatedLearnTopicIds` arrays in the definitions
 *   - `openLearnTopic("...")` calls
 *   - literal `topic=` / `learn-topic=` template props (LearnLink / SectionLegend)
 *   - the articles' own frontmatter `related:` cross-references
 * Ids assembled dynamically (e.g. a computed choosing between literals) are
 * outside textual reach; prefer declaring such literals in a scanned shape.
 *
 * Like preview-message-contract.test.ts, this reads sources from disk rather
 * than importing them: the definitions pull in `.vue` controls components and
 * Nuxt auto-imports that the node test project can't load.
 */
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, resolve } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = resolve(process.cwd());
const CONTENT_DIR = join(ROOT, "content", "learn");
const APP_DIR = join(ROOT, "app");

interface TopicReference {
  id: string;
  source: string;
}

function frontmatterOf(markdown: string): string {
  return markdown.match(/^---\n([\s\S]*?)\n---/)?.[1] ?? "";
}

function loadArticles(): { articleIds: Set<string>; relatedReferences: TopicReference[] } {
  const articleIds = new Set<string>();
  const relatedReferences: TopicReference[] = [];

  for (const file of readdirSync(CONTENT_DIR)) {
    if (!file.endsWith(".md")) continue;
    const frontmatter = frontmatterOf(readFileSync(join(CONTENT_DIR, file), "utf8"));

    const topicId = frontmatter.match(/^topicId:\s*["']?([\w-]+)["']?\s*$/m)?.[1];
    if (topicId) articleIds.add(topicId);

    const relatedBlock = frontmatter.match(/^related:\n((?:[ \t]+-[^\n]*\n?)+)/m)?.[1] ?? "";
    for (const entry of relatedBlock.matchAll(/-\s*["']?([\w-]+)["']?/g)) {
      relatedReferences.push({ id: entry[1]!, source: `content/learn/${file} (related)` });
    }
  }

  return { articleIds, relatedReferences };
}

function sourceFiles(dir: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (statSync(path).isDirectory()) files.push(...sourceFiles(path));
    else if (/\.(ts|vue)$/.test(entry)) files.push(path);
  }
  return files;
}

// The literal shapes a topic id can be declared in. The leading `[\s"({,]` on
// the template-prop pattern excludes `:topic="someVariable"` bindings (their
// attribute starts with a colon); bound literals get their own pattern.
const REFERENCE_PATTERNS: { form: string; pattern: RegExp }[] = [
  { form: "openLearnTopic()", pattern: /openLearnTopic\(\s*["']([\w-]+)["']/g },
  { form: "learnTopicId", pattern: /learnTopicId:\s*["']([\w-]+)["']/g },
  { form: "seeAlsoTopicId", pattern: /seeAlsoTopicId:\s*["']([\w-]+)["']/g },
  { form: "primaryLearnTopicId", pattern: /primaryLearnTopicId:\s*["']([\w-]+)["']/g },
  { form: "topic prop", pattern: /[\s"](?:topic|learn-topic|learnTopic)=["']([\w-]+)["']/g },
  { form: "bound topic literal", pattern: /:(?:topic|learn-topic|learnTopic)="'([\w-]+)'"/g },
];

const RELATED_IDS_BLOCK = /relatedLearnTopicIds:\s*\[([^\]]*)\]/g;

function collectCodeReferences(): TopicReference[] {
  const references: TopicReference[] = [];

  for (const file of sourceFiles(APP_DIR)) {
    const source = readFileSync(file, "utf8");
    const location = relative(ROOT, file);

    for (const { form, pattern } of REFERENCE_PATTERNS) {
      for (const match of source.matchAll(pattern)) {
        references.push({ id: match[1]!, source: `${location} (${form})` });
      }
    }

    for (const block of source.matchAll(RELATED_IDS_BLOCK)) {
      for (const entry of block[1]!.matchAll(/["']([\w-]+)["']/g)) {
        references.push({ id: entry[1]!, source: `${location} (relatedLearnTopicIds)` });
      }
    }
  }

  return references;
}

function unresolved(references: TopicReference[], articleIds: Set<string>): string[] {
  return references
    .filter((reference) => !articleIds.has(reference.id))
    .map((reference) => `"${reference.id}" ← ${reference.source}`);
}

const { articleIds, relatedReferences } = loadArticles();
const codeReferences = collectCodeReferences();

describe("learn topic ids", () => {
  // Vacuousness tripwires: if either extraction silently stops matching
  // (frontmatter format change, reference-shape change), the guard must fail
  // loudly rather than pass with nothing to check. Floors, not exact counts.
  it("extracts the article library (currently 22 topics)", () => {
    expect(articleIds.size).toBeGreaterThanOrEqual(20);
  });

  it("extracts a plausible number of code references", () => {
    expect(codeReferences.length).toBeGreaterThanOrEqual(30);
  });

  it("resolves every learn-topic id referenced in app code to a real article", () => {
    expect(unresolved(codeReferences, articleIds)).toEqual([]);
  });

  it("resolves every frontmatter `related` cross-reference to a real article", () => {
    expect(unresolved(relatedReferences, articleIds)).toEqual([]);
  });
});
