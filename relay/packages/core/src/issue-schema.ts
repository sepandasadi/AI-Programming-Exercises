import { z } from "zod";
import type { Issue } from "./triage.js";

export const MAX_TITLE_LENGTH = 256;
export const MAX_LABELS = 100;

/** GitHub sends label objects; tests and hand-written payloads send strings. */
const LabelSchema = z.union(
  [
    z.string(),
    z.object({ name: z.string() }).transform((l) => l.name),
  ],
  {
    error:
      "labels must be strings or objects with a string name",
  },
);

/**
 * A GitHub-style issue payload, validated and mapped to `Issue`.
 *
 * Unknown fields (at the top level and on label objects) are dropped.
 * `title` is kept as sent; it must not be blank and is at most
 * `MAX_TITLE_LENGTH` characters long. `body` may be a string, null or
 * absent (absent becomes null). `created_at` must carry seconds and an
 * offset, `Z` or `±hh:mm`: without one, the instant would depend on the
 * server's time zone. Every error message starts with the field's name.
 */
export const IssueSchema = z
  .object(
    {
      number: z
        .int({
          error: "number must be a positive integer",
        })
        .positive({
          error: "number must be a positive integer",
        }),
      title: z
        .string({ error: "title must be a string" })
        .max(MAX_TITLE_LENGTH, {
          error: `title must be at most ${MAX_TITLE_LENGTH} characters`,
        })
        .refine((t) => t.trim().length > 0, {
          error: "title must not be blank",
        }),
      body: z
        .string({ error: "body must be a string or null" })
        .nullish(),
      labels: z
        .array(LabelSchema, {
          error: "labels must be an array",
        })
        .max(MAX_LABELS, {
          error: `labels must have at most ${MAX_LABELS} entries`,
        }),
      created_at: z.iso.datetime({
        offset: true,
        error:
          "created_at must be an ISO 8601 date-time with Z or ±hh:mm",
      }),
    },
    { error: "issue must be a JSON object" },
  )
  .transform((raw): Issue => ({
    number: raw.number,
    title: raw.title,
    body: raw.body ?? null,
    labels: raw.labels,
    createdAt: new Date(raw.created_at),
  }));
