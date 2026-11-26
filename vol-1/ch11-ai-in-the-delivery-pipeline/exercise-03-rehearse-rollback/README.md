# Exercise 3 — Rehearse rollback

From the chapter folder, run the regression first. Its status is 3, so run
the next command separately in a shell that remains open after a nonzero exit.

```sh
node lab/release.mts canary regression
```

In the [runbook](../docs/runbook.md), find the trigger and the role that owns
rollback. Rehearse disabling the flag while the regression is still the
candidate.

```sh
node lab/release.mts rollback
node --test --test-name-pattern='flag off' lab/canary.test.mts
```

**Verify** that bucket 9 returns to control, bucket 10 stays on control,
and all 40 checks now run on control with zero mismatches. The focused test
must pass. Record the synthetic release label, the two decisions (`stop` and
`restored`), the flag settings, and the observed counts in your release log.
