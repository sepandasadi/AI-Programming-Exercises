---
name: add-api-route
description: How to add or change an HTTP route in Relay's API (apps/api) - schema in core, thin Hono handler, request tests, README entry and a smoke check against the running server. Use when a task adds, changes or removes an endpoint.
---

# Adding or changing a Relay API route

1. **Spec first.** The route's behavior is in
   `docs/specs/<feature>.md`. If there is no spec, or it doesn't
   say what invalid input returns, stop and ask.
2. **Schema in core.** Put the input schema in
   `packages/core/src/<feature>-schema.ts` and export it from
   `src/index.ts`. Query values arrive as strings: parse them
   with a strict format (see `search-schema.ts`), not
   `z.coerce`.
3. **Logic in core**, as a pure function with its own tests.
4. **The handler** in `apps/api/src/app.ts`: `safeParse` the
   input; on failure return 400 with `{ error }`, all issue
   messages joined by "; "; otherwise call core and return
   `c.json(...)`. Bodies get `bodyLimit` (see `/triage`).
5. **Tests** in `apps/api/src/app.<feature>.test.ts`, tagged
   `// spec: <feature>`, through `createApp(...).request(...)`.
   Parse every 200 body with a strict Zod schema, and cover each
   400 the spec names.
6. **README**: add a section to `relay/README.md` with a curl
   example.
7. **Verify**: run the green gate, then the smoke check for
   each new route, and paste its output in your report:

   ```sh
   pnpm build
   bash .agents/skills/add-api-route/scripts/smoke.sh \
     '/your/path?x=1'
   ```

   It starts the built API on port 3917, sends one request and
   prints the body and the status. Extra arguments go to curl
   (`-X POST -H 'content-type: application/json' -d @file`).

Hono answers a path with no handler for that method with 404,
not 405. Don't add a 405 handler unless the spec asks for one.
