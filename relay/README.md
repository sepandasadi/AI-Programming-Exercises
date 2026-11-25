# Relay

The running project for both volumes. Vol. 1 builds it with coding agents; Vol. 2 adds
AI features and, in Vol. 2, Ch. 10, exposes it as an MCP server your own coding agent uses.

| Package | What it does |
| --- | --- |
| `apps/api` | HTTP API (Hono on Node.js) |
| `packages/core` | Domain logic (docs search, issue triage) and Zod schemas |

A web UI (`apps/web`, Next.js) is added in the chapter that first needs it.

Scripts, run from this folder: `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm dev`.

## Docs search

`GET /search?q=rollback&limit=3` searches the Markdown docs loaded at startup
(spec: `docs/specs/docs-search.md`). The API reads the docs root from
`RELAY_DOCS_DIR`; a relative path resolves against the directory the API starts
in (`apps/api` for `pnpm dev`). When it is unset, the API uses `fixtures/team-docs`.

```sh
pnpm build && pnpm dev
curl 'localhost:3000/search?q=rollback'
RELAY_DOCS_DIR=/path/to/your/docs pnpm dev
```

`pnpm spec:check docs/specs/<name>.md` checks that every acceptance criterion in a
spec has a test titled `AC-n: ...` in a test file tagged `// spec: <name>`. It checks
names, not what the tests assert. CI runs it for every spec in `docs/specs/`.

Environment variables can go in `relay/.env` (see `.env.example`); `pnpm dev` and
`pnpm start` load it.

## Issue triage

`POST /triage` takes a GitHub-style issue and returns its priority, the rule
that decided it and a respond-by time in business hours (spec:
`docs/specs/issue-triage.md`). Sample issues are in `fixtures/issues/`.

```sh
curl -s -X POST localhost:3000/triage \
  -H 'content-type: application/json' \
  -d @fixtures/issues/friday-outage.json
```

## Verification tools (Vol. 1, Ch. 7)

- Property tests (`*.property.test.ts`, fast-check) run with `pnpm test`.
- `pnpm --filter @relay/core mutate` runs Stryker on the files listed in
  `packages/core/stryker.config.json`. Stryker's TypeScript checker does not
  support TypeScript 7, so the config skips its tsconfig rewrite
  (`tsconfigFile`) and names the Vitest runner plugin explicitly (`plugins`),
  which pnpm's layout needs.
- `pnpm review:flags [base]` lists added lines worth a second look (`as`, `!`,
  `any`, `.skip`, empty `catch`, `?? 0`, hidden clocks). Run `git add -N .`
  first to include new files.
- `scripts/guard-tests.mjs` is a pre-edit hook that refuses edits to test files
  (exit code 2). Set `RELAY_ALLOW_TEST_EDITS=1` in a test-writing session.
