// spec: issue-triage
import { describe, expect, it } from "vitest";
import { type Issue, triageIssue } from "./triage.js";

// Calendar used below (all UTC): 2026-11-23 is a Monday,
// 2026-11-27 a Friday, 2026-11-28/29 the weekend, 2026-11-30
// the next Monday.
const MINUTE = 60 * 1000;

const issue = (over: Partial<Issue> = {}): Issue => ({
  number: 1,
  title: "Something happened",
  body: null,
  labels: [],
  createdAt: new Date("2026-11-23T09:00:00.000Z"),
  ...over,
});

const rule = (over: Partial<Issue>) => {
  const { priority, reason } = triageIssue(issue(over));
  return { priority, reason };
};

const respondBy = (
  createdAt: string,
  over: Partial<Issue>,
): string =>
  triageIssue(
    issue({ ...over, createdAt: new Date(createdAt) }),
  ).respondBy.toISOString();

describe("triageIssue: priority rules", () => {
  it("AC-1: a priority:pN label sets priority N", () => {
    for (const n of [0, 1, 2, 3]) {
      expect(rule({ labels: [`priority:p${n}`] })).toEqual({
        priority: `P${n}`,
        reason: `label priority:p${n}`,
      });
    }
  });

  it("AC-1: priority label case and surrounding space are ignored; the reason is lowercase", () => {
    expect(rule({ labels: ["  Priority:P1 "] })).toEqual({
      priority: "P1",
      reason: "label priority:p1",
    });
  });

  it("AC-1: with several priority labels, the most urgent wins", () => {
    expect(
      rule({
        labels: [
          "priority:p3",
          "PRIORITY:P0",
          "priority:p2",
        ],
      }),
    ).toEqual({
      priority: "P0",
      reason: "label priority:p0",
    });
  });

  it("AC-1: a priority label beats security, a title term and bug", () => {
    expect(
      rule({
        title: "Checkout outage",
        labels: ["bug", "security", "priority:p3"],
      }),
    ).toEqual({
      priority: "P3",
      reason: "label priority:p3",
    });
  });

  it("AC-1: labels that only look like priority labels are ignored", () => {
    expect(
      rule({
        labels: [
          "priority:p4",
          "priority: p1",
          "priority:p1x",
        ],
      }),
    ).toEqual({ priority: "P3", reason: "default" });
  });

  it("AC-2: a security label sets P1, case ignored", () => {
    expect(rule({ labels: [" Security "] })).toEqual({
      priority: "P1",
      reason: "label security",
    });
  });

  it("AC-2: each title term outage, incident and breach sets P1", () => {
    for (const term of ["outage", "incident", "breach"]) {
      expect(
        rule({ title: `Checkout ${term} in EU` }),
      ).toEqual({
        priority: "P1",
        reason: `title term ${term}`,
      });
    }
  });

  it("AC-2: title terms match whole terms, case-insensitively", () => {
    expect(
      rule({ title: "OUTAGE: checkout down" }),
    ).toEqual({
      priority: "P1",
      reason: "title term outage",
    });
    expect(rule({ title: "Review past outages" })).toEqual({
      priority: "P3",
      reason: "default",
    });
    expect(
      rule({ title: "Breaches report", labels: ["bug"] }),
    ).toEqual({
      priority: "P2",
      reason: "label bug",
    });
  });

  it("AC-2: the reason names the first matching term in title order", () => {
    expect(
      rule({ title: "Breach caused an outage" }),
    ).toEqual({
      priority: "P1",
      reason: "title term breach",
    });
  });

  it("AC-2: the security label is checked before title terms", () => {
    expect(
      rule({
        title: "Payment outage",
        labels: ["security"],
      }),
    ).toEqual({ priority: "P1", reason: "label security" });
  });

  it("AC-2: security and title terms beat a bug label", () => {
    expect(rule({ labels: ["bug", "security"] })).toEqual({
      priority: "P1",
      reason: "label security",
    });
    expect(
      rule({ title: "Login incident", labels: ["bug"] }),
    ).toEqual({
      priority: "P1",
      reason: "title term incident",
    });
  });

  it("AC-2: terms in the body do not count", () => {
    expect(
      rule({
        title: "Checkout slow",
        body: "Feels like an outage",
      }),
    ).toEqual({ priority: "P3", reason: "default" });
  });

  it("AC-3: a bug label sets P2, case ignored", () => {
    expect(
      rule({ labels: ["enhancement", " BUG"] }),
    ).toEqual({
      priority: "P2",
      reason: "label bug",
    });
  });

  it("AC-3: anything else is P3 with reason default", () => {
    expect(rule({ labels: [] })).toEqual({
      priority: "P3",
      reason: "default",
    });
    expect(
      rule({
        title: "Add dark mode",
        labels: ["enhancement", "bugfix"],
      }),
    ).toEqual({ priority: "P3", reason: "default" });
  });

  it("returns the issue number", () => {
    expect(triageIssue(issue({ number: 42 })).number).toBe(
      42,
    );
  });
});

describe("triageIssue: respond-by", () => {
  const p0 = { labels: ["priority:p0"] };

  it("AC-4: P0 respond-by is 60 calendar minutes after created_at inside business hours", () => {
    expect(respondBy("2026-11-24T10:15:00.000Z", p0)).toBe(
      "2026-11-24T11:15:00.000Z",
    );
  });

  it("AC-4: P0 respond-by runs on the calendar clock at night, across 17:00 and midnight", () => {
    expect(respondBy("2026-11-24T16:30:00.000Z", p0)).toBe(
      "2026-11-24T17:30:00.000Z",
    );
    expect(respondBy("2026-11-24T23:30:00.000Z", p0)).toBe(
      "2026-11-25T00:30:00.000Z",
    );
  });

  it("AC-4: P0 respond-by runs on the calendar clock at the weekend", () => {
    expect(respondBy("2026-11-28T03:00:00.000Z", p0)).toBe(
      "2026-11-28T04:00:00.000Z",
    );
    expect(respondBy("2026-11-29T23:59:59.999Z", p0)).toBe(
      "2026-11-30T00:59:59.999Z",
    );
  });

  it("AC-4: P0 respond-by is exactly 60 minutes to the millisecond", () => {
    const createdAt = new Date("2026-11-27T16:30:00.123Z");
    const { respondBy: due } = triageIssue(
      issue({ ...p0, createdAt }),
    );
    expect(due.getTime() - createdAt.getTime()).toBe(
      60 * MINUTE,
    );
  });

  it("AC-5: P1 respond-by is 4 business hours after created_at", () => {
    expect(
      respondBy("2026-11-23T09:00:00.000Z", {
        labels: ["security"],
      }),
    ).toBe("2026-11-23T13:00:00.000Z");
  });

  it("AC-5: P1 from a title term on Friday 16:30 is due Monday 12:30 (spec example)", () => {
    const due = respondBy("2026-11-27T16:30:00.000Z", {
      title: "Checkout outage",
    });
    expect(due).toBe("2026-11-30T12:30:00.000Z");
  });

  it("AC-5: P2 respond-by is 16 business hours after created_at", () => {
    expect(
      respondBy("2026-11-25T10:00:00.000Z", {
        labels: ["bug"],
      }),
    ).toBe("2026-11-27T10:00:00.000Z");
  });

  it("AC-5: P3 respond-by is 40 business hours after created_at", () => {
    expect(respondBy("2026-11-27T16:30:00.000Z", {})).toBe(
      "2026-12-04T16:30:00.000Z",
    );
  });

  it("AC-5: a P1 created at the weekend starts its business clock at 09:00 Monday", () => {
    expect(
      respondBy("2026-11-28T12:00:00.000Z", {
        labels: ["priority:p1"],
      }),
    ).toBe("2026-11-30T13:00:00.000Z");
  });

  it("does not mutate the issue's createdAt", () => {
    const createdAt = new Date("2026-11-27T16:30:00.000Z");
    triageIssue(issue({ ...p0, createdAt }));
    triageIssue(issue({ createdAt }));
    expect(createdAt.toISOString()).toBe(
      "2026-11-27T16:30:00.000Z",
    );
  });

  it("rejects an invalid createdAt on every clock", () => {
    const createdAt = new Date("not a date");
    expect(() =>
      triageIssue(issue({ ...p0, createdAt })),
    ).toThrow(RangeError);
    expect(() => triageIssue(issue({ createdAt }))).toThrow(
      RangeError,
    );
  });
});
