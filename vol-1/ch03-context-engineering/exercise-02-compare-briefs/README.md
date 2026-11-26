# Exercise 2 — Compare two briefs

Use the lab's `relay/` directory and the same agent, model and
permissions for both runs. Start a new session each time and disable
persistent memory in both. For Claude Code, launch each session with
`CLAUDE_CODE_DISABLE_AUTO_MEMORY=1`. If your tool cannot disable memory,
restore the same starting state before each session. Record the memory
setting with the results. Keep the companion checker and solution material
out of the sessions. Use them yourself when evaluating the reports.

Copy the following brief for the broad run. For the targeted run, copy
the same brief and append the pointers below it.

**Broad brief**

> At `v1-ch07`, investigate the 400 for `/search?q=rollback&limit=2.0`.
> Cite the governing spec and validation code. Run both requests through
> the handler with the bundled docs, changing only `limit` from `2.0` to
> `2`, and report the command and responses. Leave the files alone.

**Pointers for the targeted brief**

> Start with AC-6 and Behavior in `docs/specs/docs-search.md` and the
> `/search` handler in `apps/api/src/app.ts`.

## Verification

For each run, record the file paths it opened, the claims it made about
the behavior and the evidence for each claim. Count the distinct files
read when the trace shows them. Check every behavior claim against the
spec and `verify-search.mts`.

## Solution notes

Both reports can be correct. Check whether the pointers changed which
files the agent opened or helped it find evidence for a claim. If both
runs find the same evidence in the same number of reads, record that
result. A pair of runs does not establish a general performance
difference.
