# Exercise 3 — Integrate and verify the joined result

Compare each committed branch with the agreed base. The listing should
identify only the assigned formatter. Check the revision and any reported
assumption from the worker before accepting the change.

```sh
for lane in priority deadline ownership; do
  git -C "$integration" diff --name-only "$base...lab/$lane"
done
```

Merge the three reviewed branches into `integration`. This first merge can
fast-forward. The other branches still share the original base and touch
different files. If any merge stops, inspect `git status` in the integration
worktree before proceeding.

```sh
git -C "$integration" merge --ff --no-edit lab/priority &&
  git -C "$integration" merge --ff --no-edit lab/deadline &&
  git -C "$integration" merge --ff --no-edit lab/ownership
```

**Verify it.** Check that the integration checkout is clean so the tests
exercise the commit you will report. Expect five passing tests, including
both `integration:` cases. After they pass, record the commit and results
and check the final diff against the base. Only the three formatter files
should differ. Use a non-UTC process time zone to catch accidental use of
local-time accessors.

```sh
(
  cd "$integration" || exit $?
  integration_changes=$(git status --porcelain) || exit $?
  if [ -n "$integration_changes" ]; then
    printf '%s\n' 'Integration worktree must be clean.' "$integration_changes" >&2
    exit 1
  fi

  TZ=America/Los_Angeles node --test test/handoff.test.mts &&
    git rev-parse HEAD &&
    git diff --name-only "$base" HEAD
)
```

For a live run, compare the time until the last worker finished with the
extra time you spent reviewing and integrating. Keep any repair or overlap
in that record. The [quiz](../quiz.md) asks what evidence you would use
before applying this workflow to a larger change.
