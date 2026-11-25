// Fails when an acceptance criterion in a spec has no test
// named after it. A test file covers a spec when it has a
// `// spec: <name>` line, where <name> is the spec's file
// name without `.md`. Only test titles that start with
// `AC-n:` count; comments and other strings do not.
// Usage: tsx check-spec.ts docs/specs/<name>.md
import { readFile, readdir } from "node:fs/promises";
import { basename, join } from "node:path";
import { pathToFileURL } from "node:url";

const AC_ID = /\bAC-\d+\b/g;
const TITLE =
  /\b(?:it|test)(?:\.\w+)*(?:\([^()]*\))?\(\s*["'`](AC-\d+):/g;
const SKIP = new Set(["node_modules", "dist", ".git"]);

export function criteriaIn(spec: string): string[] {
  const section = spec
    .split(/^## /m)
    .find((s) => s.startsWith("Acceptance criteria"));
  if (!section) return [];
  return [...new Set(section.match(AC_ID) ?? [])];
}

export function coveredIn(src: string, name: string) {
  const tag = new RegExp(`^// spec: ${name}\\s*$`, "m");
  if (!tag.test(src)) return [];
  return [...src.matchAll(TITLE)].map((m) => m[1]!);
}

async function testFiles(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const e of await readdir(dir, {
    withFileTypes: true,
  })) {
    if (SKIP.has(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...(await testFiles(p)));
    else if (e.name.endsWith(".test.ts")) out.push(p);
  }
  return out;
}

export async function checkSpec(
  specPath: string,
  root = ".",
): Promise<{ id: string; ok: boolean }[]> {
  const ids = criteriaIn(await readFile(specPath, "utf8"));
  const name = basename(specPath, ".md");
  const covered = new Set<string>();
  for (const f of await testFiles(root)) {
    const src = await readFile(f, "utf8");
    for (const id of coveredIn(src, name)) covered.add(id);
  }
  return ids.map((id) => ({ id, ok: covered.has(id) }));
}

async function main(specPath: string): Promise<number> {
  const rows = await checkSpec(specPath);
  if (rows.length === 0) {
    console.error(`No AC-n criteria in ${specPath}`);
    return 1;
  }
  for (const { id, ok } of rows) {
    console.log(`${ok ? "ok" : "MISSING"}\t${id}`);
  }
  return rows.every((r) => r.ok) ? 0 : 1;
}

const run = process.argv[1];
if (run && import.meta.url === pathToFileURL(run).href) {
  const spec = process.argv[2];
  if (!spec) {
    console.error("Usage: check-spec <spec.md>");
    process.exitCode = 1;
  } else {
    process.exitCode = await main(spec);
  }
}
