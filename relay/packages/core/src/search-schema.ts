import { z } from "zod";

export const DEFAULT_LIMIT = 5;
export const MAX_LIMIT = 20;
export const MAX_QUERY_LENGTH = 200;

/**
 * Query parameters for `GET /search`, as strings from the URL.
 *
 * `limit` must be plain digits (`1e1`, `2.0`, `+3` are rejected) and
 * between 1 and `MAX_LIMIT`. A missing `limit` means `DEFAULT_LIMIT`.
 * `q` is kept as sent; it must not be blank and is at most
 * `MAX_QUERY_LENGTH` characters long.
 */
export const SearchParamsSchema = z.object({
  q: z
    .string({ error: "q is required" })
    .max(MAX_QUERY_LENGTH, { error: `q must be at most ${MAX_QUERY_LENGTH} characters` })
    .refine((q) => q.trim().length > 0, { error: "q must not be blank" }),
  limit: z
    .string()
    .regex(/^\d+$/, { error: "limit must be an integer written as digits" })
    .transform(Number)
    .refine((n) => n >= 1 && n <= MAX_LIMIT, {
      error: `limit must be between 1 and ${MAX_LIMIT}`,
    })
    .optional()
    .transform((n) => n ?? DEFAULT_LIMIT),
});

export type SearchParams = z.infer<typeof SearchParamsSchema>;
