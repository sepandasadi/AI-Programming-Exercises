// spec: sla-table
import { describe, expect, it } from "vitest";
import { addBusinessTime } from "./business-time.js";
import {
  type Priority,
  slaTable,
  triageIssue,
} from "./triage.js";

const HOUR = 60 * 60 * 1000;

describe("slaTable", () => {
  it("AC-2: P0 1h calendar, P1 4h, P2 16h, P3 40h business", () => {
    expect(slaTable()).toEqual([
      { priority: "P0", hours: 1, clock: "calendar" },
      { priority: "P1", hours: 4, clock: "business" },
      { priority: "P2", hours: 16, clock: "business" },
      { priority: "P3", hours: 40, clock: "business" },
    ]);
  });

  it("AC-3: triage's respond-by matches the table, from Monday 09:00", () => {
    // 2026-11-23 is a Monday.
    const createdAt = new Date("2026-11-23T09:00:00Z");
    const expected: Record<Priority, string> = {
      P0: "2026-11-23T10:00:00.000Z",
      P1: "2026-11-23T13:00:00.000Z",
      P2: "2026-11-24T17:00:00.000Z",
      P3: "2026-11-27T17:00:00.000Z",
    };
    for (const { priority, hours, clock } of slaTable()) {
      const n = priority.slice(1);
      const { respondBy } = triageIssue({
        number: 1,
        title: "x",
        body: null,
        labels: [`priority:p${n}`],
        createdAt,
      });
      const fromTable =
        clock === "calendar"
          ? new Date(createdAt.getTime() + hours * HOUR)
          : addBusinessTime(createdAt, hours * HOUR);
      expect(respondBy.toISOString()).toBe(
        expected[priority],
      );
      expect(respondBy).toEqual(fromTable);
    }
  });
});
