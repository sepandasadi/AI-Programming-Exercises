// spec: docs-search
import fc from "fast-check";
import { describe, it } from "vitest";
import { searchDocs } from "./search.js";
import { foldCase, tokenize } from "./terms.js";

/** Full Unicode, no hand-picked values. */
const word = fc.string({
  unit: "binary",
  minLength: 2,
  maxLength: 8,
});
const body = fc
  .array(word, { minLength: 1, maxLength: 30 })
  .map((words) => words.join(" "));

type Variant = (term: string) => string;
const variants: Record<string, Variant> = {
  "upper case": (t) => t.toUpperCase(),
  "lower case": (t) => t.toLowerCase(),
  "NFC form": (t) => t.normalize("NFC"),
  "NFD form": (t) => t.normalize("NFD"),
};

describe("docs search properties", () => {
  for (const [name, variant] of Object.entries(variants)) {
    it(`AC-1: a term from the body is found by its ${name}`, () => {
      fc.assert(
        fc.property(body, fc.nat(), (text, pick) => {
          const terms = tokenize(text);
          fc.pre(terms.length > 0);
          const t = terms[pick % terms.length]!;
          const query = variant(text.slice(t.start, t.end));
          const sections = [
            {
              path: "a.md",
              heading: "h",
              line: 1,
              body: text,
            },
          ];
          return (
            searchDocs(sections, query, 20).length === 1
          );
        }),
        { numRuns: 5000 },
      );
    });
  }

  it("AC-1: folding is stable under folding and case changes", () => {
    fc.assert(
      fc.property(word, (w) => {
        const f = foldCase(w);
        return (
          foldCase(f) === f &&
          foldCase(w.toUpperCase()) === f &&
          foldCase(w.toLowerCase()) === f
        );
      }),
      { numRuns: 20000 },
    );
  });
});
