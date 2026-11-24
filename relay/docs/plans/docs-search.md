# Plan: Docs search (v0)

Spec: `docs/specs/docs-search.md`. Run all commands from `relay/`.
The agent does one task per session; the human reruns the
verification, reviews the diff and commits. Every test that covers
a criterion is named `it("AC-n: ...")`.

Drafted by a coding agent in planning mode, then reviewed. Review
changes:

- The decisions that change behavior (D1 whole-term matching, D2
  deduplicated terms, D3 headings, D4 whitespace preamble, D6 the
  byte limit, D9 strict `limit`) were moved into the spec's
  Behavior section. A plan must not quietly redefine the spec.
- The performance check was merged into Task 4, so the agent
  measures the function it just wrote.
- `spec:check` was added to CI in Task 7. The draft noted that CI
  did not run it.

**Green gate** (the last part of every verify command):
`pnpm build && pnpm typecheck && pnpm test`

## Implementation decisions

These don't change behavior, so they stay in the plan.

- **D5 Body.** The lines between a heading and the next level 1–3
  heading, with leading and trailing blank lines trimmed.
- **D7 Loader safety.**
  - Call `realpath` on the root once.
  - Walk the tree with `readdir(withFileTypes)` and skip every
    symlink Dirent.
  - Open each file with `O_NOFOLLOW`, then `fstat` it: it must be a
    regular file no larger than 1,048,576 bytes. Read from the same
    handle.
  - Reject any path whose path relative to the root starts with
    `..`.
  - Paths use `/` and are sorted. A missing root throws.
- **D8 Snippet.**
  - Collapse whitespace to single spaces and trim.
  - The window is at most 160 characters around the earliest
    matching term, starting about 40 characters before it.
  - If no term matches the body, use the first 160 characters.
  - Add no ellipsis. Build snippets only for the top `limit`
    results.
- **D10 Default docs root.** Resolve `fixtures/team-docs` from
  `import.meta.url`, not from the working directory (`pnpm dev` runs
  in `apps/api`). Resolve `RELAY_DOCS_DIR` against the working
  directory.
- **D11 AC-1 and `limit`.** AC-1 means every matching section, up to
  `limit`.

## Tasks

- [ ] **Task 1: Core types and term tokenizer**
  - Files: `packages/core/src/search-types.ts` (`DocSection`,
    `SearchResult`, and `SearchResultSchema` for tests),
    `packages/core/src/terms.ts` (`tokenize`, `queryTerms`),
    `packages/core/src/terms.test.ts`, `packages/core/src/index.ts`
  - Covers: AC-1 (case-insensitive, whole terms). Also tests: the
    two-character minimum, punctuation splitting (`relay-ops` gives
    `relay` and `ops`), deduplication, and offsets in non-ASCII
    text.
  - Verify: `pnpm build && pnpm typecheck && pnpm test`

- [ ] **Task 2: Markdown section parser (pure, no I/O)**
  - Files: `packages/core/src/sections.ts`
    (`parseSections(path, markdown)`),
    `packages/core/src/sections.test.ts`, `packages/core/src/index.ts`
  - Covers: AC-3 (`heading` and the 1-based `line` of the heading).
    Also tests:
    - Levels 1–3 are headings. `####` and `#tag` are not.
    - A fenced `# comment` stays in the body.
    - CRLF line endings and a BOM are handled.
    - A preamble becomes a section named after the file.
    - A whitespace-only preamble is dropped.
    - The body is trimmed (D5).
  - Verify: `pnpm build && pnpm typecheck && pnpm test`

- [ ] **Task 3: Snippet builder**
  - Files: `packages/core/src/snippet.ts` (`makeSnippet`, see D8),
    `packages/core/src/snippet.test.ts`
  - Covers: AC-4. Tests check that:
    - A snippet is never longer than 160 characters.
    - Whitespace is collapsed.
    - A term late in a long body still appears.
    - When several terms match, the earliest wins.
    - With no match, the snippet is the first 160 characters.
    - An empty body gives `""`.
  - Verify: `pnpm build && pnpm typecheck && pnpm test`

- [ ] **Task 4: `searchDocs`: matching, scoring, ordering, limit,
  performance**
  - Files: `packages/core/src/search.ts`,
    `packages/core/src/search.test.ts`,
    `packages/core/src/search.perf.test.ts`,
    `packages/core/src/index.ts`
  - `searchDocs` steps:
    1. Tokenize each heading and body.
    2. Score = 3 × heading hits + body hits.
    3. Drop sections that score 0.
    4. Sort by score descending, then `path`, then `line`.
    5. Slice to `limit`, then build snippets.
  - Covers:
    - AC-1: mixed-case queries match, and every match is returned
      when `limit` is large enough.
    - AC-2: heading beats body. An exact formula case scores 7.
    - AC-5: ties sort by path, then line.
    - AC-8 (core): no match, and only 1-character terms, both give
      `[]`.
    - AC-3 (core): results parse with `SearchResultSchema`.
  - Performance: 1,000 generated sections from a fixed seed, 3-term
    query, one warm-up, median of 10 runs under 50 ms.
  - Verify: `pnpm build && pnpm typecheck && pnpm test`

- [ ] **Task 5: `loadDocs` file-system loader**
  - Files: `packages/core/src/load-docs.ts` (see D7),
    `packages/core/src/load-docs.test.ts` (uses a temporary tree from
    `fs.mkdtemp`), `packages/core/src/index.ts`
  - Covers:
    - AC-9:
      - Only `.md` files are read.
      - Symlinked files and directories pointing outside the root
        are skipped.
      - 1,048,577 bytes is skipped; 1,048,576 bytes is read.
      - No path starts with `..`.
    - AC-3: nested paths use forward slashes.
  - Also a fixture test: `fixtures/team-docs` loads, and a test named
    "AC-5: fixtures rank Incident rollback above Rollback" checks the
    spec's manual expectation.
  - Verify: `pnpm build && pnpm typecheck && pnpm test`

- [ ] **Task 6: Query schema and `GET /search` route**
  - Files: `packages/core/src/search-schema.ts`
    (`SearchParamsSchema`), `packages/core/src/search-schema.test.ts`,
    `packages/core/src/index.ts`, `apps/api/src/app.ts`
    (`createApp({ sections })`, keeping `/health`),
    `apps/api/src/app.test.ts`
  - Covers:
    - AC-6:
      - The default is 5.
      - `limit` values `0`, `21`, `2.5`, `abc`, `""` and `1e1` give
        400.
      - `1` and `20` give 200.
    - AC-7:
      - Missing `q`, blank `q` and a 201-character `q` give 400.
      - A 200-character `q` gives 200.
      - The error body matches `{ error: string }`.
    - AC-8: no matches gives 200 with `results: []`.
    - AC-3 (API): every result parses with `SearchResultSchema`.
  - Verify: `pnpm build && pnpm typecheck && pnpm test`

- [ ] **Task 7: Load docs at startup; spec check in CI**
  - Files: `apps/api/src/config.ts` (`resolveDocsRoot`, see D10),
    `apps/api/src/config.test.ts`, `apps/api/src/server.ts`,
    `.env.example`, `README.md`, `../.github/workflows/ci.yml`
    (run `pnpm spec:check` for every file in `docs/specs/`)
  - Covers: the Interface requirement for `RELAY_DOCS_DIR` and its
    default.
  - Verify:
    `pnpm build && pnpm typecheck && pnpm test && pnpm spec:check docs/specs/docs-search.md`

## Final verification

- [ ] `pnpm spec:check docs/specs/docs-search.md`: AC-1 to AC-9 are
  all `ok`.
- [ ] `pnpm build && pnpm typecheck && pnpm test` pass.
- [ ] Manual check: run `pnpm dev`, then
  `curl 'localhost:3000/search?q=rollback'`. The first result is
  "Incident rollback" (`runbooks/on-call.md`, score 5); the second
  is "Rollback" (`deploying.md`, score 4).
- [ ] `git diff --stat main` shows no new runtime dependencies.

## Coverage

| AC | Tasks |
| --- | --- |
| AC-1 | 1, 4 |
| AC-2 | 4 |
| AC-3 | 2, 4, 5, 6 |
| AC-4 | 3 |
| AC-5 | 4, 5 |
| AC-6 | 6 |
| AC-7 | 6 |
| AC-8 | 4, 6 |
| AC-9 | 5 |
