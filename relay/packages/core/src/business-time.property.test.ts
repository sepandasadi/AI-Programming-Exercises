// spec: issue-triage
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { addBusinessTime } from "./business-time.js";

const MINUTE = 60_000;
const HOUR = 60 * MINUTE;

/** The spec, read literally: walk the clock a minute at a time. */
function model(start: Date, minutes: number): Date {
  let t = start.getTime();
  let left = minutes;
  while (left > 0) {
    const d = new Date(t);
    const weekday =
      d.getUTCDay() >= 1 && d.getUTCDay() <= 5;
    const hour = d.getUTCHours();
    if (weekday && hour >= 9 && hour < 17) left--;
    t += MINUTE;
  }
  return new Date(t);
}

const RANGE = {
  min: new Date("2026-01-01T00:00:00Z"),
  max: new Date("2028-12-31T00:00:00Z"),
  noInvalidDate: true,
};
/** Any instant, to the millisecond. */
const instant = fc.date(RANGE);
/** Whole minutes only, so the model can follow. */
const minuteInstant = instant.map(
  (d) =>
    new Date(Math.floor(d.getTime() / MINUTE) * MINUTE),
);
const amount = fc.integer({ min: 1, max: 400 * HOUR });

/** After an opening and no later than a closing, on a weekday. */
function inWindow(d: Date): boolean {
  const day = d.getUTCDay();
  const sinceMidnight = d.getTime() % (24 * HOUR);
  return (
    day >= 1 &&
    day <= 5 &&
    sinceMidnight > 9 * HOUR &&
    sinceMidnight <= 17 * HOUR
  );
}

describe("addBusinessTime properties", () => {
  it("AC-5, AC-6, AC-7: agrees with a minute-by-minute model", () => {
    fc.assert(
      fc.property(
        minuteInstant,
        fc.integer({ min: 1, max: 100 * 60 }),
        (start, minutes) => {
          expect(
            addBusinessTime(start, minutes * MINUTE),
          ).toEqual(model(start, minutes));
        },
      ),
      { numRuns: 1000 },
    );
  });

  it("AC-6, AC-7: always lands inside a window", () => {
    fc.assert(
      fc.property(instant, amount, (start, ms) =>
        inWindow(addBusinessTime(start, ms)),
      ),
    );
  });

  it("AC-6: adding a then b is the same as adding a + b", () => {
    fc.assert(
      fc.property(instant, amount, amount, (s, a, b) => {
        const stepwise = addBusinessTime(
          addBusinessTime(s, a),
          b,
        );
        expect(stepwise).toEqual(addBusinessTime(s, a + b));
      }),
    );
  });

  it("AC-5: more time never gives an earlier deadline", () => {
    fc.assert(
      fc.property(instant, amount, amount, (s, a, b) => {
        const [lo, hi] = a <= b ? [a, b] : [b, a];
        return (
          addBusinessTime(s, lo).getTime() <=
          addBusinessTime(s, hi).getTime()
        );
      }),
    );
  });
});
