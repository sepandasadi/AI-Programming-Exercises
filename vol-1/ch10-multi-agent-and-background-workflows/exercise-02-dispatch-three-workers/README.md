# Exercise 2 — Dispatch three workers

Keep the shell variables from Exercise 1. Before live dispatch, inspect the
sandbox or mount policy each worker will inherit. Confirm its one formatter
is writable and that the composer, tests, other worktrees, and shared Git
metadata are read-only or inaccessible. Keep the runtime from escalating
writes and confirm it can run the focused test. If you cannot verify and
enforce that scope, use the offline replay below.

For the live path, start three independent sessions in the matching absolute
worktree paths. Give each worker the shared contract and one assignment from
the table. You can launch the sessions concurrently. The test path is relative
to the assigned worktree.

| Lane | Worktree | Editable file | Focused test prefix |
| --- | --- | --- | --- |
| Priority | `$scratch/priority` | `src/priority.mts` | `^priority:` |
| Deadline | `$scratch/deadline` | `src/deadline.mts` | `^deadline:` |
| Ownership | `$scratch/ownership` | `src/ownership.mts` | `^ownership:` |

Use this brief with the matching values filled in.

> Read `contract.md`. Implement the contract for your assigned formatter in
> the specified file. Keep its exported signature. The composer, contract
> and tests are fixed for this task. Run the focused test assigned to you
> and report the changed path, test result and any unresolved assumption.
> For the deadline lane, run the test with a non-UTC process time zone.
> Leave the changes in your worktree for review.

For an offline replay, use the three reference files instead of running
coding sessions. The rest of the workflow is the same.

```sh
for lane in priority deadline ownership; do
  cp "$chapter_dir/solution/src/$lane.mts" "$scratch/$lane/src/$lane.mts"
done
```

### Observed live run

Three local Qwen2.5-Coder 3B sessions each received the shared contract
and their own assignment. Each worker's edit and focused test ran in a
Node 22 Docker container. The worktree was mounted read-only with its
assigned formatter mounted writable. Preflight confirmed that the
assigned file could be opened for writing, attempts on the contract,
composer, tests and other formatters were denied, and sibling worktrees
and shared Git metadata were absent.

The first joined run exposed local date getters that had passed in the
UTC container. The revised run exercised the deadline in Pacific time
and checked a year with leading zeroes. The deadline worker needed one
retry. All three scoped diffs and all five joined tests then passed.

**Verify it.** From the coordinating shell, compare each formatter in its
worktree with `HEAD`. That diff shows what the commit below will contain.
Each worktree should change exactly one file and pass one focused test.
Continue to the commit step after all three checks pass.

```sh
(
  for lane in priority deadline ownership; do
    git -C "$scratch/$lane" status --short &&
      git -C "$scratch/$lane" diff HEAD -- "src/$lane.mts" &&
      (cd "$scratch/$lane" &&
        TZ=America/Los_Angeles node --test \
          --test-name-pattern="^$lane:" test/handoff.test.mts) || exit $?
  done
)
```

`git status --short` includes untracked paths. Review and resolve any
extra changes before committing. If you make any edits during review,
repeat verification. Each commit reads the reviewed formatter from its
worktree and leaves other staged paths out of the commit.

```sh
(
  for lane in priority deadline ownership; do
    git -C "$scratch/$lane" commit --only \
      -m "Implement $lane formatter" -- "src/$lane.mts" || exit $?
  done
)
```
