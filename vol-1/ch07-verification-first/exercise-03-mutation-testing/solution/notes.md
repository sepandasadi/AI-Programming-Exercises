# Mutation testing notes: `businessTimeBetween`

Run on 2026-11-24 with Stryker 10.1.1 (`pnpm mutate` in
`relay/packages/core`, `mutate: ["src/business-time-between.ts"]`),
against Exercise 1's solution: 41 mutants.

| Tests | Score | Survivors |
| --- | --- | --- |
| Exercise 1's 6 example tests | 87.80% | 5 |
| Plus Exercise 2's 3 properties | 90.24% | 4 |

## Survivors and their classes

| Mutant | Class | Why |
| --- | --- | --- |
| `if (to > from)` becomes `if (true)` | Real gap, closed by the properties | With no check, a day where the span ends before opening adds a negative amount. No example has such a day; random spans do. Killed in the second run. |
| `if (to > from)` becomes `if (to >= from)` | Equivalent | When `to === from` the added amount is 0. |
| `day < b` becomes `day <= b` | Equivalent | The extra day starts at `b`, so `to = min(b, ...) = b` is below `from >= b + 09:00`, and nothing is added. |
| Error message `"businessTimeBetween: invalid Date"` becomes `""` | Not worth killing | The tests check the error type, which is the contract; the wording isn't. |
| Error message `"... end is before start"` becomes `""` | Not worth killing | Same. |

Timeouts (2 and 3) count as killed: the mutant made the loop run
forever, and the test run noticed.
