import { z } from "zod";

/** One Markdown section: the text under a level 1–3 heading. */
export type DocSection = {
  /** Path relative to the docs root, with forward slashes. */
  path: string;
  heading: string;
  /** 1-based line of the heading. */
  line: number;
  body: string;
};

export const SearchResultSchema = z.object({
  path: z.string().min(1),
  heading: z.string(),
  line: z.number().int().min(1),
  snippet: z.string().max(160),
  score: z.number().int().min(1),
});

export type SearchResult = z.infer<typeof SearchResultSchema>;
