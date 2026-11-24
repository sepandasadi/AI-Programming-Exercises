# Relay

The running project for both volumes. Vol. 1 builds it with coding agents; Vol. 2 adds
AI features and, in Vol. 2, Ch. 10, exposes it as an MCP server your own coding agent uses.

| Package | What it does |
| --- | --- |
| `apps/api` | HTTP API (Hono on Node.js) |
| `packages/core` | Shared domain types and Zod schemas |

A web UI (`apps/web`, Next.js) is added in the chapter that first needs it.

Scripts, run from this folder: `pnpm build`, `pnpm typecheck`, `pnpm test`, `pnpm dev`.
