// spec: issue-triage
import { describe, expect, it } from "vitest";
import { addBusinessTime } from "./business-time.js";

// Calendar used below (all UTC): 2026-11-23 is a Monday,
// 2026-11-27 a Friday, 2026-11-28/29 the weekend, 2026-11-30
// the next Monday.
const MS = 1;
const HOUR = 60 * 60 * 1000;

const add = (startIso: string, ms: number): string =>
  addBusinessTime(new Date(startIso), ms).toISOString();

describe("addBusinessTime", () => {
  it("AC-5: 4 business hours from Monday 09:00 is Monday 13:00", () => {
    expect(add("2026-11-23T09:00:00.000Z", 4 * HOUR)).toBe(
      "2026-11-23T13:00:00.000Z",
    );
  });

  it("AC-5: 16 business hours from Wednesday 10:00 is Friday 10:00", () => {
    expect(add("2026-11-25T10:00:00.000Z", 16 * HOUR)).toBe(
      "2026-11-27T10:00:00.000Z",
    );
  });

  it("AC-5: 40 business hours from Friday 16:30 is the next Friday 16:30", () => {
    expect(add("2026-11-27T16:30:00.000Z", 40 * HOUR)).toBe(
      "2026-12-04T16:30:00.000Z",
    );
  });

  it("AC-5: 4 business hours from Friday 16:30 is Monday 12:30 (spec example)", () => {
    expect(add("2026-11-27T16:30:00.000Z", 4 * HOUR)).toBe(
      "2026-11-30T12:30:00.000Z",
    );
  });

  it("AC-6: a start exactly at 09:00 counts from 09:00 (opening is inclusive)", () => {
    expect(add("2026-11-23T09:00:00.000Z", 1 * MS)).toBe(
      "2026-11-23T09:00:00.001Z",
    );
  });

  it("AC-6: a start before 09:00 on a weekday starts the clock at 09:00 that day", () => {
    expect(add("2026-11-24T06:15:00.000Z", 1 * HOUR)).toBe(
      "2026-11-24T10:00:00.000Z",
    );
  });

  it("AC-6: a start one millisecond before opening starts the clock at 09:00", () => {
    expect(add("2026-11-24T08:59:59.999Z", 1 * MS)).toBe(
      "2026-11-24T09:00:00.001Z",
    );
  });

  it("AC-6: a start at midnight Monday starts the clock at 09:00 Monday", () => {
    expect(add("2026-11-30T00:00:00.000Z", 1 * HOUR)).toBe(
      "2026-11-30T10:00:00.000Z",
    );
  });

  it("AC-6: a start exactly at 17:00 starts the clock at the next opening (closing is exclusive)", () => {
    expect(add("2026-11-24T17:00:00.000Z", 1 * HOUR)).toBe(
      "2026-11-25T10:00:00.000Z",
    );
  });

  it("AC-6: a start after 17:00 on a weekday starts the clock at 09:00 the next weekday", () => {
    expect(add("2026-11-24T21:30:00.000Z", 1 * HOUR)).toBe(
      "2026-11-25T10:00:00.000Z",
    );
  });

  it("AC-6: a start at 17:00 Friday starts the clock at 09:00 Monday", () => {
    expect(add("2026-11-27T17:00:00.000Z", 1 * HOUR)).toBe(
      "2026-11-30T10:00:00.000Z",
    );
  });

  it("AC-6: a start on Saturday starts the clock at 09:00 Monday", () => {
    expect(add("2026-11-28T12:00:00.000Z", 1 * HOUR)).toBe(
      "2026-11-30T10:00:00.000Z",
    );
  });

  it("AC-6: a start late on Sunday starts the clock at 09:00 Monday", () => {
    expect(add("2026-11-29T23:59:59.999Z", 1 * HOUR)).toBe(
      "2026-11-30T10:00:00.000Z",
    );
  });

  it("AC-6: time remaining at 17:00 carries over to the next opening, to the millisecond", () => {
    expect(add("2026-11-24T16:59:59.999Z", 2 * MS)).toBe(
      "2026-11-25T09:00:00.001Z",
    );
  });

  it("AC-6: time remaining at 17:00 Friday skips the weekend", () => {
    expect(add("2026-11-27T16:00:00.000Z", 2 * HOUR)).toBe(
      "2026-11-30T10:00:00.000Z",
    );
  });

  it("AC-6: business windows are UTC, whatever offset the start was written in", () => {
    // 08:30+01:00 is 07:30 UTC, before opening.
    expect(add("2026-11-24T08:30:00+01:00", 1 * HOUR)).toBe(
      "2026-11-24T10:00:00.000Z",
    );
    // 08:30-08:00 is 16:30 UTC, inside the window.
    expect(add("2026-11-24T08:30:00-08:00", 1 * HOUR)).toBe(
      "2026-11-25T09:30:00.000Z",
    );
  });

  it("AC-6: weekdays that are public holidays still count (no holidays)", () => {
    // Thursday 2026-12-31 into Friday 2027-01-01.
    expect(add("2026-12-31T16:00:00.000Z", 2 * HOUR)).toBe(
      "2027-01-01T10:00:00.000Z",
    );
  });

  it("AC-7: a deadline that lands on 17:00 is 17:00, not 09:00 the next day", () => {
    expect(add("2026-11-24T13:00:00.000Z", 4 * HOUR)).toBe(
      "2026-11-24T17:00:00.000Z",
    );
  });

  it("AC-7: a full 8-hour day from 09:00 ends at 17:00 the same day", () => {
    expect(add("2026-11-23T09:00:00.000Z", 8 * HOUR)).toBe(
      "2026-11-23T17:00:00.000Z",
    );
  });

  it("AC-7: a deadline on Friday 17:00 stays on Friday, not Monday 09:00", () => {
    expect(add("2026-11-23T09:00:00.000Z", 40 * HOUR)).toBe(
      "2026-11-27T17:00:00.000Z",
    );
  });

  it("AC-7: a deadline reached after carrying over still lands on 17:00", () => {
    expect(add("2026-11-26T13:00:00.000Z", 12 * HOUR)).toBe(
      "2026-11-27T17:00:00.000Z",
    );
  });

  it("AC-7: a start outside a window with exactly one day of time ends at 17:00", () => {
    expect(add("2026-11-28T12:00:00.000Z", 8 * HOUR)).toBe(
      "2026-11-30T17:00:00.000Z",
    );
  });

  it("rejects zero, negative and fractional amounts", () => {
    const start = new Date("2026-11-23T09:00:00.000Z");
    for (const ms of [0, -HOUR, 0.5, Number.NaN]) {
      expect(() => addBusinessTime(start, ms)).toThrow(
        RangeError,
      );
    }
  });

  it("rejects an invalid start and a result Date cannot hold", () => {
    expect(() =>
      addBusinessTime(new Date("not a date"), HOUR),
    ).toThrow(RangeError);
    expect(() =>
      addBusinessTime(new Date("2026-11-23T09:00Z"), 1e300),
    ).toThrow(RangeError);
  });

  it("throws instead of hanging when the result is beyond the Date range", () => {
    // Found in review: past 2^53 ms, adding a day no longer
    // changes the float, and the loop never ended.
    const start = new Date("2026-11-23T09:00:00.000Z");
    for (const ms of [
      1e16,
      Number.MAX_SAFE_INTEGER,
      1e20,
      Number.MAX_VALUE,
    ]) {
      expect(() => addBusinessTime(start, ms)).toThrow(
        RangeError,
      );
    }
    expect(() =>
      addBusinessTime(new Date(8.64e15 - HOUR), 2 * HOUR),
    ).toThrow(RangeError);
    // start + ms is in range, but the week skip overshoots it.
    for (const ms of [3e15, 8e15]) {
      expect(() => addBusinessTime(start, ms)).toThrow(
        RangeError,
      );
    }
    // The next opening is already past the last valid Date.
    expect(() =>
      addBusinessTime(new Date(8.64e15 - 2 * HOUR), HOUR),
    ).toThrow(RangeError);
  }, 2000);

  it("handles very large amounts that stay in range", () => {
    const start = new Date("2026-11-23T09:00:00.000Z");
    const half = 5e14;
    expect(addBusinessTime(start, 2 * half)).toEqual(
      addBusinessTime(addBusinessTime(start, half), half),
    );
  });

  it("does not mutate the start date", () => {
    const start = new Date("2026-11-27T16:30:00.000Z");
    addBusinessTime(start, 4 * HOUR);
    expect(start.toISOString()).toBe(
      "2026-11-27T16:30:00.000Z",
    );
  });
});
