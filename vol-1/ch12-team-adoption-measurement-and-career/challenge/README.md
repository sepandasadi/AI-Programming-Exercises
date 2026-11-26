# Challenge — Challenge the follow-up

Imagine the documentation pilot extends to four matched pairs. The assisted
arm still uses less active time and accepts all four changes. If one accepted
change reaches the readout before its follow-up window ends, the scorecard must
show four accepted and three observed in that arm. The decision should stay at
`extend` even with zero observed defects.

From the chapter directory, run the reference check.

```sh
node --test --test-name-pattern='extends|pending follow-up' report.test.mts
```

In `report.test.mts`, read how the test temporarily clones the two docs pairs
under separate synthetic IDs to make four, then changes one outcome to
`pending`. This creates a scenario for the rule, independent of any real task
sample. The test exercises pending follow-up in each arm in turn.

In a scratch copy of this chapter, change the trial outcome in that test from
`pending` to `clear`. Rerun the command and confirm the assertion that required
three observed outcomes fails. Restore `pending` and confirm both tests pass.
Before collecting real records, add a state for work that could never be
observed, such as a release flag that was never enabled, and decide who can
resolve it and when the team would stop waiting.
