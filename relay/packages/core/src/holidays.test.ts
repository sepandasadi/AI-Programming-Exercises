// spec: triage-holidays
import { describe, expect, it } from "vitest";
import {
  HolidayListSchema,
  isHolidayDate,
} from "./holidays.js";

describe("isHolidayDate", () => {
  it("accepts real calendar dates in YYYY-MM-DD form", () => {
    for (const ok of [
      "2026-12-25",
      "2028-02-29",
      "2027-01-01",
    ]) {
      expect(isHolidayDate(ok)).toBe(true);
    }
  });

  it("rejects other forms and impossible dates", () => {
    for (const bad of [
      "2026-02-30",
      "2027-02-29",
      "2026-13-01",
      "2026-00-10",
      "2026-1-5",
      "25/12/2026",
      "2026-12-25T00:00:00Z",
      " 2026-12-25",
      "",
    ]) {
      expect(isHolidayDate(bad)).toBe(false);
    }
  });
});

describe("HolidayListSchema", () => {
  const parse = (s: string) => HolidayListSchema.parse(s);

  it("AC-6: a comma-separated list parses to sorted dates", () => {
    expect(
      parse("2027-01-01,2026-12-24,2026-12-25"),
    ).toEqual(["2026-12-24", "2026-12-25", "2027-01-01"]);
  });

  it("AC-6: whitespace, empty entries and duplicates are tolerated", () => {
    expect(
      parse(" 2026-12-25 ,, 2026-12-24,2026-12-25 , "),
    ).toEqual(["2026-12-24", "2026-12-25"]);
  });

  it("AC-6: a blank list is no holidays", () => {
    expect(parse("")).toEqual([]);
    expect(parse("   ")).toEqual([]);
    expect(parse(" , ,")).toEqual([]);
  });

  it("AC-7: each invalid entry is named in the error", () => {
    const result = HolidayListSchema.safeParse(
      "2026-12-25,2026-02-30,tomorrow",
    );
    expect(result.success).toBe(false);
    const messages =
      result.error?.issues.map((i) => i.message) ?? [];
    expect(messages).toHaveLength(2);
    expect(messages[0]).toContain('"2026-02-30"');
    expect(messages[1]).toContain('"tomorrow"');
  });
});
