# Exercise 3: Mutation testing

**Goal:** find out whether your tests for `businessTimeBetween` would
notice a bug, and act on what they miss.

## Instructions

1. With Exercise 1's code and tests (and, for the second run, Exercise
   2's properties), add `src/business-time-between.ts` to `mutate` in
   `relay/packages/core/stryker.config.json`.
2. Run `pnpm mutate` from `relay/packages/core` with the property file
   moved aside, then again with it in place. Note both scores.
3. For each surviving mutant, decide: a real gap (write a test that
   kills it), an equivalent mutant (explain why no test can kill it), or
   not worth killing (say why).

## Verification

- A short table in your notes: every survivor, its class, and the test
  or reason. Rerun `pnpm mutate` and confirm the real gaps are gone.

## Solution

`solution/notes.md` has one run's results and classifications.
Mutant counts and scores depend on your exact code; the classes are
what to compare.
