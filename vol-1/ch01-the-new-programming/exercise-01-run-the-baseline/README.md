# Exercise 1 — Run the baseline

Follow the setup in the [chapter README](../README.md). Open
[`baseline.test.mts`](../baseline.test.mts) and
[`match-sections.mts`](../match-sections.mts). Identify the expected
result for each query. Describe a case the tests would miss.

## Verification and solution

The `Rollback` query finds `incident` through its heading and `staging`
through its body, in fixture order. The `backfill` query finds nothing.
Verify that `node --test baseline.test.mts` reports exactly two passes.
The fixtures contain no longer word that contains `rollback`. The
assertions leave substring matching and whole-term matching both possible.
