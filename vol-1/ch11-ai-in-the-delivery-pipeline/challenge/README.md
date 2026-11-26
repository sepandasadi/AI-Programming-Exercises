# Challenge — Verify that zero means off

Copy the reference lab to a new scratch folder. From the chapter folder:

```sh
rollback_scratch=$(mktemp -d)
cp -R lab "$rollback_scratch/"
```

In the scratch copy of `lab/replay.mts`, change the cohort predicate from
`bucket < flagPercent` to `bucket <= flagPercent`. Leave the tests and
fixture expectations intact. Run the following commands separately:

```sh
node "$rollback_scratch/lab/release.mts" rollback
node --test --test-name-pattern='flag off' "$rollback_scratch/lab/canary.test.mts"
```

**Verify** that the rollback command exits with status 1 and reports
`rollback-failed`. `candidateBuckets` contains bucket 0, and
`firstMismatch` shows the expected and actual handoffs for issue 43. The
candidate checked two handoffs and missed `UTC` on one. The focused test
must also fail. Keep promotion stopped even though the flag is set to zero.

**Solution** Restore the strict predicate in the scratch file. The rollback
command must print `restored` with no candidate observations and the focused
test must pass. The stable workspace decision is recorded in the [ADR](../docs/adr-001-handoff-cohort.md).
