# Exercise 2 — Compare two briefs

Use the same agent, model, working directory, baseline and permissions
for both runs. Start a new session each time.

**Broad brief.** “Investigate the 400 for `/search?q=rollback&limit=2.0`.
Explain it without changing files.”

**Targeted brief.** “At `v1-ch07`, check the 400 for
`/search?q=rollback&limit=2.0` against AC-6 and Behavior in
`docs/specs/docs-search.md`. Start at the `/search` handler. Identify the
validation rule, compare with `limit=2`, and leave the files alone.”

## Verification

For each run, record the file paths it opened, the claims it made about
the behavior and the evidence for each claim. Count the distinct files
read when the trace shows them. Check every behavior claim against the
spec and `verify-search.mjs`.

## Solution notes

Both reports can be correct. A narrower brief is useful when it avoids
irrelevant reads or prompts the agent to show the missing evidence. If
the broader run discovers the right spec and needs the same number of
reads, record that result. A pair of runs does not establish a general
performance difference.
