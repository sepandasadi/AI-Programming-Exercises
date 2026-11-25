# Spec: Triage holidays (v0)

Status: draft · Owner: Sepand · Amends: `issue-triage.md`

## Problem

Respond-by deadlines from `POST /triage` count team
holidays as business days, so an issue filed before a
holiday gets a deadline nobody is there to meet. The
issue-triage spec ruled holidays out (non-goal "No
holidays"); this spec adds them, so that non-goal no
longer applies once this spec is approved.

## Goal

An operator lists the team's holidays in `RELAY_HOLIDAYS`,
and the business clock behind respond-by skips those dates.

## Non-goals

- No per-team or per-issue holiday lists; one list for the
  whole API, read once at startup.
- No half days, no time zones other than UTC, no
  recurring rules ("every 25 December"), no holiday
  calendars fetched from anywhere.
- No change to the P0 calendar clock.
- No new endpoint to read or change the list.

## Behavior

A **holiday** is a calendar date `YYYY-MM-DD` (UTC). It
covers that whole UTC day, 00:00 to 24:00.

A **business window** is as in `issue-triage.md` (Monday
to Friday, 09:00 inclusive to 17:00 exclusive, UTC), except
that a holiday has no window. Everything else about
business time and respond-by (start at the next opening,
the 17:00 rule, the SLA table) is unchanged.

**`RELAY_HOLIDAYS`** is a comma-separated list of holidays.
Whitespace around entries is ignored, empty entries (from
a trailing comma, say) are ignored, and duplicates count
once. Unset or blank means no holidays, which gives
exactly the issue-triage behavior. An entry that is not a
real calendar date in `YYYY-MM-DD` form (`2026-02-30`,
`2026-1-5`, `25/12/2026`) stops the API at startup with an
error that names `RELAY_HOLIDAYS` and the bad entry.

A holiday on a Saturday or Sunday changes nothing.

## Acceptance criteria

- AC-1: A weekday holiday has no business window: business
  time that would run into it continues at 09:00 on the
  next business day that is not a holiday.
- AC-2: An issue created on a holiday starts its clock at
  the next opening that is not on a holiday; consecutive
  holidays, and holidays next to a weekend, are all
  skipped.
- AC-3: The 17:00 rule still holds: a deadline that lands
  exactly at 17:00 on the business day before a holiday is
  that 17:00.
- AC-4: Holidays on a Saturday or Sunday, and holidays
  outside the span being counted, do not change
  respond-by. With no holidays, respond-by is as in
  `issue-triage.md`.
- AC-5: P0 respond-by is still `created_at` plus 60 minutes
  of calendar time, on a holiday too.
- AC-6: `RELAY_HOLIDAYS` is parsed as described above:
  whitespace, empty entries and duplicates are tolerated;
  unset or blank means none.
- AC-7: An invalid entry in `RELAY_HOLIDAYS` is an error
  naming the variable and the entry, raised before the API
  serves requests.
- AC-8: `POST /triage` uses the configured holidays for
  P1, P2 and P3 respond-by.

## Interface

```ts
// packages/core
addBusinessTime(
  start: Date,
  ms: number,
  holidays?: readonly string[], // YYYY-MM-DD, default []
): Date; // RangeError on an invalid holiday
triageIssue(
  issue: Issue,
  options?: { holidays?: readonly string[] },
): Triage;
isHolidayDate(s: string): boolean;
HolidayListSchema; // Zod: "a, b," -> sorted unique string[]

// apps/api
resolveHolidays(env?): string[]; // throws on bad input
createApp({ sections?, holidays? }): Hono;
```

```
RELAY_HOLIDAYS=2026-12-24,2026-12-25,2027-01-01
```

## Constraints

- No new runtime dependencies.
- Core stays pure: holidays are passed in, never read from
  the environment or a clock in core. The API reads and
  validates `RELAY_HOLIDAYS` with Zod at startup.
- `addBusinessTime` stays fast for long spans: it must not
  walk day by day across spans without holidays.

## Verification

- `pnpm spec:check docs/specs/triage-holidays.md` and
  `pnpm spec:check docs/specs/issue-triage.md` pass.
- `pnpm build && pnpm typecheck && pnpm test` pass.
- Manual: with `RELAY_HOLIDAYS=2026-11-30`, post
  `fixtures/issues/friday-outage.json` (Friday 16:30, P1):
  respond-by is `2026-12-01T12:30:00.000Z` (Tuesday)
  instead of Monday. With
  `RELAY_HOLIDAYS=2026-13-01`, `pnpm dev` fails at startup.

## Open questions

None. Decisions taken while drafting, for the owner to
confirm: holidays are whole UTC days; P0 ignores them;
an invalid entry fails startup rather than being skipped;
empty entries and duplicates are tolerated.
