/** A term found in text, with UTF-16 offsets into the original string. */
export type Token = {
  term: string;
  start: number;
  end: number;
};

const MIN_TERM_LENGTH = 2;
const TERM_RUN = /[\p{L}\p{N}][\p{L}\p{M}\p{N}]*/gu;

/**
 * Splits text into terms: runs of letters, digits and combining marks,
 * case-folded by `foldCase` and at least two characters (code points)
 * long after folding. Offsets point into `text`, so
 * `text.slice(start, end)` is the original spelling of the term.
 */
export function tokenize(text: string): Token[] {
  const tokens: Token[] = [];
  for (const match of text.matchAll(TERM_RUN)) {
    const raw = match[0];
    const term = foldCase(raw);
    if ([...term].length < MIN_TERM_LENGTH) continue;
    const start = match.index;
    tokens.push({
      term,
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

/**
 * Unicode case folding for matching: compatibility-normalize, then lower-,
 * upper- and lower-case again (so "ẞ", "ß", "SS" and "ss" all agree), then
 * normalize again, since lower-casing can leave decomposed sequences ("İ"
 * becomes "i̇"). Folding twice gives the same result as folding once.
 */
export function foldCase(text: string): string {
  return text
    .normalize("NFKC")
    .toLowerCase()
    .toUpperCase()
    .toLowerCase()
    .normalize("NFKC");
}
