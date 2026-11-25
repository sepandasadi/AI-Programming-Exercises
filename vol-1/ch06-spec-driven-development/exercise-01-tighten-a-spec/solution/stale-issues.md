# Spec: Stale issue report (v0)

Status: approved · Owner: you · Chapter: Vol. 1, Ch. 6

## Problem

Issues that nobody has touched for weeks hide real work
and real bugs. The team wants a list of them to review in
the weekly triage meeting.

## Goal

`GET /issues/stale` returns the open issues that have not
been updated for a given number of days, oldest first.

## Non-goals

- No writes: Relay does not comment on or close issues.
- No GitHub API calls: issues come from a JSON file
  (`fixtures/issues.json`) until a later chapter.
- No notifications or scheduling.

## Behavior

An issue is *stale* when `state` is `"open"`, it has no
`on-hold` label, and `now - updatedAt` is at least `days`
whole days (24-hour periods).

## Acceptance criteria

- AC-1: Only open issues are returned.
- AC-2: Issues labelled `on-hold` (case-insensitive) are
  never returned.
- AC-3: An issue updated exactly `days` x 24 hours ago is
  stale; one updated a second later is not.
- AC-4: Results are ordered by `updatedAt` ascending, then
  `id` ascending.
- AC-5: `days` defaults to 14. It must be written as
  plain digits for an integer from 1 to 365; anything else
  (`0`, `366`, `1.5`, `1e1`, `0x10`) returns 400 with
  `{ "error": string }`.
- AC-6: Each result has `id`, `title`, `updatedAt` (ISO
  8601) and `daysStale` (whole days, rounded down).
- AC-7: When nothing is stale the response is 200 with
  `issues: []`.
- AC-8: An invalid issue file stops the server at startup
  with an error that names the file.

## Interface

```ts
// packages/core
type Issue = {
  id: number;
  title: string;
  state: "open" | "closed";
  labels: string[];
  updatedAt: string; // ISO 8601
};
type StaleIssue = {
  id: number;
  title: string;
  updatedAt: string;
  daysStale: number;
};
staleIssues(
  issues: Issue[],
  now: Date,
  days: number,
): StaleIssue[];
```

```
GET /issues/stale?days=30
200 { "days": 30, "issues": StaleIssue[] }
400 { "error": "..." }
```

## Constraints

- No new runtime dependencies.
- `staleIssues` is pure: the caller passes `now`, so tests
  never depend on the clock.

## Verification

- `pnpm spec:check docs/specs/stale-issues.md` passes.
- `pnpm build && pnpm typecheck && pnpm test` pass.

## Open questions

None.
