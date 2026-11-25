// spec: triage-holidays
import { describe, expect, it } from "vitest";
import { addBusinessTime } from "./business-time.js";

// Calendar used below (all UTC): 2026-11-23 is a Monday,
// 2026-11-26 a Thursday, 2026-11-27 a Friday, 2026-11-28/29
// the weekend, 2026-11-30 the next Monday. 2026-12-24 and
// 2026-12-25 are Thursday and Friday; 2027-01-01 is a Friday.
const MS = 1;
const HOUR = 60 * 60 * 1000;

const add = (
  startIso: string,
  ms: number,
  holidays: string[],
): string =>
  addBusinessTime(
    new Date(startIso),
    ms,
    holidays,
  ).toISOString();

describe("addBusinessTime with holidays", () => {
  it("AC-1: time remaining at 17:00 before a holiday continues at 09:00 the day after it", () => {
    // Wednesday 15:00-17:00 counts 2 h; Thursday is a holiday.
    expect(
      add("2026-11-25T15:00:00.000Z", 4 * HOUR, [
        "2026-11-26",
      ]),
    ).toBe("2026-11-27T11:00:00.000Z");
  });

  it("AC-1: carries over to the millisecond across a holiday", () => {
    expect(
      add("2026-11-25T16:59:59.999Z", 2 * MS, [
        "2026-11-26",
      ]),
    ).toBe("2026-11-27T09:00:00.001Z");
  });

  it("AC-1: time remaining at 17:00 Friday skips the weekend and a Monday holiday", () => {
    // The issue-triage example (friday-outage) moves from Monday to Tuesday.
    expect(
      add("2026-11-27T16:30:00.000Z", 4 * HOUR, [
        "2026-11-30",
      ]),
    ).toBe("2026-12-01T12:30:00.000Z");
  });

  it("AC-1: a holiday inside a 40-hour span pushes the deadline one business day", () => {
    // Without the holiday: Friday 2026-11-27 17:00.
    expect(
      add("2026-11-23T09:00:00.000Z", 40 * HOUR, [
        "2026-11-26",
      ]),
    ).toBe("2026-11-30T17:00:00.000Z");
  });

  it("AC-1: a long span counts every weekday holiday in it", () => {
    // 400 h (50 business days) from Monday 2026-11-23 09:00 ends Friday
    // 2027-01-29 17:00; three weekday holidays add three business days.
    const holidays = [
      "2026-12-24",
      "2026-12-25",
      "2027-01-01",
    ];
    expect(
      add("2026-11-23T09:00:00.000Z", 400 * HOUR, []),
    ).toBe("2027-01-29T17:00:00.000Z");
    expect(
      add("2026-11-23T09:00:00.000Z", 400 * HOUR, holidays),
    ).toBe("2027-02-03T17:00:00.000Z");
  });

  it("AC-2: an issue created during a holiday starts at 09:00 the next business day", () => {
    expect(
      add("2026-11-26T10:00:00.000Z", 1 * HOUR, [
        "2026-11-26",
      ]),
    ).toBe("2026-11-27T10:00:00.000Z");
  });

  it("AC-2: a start before 09:00 on a holiday does not start the clock that day", () => {
    expect(
      add("2026-11-26T06:00:00.000Z", 1 * HOUR, [
        "2026-11-26",
      ]),
    ).toBe("2026-11-27T10:00:00.000Z");
  });

  it("AC-2: consecutive holidays before a weekend are all skipped", () => {
    // Wednesday 17:30 -> Thursday and Friday holidays -> weekend -> Monday.
    expect(
      add("2026-12-23T17:30:00.000Z", 1 * HOUR, [
        "2026-12-24",
        "2026-12-25",
      ]),
    ).toBe("2026-12-28T10:00:00.000Z");
  });

  it("AC-2: a start on Saturday skips a Monday holiday", () => {
    expect(
      add("2026-11-28T12:00:00.000Z", 1 * HOUR, [
        "2026-11-30",
      ]),
    ).toBe("2026-12-01T10:00:00.000Z");
  });

  it("AC-2: a start at 00:00 on the day after a holiday counts from 09:00 that day", () => {
    expect(
      add("2026-11-27T00:00:00.000Z", 1 * HOUR, [
        "2026-11-26",
      ]),
    ).toBe("2026-11-27T10:00:00.000Z");
  });

  it("AC-3: a deadline that lands on 17:00 before a holiday is that 17:00", () => {
    expect(
      add("2026-11-25T13:00:00.000Z", 4 * HOUR, [
        "2026-11-26",
      ]),
    ).toBe("2026-11-25T17:00:00.000Z");
    expect(
      add("2026-11-25T09:00:00.000Z", 8 * HOUR, [
        "2026-11-26",
      ]),
    ).toBe("2026-11-25T17:00:00.000Z");
  });

  it("AC-3: a deadline reached after skipping a holiday still lands on 17:00", () => {
    expect(
      add("2026-11-25T13:00:00.000Z", 12 * HOUR, [
        "2026-11-26",
      ]),
    ).toBe("2026-11-27T17:00:00.000Z");
  });

  it("AC-4: holidays on a Saturday or Sunday change nothing", () => {
    expect(
      add("2026-11-27T16:30:00.000Z", 4 * HOUR, [
        "2026-11-28",
        "2026-11-29",
      ]),
    ).toBe("2026-11-30T12:30:00.000Z");
  });

  it("AC-4: holidays outside the span change nothing", () => {
    expect(
      add("2026-11-27T16:30:00.000Z", 4 * HOUR, [
        "2026-01-01",
        "2026-11-20",
        "2026-12-01",
        "2027-06-01",
      ]),
    ).toBe("2026-11-30T12:30:00.000Z");
  });

  it("AC-4: no holidays is the same as omitting them", () => {
    const start = new Date("2026-11-27T16:30:00.000Z");
    expect(addBusinessTime(start, 40 * HOUR, [])).toEqual(
      addBusinessTime(start, 40 * HOUR),
    );
  });

  it("order and duplicates in the list do not matter", () => {
    expect(
      add("2026-12-23T17:30:00.000Z", 1 * HOUR, [
        "2026-12-25",
        "2026-12-24",
        "2026-12-25",
      ]),
    ).toBe("2026-12-28T10:00:00.000Z");
  });

  it("rejects a holiday that is not a YYYY-MM-DD date", () => {
    const start = new Date("2026-11-23T09:00:00.000Z");
    for (const bad of [
      "2026-02-30",
      "2026-1-5",
      "2026-11-26T00:00:00Z",
      "",
    ]) {
      expect(() =>
        addBusinessTime(start, HOUR, [bad]),
      ).toThrow(RangeError);
    }
  });

  it("still rejects a result Date cannot hold, with holidays", () => {
    expect(() =>
      addBusinessTime(
        new Date("2026-11-23T09:00Z"),
        1e300,
        ["2026-11-26", "2027-01-01"],
      ),
    ).toThrow(RangeError);
  });
});
