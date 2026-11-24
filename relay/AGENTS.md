# Relay: notes for coding agents

Relay is a pnpm workspace (Node.js 22, TypeScript, ESM).

- `packages/core`: domain logic and Zod schemas. No HTTP code here.
- `apps/api`: Hono HTTP API. Route handlers stay thin; logic lives in core.

## Commands (run from `relay/`)

- `pnpm build`: compile all packages (run before testing apps/api, which imports core's build)
- `pnpm typecheck`
- `pnpm test`
- `pnpm spec:check docs/specs/<name>.md`: every acceptance criterion has a test

## Conventions

- Tests sit next to the code: `foo.ts` and `foo.test.ts`, Vitest.
- Name each test after the acceptance criterion it covers, e.g. `it("AC-3: ...")`.
- Validate all external input with Zod.
- Do not add dependencies without asking.
- Do not commit; the human reviews and commits each step.
