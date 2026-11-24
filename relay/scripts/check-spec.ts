// Fails when an acceptance criterion in a spec has no
// test that names it. Usage: tsx check-spec.ts <spec.md>
import { readFile, readdir } from "node:fs/promises";
import { join } from "node:path";

const AC_ID = /\bAC-\d+\b/g;
const SKIP = new Set(["node_modules", "dist", ".git"]);

export function criteriaIn(spec: string): string[] {
  const section = spec
    .split(/^## /m)
    .find((s) => s.startsWith("Acceptance criteria"));
  if (!section) return [];
  return [...new Set(section.match(AC_ID) ?? [])];
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

async function main(specPath: string): Promise<number> {
  const ids = criteriaIn(await readFile(specPath, "utf8"));
  if (ids.length === 0) {
    console.error(`No AC-n criteria in ${specPath}`);
    return 1;
  }
  const covered = new Set<string>();
  for (const f of await testFiles(".")) {
    const src = await readFile(f, "utf8");
    const found = src.match(AC_ID) ?? [];
    for (const id of found) covered.add(id);
  }
  const missing = ids.filter((id) => !covered.has(id));
  for (const id of ids) {
    const mark = missing.includes(id) ? "MISSING" : "ok";
    console.log(`${mark}\t${id}`);
  }
  return missing.length === 0 ? 0 : 1;
}

const spec = process.argv[2];
if (spec) process.exitCode = await main(spec);
