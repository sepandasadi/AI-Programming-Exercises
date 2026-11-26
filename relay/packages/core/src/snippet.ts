import { tokenize } from "./terms.js";

/** The longest snippet, in UTF-16 code units (what `string.length` counts). */
export const SNIPPET_LENGTH = 160;
/** How far before the first matching term the window starts. */
const LEAD = 40;

/**
 * Builds a search snippet from a section body: whitespace collapsed to
 * single spaces, at most 160 UTF-16 code units. It starts about 40 units
 * before the first match when there is room. A match longer than the window
 * keeps its trailing units. With no match, the window starts at the beginning.
 * The result keeps surrogate pairs intact and adds no ellipsis.
 *
 * `terms` are the normalized terms returned by `queryTerms`.
 */
export function makeSnippet(
  body: string,
  terms: readonly string[],
): string {
  const text = body.replace(/\s+/g, " ").trim();
  if (text.length <= SNIPPET_LENGTH) return text;

  const wanted = new Set(terms);
  const first = tokenize(text).find((t) =>
    wanted.has(t.term),
  );

  let start = 0;
  if (first) {
    // Prefer some context before the match. Shift right to fit a long match
    // or keep its suffix, then shift left if the window would overrun the body.
    const ideal = Math.max(
      first.start - LEAD,
      first.end - SNIPPET_LENGTH,
    );
    start = Math.max(
      0,
      Math.min(ideal, text.length - SNIPPET_LENGTH),
    );
  }
  let end = start + SNIPPET_LENGTH;

  // Never split a surrogate pair at either edge.
  if (isLowSurrogate(text.charCodeAt(start))) start += 1;
  if (isHighSurrogate(text.charCodeAt(end - 1))) end -= 1;

  return text.slice(start, end).trim();
}

function isHighSurrogate(code: number): boolean {
  return code >= 0xd800 && code <= 0xdbff;
}

function isLowSurrogate(code: number): boolean {
  return code >= 0xdc00 && code <= 0xdfff;
}
