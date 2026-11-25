// spec: stale-issues
import { describe, expect, it } from "vitest";
import type { Issue } from "@relay/core";
import { staleIssuesRoute } from "./stale-issues.js";

const issues: Issue[] = [
  {
    id: 1,
    title: "Old",
    state: "open",
    labels: [],
    updatedAt: "2026-10-01T00:00:00Z",
  },
];
const now = () => new Date("2026-11-24T00:00:00Z");
const app = staleIssuesRoute(issues, now);

describe("GET /stale", () => {
  it("AC-5: defaults days to 14", async () => {
    const res = await app.request("/stale");
    expect(res.status).toBe(200);
    expect((await res.json()).days).toBe(14);
  });

  it.each(["0", "366", "1.5", "abc", "1e1", "0x10", "+5"])(
    "AC-5: rejects days=%s with 400",
    async (days) => {
      const res = await app.request(`/stale?days=${days}`);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(typeof body.error).toBe("string");
    },
  );

  it("AC-7: returns 200 and [] when nothing is stale", async () => {
    const res = await app.request("/stale?days=365");
    expect(res.status).toBe(200);
    expect((await res.json()).issues).toEqual([]);
  });
});
