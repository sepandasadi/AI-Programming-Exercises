<!--
The plan exactly as the planning agent returned it (read-only
planning mode, prompt from Vol. 1, Listing 6.4), before review.
Kept for reference; the reviewed plan is docs-search.md.
-->

# Plan: Docs search (v0)

Spec: `relay/docs/specs/docs-search.md`. All commands run from `relay/`. Following `AGENTS.md`, the agent writes each step and the human reviews and commits it. Every test that covers a criterion is named `it("AC-n: ...")`.

**Green gate** (the last part of every verify command): `pnpm build && pnpm typecheck && pnpm test`. This matches CI in `.github/workflows`. `pnpm spec:check` exits 1 until every AC has a test, and CI doesn't run it, so it only appears in the last task.

## Decisions the spec leaves open

These are fixed here so reviewers don't have to guess. Change them before Task 1 if you disagree.

- **D1. Terms.** Use `/[\p{L}\p{N}]+/gu` on the original text, lowercase each match, and drop matches shorter than 2 characters. Matching runs on the original string rather than a `toLowerCase()` copy, so offsets stay correct for snippets. A term counts only when it equals a whole token, with no substring matching. This is required for the spec's manual check. "Rollbacks" must not count as "rollback". If it did, `deploying.md#Rollback` would tie on score 5 and sort ahead of `runbooks/on-call.md` by path, which is the reverse of what the spec expects (on-call scores 3+2=5, deploying scores 3+1=4).
- **D2. Duplicate query terms.** They are deduplicated, so `rollback rollback` scores the same as `rollback`.
- **D3. Headings.** A heading is an ATX heading of level 1 to 3: up to 3 leading spaces, `#{1,3}`, at least one space or tab, then the text, with any closing `#`s removed. `####` and deeper lines are body text, and so is `#tag` with no space. Lines inside ``` or `~~~` fences are body text, so shell comments like `# roll back` in runbooks are not headings. Split lines on `\r?\n` and strip a BOM.
- **D4. Text before the first heading.** If it contains anything other than whitespace, it becomes a section with heading = the file's base name (e.g. `notes.md`) and `line` = 1. If it is only whitespace, no section is created.
- **D5. Body.** The lines between a heading and the next level 1 to 3 heading, with leading and trailing blank lines removed.
- **D6. Size limit.** "1 MB" means 1,048,576 bytes. A file of exactly that size is read; one byte more is skipped.
- **D7. Loader safety.**
  - Resolve the root with `realpath` once.
  - Walk the tree by hand with `readdir(withFileTypes)`. Skip every Dirent where `isSymbolicLink()` is true, whether it points to a file or a directory.
  - Only names ending in `.md` qualify (case-sensitive).
  - Open each file with `O_RDONLY | (constants.O_NOFOLLOW ?? 0)`, then `fstat` the handle (it must be a regular file within the size limit), then read from the same handle. This avoids a race between `lstat` and `read`.
  - As a further check, refuse any path whose `path.relative(root, p)` starts with `..` or is absolute.
  - Paths use `/` separators and the output is sorted by `path`.
  - A missing root throws, so the server fails fast.
- **D8. Snippet.**
  - Collapse whitespace with `/\s+/g` → `" "`, then trim.
  - Find the earliest token in the collapsed body that is a query term.
  - Choose a window of at most 160 characters that contains the term, starting about 40 characters before it and clamped to the body. If the term is longer than 160 characters, start at the term.
  - If no term appears in the body, use the first 160 characters. Add no ellipsis.
  - Snippets are computed only for the top `limit` results.
- **D9. Validation.**
  - `q` is required, at most 200 characters before trimming, and not blank after trimming.
  - `limit` is optional and must match `/^\d+$/` and fall within 1 to 20. This rejects values like `1e1`, `2.0` and `" 5"`, which `z.coerce` would accept.
  - On failure, return 400 with `{ error: <first Zod issue message> }`.
  - The response echoes `query` exactly as `q` was received.
- **D10. Default docs root.** `pnpm dev` runs with `--filter`, so its working directory is `apps/api`, not `relay/`.
  - **Default:** resolve `fixtures/team-docs` relative to the workspace root: `new URL("../../../fixtures/team-docs", import.meta.url)`. This works from both `src/` and `dist/`.
  - **When `RELAY_DOCS_DIR` is set:** resolve it against `process.cwd()`.
- **D11. "Every section" (AC-1) vs. `limit`.** AC-1 is read as "every matching section, up to `limit`". The tests use a limit at least as large as the number of matches.

---

## Tasks

- [ ] **Task 1: Core types and term tokenizer**
  - Files:
    - `packages/core/src/search-types.ts`: `DocSection`, `SearchResult`, plus a `SearchResultSchema` Zod schema for the tests.
    - `packages/core/src/terms.ts`: `tokenize(text): { term, index, length }[]` and `queryTerms(q): string[]`, which dedupes.
    - `packages/core/src/terms.test.ts`
    - `packages/core/src/index.ts`: re-exports.
  - Covers: part of AC-1 (case-insensitive terms). Other tests: only runs of letters or digits, minimum 2 characters, punctuation splits (`relay-ops` gives `relay` and `ops`), dedupe, correct offsets for non-ASCII text.
  - Verify: `pnpm --filter @relay/core exec vitest run src/terms.test.ts && pnpm build && pnpm typecheck && pnpm test`

- [ ] **Task 2: Markdown section parser (pure, no I/O)**
  - Files:
    - `packages/core/src/sections.ts`: `parseSections(path, markdown): DocSection[]`
    - `packages/core/src/sections.test.ts`
    - `packages/core/src/index.ts`
  - Covers: part of AC-3 (`heading` and 1-based `line` of the heading).
  - Other tests:
    - D3: levels 1 to 3 are headings, `####` is body, `#tag` is not a heading, fenced `# comment` is body, CRLF and BOM are handled.
    - D4: text before the first heading becomes a file-name section at line 1; a whitespace-only preamble is dropped.
    - D5: body trimming.
    - An empty body under a heading still produces a section.
  - Verify: `pnpm --filter @relay/core exec vitest run src/sections.test.ts && pnpm build && pnpm typecheck && pnpm test`

- [ ] **Task 3: Snippet builder**
  - Files:
    - `packages/core/src/snippet.ts`: `makeSnippet(body, terms): string`, following D8.
    - `packages/core/src/snippet.test.ts`
  - Covers: AC-4. Tests:
    - The result is never longer than 160 characters.
    - Newlines and tabs collapse to single spaces.
    - A term near the end of a body over 300 characters appears in the snippet.
    - The earliest matching term wins when several query terms appear.
    - With no body match, the snippet is the first 160 characters.
    - An empty body gives `""`.
  - Verify: `pnpm --filter @relay/core exec vitest run src/snippet.test.ts && pnpm build && pnpm typecheck && pnpm test`

- [ ] **Task 4: `searchDocs`: matching, scoring, ordering, limit**
  - Files:
    - `packages/core/src/search.ts`: `searchDocs(sections, query, limit)`. It tokenizes each section's heading and body, counts tokens that are query terms, computes score = 3·heading + body, drops sections scoring 0, sorts by score descending then `path` ascending then `line` ascending, slices to `limit`, and only then calls `makeSnippet`.
    - `packages/core/src/search.test.ts`
    - `packages/core/src/index.ts`
  - Covers:
    - **AC-1:** `ROLLBACK` and `RollBack` match "Rollback"; every matching section comes back when `limit` is at least the number of matches; sections with no match are excluded.
    - **AC-2:** heading-only beats body-only, 3 vs 1. An exact formula check: heading "Rollback rollback" with body "rollback" scores 7. A two-term query sums its terms.
    - **AC-5:** ties are broken by path, then line. Build equal-score sections in `b.md`/`a.md` and at lines 8/3.
    - **AC-8 (core):** no matches returns `[]`. A query with only 1-character terms (e.g. `a`) also returns `[]`.
    - **AC-3 (core):** every result has `path`, `heading`, `line`, `snippet` and `score`, checked with `SearchResultSchema`.
  - Verify: `pnpm --filter @relay/core exec vitest run src/search.test.ts && pnpm build && pnpm typecheck && pnpm test`

- [ ] **Task 5: `loadDocs` file-system loader**
  - Files:
    - `packages/core/src/load-docs.ts`: `loadDocs(root): Promise<DocSection[]>`, following D6 and D7, using `parseSections`.
    - `packages/core/src/load-docs.test.ts`
    - `packages/core/src/index.ts`
  - Tests build a temporary tree with `fs.mkdtemp(os.tmpdir())` and delete it in `afterAll`.
  - Covers:
    - **AC-9:**
      - Only `.md` files are read; `.txt` and `.markdown` are skipped.
      - A symlinked file and a symlinked directory that point outside the root are not read.
      - A file of 1,048,577 bytes is skipped; one of exactly 1,048,576 bytes is read.
      - No section's path starts with `..`.
    - **AC-3:** a nested file gets the path `sub/dir/x.md` with forward slashes.
  - Fixture test: loading `fixtures/team-docs`, resolved from `import.meta.url`, gives 12 sections with paths `code-review.md`, `deploying.md` and `runbooks/on-call.md`.
  - Also automate the spec's manual check, named `AC-5: fixtures rank Incident rollback above Rollback`. `searchDocs(loaded, "rollback", 5)` must return "Incident rollback" (`runbooks/on-call.md`, score 5) first and "Rollback" (`deploying.md`, score 4) second.
  - Verify: `pnpm --filter @relay/core exec vitest run src/load-docs.test.ts && pnpm build && pnpm typecheck && pnpm test`

- [ ] **Task 6: Performance check (constraint, not an AC)**
  - Files:
    - `packages/core/src/search.perf.test.ts`. It generates 1,000 sections with a fixed seed, about 80 words each, and runs a 3-term query. After one warm-up run it takes the median of 10 runs and asserts it is under 50 ms.
  - Covers: the "1,000 sections in under 50 ms" constraint. Using the median keeps the test stable on CI.
  - Verify: `pnpm --filter @relay/core exec vitest run src/search.perf.test.ts && pnpm build && pnpm typecheck && pnpm test`

- [ ] **Task 7: Query schema in core and the `GET /search` route**
  - Files:
    - `packages/core/src/search-schema.ts`: `SearchParamsSchema`, following D9. Per `AGENTS.md`, Zod schemas live in core.
    - `packages/core/src/search-schema.test.ts`
    - `packages/core/src/index.ts`
    - `apps/api/src/app.ts`: `createApp({ sections = [] }: { sections?: DocSection[] } = {})`. It keeps `/health` working and existing callers unchanged. The handler builds `{ q, limit }` from `c.req.query`, calls `safeParse`, then either `c.json({ error }, 400)` or `c.json({ query: q, results: searchDocs(sections, q, limit) })`.
    - `apps/api/src/app.test.ts`: add a `describe("GET /search")` block with sections defined inline.
  - Covers:
    - **AC-6:** a missing `limit` returns 5 results when 6 or more sections match. `limit` values `0`, `21`, `2.5`, `abc`, `""` and `1e1` return 400. `1` and `20` return 200.
    - **AC-7:**
      - A missing `q` returns 400.
      - `q` of `"   "` returns 400.
      - A 201-character `q` returns 400.
      - A 200-character `q` returns 200.
      - Each 400 body matches `{ error: string }`.
    - **AC-8:** `q=zzzz` returns 200 with `{ query: "zzzz", results: [] }`.
    - **AC-3 (API):** each result parses with `SearchResultSchema`.
  - Note: `apps/api` imports core's `dist`, so build first.
  - Verify: `pnpm build && pnpm --filter @relay/api exec vitest run src/app.test.ts && pnpm typecheck && pnpm test`

- [ ] **Task 8: Load docs at startup from `RELAY_DOCS_DIR`**
  - Files:
    - `apps/api/src/config.ts`: `resolveDocsRoot(env, cwd)`, following D10.
    - `apps/api/src/config.test.ts`: the default points at `<relay>/fixtures/team-docs` and the directory exists; a relative env value is resolved against `cwd`.
    - `apps/api/src/server.ts`: `const sections = await loadDocs(resolveDocsRoot(process.env, process.cwd()))`, log the section count and root, pass `sections` to `createApp`.
    - `.env.example`: add `RELAY_DOCS_DIR=fixtures/team-docs` with a comment.
    - `README.md`: one line on `GET /search`.
  - Covers: the Interface requirement for the env var and its default. No AC.
  - Verify: `pnpm build && pnpm --filter @relay/api exec vitest run src/config.test.ts && pnpm typecheck && pnpm test`

## Final verification (no commit)

- [ ] `pnpm spec:check docs/specs/docs-search.md` prints `ok` for AC-1 through AC-9 and exits 0.
- [ ] `pnpm build && pnpm typecheck && pnpm test` passes.
- [ ] Manual check:
  1. Run `pnpm dev`.
  2. In a second terminal, run `curl 'localhost:3000/search?q=rollback'`.
  3. The results should be "Incident rollback" (`runbooks/on-call.md`, line 8, score 5), then "Rollback" (`deploying.md`, line 8, score 4).
  4. Also check that `curl -i 'localhost:3000/search?q=rollback&limit=0'` returns 400.
- [ ] `git diff --stat` touches no `package.json` or `pnpm-lock.yaml` (no new runtime dependencies).

## AC coverage map

| AC | Tasks |
| --- | --- |
| AC-1 | 1, 4 |
| AC-2 | 4 |
| AC-3 | 2, 4, 5, 7 |
| AC-4 | 3 |
| AC-5 | 4, 5 |
| AC-6 | 7 |
| AC-7 | 7 |
| AC-8 | 4, 7 |
| AC-9 | 5 |

## Risks

- **Substring scoring.** Counting substrings instead of whole tokens would break the spec's manual expectation (see D1). The Task 5 fixture test catches this.
- **Default docs root.** A default resolved against the working directory would point at `apps/api/fixtures/...` under `pnpm dev` (see D10). The Task 8 test catches this.
- **Symlink tests.** They rely on POSIX symlinks. CI runs on ubuntu, which is fine. On Windows, skip them with `it.skipIf(process.platform === "win32")`.
- **Performance test on slow CI.** It could be flaky. If so, raise the number of runs before touching the threshold.
