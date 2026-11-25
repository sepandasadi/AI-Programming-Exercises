# Relay: notes for coding agents

Relay searches a team's docs and triages its issues. It is a
pnpm workspace (Node.js 22, TypeScript, ESM). Run every
command from `relay/`.

- `packages/core`: domain logic and Zod schemas. No HTTP code.
- `apps/api`: Hono HTTP API. Routes stay thin; logic is in core.
- `docs/specs`, `docs/plans`: a spec and a plan per feature.

Each package has its own `AGENTS.md` with rules for that folder.

## Commands

- Green gate, before you report a task done:
  `pnpm build && pnpm typecheck && pnpm test`
  (build first: apps/api imports core's build)
- `pnpm spec:check docs/specs/<name>.md`: every acceptance
  criterion has a test titled after it
- `pnpm review:flags [base]`: added lines worth a second look
- `pnpm mutate`: mutation testing on the files in
  `packages/core/stryker.config.json`
- `pnpm agents:check`: checks this file, skills and hooks

## Conventions

- Tests sit next to the code: `foo.ts` and `foo.test.ts`, Vitest.
- Name each test after the criterion it covers, `it("AC-3: ...")`,
  and start the file with `// spec: <name>` (the spec's file
  name without `.md`).
- New features start with a spec in `docs/specs/` and a plan in
  `docs/plans/` (templates in `docs/templates/`).
- Validate all external input with Zod.
- A new `as`, `!`, `any` or `@ts-` needs a comment saying why.
- When a task says the tests are locked, do not change, skip or
  delete any test. If you think a test is wrong, stop and say so.
- A property test's model is the reference: do not change it in
  the same change as the code it checks without saying so.

## Boundaries

- Never read, print or edit `.env` files; `.env.example` lists
  the variables.
- Ask before adding a dependency, changing CI or editing agent
  config (`AGENTS.md` files, `.claude/`, `.agents/`, `.codex/`,
  `.mcp.json`).
- Do not commit; the human reviews and commits each step.
