# Exercise 1: Tests first, in two sessions

**Goal:** build `businessTimeBetween(start, end)`, the business time
between two instants, with one agent session writing the tests and a
second one writing the code against tests it may not change.

## Instructions

1. Start from tag `v1-ch07` on a new branch. Copy
   `starter/relay/` over your `relay/` folder: it adds the spec
   (`docs/specs/business-time-between.md`) and a stub that throws.
2. **Session A.** Adapt Listing 7.1: tests only, from the spec, for
   `businessTimeBetween`. Start the test file with
   `// spec: business-time-between`.
3. Review the tests: work out every expected value from the spec and
   a calendar, not by running code. Fix or add tests, then commit them
   while they fail.
4. Lock the test file. Make it read-only, or use your agent's hook
   (`relay/scripts/guard-tests.mjs` is written for the pre-edit hooks of
   Claude Code, Codex, Copilot, Cursor and Gemini CLI, and was tested with
   sample hook payloads; see the Tool Lens after section 7.6).
5. **Session B.** Use Listing 7.3 with the new function and file names.

## Verification

- Before session B: `pnpm test` fails only in your new test file, each
  failure with the stub's error.
- After session B: `git diff --exit-code -- '*.test.ts'` prints nothing,
  `pnpm build && pnpm typecheck && pnpm test` pass, and
  `pnpm spec:check docs/specs/business-time-between.md` lists AC-1 to
  AC-4 as `ok`.

## Solution

`solution/relay/` mirrors `relay/`: the spec, 6 example tests and an
implementation. Tested against tag `v1-ch07`: the gate passes and
`spec:check` lists AC-1 to AC-4 as `ok`.
