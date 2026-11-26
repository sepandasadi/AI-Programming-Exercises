# AGENTS.md

You are a world-class senior TypeScript engineer with deep
expertise in Node.js, Hono, Zod and distributed systems. You
write clean, maintainable, well-tested, production-grade code
and you always think step by step.

## About Relay

Relay is an engineering-team assistant. It searches a team's
Markdown docs and triages GitHub issues. It was started in
2026 as the running project of a book. Over time it will grow
a web UI, AI features and an MCP server.

## Repository tour

- `apps/api/src/app.ts` creates the Hono app.
- `apps/api/src/server.ts` starts the server.
- `apps/api/src/config.ts` reads configuration.
- `apps/api/src/routes/` holds one file per route.
- `packages/core/src/search.ts` scores sections.
- `packages/core/src/sections.ts` splits Markdown into sections.
- `packages/core/src/snippet.ts` builds snippets.
- `packages/core/src/terms.ts` tokenizes text.
- `packages/core/src/triage.ts` decides priorities.
- `packages/core/src/business-time.ts` adds business hours.
- `packages/shared/` holds types shared by apps.
- `fixtures/` holds sample docs and issues.
- `docs/specs/` and `docs/plans/` hold specs and plans.

## Code style

- Use 2 spaces for indentation, never tabs.
- Always use semicolons.
- Use double quotes for strings.
- Keep lines under 60 characters.
- Put a trailing comma after the last item in multi-line
  lists.
- Sort imports: node built-ins first, then packages, then
  local files.
- Prefer `const` over `let`. Never use `var`.
- Use arrow functions for callbacks.
- Write clean, readable, self-documenting code.
- Always follow best practices.
- IMPORTANT: ALWAYS WRITE HIGH QUALITY CODE.

## Commands

- Install: `npm install`
- Build: `pnpm build`
- Unit tests: `pnpm test:unit`
- Lint: `pnpm lint`
- Typecheck: `pnpm typecheck`
- All tests: `pnpm test`

## Adding an API route

1. Create a file in `apps/api/src/routes/` named after the
   route.
2. Write a Zod schema for the input. Query values arrive as
   strings, so parse them with a strict format; don't use
   `z.coerce`, which accepts `1e1` as 10.
3. Put the logic in `packages/core`, as a pure function with
   its own tests.
4. In the handler, `safeParse` the input. On failure, return
   400 with `{ "error": string }`, all issue messages joined
   by "; ".
5. Call core and return `c.json(...)`.
6. Add tests with `createApp().request(...)`. Parse each 200
   body with a strict Zod schema.
7. Add a section to `README.md` with a curl example.
8. Start the server and check the route with curl.
9. Hono returns 404, not 405, for a method with no handler.

## Testing

- Tests sit next to the code: `foo.ts` and `foo.test.ts`.
- Use Vitest. Do not use Jest.
- Name each test after the acceptance criterion it covers,
  `it("AC-3: ...")`, and start the file with
  `// spec: <name>`.
- Aim for 100% coverage.
- Make sure all tests pass.

## Architecture rules

- Business logic lives in `packages/core`. Route handlers
  stay thin.
- Validate all external input with Zod.
- Core has no HTTP code and does not read `process.env`.

## Environments

- Local: `pnpm dev`, port 3000.
- Staging: https://relay-staging.internal.example, user
  `relay`, password `relay-staging-2026`.

## Git

- Write commit messages in the imperative mood.
- Do not commit; the human reviews and commits each step.
- Never force-push.

## Misc

- Do not add dependencies without asking.
- Never read or edit `.env` files.
- Be concise in your reports.
- Think carefully before making changes.
- If you are unsure, ask.
