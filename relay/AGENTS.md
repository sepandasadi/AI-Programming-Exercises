# Relay: notes for coding agents

Relay is a pnpm workspace (Node.js 22, TypeScript, ESM).

- `packages/core`: domain logic and Zod schemas. No HTTP code here.
- `apps/api`: Hono HTTP API. Route handlers stay thin; logic lives in core.

## Commands (run from `relay/`)

- `pnpm build`: compile all packages (run before testing apps/api, which imports core's build)
- `pnpm typecheck`
- `pnpm test`
- `pnpm spec:check docs/specs/<name>.md`: every acceptance criterion has a test titled after it

## Conventions

- Tests sit next to the code: `foo.ts` and `foo.test.ts`, Vitest.
- Name each test after the acceptance criterion it covers, e.g. `it("AC-3: ...")`,
  and start the test file with `// spec: <name>` (the spec's file name without
  `.md`). `spec:check` counts only titles in files tagged for that spec.
- New features start with a spec in `docs/specs/` and a plan in `docs/plans/`
  (templates in `docs/templates/`).
- Validate all external input with Zod.
- Do not add dependencies without asking.
- Do not commit; the human reviews and commits each step.
