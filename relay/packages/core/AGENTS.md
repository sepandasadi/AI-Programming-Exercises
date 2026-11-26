# packages/core

Rules for this package, on top of `relay/AGENTS.md`.

- Pure functions by default. Only `src/load-docs.ts` touches
  the file system; nothing here reads `process.env`, starts a
  server or imports Hono.
- No hidden clocks: a function that needs the time takes it as
  a parameter (as `triageIssue` uses `issue.createdAt`), so
  tests can fix it.
- Schemas for external input live here, next to the code that
  uses them, and are exported from `src/index.ts`. Apps import
  only `@relay/core`, never a deep path.
- `business-time.property.test.ts` holds the reference model
  for business time. Change the model only in its own change,
  and say so in your report.
