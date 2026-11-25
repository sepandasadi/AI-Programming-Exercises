# Relay search support handoff

- Revision: `v1-ch07`. Working directory: `relay/`.
- Question: Should `limit=2.0` be accepted?
- Decision: Keep digit-only spelling. See
  `docs/specs/docs-search.md`, AC-6 and Behavior.
- Evidence: `verify-search.mjs` ran with the bundled docs.
  The same `q=rollback` returned 200 with `limit=2`
  and 400 with `limit=2.0`.
- Next action: Explain the digit requirement to the caller.
  Use `limit=2`.
- Open question: Which revision is deployed? Verify it if
  the caller's result differs.
