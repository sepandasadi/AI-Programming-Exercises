import { Hono } from "hono";
import {
  type DocSection,
  IssueSchema,
  SearchParamsSchema,
  health,
  searchDocs,
  triageIssue,
} from "@relay/core";

export type AppOptions = {
  /** Parsed docs to search; loaded once at startup. */
  sections?: readonly DocSection[];
  /** Team holidays (`YYYY-MM-DD`, UTC) for respond-by; read at startup. */
  holidays?: readonly string[];
};

export function createApp({
  sections = [],
  holidays = [],
}: AppOptions = {}): Hono {
  const app = new Hono();

  app.get("/health", (c) => c.json(health()));

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

  app.post("/triage", async (c) => {
    let payload: unknown;
    try {
      payload = await c.req.json();
    } catch {
      return c.json(
        { error: "body must be valid JSON" },
        400,
      );
    }
    const parsed = IssueSchema.safeParse(payload);
    if (!parsed.success) {
      const error = parsed.error.issues
        .map((issue) => issue.message)
        .join("; ");
      return c.json({ error }, 400);
    }
    const { respondBy, ...triage } = triageIssue(
      parsed.data,
      { holidays },
    );
    return c.json({
      ...triage,
      respondBy: respondBy.toISOString(),
    });
  });

  return app;
}
