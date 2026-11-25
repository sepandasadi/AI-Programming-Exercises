import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { z } from "zod";
import { type Issue, IssueSchema } from "@relay/core";

/** `relay/fixtures/issues.json`, found from this module. */
export const DEFAULT_ISSUES_FILE = fileURLToPath(
  new URL("../../../fixtures/issues.json", import.meta.url),
);

/** Reads and validates the issue file; throws if invalid. */
export async function loadIssues(
  path: string,
): Promise<Issue[]> {
  let data: unknown;
  try {
    data = JSON.parse(await readFile(path, "utf8"));
  } catch (cause) {
    throw new Error(`Cannot read issue file ${path}`, {
      cause,
    });
  }
  const parsed = z.array(IssueSchema).safeParse(data);
  if (!parsed.success) {
    throw new Error(
      `Invalid issue file ${path}: ` +
        z.prettifyError(parsed.error),
    );
  }
  return parsed.data;
}
