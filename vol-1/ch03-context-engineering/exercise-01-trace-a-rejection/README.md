# Exercise 1 — Trace a rejection

Start in the lab checkout prepared in the chapter README. Ask a fresh
session to investigate why `/search?q=rollback&limit=2.0` returns 400.
Name the tag and `docs/specs/docs-search.md`, and ask for an explanation
with two results from the request handler. Keep the work read-only.

## Verification

The report should cite AC-6 and the spelling rule in Behavior. Follow the
path it gives through `apps/api/src/app.ts` and the schema it calls. Run
`verify-search.mjs` yourself and compare the report with the output.

## Solution

The handler passes the URL query string to `SearchParamsSchema` in
`packages/core/src/search-schema.ts`. The schema checks `limit` for
plain digits before converting it to a number. With `limit=2`, the
bundled docs return “Incident rollback” and “Rollback”. With `limit=2.0`,
validation returns 400 before calling the search function. AC-6 and the
Behavior section describe this contract.
