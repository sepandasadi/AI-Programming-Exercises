// spec: stale-issues
import { describe, expect, it } from "vitest";
import { type Issue, staleIssues } from "./stale.js";

const now = new Date("2026-11-24T12:00:00Z");
const DAY = 24 * 60 * 60 * 1000;

function issue(p: Partial<Issue> & { id: number }): Issue {
  return {
    title: `Issue ${p.id}`,
    state: "open",
    labels: [],
    updatedAt: "2026-01-01T00:00:00Z",
    ...p,
  };
}

const ago = (ms: number) =>
  new Date(now.getTime() - ms).toISOString();

describe("staleIssues", () => {
  it("AC-1: returns only open issues", () => {
    const r = staleIssues(
      [issue({ id: 1 }), issue({ id: 2, state: "closed" })],
      now,
      14,
    );
    expect(r.map((i) => i.id)).toEqual([1]);
  });

  it("AC-2: never returns on-hold issues", () => {
    const r = staleIssues(
      [issue({ id: 1, labels: ["On-Hold"] })],
      now,
      14,
    );
    expect(r).toEqual([]);
  });

  it("AC-3: stale at exactly days x 24h, not 1s later", () => {
    const r = staleIssues(
      [
        issue({ id: 1, updatedAt: ago(14 * DAY) }),
        issue({ id: 2, updatedAt: ago(14 * DAY - 1000) }),
      ],
      now,
      14,
    );
    expect(r.map((i) => i.id)).toEqual([1]);
  });

  it("AC-4: oldest first, then by id", () => {
    const old = ago(40 * DAY);
    const r = staleIssues(
      [
        issue({ id: 3, updatedAt: ago(20 * DAY) }),
        issue({ id: 2, updatedAt: old }),
        issue({ id: 1, updatedAt: old }),
      ],
      now,
      14,
    );
    expect(r.map((i) => i.id)).toEqual([1, 2, 3]);
  });

  it("AC-6: reports whole days stale, rounded down", () => {
    const at = ago(15 * DAY + 5 * 60 * 60 * 1000);
    const [r] = staleIssues(
      [issue({ id: 1, updatedAt: at })],
      now,
      14,
    );
    expect(r).toEqual({
      id: 1,
      title: "Issue 1",
      updatedAt: at,
      daysStale: 15,
    });
  });
});
