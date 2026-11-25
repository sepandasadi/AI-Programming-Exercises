# Plan: Issue triage

Spec: `docs/specs/issue-triage.md`. Each task is one
reviewable commit and leaves the build green. Verify every
task with `pnpm build && pnpm typecheck && pnpm test`.

Task 1 is run test-first in two sessions (Ch. 7, 7.2): one
agent writes the tests from the spec and stops; after the
tests are reviewed and committed, a second agent writes the
code and may not edit the tests.

- [ ] **Task 1a: business-time tests.**
  Files: `packages/core/src/business-time.test.ts`, a stub
  `packages/core/src/business-time.ts` that throws.
  ACs: AC-4 (calendar add is in Task 2), AC-5, AC-6, AC-7.
  Verify: the new tests fail against the stub, every other
  test passes, typecheck passes.
- [ ] **Task 1b: business-time implementation.**
  Files: `packages/core/src/business-time.ts` only.
  Verify: the green gate, and
  `git diff --exit-code -- '*.test.ts'` (tests untouched).
- [ ] **Task 2: triage rules.**
  Files: `packages/core/src/triage.ts`, `triage.test.ts`,
  `index.ts`. ACs: AC-1, AC-2, AC-3, AC-4, AC-5.
- [ ] **Task 3: issue schema and `POST /triage`.**
  Files: `packages/core/src/issue-schema.ts`,
  `issue-schema.test.ts`, `index.ts`,
  `apps/api/src/app.ts`, `app.triage.test.ts` (not
  `app.test.ts`, which is tagged for docs search),
  `fixtures/issues/*.json`. ACs: AC-8, AC-9, AC-10.
