# Exercise 3 — Review the repair

Keep the baseline and boundary tests from the first two exercises. In
the scratch directory, replace substring matching with whole-term
matching. Keep the exported function signature and preserve fixture order.
The matcher may use the lab's ASCII-only contract.

## Verification

Compare your change with the starter and run the same tests that produced
the failure.

```sh
diff -u "$lab_dir/match-sections.mts" match-sections.mts
node --test baseline.test.mts boundary.test.mts
```

`diff` reports differences with exit status 1. The test command should
report three passes and exit successfully. Explain how the revised
matcher rejects the plural while still finding a term in a heading or a
body.

The [reference repair](solution/match-sections.mts) tokenizes the two
fields with a space between them. Its `includes` checks for an array
entry equal to the term. To try it, copy it to a fresh scratch directory
with the two tests, or replace your current matcher after saving your
own edit.
