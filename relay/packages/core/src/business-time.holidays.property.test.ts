// spec: triage-holidays
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { addBusinessTime } from "./business-time.js";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/** The spec, read literally: walk the clock a minute at a time. */
function model(
  start: Date,
  minutes: number,
  holidays: readonly string[],
): Date {
  const off = new Set(
    holidays.map((h) => Date.parse(`${h}T00:00:00Z`) / DAY),
  );
  let t = start.getTime();
  let left = minutes;
  while (left > 0) {
    const d = new Date(t);
    const weekday =
      d.getUTCDay() >= 1 && d.getUTCDay() <= 5;
    const holiday = off.has(Math.floor(t / DAY));
    const hour = d.getUTCHours();
    if (weekday && !holiday && hour >= 9 && hour < 17) {
      left--;
    }
    t += MINUTE;
  }
  return new Date(t);
}

const RANGE = {
  min: new Date("2026-01-01T00:00:00Z"),
  max: new Date("2028-12-31T00:00:00Z"),
  noInvalidDate: true,
};
const instant = fc.date(RANGE);
const minuteInstant = instant.map(
  (d) =>
    new Date(Math.floor(d.getTime() / MINUTE) * MINUTE),
);
const amount = fc.integer({ min: 1, max: 400 * HOUR });

/** Up to 15 holidays within 60 days of `start`, so most fall in the span. */
const holidaysNear = (start: Date) =>
  fc
    .uniqueArray(fc.integer({ min: -2, max: 60 }), {
      maxLength: 15,
    })
    .map((offsets) =>
      offsets.map((n) =>
        new Date(start.getTime() + n * DAY)
          .toISOString()
          .slice(0, 10),
      ),
    );

const withHolidays = <T extends Date>(
  start: fc.Arbitrary<T>,
) =>
  start.chain((s) =>
    holidaysNear(s).map((h) => [s, h] as const),
  );

const isoDay = (t: number) =>
  new Date(t).toISOString().slice(0, 10);

describe("addBusinessTime properties, with holidays", () => {
  it("AC-1, AC-2, AC-3: agrees with a minute-by-minute model", () => {
    fc.assert(
      fc.property(
        withHolidays(minuteInstant),
        fc.integer({ min: 1, max: 100 * 60 }),
        ([start, holidays], minutes) => {
          expect(
            addBusinessTime(
              start,
              minutes * MINUTE,
              holidays,
            ),
          ).toEqual(model(start, minutes, holidays));
        },
      ),
      { numRuns: 1000 },
    );
  });

  it("AC-1, AC-2: never lands on a holiday, and always inside a window", () => {
    fc.assert(
      fc.property(
        withHolidays(instant),
        amount,
        ([start, holidays], ms) => {
          const t = addBusinessTime(
            start,
            ms,
            holidays,
          ).getTime();
          const day = new Date(t).getUTCDay();
          const sinceMidnight = t % DAY;
          return (
            !holidays.includes(isoDay(t)) &&
            day >= 1 &&
            day <= 5 &&
            sinceMidnight > 9 * HOUR &&
            sinceMidnight <= 17 * HOUR
          );
        },
      ),
    );
  });

  it("AC-1: adding a then b is the same as adding a + b", () => {
    fc.assert(
      fc.property(
        withHolidays(instant),
        amount,
        amount,
        ([s, h], a, b) => {
          const stepwise = addBusinessTime(
            addBusinessTime(s, a, h),
            b,
            h,
          );
          expect(stepwise).toEqual(
            addBusinessTime(s, a + b, h),
          );
        },
      ),
    );
  });

  it("AC-1: more holidays never give an earlier deadline", () => {
    fc.assert(
      fc.property(
        withHolidays(instant),
        amount,
        ([s, h], ms) =>
          addBusinessTime(s, ms, h).getTime() >=
          addBusinessTime(s, ms, h.slice(1)).getTime(),
      ),
    );
  });

  it("AC-4: weekend holidays never change the deadline", () => {
    fc.assert(
      fc.property(
        withHolidays(instant),
        amount,
        ([s, h], ms) => {
          const weekends = h.filter((d) => {
            const day = new Date(
              `${d}T00:00:00Z`,
            ).getUTCDay();
            return day === 0 || day === 6;
          });
          expect(addBusinessTime(s, ms, weekends)).toEqual(
            addBusinessTime(s, ms),
          );
        },
      ),
    );
  });
});
