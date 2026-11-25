// spec: business-time-between
import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { addBusinessTime } from "./business-time.js";
import { businessTimeBetween } from "./business-time-between.js";

const HOUR = 60 * 60 * 1000;
const instant = fc.date({
  min: new Date("2026-01-01T00:00:00Z"),
  max: new Date("2028-12-31T00:00:00Z"),
  noInvalidDate: true,
});
const amount = fc.integer({ min: 1, max: 400 * HOUR });

describe("businessTimeBetween properties", () => {
  it("AC-1: undoes addBusinessTime (round trip)", () => {
    fc.assert(
      fc.property(instant, amount, (start, ms) => {
        const end = addBusinessTime(start, ms);
        expect(businessTimeBetween(start, end)).toBe(ms);
      }),
    );
  });

  it("AC-1: splitting the span changes nothing", () => {
    fc.assert(
      fc.property(instant, instant, instant, (x, y, z) => {
        // Sorting three dates keeps three dates; the cast tells
        // noUncheckedIndexedAccess so.
        const [a, b, c] = [x, y, z].sort(
          (p, q) => p.getTime() - q.getTime(),
        ) as [Date, Date, Date];
        expect(
          businessTimeBetween(a, b) +
            businessTimeBetween(b, c),
        ).toBe(businessTimeBetween(a, c));
      }),
    );
  });

  it("AC-2: never more than the calendar time", () => {
    fc.assert(
      fc.property(instant, instant, (x, y) => {
        const [a, b] = x <= y ? [x, y] : [y, x];
        return (
          businessTimeBetween(a, b) <=
          b.getTime() - a.getTime()
        );
      }),
    );
  });
});
