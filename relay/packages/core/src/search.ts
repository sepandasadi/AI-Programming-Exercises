import type { DocSection, SearchResult } from "./search-types.js";
import { makeSnippet } from "./snippet.js";
import { queryTerms, tokenize } from "./terms.js";

/** A heading occurrence counts this many times a body occurrence. */
const HEADING_WEIGHT = 3;

type Scored = { section: DocSection; score: number };

/**
 * Keyword search over parsed sections.
 *
 * Score = 3 x (heading occurrences) + (body occurrences), summed over the
 * distinct query terms. Sections that score 0 are dropped. Results are
 * sorted by score descending, then `path`, then `line`, cut to `limit`,
 * and only then given snippets.
 *
 * `limit` must be a positive integer; the API validates it before calling.
 */
export function searchDocs(
  sections: readonly DocSection[],
  query: string,
  limit: number,
): SearchResult[] {
  if (!Number.isInteger(limit) || limit < 1) {
    throw new RangeError(`limit must be a positive integer, got ${limit}`);
  }
  const terms = queryTerms(query);
  if (terms.length === 0) return [];
  const wanted = new Set(terms);

  const scored: Scored[] = [];
  for (const section of sections) {
    const score =
      HEADING_WEIGHT * countHits(section.heading, wanted) + countHits(section.body, wanted);
    if (score > 0) scored.push({ section, score });
  }

  scored.sort(compareScored);

  return scored.slice(0, limit).map(({ section, score }) => ({
    path: section.path,
    heading: section.heading,
    line: section.line,
    snippet: makeSnippet(section.body, terms),
    score,
  }));
}

function countHits(text: string, wanted: ReadonlySet<string>): number {
  let hits = 0;
  for (const token of tokenize(text)) {
    if (wanted.has(token.term)) hits++;
  }
  return hits;
}

/** Score descending, then path and line ascending. Paths compare by code unit, not locale. */
function compareScored(a: Scored, b: Scored): number {
  if (a.score !== b.score) return b.score - a.score;
  if (a.section.path !== b.section.path) return a.section.path < b.section.path ? -1 : 1;
  return a.section.line - b.section.line;
}
