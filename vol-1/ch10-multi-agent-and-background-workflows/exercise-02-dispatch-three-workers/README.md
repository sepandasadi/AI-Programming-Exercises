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

**Verify it.** From the coordinating shell, inspect each diff and run its
focused check. Each should change exactly one file and pass one test.
All five tests become useful as a gate when the three changes meet.

```sh
for lane in priority deadline ownership; do
  git -C "$scratch/$lane" status --short
  git -C "$scratch/$lane" diff -- "src/$lane.mts"
  (cd "$scratch/$lane" &&
    node --test --test-name-pattern="^$lane:" test/handoff.test.mts) || break
done
```

`git status --short` includes untracked paths. Review and resolve any
extra changes before committing. Commit only the reviewed formatter
in each worktree.

```sh
for lane in priority deadline ownership; do
  git -C "$scratch/$lane" add -- "src/$lane.mts"
  git -C "$scratch/$lane" commit -m "Implement $lane formatter"
done
```
