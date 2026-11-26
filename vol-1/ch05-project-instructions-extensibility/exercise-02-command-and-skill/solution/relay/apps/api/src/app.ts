import { Hono } from "hono";
import { bodyLimit } from "hono/body-limit";
import {
  type DocSection,
  IssueSchema,
  SearchParamsSchema,
  health,
  searchDocs,
  slaTable,
  triageIssue,
} from "@relay/core";

/** Largest `POST /triage` body accepted (spec: Constraints). */
export const MAX_TRIAGE_BODY_BYTES = 256 * 1024;

export type AppOptions = {
  /** Parsed docs to search; loaded once at startup. */
  sections?: readonly DocSection[];
};

export function createApp({
  sections = [],
}: AppOptions = {}): Hono {
  const app = new Hono();

  app.get("/health", (c) => c.json(health()));

  app.get("/sla", (c) =>
    c.json({ priorities: slaTable() }),
  );

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

  app.post(
    "/triage",
    bodyLimit({
      maxSize: MAX_TRIAGE_BODY_BYTES,
      onError: (c) =>
        c.json(
          { error: "body must be at most 256 KB" },
          413,
        ),
    }),
    async (c) => {
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
      );
      return c.json({
        ...triage,
        respondBy: respondBy.toISOString(),
      });
    },
  );

  return app;
}
