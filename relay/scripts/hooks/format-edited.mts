#!/usr/bin/env node
// Post-edit hook: runs Prettier on each file the agent just
// wrote, if it is inside relay/ and Prettier handles it.
// A file Prettier can't parse is reported back to the agent
// on stderr with exit code 2; everything else exits 0.
import { readFile, writeFile } from "node:fs/promises";
import { isAbsolute, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import * as prettier from "prettier";
import {
  parseEvent,
  readStdin,
  targetPaths,
} from "./hook-input.mts";

const ROOT = fileURLToPath(
  new URL("../..", import.meta.url),
);
const IGNORE = resolve(ROOT, ".prettierignore");

const parsed = parseEvent(await readStdin());
if (!parsed) process.exit(0); // nothing to format

const cwd =
  typeof parsed.event.cwd === "string"
    ? parsed.event.cwd
    : process.cwd();
for (const target of targetPaths(parsed.args)) {
  const file = resolve(cwd, target);
  const rel = relative(ROOT, file);
  if (rel.startsWith("..") || isAbsolute(rel)) continue;

  const info = await prettier.getFileInfo(file, {
    ignorePath: IGNORE,
  });
  if (info.ignored || !info.inferredParser) continue;

  let source: string;
  try {
    source = await readFile(file, "utf8");
  } catch {
    continue; // deleted by the edit, or unreadable
  }
  try {
    const options = await prettier.resolveConfig(file);
    const output = await prettier.format(source, {
      ...options,
      filepath: file,
    });
    if (output !== source) await writeFile(file, output);
  } catch (error) {
    console.error(`Prettier could not format ${rel}:`);
    console.error(
      error instanceof Error
        ? error.message
        : String(error),
    );
    process.exit(2);
  }
}
