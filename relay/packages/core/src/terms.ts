/** A term found in text, with UTF-16 offsets into the original string. */
export type Token = {
  term: string;
  start: number;
  end: number;
};

const MIN_TERM_LENGTH = 2;
const TERM_RUN = /[\p{L}\p{N}]+/gu;

/**
 * Splits text into terms: lowercase runs of letters or digits, at least
 * two characters (code points) long. Offsets point into `text`, so
 * `text.slice(start, end)` is the original spelling of the term.
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  for (const match of text.matchAll(TERM_RUN)) {
    const raw = match[0];
    if ([...raw].length < MIN_TERM_LENGTH) continue;
    const start = match.index;
    tokens.push({
      term: raw.toLowerCase(),
      start,
      end: start + raw.length,
    });
  }
  return tokens;
}

/** The distinct terms of a query, in the order they first appear. */
export function queryTerms(query: string): string[] {
  return [...new Set(tokenize(query).map((t) => t.term))];
}
