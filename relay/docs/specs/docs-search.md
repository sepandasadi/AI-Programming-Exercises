# Spec: Docs search (v0)

Status: approved · Owner: Sepand · Chapter: Vol. 1, Ch. 6

## Problem

Engineers ask the same questions in chat ("how do I roll
back?") because the answers are spread across Markdown
files in the team's docs folder. Relay should find the
right section of the right file.

## Goal

A keyword search over the team's Markdown docs, exposed as
`GET /search`, that returns the best-matching sections with
enough context to decide which one to open.

## Non-goals

- No embeddings, LLM calls or semantic ranking (Vol. 2).
- No index persistence: the index is built at startup.
- No UI. No auth (Relay runs on a trusted network for now).
- No fuzzy matching or stemming.

## Behavior

A *section* is the text under one Markdown heading (levels
1 to 3) up to the next heading of any of those levels.
Text before the first heading belongs to a section whose
heading is the file name.

Only ATX headings count (`# Title`), and lines inside
fenced code blocks are never headings. A preamble that is
only whitespace produces no section.

A *term* is a lowercase run of letters or digits, at least
two characters long. Matching is by whole term: the query
term `rollback` does not match `rollbacks`. Repeated
query terms count once. A section matches when its heading
or body contains at least one query term.

Score = 3 x (heading occurrences) + (body occurrences),
summed over all query terms.

`limit` must be written as plain digits: `1e1` and `2.0`
are rejected. "1 MB" means 1,048,576 bytes.

## Acceptance criteria

- AC-1: Search is case-insensitive and returns every
  section that contains at least one query term.
- AC-2: A section whose heading contains a term scores
  higher than one with the same term only in its body,
  as given by the score formula.
- AC-3: Each result has `path` (relative to the docs root,
  forward slashes), `heading`, `line` (1-based line of the
  heading) and `snippet`.
- AC-4: `snippet` is at most 160 characters of the section
  body, whitespace collapsed, and contains the first
  matching term found in the body, if any.
- AC-5: Results are ordered by score descending, then
  `path` ascending, then `line` ascending.
- AC-6: `limit` defaults to 5; values outside 1 to 20 or
  not an integer return 400.
- AC-7: A missing or blank `q`, or a `q` longer than 200
  characters, returns 400 with `{ "error": string }`.
- AC-8: A query with no matches returns 200 with
  `results: []`.
- AC-9: The loader reads only `.md` files under the docs
  root, skips symbolic links and files over 1 MB, and never
  reads outside the root.

## Interface

```ts
// packages/core
type DocSection = {
  path: string;
  heading: string;
  line: number;
  body: string;
};
type SearchResult = {
  path: string;
  heading: string;
  line: number;
  snippet: string;
  score: number;
};
loadDocs(root: string): Promise<DocSection[]>;
searchDocs(
  sections: DocSection[],
  query: string,
  limit: number,
): SearchResult[];
```

```
GET /search?q=rollback&limit=3
200 { "query": "rollback", "results": SearchResult[] }
400 { "error": "..." }
```

The API reads the docs root from `RELAY_DOCS_DIR`
(default: `fixtures/team-docs`).

## Constraints

- No new runtime dependencies.
- Logic in `packages/core`; the route only validates input
  (Zod) and calls core.
- Search over 1,000 sections answers in under 50 ms on a
  laptop.

## Verification

- Every AC has at least one test named after it:
  `pnpm spec:check docs/specs/docs-search.md` passes.
- `pnpm build && pnpm typecheck && pnpm test` pass.
- Manual: start the API and run
  `curl 'localhost:3000/search?q=rollback'`; the top two
  results are "Incident rollback" (`runbooks/on-call.md`)
  and "Rollback" (`deploying.md`).

## Open questions

None. (Resolved: stemming is out of scope; ties are
broken by path, then line.)
