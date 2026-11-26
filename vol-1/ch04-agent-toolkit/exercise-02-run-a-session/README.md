# Exercise 2 — Run a bounded session

The formatter always prints `:1` beside the result path. The search hit already carries the one-based heading line. Preserve the heading and path and print the supplied line. Change only `format-hit.mts`.

Start with the offline replay, from this exercise folder:

```sh
node replay.mts
```

## Run the stages yourself

In a shell, from this exercise folder, create a fresh workspace and copy only the two task files. Keep this shell so you can use the path again during the review.

```sh
lab="$(mktemp -d)"
cp starter/format-hit.mts format-hit.test.mts "$lab/"
printf '%s\n' "$lab"
(cd "$lab" && node --test format-hit.test.mts)
```

The baseline exits with status `1`. Read the failing assertion. It should show expected `:27`, actual `:1`, and the first-line case should pass. A missing file or incompatible Node version is a setup failure.

1. **Explore.** Read the formatter and the test. Trace each part of the displayed string to its source and find the literal responsible for the failure.
2. **Plan.** Write down the one change, the unchanged behavior and the test you will rerun.
3. **Implement.** Edit the formatter in the temporary workspace, then check your patch against the [reference formatter](solution/format-hit.mts).
4. **Verify.** In the original shell run `(cd "$lab" && node --test format-hit.test.mts)` again. Require exit status `0` and two passing tests. Run `cmp format-hit.test.mts "$lab/format-hit.test.mts"` to compare test bytes. With these paths, `cmp` exits silently on equality.

## Optional live agent run

Start with a fresh copy of the two files. Open only that workspace in the agent. Allow local reads and the test command, turn off tool egress if supported, and hold write permission until you have reviewed the plan. Use a disposable environment with no credentials if you need stronger confinement. This task works with the supplied files and Node alone.

> Read the formatter and the supplied test. Run `node --test format-hit.test.mts` in this directory. Explain the failure and propose a one-file fix. Stop for review before editing.

Check the failing assertion and confirm the agent found the literal `1`. Then send this instruction:

> Apply the agreed fix to `format-hit.mts`. Keep the heading and path and print the existing one-based line from the hit. Leave the test file byte-for-byte unchanged. Run the same test command and report the exact change, test count and exit status. Stop with the diff ready for review.

If the agent asks to widen the scope, inspect the request before acting. When it reports completion, continue to Exercise 3 from your own terminal.
