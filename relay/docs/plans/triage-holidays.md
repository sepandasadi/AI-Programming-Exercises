# Plan: Triage holidays (v0)

Spec: `docs/specs/triage-holidays.md`. Run all commands from
`relay/`. The human reruns the verification, reviews the
diff and commits.

**Green gate:** `pnpm build && pnpm typecheck && pnpm test`

## Implementation decisions

- **H1 Representation.** Core takes holidays as
  `YYYY-MM-DD` strings (JSON-friendly, easy to log) and
  converts them once per call to UTC day starts: a `Set`
  for "is this day a holiday" and a sorted array for "next
  holiday after this day".
- **H2 Week skip.** The existing shortcut (40 business
  hours = one calendar week) is only valid across weeks
  with no holiday. `addBusinessTime` now skips as many
  whole weeks as fit before the next holiday, then walks
  one window at a time past it, and repeats. Without
  holidays this is the old single skip.
- **H3 Range guard.** If the cursor leaves the `Date` range
  during the skip, throw the existing RangeError at once
  instead of looping on huge, imprecise numbers.
- **H4 Validation in two places.** `isHolidayDate` (format
  plus round trip through `Date`, so `2026-02-30` fails)
  backs both the Zod schema the API uses and the RangeError
  in `addBusinessTime`, so core is safe to call directly.
- **H5 Existing tests untouched.** Holiday tests go in new
  files tagged `// spec: triage-holidays`; the
  issue-triage tests keep covering the no-holiday case.

## Tasks

- [ ] **Task 1: core.**
  Files: `packages/core/src/holidays.ts`,
  `holidays.test.ts`, `business-time.ts`,
  `business-time.holidays.test.ts`,
  `business-time.holidays.property.test.ts`, `triage.ts`,
  `triage.holidays.test.ts`, `index.ts`.
  Covers: AC-1 to AC-6.
- [ ] **Task 2: API.**
  Files: `apps/api/src/config.ts`,
  `config.holidays.test.ts`, `app.ts`,
  `app.triage.holidays.test.ts`, `server.ts`,
  `.env.example`, `README.md`.
  Covers: AC-6, AC-7, AC-8.
  Verify: the green gate and both `spec:check` runs.

## Final verification

- [ ] `pnpm spec:check docs/specs/triage-holidays.md`
- [ ] `pnpm spec:check docs/specs/issue-triage.md`
- [ ] The spec's manual check.

## Coverage

| AC | Tasks |
| --- | --- |
| AC-1 | 1 |
| AC-2 | 1 |
| AC-3 | 1 |
| AC-4 | 1 |
| AC-5 | 1 |
| AC-6 | 1, 2 |
| AC-7 | 2 |
| AC-8 | 2 |
