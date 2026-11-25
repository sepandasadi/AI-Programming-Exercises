import { tokenize } from "./terms.js";

/** The longest snippet, in UTF-16 code units (what `string.length` counts). */
export const SNIPPET_LENGTH = 160;
/** How far before the first matching term the window starts. */
const LEAD = 40;

/**
 * Builds a search snippet from a section body: whitespace collapsed to
 * single spaces, at most 160 characters, starting about 40 characters
 * before the earliest occurrence of any of `terms` in the body. With no
 * match it is the first 160 characters. No ellipsis is added.
 *
 * `terms` are query terms as `queryTerms` returns them (lowercase).
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
    // Start LEAD characters early, but late enough that a long term still
    // fits, and early enough that a match near the end fills the window.
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
