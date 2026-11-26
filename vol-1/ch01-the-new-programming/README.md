# Vol. 1, Ch. 1 — The New Programming

Verify a small matcher inspired by Relay's docs search. The lab uses
in-memory sections and has no dependencies beyond Node.js 22.18 or newer.
After checkout, it runs offline without a model, API key, or package install.
The commands use a POSIX-compatible shell.

The matcher accepts a single non-empty ASCII alphanumeric query term
and ASCII fixture text. It returns the IDs of all sections whose heading
or body contains that whole term, case-insensitively, in input order.
Punctuation separates words. The lab has no ranking or limit. See [Relay's
spec](../../relay/docs/specs/docs-search.md) for the full search contract.

## Run the baseline

From this chapter folder, copy the starter into a scratch directory.
Keep this shell open for the exercises.

```sh
node --version
lab_dir="$PWD"
scratch_dir=$(mktemp -d)
cp baseline.test.mts match-sections.mts "$scratch_dir/"
cd "$scratch_dir"
node --test baseline.test.mts
```

Expect two passing tests. The starter intentionally contains a defect.
Use the same scratch directory through the red and green runs so the
fixtures and assertions stay fixed.

| Exercise | Verification |
| --- | --- |
| [Run the baseline](exercise-01-run-the-baseline/) | Explain what the two passing assertions demonstrate |
| [Pin the boundary](exercise-02-pin-the-boundary/) | Observe the intended assertion failure for `rollbacks` |
| [Review the repair](exercise-03-review-the-repair/) | Review the diff and pass all three tests |
| [Challenge](challenge/) | Check punctuation, mixed case, and input order |
| [Quiz](quiz.md) | Check your answers against the explanations |
