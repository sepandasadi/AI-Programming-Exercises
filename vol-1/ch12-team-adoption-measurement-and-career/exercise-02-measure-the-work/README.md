# Exercise 2 — Measure the work

Before running the reference, inspect `fixtures/relay-pilot.mts`. Predict which
condition had the lower median minutes to disposition. Then add author and
reviewer effort for `triage-2` in both conditions. Explain why the assisted
row still belongs in the effort and acceptance comparison.

From the chapter directory, run `node solution/replay.mts`. Check the figures
against your hand calculation. Verify that the report returns `extend` for
documentation and `pause` for triage, even though both have lower assisted
median elapsed time. In the assisted triage group, one of two assigned tasks
was accepted, and one of one observed accepted changes had an escaped defect.

## Build and verify

Implement `compare` and `decision` in `starter/report.mts`. Use these rules.

- Count time for every assigned attempt. Include accepted or abandoned attempts
  in the median, which describes time to disposition.
- Count `pending` as accepted. Count `clear` and `escaped-defect` as both
  accepted and observed. Count `abandoned` as neither.
- Reject an empty sample and repeated pair IDs. Report the two arms separately.
  Set the report's `lane` to the shared category or `mixed` when the sample
  includes both categories.
- Require a single category for a rollout decision. Throw an error for a
  `mixed` report and keep the overall scorecard for context.
- Pause if the assisted arm has any observed escaped defect, lower acceptance
  or more than 15 extra active review minutes per assisted task on average.
- With those checks clear, extend if fewer than four pairs are present, either
  arm has incomplete follow-up, or assisted author plus review effort is at
  least as high as baseline effort. Otherwise return `consider-expansion`.

Run the checks in the chapter directory. They fail against the unfilled starter.

```sh
PILOT_IMPLEMENTATION=starter node --test --test-name-pattern='assigned work|task lanes|mixed lanes|duplicate pair IDs|pauses|extends|pending follow-up' report.test.mts
```

The [reference report](../solution/report.mts) and [fixture assertions](../report.test.mts)
show the results for both categories and the whole pilot.
