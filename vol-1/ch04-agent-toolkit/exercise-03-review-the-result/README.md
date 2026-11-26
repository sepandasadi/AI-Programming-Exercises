# Exercise 3 — Review the result

Read the [completion report](starter/report.md). Decide which of its claims you can rely on from the report alone and what you would inspect for each claim. Use the workspace from Exercise 2 or repeat the manual steps to create it.

From the Exercise 2 folder, in the shell that still has `lab` set, run:

```sh
diff -u starter/format-hit.mts "$lab/format-hit.mts"
cmp format-hit.test.mts "$lab/format-hit.test.mts"
(cd "$lab" && node --test format-hit.test.mts)
```

`diff` exits `1` when the files differ, so run these commands individually. Review the changed line. `cmp` and the final test run should exit `0`. Inspect the temporary directory for unexpected files.

**Verify.** Record the baseline assertion, final test count, test-file comparison and reviewed file. Compare your evidence with the [worked review](solution/review.md).
