import { z } from "zod";

export const RELAY_VERSION = "0.0.0";

export const HealthSchema = z.object({
  status: z.literal("ok"),
  version: z.string(),
});

export type Health = z.infer<typeof HealthSchema>;

export function health(): Health {
  return { status: "ok", version: RELAY_VERSION };
}

export type {
  DocSection,
  SearchResult,
} from "./search-types.js";
export { SearchResultSchema } from "./search-types.js";
export type { Token } from "./terms.js";
export { queryTerms, tokenize } from "./terms.js";
export { parseSections } from "./sections.js";
export { searchDocs } from "./search.js";
export { MAX_DOC_BYTES, loadDocs } from "./load-docs.js";
export type { SearchParams } from "./search-schema.js";
export {
  DEFAULT_LIMIT,
  MAX_LIMIT,
  MAX_QUERY_LENGTH,
  SearchParamsSchema,
} from "./search-schema.js";
export {
  IssueSchema,
  type Issue,
  type StaleIssue,
  staleIssues,
} from "./issues/stale.js";
