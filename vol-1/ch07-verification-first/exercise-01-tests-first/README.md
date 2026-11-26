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
   while they fail. Save that commit ID in the shell you will use for
   verification: `red_tests=$(git rev-parse HEAD)`.
4. Lock the test file. Make it read-only, or use your agent's hook
   (copy `relay/scripts/guard-tests.mts` from the chapter checkout into
   your `v1-ch07` workspace. It supports the pre-edit hooks of
   Claude Code, Codex, Copilot, Cursor and Gemini CLI, and was tested with
   sample hook payloads; see the Tool Lens after section 7.6).
5. **Session B.** Use Listing 7.3 with the new function and file names.

## Verification

- Before session B: `pnpm test` fails only in your new test file, each
  failure with the stub's error.
- After session B, run from `relay/` in the shell where you saved
  `red_tests`:

  ```sh
  git diff --exit-code "$red_tests" -- '*.test.ts' &&
    git diff --cached --exit-code "$red_tests" -- '*.test.ts' &&
    untracked=$(git ls-files -o --exclude-standard \
      -- '*.test.ts') &&
    test -z "$untracked" &&
    pnpm build && pnpm typecheck && pnpm test
  ```

  Both diffs must be empty and `$untracked` must contain no paths. Review
  any staged changes or new files before continuing. Then run
  `pnpm spec:check docs/specs/business-time-between.md` and check that
  AC-1 to AC-4 are `ok`.

## Solution

`solution/relay/` mirrors `relay/`: the spec, 6 example tests and an
implementation. Tested against tag `v1-ch07`: the gate passes and
`spec:check` lists AC-1 to AC-4 as `ok`.
