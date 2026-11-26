# Spec: SLA table (v1)

Status: approved · Owner: Relay team

## Problem

People who file or triage issues want to know how soon each
priority gets a response, without reading `triage.ts`.

## Goal

`GET /sla` returns the respond-by allowance for each priority,
from the same table triage uses.

## Non-goals

- No changing SLAs through the API.
- No per-team or per-repo SLAs.
- No UI.

## Behavior

An *entry* is `{ priority, hours, clock }`: `hours` is the
allowance in whole hours, and `clock` is `"calendar"` (every
hour counts) or `"business"` (only Monday to Friday, 09:00 to
17:00 UTC count, as in `docs/specs/issue-triage.md`).

## Acceptance criteria

- AC-1: `GET /sla` returns 200 and `{ "priorities": [...] }`
  with exactly one entry per priority, ordered P0, P1, P2, P3.
- AC-2: The entries are P0 1 hour calendar, P1 4 hours
  business, P2 16 hours business, P3 40 hours business.
- AC-3: For an issue created on a Monday at 09:00 UTC, the
  respond-by time triage gives each priority is the start plus
  that priority's `hours` on its `clock`.

## Interface

- Core: `slaTable(): SlaEntry[]` and
  `type SlaEntry = { priority: Priority; hours: number;
  clock: "calendar" | "business" }`, exported from
  `@relay/core`.
- API: `GET /sla` → 200 `{ "priorities": SlaEntry[] }`.

## Constraints

- One table: `slaTable()` reads the table `triageIssue` uses;
  no second copy of the numbers.
- No new dependencies.

## Verification

- `pnpm spec:check docs/specs/sla-table.md` passes.
- `pnpm build && pnpm typecheck && pnpm test` pass.
- Manual: `pnpm build`, then
  `bash .agents/skills/add-api-route/scripts/smoke.sh /sla`
  prints the four entries and `HTTP 200`.

## Open questions

None.
