#!/usr/bin/env node
// Pre-tool hook: refuses tool calls that name a .env file
// (.env, .env.local, ...) in a path or a shell command.
// .env.example is allowed. A guardrail, not a sandbox: a
// command can still reach the file without naming it.
import {
  block,
  commands,
  parseEvent,
  readStdin,
  targetPaths,
} from "./hook-input.mts";

const ENV_FILE =
  /(?:^|[^\w.-])(\.env(?:\.[\w-]+)*)(?![\w.-])/g;
const ALLOWED = new Set([".env.example"]);

/** The first .env-style name in `text` that isn't allowed. */
function envFileIn(text: string): string | undefined {
  for (const [, match] of text.matchAll(ENV_FILE)) {
    if (match !== undefined && !ALLOWED.has(match))
      return match;
  }
  return undefined;
}

const parsed = parseEvent(await readStdin());
// Fail closed: most tools treat other exit codes as allow.
if (!parsed) block("could not read the hook input.");

for (const text of [
  ...targetPaths(parsed.args),
  ...commands(parsed.args),
]) {
  const hit = envFileIn(text);
  if (hit) {
    block(
      `${hit} holds secrets and is off limits to agents. ` +
        `Use .env.example for names and defaults.`,
    );
  }
}
