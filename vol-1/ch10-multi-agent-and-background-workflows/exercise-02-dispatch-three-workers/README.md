# Exercise 2 — Dispatch three workers

Keep the shell variables from Exercise 1. Start three independent sessions
in the matching absolute worktree paths. Give each worker the shared contract
and one assignment from the table. You can launch the sessions concurrently.
The test path is relative to the assigned worktree.

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
> Leave the changes in your worktree for review.

For an offline replay, use the three reference files instead of running
coding sessions. The rest of the workflow is the same.

```sh
for lane in priority deadline ownership; do
  cp "$chapter_dir/solution/src/$lane.mts" "$scratch/$lane/src/$lane.mts"
done
```

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
        node --test --test-name-pattern="^$lane:" test/handoff.test.mts) || exit $?
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
