# Exercise 3: A stop hook

**Goal:** a hook that keeps the agent from finishing while
`pnpm typecheck` fails, and that cannot trap it in a loop.

## Instructions

1. Start from tag `v1-ch05` on a new branch. Write
   `relay/scripts/hooks/typecheck-on-stop.mjs`, using `hook-input.mjs`
   for parsing. It should:
   - exit 0 at once if the event has `stop_hook_active: true` (the agent
     is already continuing because of this hook);
   - otherwise run `pnpm typecheck` in `relay/`;
   - on failure, exit 2 with the last 30 lines of output on stderr and a
     sentence telling the agent to fix the errors or say why it can't.
2. Make the command overridable with an environment variable, so tests
   can simulate a failing check without breaking the code.
3. Write `typecheck-on-stop.test.ts` next to it: pass, fail,
   `stop_hook_active`, and one run of the real typecheck.
4. Wire it under `Stop` in `relay/.claude/settings.json`. Give it a
   timeout long enough for a typecheck. If you port it to another agent,
   check that tool's event payload, continuation response and loop guard.

## Verification

- From `relay/`, run `pnpm build` so the API can resolve core's
  generated declarations. Then `pnpm vitest run scripts/hooks` should
  pass, including your four tests.
- `pnpm agents:check` passes: the wiring calls a script that exists.
- Live: add `export const x: number = "no";` to a new file in
  `packages/core/src/`, ask your agent to make an unrelated one-line
  change, and watch it get sent back to fix the type error before it
  stops. Then ask it to stop while a type error it can't fix remains (for
  example, one in a file you told it not to touch): it should stop after
  one retry, not loop.

## Solution

`solution/relay/scripts/hooks/` holds the hook and its tests.
`solution/stop-hook-entry.json` is the `Stop` entry for
`.claude/settings.json`. Tested against `v1-ch05`: 4 tests pass, and with
a real type error in `packages/core` the hook exits 2 and prints the
`TS2322` error.
