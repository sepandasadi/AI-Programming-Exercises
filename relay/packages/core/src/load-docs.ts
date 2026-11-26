import { constants } from "node:fs";
import { open, readdir, realpath } from "node:fs/promises";
import { isAbsolute, join, relative, sep } from "node:path";
import type { DocSection } from "./search-types.js";
import { parseSections } from "./sections.js";

/** "1 MB" in the spec: files larger than this are skipped. */
export const MAX_DOC_BYTES = 1_048_576;

/** O_NOFOLLOW is not defined on Windows; there the Dirent check alone applies. */
const OPEN_FLAGS =
  constants.O_RDONLY | (constants.O_NOFOLLOW ?? 0);

/**
 * Loads every `.md` file under `root` and splits it into sections.
 *
 * Pass a trusted tree whose root and descendants stay stable during loading.
 * The walk starts at the resolved root and skips symlink entries. The relative
 * path check is lexical. Files are opened later by path with `O_NOFOLLOW`
 * where available, which guards the final component. Each file must be
 * regular and at most 1,048,576 bytes. Paths use `/` and are sorted.
 * A missing root throws.
 */
export async function loadDocs(
  root: string,
): Promise<DocSection[]> {
  const realRoot = await realpath(root);
  const files = await listMarkdown(realRoot);

  const relPaths = files
    .map((full) => relative(realRoot, full))
    .filter(
      (rel) =>
        rel !== "" &&
        rel.split(sep)[0] !== ".." &&
        !isAbsolute(rel),
    )
    .map((rel) => rel.split(sep).join("/"))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const sections: DocSection[] = [];
  for (const rel of relPaths) {
    const text = await readDoc(
      join(realRoot, ...rel.split("/")),
    );
    if (text !== undefined)
      sections.push(...parseSections(rel, text));
  }
  return sections;
}

/** Walks the tree, skipping every symlink Dirent, and returns `.md` file paths. */
async function listMarkdown(
  dir: string,
): Promise<string[]> {
  const found: string[] = [];
  for (const entry of await readdir(dir, {
    withFileTypes: true,
  })) {
    if (entry.isSymbolicLink()) continue;
    const full = join(dir, entry.name);
    if (entry.isDirectory()) {
      found.push(...(await listMarkdown(full)));
    } else if (
      entry.isFile() &&
      entry.name.endsWith(".md")
    ) {
      found.push(full);
    }
  }
  return found;
}

/**
 * Opens one file with O_NOFOLLOW where supported, then checks and reads
 * through the same handle. Skips non-regular, oversized and unreadable files,
 * and handles final-component symlink errors on platforms that report them.
 */
async function readDoc(
  full: string,
): Promise<string | undefined> {
  let handle;
  try {
    handle = await open(full, OPEN_FLAGS);
  } catch (error) {
    if (isSkippableOpenError(error)) return undefined;
    throw error;
  }
  try {
    const stat = await handle.stat();
    if (!stat.isFile() || stat.size > MAX_DOC_BYTES)
      return undefined;

    // Read one byte past the fstat size so a file that grew since fstat is caught.
    const buffer = Buffer.alloc(stat.size + 1);
    let total = 0;
    while (total < buffer.length) {
      const { bytesRead } = await handle.read(
        buffer,
        total,
        buffer.length - total,
        total,
      );
      if (bytesRead === 0) break;
      total += bytesRead;
    }
    if (total > stat.size) return undefined;
    return buffer.toString("utf8", 0, total);
  } finally {
    await handle.close();
  }
}

/**
 * ELOOP: the path became a symlink (O_NOFOLLOW). ENOENT: it
 * was removed. EACCES/EPERM: unreadable, so skipped (spec).
 */
function isSkippableOpenError(error: unknown): boolean {
  const code = (error as NodeJS.ErrnoException | undefined)
    ?.code;
  return (
    code === "ELOOP" ||
    code === "ENOENT" ||
    code === "EACCES" ||
    code === "EPERM"
  );
}
