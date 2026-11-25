import { Hono } from "hono";
import { z } from "zod";
import { type Issue, staleIssues } from "@relay/core";

const Days = z
  .string()
  .regex(/^\d+$/, { error: "days must be digits" })
  .transform(Number)
  .refine((n) => n >= 1 && n <= 365, {
    error: "days must be 1 to 365",
  })
  .optional()
  .transform((n) => n ?? 14);

export function staleIssuesRoute(
  issues: Issue[],
  now: () => Date = () => new Date(),
): Hono {
  const app = new Hono();
  app.get("/stale", (c) => {
    const days = Days.safeParse(c.req.query("days"));
    if (!days.success) {
      const error = days.error.issues
        .map((i) => i.message)
        .join("; ");
      return c.json({ error }, 400);
    }
    return c.json({
      days: days.data,
      issues: staleIssues(issues, now(), days.data),
    });
  });
  return app;
}
