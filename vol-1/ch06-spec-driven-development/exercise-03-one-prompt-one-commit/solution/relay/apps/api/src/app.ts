import { Hono } from "hono";
import {
  type DocSection,
  type Issue,
  SearchParamsSchema,
  health,
  searchDocs,
} from "@relay/core";
import { staleIssuesRoute } from "./routes/stale-issues.js";

export type AppOptions = {
  /** Parsed docs to search; loaded once at startup. */
  sections?: readonly DocSection[];
  /** Issues for the stale report; loaded at startup. */
  issues?: Issue[];
};

export function createApp({
  sections = [],
  issues = [],
}: AppOptions = {}): Hono {
  const app = new Hono();

  app.get("/health", (c) => c.json(health()));
  app.route("/issues", staleIssuesRoute(issues));

  app.get("/search", (c) => {
    const parsed = SearchParamsSchema.safeParse({
      q: c.req.query("q"),
      limit: c.req.query("limit"),
    });
    if (!parsed.success) {
      const error = parsed.error.issues
        .map((issue) => issue.message)
        .join("; ");
      return c.json({ error }, 400);
    }
    const { q, limit } = parsed.data;
    return c.json({
      query: q,
      results: searchDocs(sections, q, limit),
    });
  });

  return app;
}
