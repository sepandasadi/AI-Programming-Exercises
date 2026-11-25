# Spec: Business time between two instants (v0)

Status: approved · Chapter: Vol. 1, Ch. 7, exercise 1

## Problem

Relay can compute a respond-by time (`addBusinessTime`).
To report how long an issue actually waited, it needs the
inverse: how much business time passed between two
instants.

## Goal

`businessTimeBetween(start, end)` returns the business time
in milliseconds between two instants.

## Non-goals

- No holidays, no time zones other than UTC.

## Behavior

Business windows are as in `docs/specs/issue-triage.md`:
Monday to Friday, 09:00 (inclusive) to 17:00 (exclusive),
UTC. The result is the length of the part of
`[start, end)` that lies inside windows.

## Acceptance criteria

- AC-1: Time inside windows counts to the millisecond,
  across any number of days and weeks.
- AC-2: Time outside windows (nights, weekends) does not
  count.
- AC-3: 09:00 is inside a window and 17:00 is not.
- AC-4: `start` equal to `end` gives 0; `end` before
  `start`, or an invalid Date, throws a `RangeError`.

## Interface

```ts
// packages/core/src/business-time-between.ts
businessTimeBetween(start: Date, end: Date): number;
```

## Constraints

- No new dependencies. Pure: no `Date.now()`, no I/O.

## Verification

- `pnpm spec:check docs/specs/business-time-between.md`
- `pnpm build && pnpm typecheck && pnpm test`

## Open questions

None.
