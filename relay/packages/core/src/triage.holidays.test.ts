// spec: triage-holidays
import { describe, expect, it } from "vitest";
import { type Issue, triageIssue } from "./triage.js";

// 2026-11-26 is a Thursday, 2026-11-27 a Friday, 2026-11-30
// a Monday (all UTC).
const issue = (over: Partial<Issue> = {}): Issue => ({
  number: 1,
  title: "Something happened",
  body: null,
  labels: [],
  createdAt: new Date("2026-11-25T15:00:00.000Z"),
  ...over,
});

const respondBy = (
  over: Partial<Issue>,
  holidays?: string[],
): string =>
  triageIssue(issue(over), {
    holidays,
  }).respondBy.toISOString();

describe("triageIssue with holidays", () => {
  it("AC-1: P1, P2 and P3 respond-by skip a weekday holiday", () => {
    const thanksgiving = ["2026-11-26"];
    // Wednesday 15:00 + 4 h, Thursday off: Friday 11:00.
    expect(
      respondBy({ labels: ["security"] }, thanksgiving),
    ).toBe("2026-11-27T11:00:00.000Z");
    // + 16 h: Wed 2 h, Fri 8 h, Mon 6 h -> Monday 15:00.
    expect(
      respondBy({ labels: ["bug"] }, thanksgiving),
    ).toBe("2026-11-30T15:00:00.000Z");
    // + 40 h: one business day later than without the holiday.
    expect(respondBy({}, thanksgiving)).toBe(
      "2026-12-03T15:00:00.000Z",
    );
    expect(respondBy({})).toBe("2026-12-02T15:00:00.000Z");
  });

  it("AC-4: without holidays, respond-by is unchanged", () => {
    const at = { labels: ["security"] };
    expect(respondBy(at, [])).toBe(respondBy(at));
    expect(
      triageIssue(issue(at)).respondBy.toISOString(),
    ).toBe("2026-11-26T11:00:00.000Z");
  });

  it("AC-5: P0 respond-by is 60 calendar minutes, on a holiday too", () => {
    expect(
      respondBy(
        {
          labels: ["priority:p0"],
          createdAt: new Date("2026-11-26T10:00:00.000Z"),
        },
        ["2026-11-26"],
      ),
    ).toBe("2026-11-26T11:00:00.000Z");
  });
});
