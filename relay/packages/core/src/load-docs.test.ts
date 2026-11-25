import { mkdir, mkdtemp, rm, symlink, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MAX_DOC_BYTES, loadDocs } from "./load-docs.js";
import { searchDocs } from "./search.js";

const FIXTURES = fileURLToPath(new URL("../../../fixtures/team-docs", import.meta.url));

let base: string;
let root: string;
let outside: string;

async function put(dir: string, relative: string, content: string): Promise<void> {
  const full = join(dir, relative);
  await mkdir(join(full, ".."), { recursive: true });
  await writeFile(full, content);
}

/** A Markdown file of exactly `bytes` bytes: a heading line, then padding. */
function sizedMarkdown(heading: string, bytes: number): string {
  const head = `# ${heading}\n`;
  return head + "a".repeat(bytes - Buffer.byteLength(head));
}

const paths = (sections: { path: string }[]) => [...new Set(sections.map((s) => s.path))];

beforeEach(async () => {
  base = await mkdtemp(join(tmpdir(), "relay-load-docs-"));
  root = join(base, "docs");
  outside = join(base, "outside");
  await mkdir(root);
  await mkdir(outside);
  await put(outside, "secret.md", "# Secret\n\nOutside the root.\n");
});

afterEach(async () => {
  await rm(base, { recursive: true, force: true });
});

describe("loadDocs", () => {
  it("AC-9: reads only .md files", async () => {
    await put(root, "guide.md", "# Guide\n\nText.\n");
    await put(root, "notes.txt", "# Notes\n");
    await put(root, "readme.markdown", "# Readme\n");
    await put(root, "draft.md.bak", "# Draft\n");
    await put(root, "md", "# No extension\n");
    await mkdir(join(root, "folder.md"));
    await put(root, "folder.md/inner.md", "# Inner\n");

    const sections = await loadDocs(root);
    expect(paths(sections)).toEqual(["folder.md/inner.md", "guide.md"]);
  });

  it("AC-9: skips symlinked files and directories that point outside the root", async () => {
    await put(root, "real.md", "# Real\n");
    await symlink(join(outside, "secret.md"), join(root, "linked.md"));
    await symlink(outside, join(root, "linked-dir"), "dir");

    const sections = await loadDocs(root);
    expect(paths(sections)).toEqual(["real.md"]);
    expect(sections.some((s) => s.heading === "Secret")).toBe(false);
  });

  it("AC-9: skips symlinks even when they point inside the root", async () => {
    await put(root, "real.md", "# Real\n");
    await symlink(join(root, "real.md"), join(root, "alias.md"));
    await mkdir(join(root, "sub"));
    await put(root, "sub/page.md", "# Page\n");
    await symlink(join(root, "sub"), join(root, "sub-alias"), "dir");

    const sections = await loadDocs(root);
    expect(paths(sections)).toEqual(["real.md", "sub/page.md"]);
  });

  it("AC-9: reads a file of exactly 1,048,576 bytes and skips one of 1,048,577", async () => {
    expect(MAX_DOC_BYTES).toBe(1_048_576);
    await put(root, "at-limit.md", sizedMarkdown("At limit", 1_048_576));
    await put(root, "over-limit.md", sizedMarkdown("Over limit", 1_048_577));

    const sections = await loadDocs(root);
    expect(paths(sections)).toEqual(["at-limit.md"]);
    expect(sections[0]?.heading).toBe("At limit");
  });

  it("AC-9: no returned path starts with .. or is absolute", async () => {
    await put(root, "a.md", "# A\n");
    await put(root, "deep/er/b.md", "# B\n");
    await symlink(outside, join(root, "escape"), "dir");

    const sections = await loadDocs(root);
    expect(sections.length).toBeGreaterThan(0);
    for (const s of sections) {
      expect(s.path.startsWith("..")).toBe(false);
      expect(s.path.startsWith("/")).toBe(false);
    }
  });

  it("AC-9: follows a symlinked root once, then reads only inside it", async () => {
    await put(root, "a.md", "# A\n");
    const linkedRoot = join(base, "root-link");
    await symlink(root, linkedRoot, "dir");

    const sections = await loadDocs(linkedRoot);
    expect(paths(sections)).toEqual(["a.md"]);
  });

  it("AC-3: nested paths are relative to the root, use forward slashes and are sorted", async () => {
    await put(root, "z.md", "# Z\n");
    await put(root, "runbooks/on-call.md", "# On-Call\n");
    await put(root, "a/b/c.md", "# C\n");

    const sections = await loadDocs(root);
    expect(paths(sections)).toEqual(["a/b/c.md", "runbooks/on-call.md", "z.md"]);
  });

  it("AC-3: sections carry heading and 1-based heading line from the file", async () => {
    await put(root, "guide.md", "# Guide\n\nIntro.\n\n## Setup\n\nSteps.\n");

    const sections = await loadDocs(root);
    expect(sections.map(({ path, heading, line }) => ({ path, heading, line }))).toEqual([
      { path: "guide.md", heading: "Guide", line: 1 },
      { path: "guide.md", heading: "Setup", line: 5 },
    ]);
  });

  it("throws when the root does not exist", async () => {
    await expect(loadDocs(join(base, "missing"))).rejects.toThrow();
  });
});

describe("loadDocs with fixtures/team-docs", () => {
  it("AC-3: loads every fixture file with forward-slash paths", async () => {
    const sections = await loadDocs(FIXTURES);
    expect(paths(sections)).toEqual(["code-review.md", "deploying.md", "runbooks/on-call.md"]);
  });

  it("AC-5: fixtures rank Incident rollback above Rollback", async () => {
    const sections = await loadDocs(FIXTURES);
    const [first, second] = searchDocs(sections, "rollback", 5);
    expect(first).toMatchObject({ path: "runbooks/on-call.md", heading: "Incident rollback", score: 5 });
    expect(second).toMatchObject({ path: "deploying.md", heading: "Rollback", score: 4 });
  });
});
