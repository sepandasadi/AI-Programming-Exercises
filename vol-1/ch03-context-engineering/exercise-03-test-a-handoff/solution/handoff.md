# Relay search support handoff

- Revision: `v1-ch07`. Working directory: `relay/`.
- Question: Should `limit=2.0` be accepted?
- Decision: Keep digit-only spelling. See
  `docs/specs/docs-search.md`, AC-6 and Behavior.
- Evidence: The same `q=rollback` returned 200 with
  `limit=2` and 400 with `limit=2.0` on the bundled docs.
- Next action: Explain the digit requirement to the caller.
  Use `limit=2`.
- Open question: Which revision is deployed? Verify it if
  the caller's result differs.

Run this from `relay/` after `pnpm build`.

```sh
node --input-type=module <<'JS'
import { createApp } from "./apps/api/dist/app.js";
import { loadDocs } from "./packages/core/dist/index.js";

const sections = await loadDocs("fixtures/team-docs");
const app = createApp({ sections });
for (const limit of ["2", "2.0"]) {
  const url = `/search?q=rollback&limit=${limit}`;
  const response = await app.request(url);
  const body = await response.json();
  const detail = response.ok
    ? body.results.map(({ heading }) => heading).join(" | ")
    : body.error;
  console.log(`${response.status} ${detail}`);
}
JS
```
