// Shared parsing for Relay's agent hooks. Each tool sends a
// JSON event on stdin; the field names differ, so this
// module reduces an event to the paths and shell commands
// a tool call targets.

const PATH_KEYS = [
  "file_path",
  "path",
  "filePath",
  "absolute_path",
  "notebook_path",
];
const COMMAND_KEYS = ["command", "cmd"];
const PATCH_FILE =
  /^\*\*\* (?:Add|Update|Delete) File: (.+)$/gm;

function fields(value: unknown): Record<string, unknown> {
  // JSON objects expose fields by name. Other values have no named hook fields.
  return typeof value === "object" &&
    value !== null &&
    !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

export async function readStdin(): Promise<string> {
  let input = "";
  for await (const chunk of process.stdin) input += chunk;
  return input;
}

/**
 * Parses a hook event. Returns undefined if the input is
 * not JSON, so callers can fail closed.
 */
export function parseEvent(input: string) {
  try {
    const value: unknown = JSON.parse(input || "{}");
    if (value === null) return undefined;
    const event = fields(value);
    let args = event.tool_input ?? event.toolArgs ?? event;
    // Copilot sends its tool arguments as a JSON string.
    if (typeof args === "string") args = JSON.parse(args);
    return { event, args: fields(args) };
  } catch {
    return undefined;
  }
}

/** File paths the call names, including inside patches. */
export function targetPaths(
  args: Record<string, unknown>,
): string[] {
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
  return paths;
}

/** Shell commands the call runs, as single strings. */
export function commands(
  args: Record<string, unknown>,
): string[] {
  return COMMAND_KEYS.map((k) => args?.[k])
    .map((c) => (Array.isArray(c) ? c.join(" ") : c))
    .filter((c) => typeof c === "string");
}

/** Exit 2: "deny" in Claude Code, Codex, Copilot, Cursor
 * and Gemini CLI. The message on stderr goes to the agent. */
export function block(message: string): never {
  console.error(`Blocked: ${message}`);
  process.exit(2);
}
