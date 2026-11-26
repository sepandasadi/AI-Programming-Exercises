# Exercise 2 — Check the canary

Read the [release packet](../docs/release-packet.md). From the chapter folder,
make an editable copy of the simulator:

```sh
canary_scratch=$(mktemp -d)
cp -R lab "$canary_scratch/"
cp exercise-02-check-the-canary/starter/gate.mts "$canary_scratch/lab/gate.mts"
node --test "$canary_scratch/lab/canary.test.mts"
```

The test run exits with status 1. Expect four failures with the gate stub:
clean samples do not proceed, and three cases that should stop return hold.
Implement `evaluateCanary` in the scratch file and rerun the tests. Expect all
eight to pass. The [reference gate](../lab/gate.mts) is available for comparison.

**Verify** the three decisions from the actual replays. Run these lines
individually in a shell that stays open after a nonzero exit:

```sh
node "$canary_scratch/lab/release.mts" canary healthy
node "$canary_scratch/lab/release.mts" canary short
node "$canary_scratch/lab/release.mts" canary regression
```

| Replay       | Control checked / mismatched | Candidate checked / mismatched | Decision  | Exit |
| ------------ | ---------------------------- | ------------------------------ | --------- | ---- |
| `healthy`    | 20 / 0                       | 20 / 0                         | `proceed` | 0    |
| `short`      | 8 / 0                        | 8 / 0                          | `hold`    | 2    |
| `regression` | 20 / 0                       | 20 / 10                        | `stop`    | 3    |

Explain why the short run's zero mismatches cannot justify promotion. Find
which fixture needs its `UTC` suffix to pass the regression replay.
