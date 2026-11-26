# Exercise 3 — Review the result

Read the [completion report](starter/report.md). Decide which of its claims you can rely on from the report alone and what you would inspect for each claim. Use the workspace from Exercise 2 or repeat the manual steps to create it.

From the Exercise 2 folder, in the shell that still has `lab` set, list the workspace files:

```sh
ls -la "$lab"
```

Continue only if the workspace contains exactly the two expected regular files. Then inspect the diff and compare the test:

```sh
diff -u starter/format-hit.mts "$lab/format-hit.mts"
cmp format-hit.test.mts "$lab/format-hit.test.mts"
```

`diff` exits `1` for the expected one-line change. `cmp` exits silently with status `0` when the test bytes match the supplied copy. Resolve any unexpected changes before running the tests.

After both checks, stage the reviewed formatter and the original test in a fresh directory:

```sh
check="$(mktemp -d)"
cp "$lab/format-hit.mts" format-hit.test.mts "$check/"
printf '%s\n' "$check"
```

For a live agent run, open this directory in a confined execution environment with tool network access disabled and no credentials. For the manual exercise, use the same local Node environment you used to establish the baseline. In the new directory, run `node --test format-hit.test.mts`. Require exit status `0` and two passing tests.

**Verify.** Record the baseline assertion, final test count, test-file comparison and reviewed file. Compare your evidence with the [worked review](solution/review.md).
