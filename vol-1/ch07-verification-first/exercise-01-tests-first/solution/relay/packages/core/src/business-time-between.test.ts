// spec: business-time-between
import { describe, expect, it } from "vitest";
import { businessTimeBetween } from "./business-time-between.js";

const HOUR = 60 * 60 * 1000;
const between = (a: string, b: string) =>
  businessTimeBetween(new Date(a), new Date(b));

describe("businessTimeBetween", () => {
  it("AC-1: counts time inside one window", () => {
    expect(
      between("2026-11-23T10:00Z", "2026-11-23T12:30Z"),
    ).toBe(2.5 * HOUR);
  });
  it("AC-2: ignores time before opening and after closing", () => {
    expect(
      between("2026-11-23T06:00Z", "2026-11-23T20:00Z"),
    ).toBe(8 * HOUR);
  });
  it("AC-2: ignores weekends", () => {
    expect(
      between("2026-11-27T16:00Z", "2026-11-30T10:00Z"),
    ).toBe(2 * HOUR);
  });
  it("AC-3: the window is [09:00, 17:00)", () => {
    expect(
      between("2026-11-23T17:00Z", "2026-11-24T09:00Z"),
    ).toBe(0);
    expect(
      between(
        "2026-11-23T16:59:59.999Z",
        "2026-11-24T09:00:00.001Z",
      ),
    ).toBe(2);
  });
  it("AC-4: equal instants give 0; end before start throws", () => {
    expect(
      between("2026-11-23T10:00Z", "2026-11-23T10:00Z"),
    ).toBe(0);
    expect(() =>
      between("2026-11-23T10:00Z", "2026-11-23T09:00Z"),
    ).toThrow(RangeError);
    expect(() =>
      between("not a date", "2026-11-23T09:00Z"),
    ).toThrow(RangeError);
  });
  it("AC-1: a full week is 40 hours", () => {
    expect(
      between("2026-11-23T00:00Z", "2026-11-30T00:00Z"),
    ).toBe(40 * HOUR);
  });
});
