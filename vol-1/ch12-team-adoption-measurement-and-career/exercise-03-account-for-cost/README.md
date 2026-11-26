# Exercise 3 — Account for cost

From the chapter directory, inspect the `rates`, `seats` and `usage` fields in
`fixtures/relay-pilot.mts`. Each usage field aggregates a billed bucket for an
attempt. Cached and uncached input counts are disjoint. This pilot uses a
metered account in addition to fixed seats.

1. Compute tool spend from the token buckets and three paid seats. Keep the
   abandoned attempt in the meter. Calculate its share of the token bill and
   the discrepancy you would see if an export dropped its usage.
2. Implement `tokenCostUsd` and `pilotCostUsd` in `starter/report.mts`. Calculate
   the token charge as the dot product of bucket counts and rates per million,
   divided by one million. Sum unrounded attempt costs before rounding for
   display. Add seat spend once for the whole billing period.
3. Name two additional cost inputs for a renewal decision and who can supply
   them. For example, the review lead can estimate active review capacity and
   the champion can estimate onboarding and support time.

## Verify

Run this command from the chapter directory.

```sh
PILOT_IMPLEMENTATION=starter node --test --test-name-pattern='token bucket' report.test.mts
```

The four attempts cost $1.70 in metered usage and the seats cost $60.00. The
abandoned attempt accounts for $0.425 before rounding, a quarter of metered
usage. Omitting it would give an unrounded meter of $1.275 for the pilot.
Check your [reference implementation](../solution/report.mts), then run the
full starter suite with `PILOT_IMPLEMENTATION=starter node --test report.test.mts`.
