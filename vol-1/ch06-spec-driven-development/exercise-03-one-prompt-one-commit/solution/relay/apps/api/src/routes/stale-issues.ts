import { Hono } from "hono";
import { z } from "zod";
import { type Issue, staleIssues } from "@relay/core";

const Query = z.object({
  days: z.coerce.number().int().min(1).max(365).default(14),
});

export function staleIssuesRoute(
  issues: Issue[],
  now: () => Date = () => new Date(),
): Hono {
  const app = new Hono();
  app.get("/stale", (c) => {
    const q = Query.safeParse({ days: c.req.query("days") });
    if (!q.success) {
      return c.json({ error: "days must be 1 to 365" }, 400);
    }
    const { days } = q.data;
    return c.json({
      days,
      issues: staleIssues(issues, now(), days),
    });
  });
  return app;
}
