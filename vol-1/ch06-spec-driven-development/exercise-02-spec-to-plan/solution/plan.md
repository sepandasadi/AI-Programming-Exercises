# Plan: Stale issue report (v0)

One reviewed commit per task. Run commands from `relay/`.

- [ ] **Task 1: Issue schema and fixture**
  - Files: `packages/core/src/issues/stale.ts` (schema and types
    only), `packages/core/src/index.ts`, `fixtures/issues.json`
  - Covers: none (setup for AC-1 to AC-7)
  - Verify: `pnpm build && pnpm typecheck`
- [ ] **Task 2: `staleIssues` with tests**
  - Files: `packages/core/src/issues/stale.ts`,
    `packages/core/src/issues/stale.test.ts`
  - Covers: AC-1, AC-2, AC-3, AC-4, AC-6
  - Verify: `pnpm build && pnpm typecheck && pnpm test`
- [ ] **Task 3: `GET /issues/stale` route with tests**
  - Files: `apps/api/src/routes/stale-issues.ts`,
    `apps/api/src/routes/stale-issues.test.ts`, `apps/api/src/app.ts`
  - Covers: AC-5, AC-7
  - Verify: `pnpm build && pnpm typecheck && pnpm test`
- [ ] **Task 4: Load and validate the issue file at startup**
  - Files: `apps/api/src/issues-file.ts`,
    `apps/api/src/issues-file.test.ts`, `apps/api/src/server.ts`
  - Covers: AC-8
  - Verify: `pnpm build && pnpm typecheck && pnpm test`
- [ ] **Task 5: Traceability and docs**
  - Files: `README.md`
  - Covers: all (check only)
  - Verify: `pnpm spec:check docs/specs/stale-issues.md && pnpm test`

| AC | T1 | T2 | T3 | T4 | T5 |
| --- | --- | --- | --- | --- | --- |
| AC-1 | | x | | | x |
| AC-2 | | x | | | x |
| AC-3 | | x | | | x |
| AC-4 | | x | | | x |
| AC-5 | | | x | | x |
| AC-6 | | x | | | x |
| AC-7 | | | x | | x |
| AC-8 | | | | x | x |
