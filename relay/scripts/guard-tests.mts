#!/usr/bin/env node
// Pre-edit hook: refuses agent edits to test files.
// Reads the hook's JSON from stdin; exit code 2 means
// "deny" in Claude Code, Codex, Copilot, Cursor and Gemini
// CLI. Set RELAY_ALLOW_TEST_EDITS=1 in a test-writing session.
const TEST_FILE = /[\w.-]+\.(test|spec)\.[cm]?[jt]sx?\b/;
const PATH_KEYS = ["file_path", "path", "filePath"];
const PATCH_FILE =
  /^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm;

function block(message: string): never {
  console.error(`Blocked: ${message}`);
  process.exit(2);
}

/** The paths an edit targets, or undefined if none is named. */
function targetPaths(value: unknown): string[] | undefined {
  if (typeof value !== "object" || value === null)
    return undefined;
  // Hook events may use different keys, so validate each field below.
  const args = value as Record<string, unknown>;
  const paths = PATH_KEYS.map((k) => args?.[k]).filter(
    (p) => typeof p === "string",
  );
  // Codex's apply_patch names its files inside the patch.
  const patch = args?.input ?? args?.patch;
  if (typeof patch === "string") {
    for (const [, path] of patch.matchAll(PATCH_FILE)) {
      if (path !== undefined) paths.push(path);
    }
  }
  return paths.length > 0 ? paths : undefined;
}

let input = "";
for await (const chunk of process.stdin) input += chunk;

let args: unknown;
try {
  const event = JSON.parse(input || "{}");
  args = event.tool_input ?? event.toolArgs ?? event;
  // Copilot sends its tool arguments as a JSON string.
  if (typeof args === "string") args = JSON.parse(args);
} catch {
  // Fail closed: most tools treat other exit codes as allow.
  block("could not read the hook input.");
}

// Check only the target paths, so an edit whose text merely
// mentions a test file is allowed. If no path field is
// recognized, check the whole input (fail safe).
const targets =
  targetPaths(args)?.join("\n") ?? JSON.stringify(args);
const hit = TEST_FILE.exec(targets);

if (hit && process.env.RELAY_ALLOW_TEST_EDITS !== "1") {
  block(
    `${hit[0]} is a test file. Tests are locked in this ` +
      `session; if a test is wrong, stop and say so.`,
  );
}
