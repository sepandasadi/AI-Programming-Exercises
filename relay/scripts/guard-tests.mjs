#!/usr/bin/env node
// Pre-edit hook: refuses agent edits to test files.
// Reads the hook's JSON from stdin; exit code 2 means
// "deny" in Claude Code, Codex, Copilot, Cursor and Gemini
// CLI. Set RELAY_ALLOW_TEST_EDITS=1 in a test-writing session.
const TEST_FILE = /[\w.-]+\.(test|spec)\.[cm]?[jt]sx?\b/;

let input = "";
for await (const chunk of process.stdin) input += chunk;

let target;
try {
  const event = JSON.parse(input || "{}");
  target = JSON.stringify(
    event.tool_input ?? event.toolArgs ?? event,
  );
} catch {
  // Fail closed: most tools treat other exit codes as allow.
  console.error("Blocked: could not read the hook input.");
  process.exit(2);
}
const hit = TEST_FILE.exec(target);

if (hit && process.env.RELAY_ALLOW_TEST_EDITS !== "1") {
  console.error(
    `Blocked: ${hit[0]} is a test file. Tests are locked ` +
      `in this session; if a test is wrong, stop and say so.`,
  );
  process.exit(2);
}
