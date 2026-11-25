# Exercise 2: Properties that catch what examples miss

**Goal:** write property-based tests for `businessTimeBetween` and use
them to find a bug that passes every example test.

## Instructions

1. Do Exercise 1 first, or copy its `solution/relay/` over `relay/`.
2. Copy `starter/relay/` over `relay/`. It replaces your
   implementation with an agent-style "faster" version that passes all
   six example tests from Exercise 1's solution. Confirm that with
   `pnpm test`.
3. Write `business-time-between.property.test.ts` with fast-check
   (already a dev dependency of `@relay/core`). Aim for at least one of
   each kind from section 7.4: a round trip with `addBusinessTime`, an
   algebraic law, and an invariant.
4. When a property fails, read the shrunk counterexample, find the bug,
   fix it, and pin the counterexample as an example test.

## Verification

- Your properties fail against the starter implementation.
- After your fix, the properties and the example tests pass, and the
  pinned counterexample fails if you put the starter back.

## Solution

`solution/relay/packages/core/src/business-time-between.property.test.ts`
has three properties. Against the starter, the round trip and the
"splitting the span changes nothing" law fail (the starter rounds the
number of whole weeks instead of flooring it, so spans of 3.5 to 7
days count a week too many); the "never more than calendar time"
invariant still passes. Against Exercise 1's solution all three pass.
