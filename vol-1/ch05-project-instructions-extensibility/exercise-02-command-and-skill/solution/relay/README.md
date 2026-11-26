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

## SLA table

`GET /sla` returns the respond-by allowance for each priority, from the
table triage uses (spec: `docs/specs/sla-table.md`).

```sh
curl -s localhost:3000/sla
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
- `scripts/guard-tests.mts` is a pre-edit hook that refuses edits to test files
  (exit code 2). Set `RELAY_ALLOW_TEST_EDITS=1` in a test-writing session.

## Agent config (Vol. 1, Ch. 5)

Relay ships project instructions and extensions for coding agents. All of
it is checked by `pnpm agents:check`, which CI runs.

| What | Where | Read by |
| --- | --- | --- |
| Project instructions | `AGENTS.md`, `apps/api/AGENTS.md`, `packages/core/AGENTS.md` | Codex, Copilot, Cursor, Claude Code (no `CLAUDE.md`, so it reads `AGENTS.md`); Gemini CLI through `context.fileName` in `.gemini/settings.json` |
| Skills | `.agents/skills/` (`add-api-route`, `task`); `.claude/skills` is a symlink to it | Codex, Copilot, Cursor, Gemini CLI; Claude Code through the symlink |
| Hooks | `scripts/hooks/*.mts`, wired in `.claude/settings.json` and `.codex/hooks.json` | Claude Code, Codex (trusted projects; trust each hook in `/hooks`) |
| MCP servers | `.mcp.json` (Claude Code, Copilot CLI), `.codex/config.toml` (Codex) | GitHub's server, read-only, issues and pull requests only |
| Sub-agent | `.claude/agents/reviewer.md` | Claude Code |

The hooks refuse tool calls that name a `.env` file (`protect-env.mts`) and
run Prettier on files the agent writes (`format-edited.mts`). Ch. 7's
`scripts/guard-tests.mts` is not wired in by default; add it in a session
whose tests are locked.

The GitHub MCP server needs a fine-grained personal access token with
read-only access to the repositories you want, in your shell:

```sh
export GITHUB_MCP_TOKEN=github_pat_...   # never in a committed file
claude mcp get github                     # or: codex mcp get github
```

On Windows, enable symlinks (`git config core.symlinks true` and Developer
Mode) before cloning, or `.claude/skills` checks out as a text file and
`pnpm agents:check` fails.
