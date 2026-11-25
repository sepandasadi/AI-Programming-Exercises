# Solution: the lab bug

**The bug, in user terms:** an issue created during business hours on
a holiday is clocked as if the holiday were a working day. A P1 filed
at 10:00 on holiday Thursday 2026-11-26 is due at 14:00 that Thursday;
it should be due at 13:00 on Friday 2026-11-27.

**Where:** `nextBusinessInstant` in `relay/packages/core/src/business-time.ts`.
Its early return ("already inside a window") checks `isBusinessDay(day)`,
which knows only weekdays. The new `isOpenDay`, which also checks
holidays, is used only in the loop that looks for the next day.

**Why the tests pass:** the test "a start on a holiday starts the clock
at the next open day" starts at 07:30, before opening, so it takes the
loop path. No test starts inside a window on a holiday, and the
property test's model knows nothing about holidays.

**A failing example** (add to the `holidays` block in
`business-time.test.ts`):

```ts
it("a start inside the window on a holiday counts nothing that day", () => {
  expect(
    addH("2026-11-26T10:00:00.000Z", 4 * HOUR, ["2026-11-26"]),
  ).toBe("2026-11-27T13:00:00.000Z");
});
```

**The fix:** one word.

```ts
if (isOpenDay(day) && offset >= OPEN && offset < CLOSE) {
```

**The property that finds it without knowing where to look:** extend
the model in `business-time.property.test.ts` to skip holidays (a day
counts only if it is a weekday and `holidays` doesn't include its
`YYYY-MM-DD`) and compare against it with a few random holidays near
the start. The unedited agent runs on `lab/v1-ch07-run1-ticket` and
`lab/v1-ch07-run2-terse` both contain such a property; on the lab
branch it was removed.

## What the checklist would have caught

- **Tests (item 2):** the test's title says "a start on a holiday", and
  its input is the one start time on a holiday that can't fail.
- **Boundaries (item 4):** "the day of the start" has two cases, before
  opening and inside the window; only one is tested.
- **Duplication (item 8):** `isOpenDay` and `isBusinessDay` both exist
  in one function, and the early return uses the wrong one.

## Two agent reviewers on the same pull request

See the chapter, section 7.6, for the full comparison. In short: a
briefed reviewer that was told to confirm each finding by running code
found this bug, with the failing inputs. It also found a test whose
result is the same with and without its holiday ("a deadline at 17:00
before a holiday stays at 17:00"), which was a real weakness in the
original agent run, not a planted one.
