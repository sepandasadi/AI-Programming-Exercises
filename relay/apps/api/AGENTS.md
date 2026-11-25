# apps/api

Rules for this package, on top of `relay/AGENTS.md`.

- A route does three things: parse input with a schema from
  `@relay/core`, call core, shape the response. Business rules
  belong in core.
- Invalid input returns 400 with `{ "error": string }`: every
  Zod issue message, joined by "; ".
- Only `src/server.ts` and `src/config.ts` read the
  environment; `src/app.ts` gets everything through
  `createApp(options)`.
- Test routes with `createApp(...).request(...)`; don't start
  a server in tests. Run `pnpm build` first: this package
  imports core's build.
