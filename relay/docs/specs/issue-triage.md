# Spec: Issue triage (v0)

Status: approved · Owner: Sepand · Chapter: Vol. 1, Ch. 7

## Problem

New issues sit unread until someone happens to look, and
urgent ones get the same wait as feature requests. Relay
should give every new issue a priority and a respond-by
time the moment it arrives, using rules the team can read.

## Goal

`POST /triage` takes a GitHub-style issue and returns its
priority, the rule that decided it, and the time by which
someone should respond.

## Non-goals

- No time zones other than UTC, and no per-team hours.
- No holidays.
- No LLM or keyword-model triage (Vol. 2).
- No storage, no webhooks, no assignment to people.

## Behavior

**Priority** is one of `P0` (most urgent) to `P3`. The
rules are tried in order and the first that applies
decides. Label names compare case-insensitively after
trimming.

1. A label `priority:p0` to `priority:p3` sets that
   priority. If there are several, the most urgent wins.
2. A label `security` sets `P1`.
3. A title term `outage`, `incident` or `breach` sets
   `P1`. Terms are as in docs search (`tokenize` in core):
   whole terms, case-insensitive, so `outages` does not
   match.
4. A label `bug` sets `P2`.
5. Otherwise `P3`.

The **reason** names the rule: `label priority:p1`,
`label security`, `title term outage` (the first matching
term in title order), `label bug` or `default`.

The **SLA** is the time allowed before respond-by:

| Priority | SLA | Clock |
| --- | --- | --- |
| P0 | 60 minutes | calendar |
| P1 | 4 hours | business |
| P2 | 16 hours | business |
| P3 | 40 hours | business |

**Business time** is time inside a business window:
Monday to Friday, from 09:00 (inclusive) to 17:00
(exclusive), UTC. The business clock runs only inside a
window, counted to the millisecond. An issue created
outside a window starts its clock at the next opening.

**Respond-by** is the earliest instant at which the clock,
started at `created_at`, has counted the full SLA. So a
deadline that lands exactly on a closing time is that
closing time (17:00), not the next opening.

## Acceptance criteria

- AC-1: A `priority:pN` label sets priority N, label case
  ignored; with several, the most urgent wins. Reason
  `label priority:pN`, lowercase.
- AC-2: With no priority label, a `security` label, or a
  title term `outage`, `incident` or `breach`, sets `P1`.
  The label is checked first. Reasons `label security` or
  `title term <term>`.
- AC-3: Otherwise a `bug` label sets `P2` (`label bug`);
  anything else is `P3` (`default`).
- AC-4: P0 respond-by is `created_at` plus 60 minutes of
  calendar time, on any day and at any hour.
- AC-5: P1, P2 and P3 respond-by is `created_at` plus 4, 16
  and 40 business hours.
- AC-6: Business time counts only Monday to Friday, 09:00
  to 17:00 UTC; an issue created outside those hours
  starts its clock at the next opening.
- AC-7: A deadline that falls exactly at 17:00 is 17:00
  that day, not 09:00 the next business day.
- AC-8: `created_at` with a UTC offset is read correctly;
  `respondBy` is UTC in `Date.toISOString()` form
  (`2026-11-27T13:00:00.000Z`).
- AC-9: Labels may be strings or objects with a `name`
  (GitHub sends objects); unknown fields are ignored.
- AC-10: Malformed JSON, a missing or invalid field, a
  `created_at` without an offset, or a blank title or one
  over 256 characters returns 400 with
  `{ "error": string }`.

## Interface

```ts
// packages/core
type Priority = "P0" | "P1" | "P2" | "P3";
type Issue = {
  number: number;
  title: string;
  body: string | null;
  labels: string[];
  createdAt: Date;
};
type Triage = {
  number: number;
  priority: Priority;
  reason: string;
  respondBy: Date;
};
addBusinessTime(start: Date, ms: number): Date;
triageIssue(issue: Issue): Triage;
IssueSchema; // Zod: GitHub payload -> Issue
```

```
POST /triage   (JSON body: a GitHub issue)
200 { "number", "priority", "reason", "respondBy" }
400 { "error": "..." }
```

Input fields: `number` (positive integer), `title`
(string), `body` (string, null or absent), `labels` (array
of at most 100 strings or `{ name: string }`), `created_at`
(ISO 8601 date-time with `Z` or `±hh:mm`).

## Constraints

- No new runtime dependencies.
- Core stays pure: no `Date.now()`, no I/O. The route
  validates with Zod and calls core.

## Verification

- `pnpm spec:check docs/specs/issue-triage.md` passes.
- `pnpm build && pnpm typecheck && pnpm test` pass.
- Manual: start the API and post
  `fixtures/issues/friday-outage.json` (created Friday
  2026-11-27 16:30 UTC, title "Checkout outage"):
  `curl -s -X POST localhost:3000/triage
  -H 'content-type: application/json'
  -d @fixtures/issues/friday-outage.json` returns `P1`,
  reason `title term outage`, respond-by
  `2026-11-30T12:30:00.000Z` (Monday).

## Open questions

None.
