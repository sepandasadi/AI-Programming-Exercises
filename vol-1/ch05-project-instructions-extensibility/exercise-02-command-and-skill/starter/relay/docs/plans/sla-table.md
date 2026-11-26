# Plan: SLA table

Spec: `docs/specs/sla-table.md`. Each task is one reviewable
commit and leaves the build green. Verify every task with
`pnpm build && pnpm typecheck && pnpm test`.

- [ ] **Task 1: `slaTable` in core.**
  Files: `packages/core/src/triage.ts`,
  `packages/core/src/sla.test.ts`, `packages/core/src/index.ts`.
  ACs: AC-2, AC-3.
- [ ] **Task 2: `GET /sla`.**
  Files: `apps/api/src/app.ts`, `apps/api/src/app.sla.test.ts`,
  `README.md`. ACs: AC-1.
  Verify: also the smoke check from the spec.
