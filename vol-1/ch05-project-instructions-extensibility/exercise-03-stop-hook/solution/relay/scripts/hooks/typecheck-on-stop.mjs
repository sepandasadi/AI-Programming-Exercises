#!/usr/bin/env node
// Stop hook: keeps the agent working while `pnpm typecheck`
// fails, by exiting 2 with the errors on stderr. When the
// agent is already continuing because of this hook
// (stop_hook_active), it lets the agent stop, so a type
// error the agent can't fix doesn't become a loop.
// RELAY_STOP_CHECK overrides the command (for tests).
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { parseEvent, readStdin } from "./hook-input.mjs";

const ROOT = fileURLToPath(
  new URL("../..", import.meta.url),
);
const CHECK =
  process.env.RELAY_STOP_CHECK ?? "pnpm typecheck";
const MAX_LINES = 30;

const parsed = parseEvent(await readStdin());
if (parsed?.event.stop_hook_active) process.exit(0);

const run = spawnSync(CHECK, {
  cwd: ROOT,
  shell: true,
  encoding: "utf8",
});
if (run.status === 0) process.exit(0);

const output = `${run.stdout}${run.stderr}`
  .trim()
  .split("\n")
  .slice(-MAX_LINES)
  .join("\n");
console.error(
  `\`${CHECK}\` fails. Fix these errors before you ` +
    `finish, or say why you can't:\n${output}`,
);
process.exit(2);
