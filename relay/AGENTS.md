# Relay: notes for coding agents

Relay is a pnpm workspace (Node.js 22, TypeScript, ESM).

- `packages/core`: domain logic and Zod schemas. No HTTP code here.
- `apps/api`: Hono HTTP API. Route handlers stay thin; logic lives in core.

## Commands (run from `relay/`)

- `pnpm build`: compile all packages (run before testing apps/api, which imports core's build)
- `pnpm typecheck`
- `pnpm test`
- `pnpm spec:check docs/specs/<name>.md`: every acceptance criterion has a test titled after it
- `pnpm review:flags [base]`: added lines worth a second look in review
- `pnpm --filter @relay/core mutate`: mutation testing (Stryker) on the files in
  `packages/core/stryker.config.json`

## Conventions

- Tests sit next to the code: `foo.ts` and `foo.test.ts`, Vitest.
- Name each test after the acceptance criterion it covers, e.g. `it("AC-3: ...")`,
  and start the test file with `// spec: <name>` (the spec's file name without
  `.md`). `spec:check` counts only titles in files tagged for that spec.
- New features start with a spec in `docs/specs/` and a plan in `docs/plans/`
  (templates in `docs/templates/`).
- Validate all external input with Zod.
- `pnpm typecheck` is part of the green gate. A new `as`, `!`, `any` or
  `@ts-` needs a comment saying why.
- When a task says the tests are locked, do not change, skip or delete any
  test. If you think a test is wrong, stop and say which and why.
- A property test's model is the reference: do not change it in the same
  change as the code it checks without saying so in your report.
- Do not add dependencies without asking.
- Do not commit; the human reviews and commits each step.
