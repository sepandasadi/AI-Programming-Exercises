# Relay

The running project for both volumes. Vol. 1 builds it with coding agents; Vol. 2 adds
AI features and, in Vol. 2, Ch. 10, exposes it as an MCP server your own coding agent uses.

| Package | What it does |
| --- | --- |
| `apps/api` | HTTP API (Hono on Node.js) |
| `packages/core` | Domain logic (docs search) and Zod schemas |

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
