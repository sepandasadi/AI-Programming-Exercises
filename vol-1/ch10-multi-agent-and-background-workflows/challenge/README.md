# Challenge — Catch an out-of-scope edit

After Exercise 3, create a separate worktree from the accepted
integration revision. In this copy, remove the ownership hint from
`src/handoff.mts`. Remove the `ownershipHint` import as well. Treat that
change as a proposed simplification from a worker who owned only the
priority formatter.

```sh
git -C "$integration" worktree add -b lab/challenge \
  "$scratch/challenge" integration
```

**Verify it.** Check which file changed and run both focused and combined
checks from the challenge worktree.

```sh
git -C "$scratch/challenge" diff --name-only
(cd "$scratch/challenge" && node --test \
  --test-name-pattern='^priority:' test/handoff.test.mts)
(cd "$scratch/challenge" && node --test \
  --test-name-pattern='^integration:' test/handoff.test.mts)
```

## Reference result

The diff names `src/handoff.mts`, outside that worker's scope. The priority
check passes. Both integration checks fail because the output is missing
the final field. In review, reject the extra edit or give it a separate
contract and reviewer. The accepted integration checkout still contains
the complete handoff.

When finished, keep the scratch parent if you want to inspect the history.
To clean up later, first check each worktree for edits you want to retain.
Remove clean worktrees with `git worktree remove` from the integration
checkout. The deliberately edited challenge worktree needs its change
reviewed before it can be removed normally.
