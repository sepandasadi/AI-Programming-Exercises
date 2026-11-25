# Challenge: Grade the reviewer

**Goal:** run Relay's `reviewer` sub-agent on a change that passes every
automated check and is still wrong, and grade what it reports.

`sla-table.patch` is a version of Exercise 2's `GET /sla` feature, the
kind of pull request an agent might open. The green gate passes,
`spec:check` lists AC-1 to AC-3 as `ok`, and `agents:check` passes. It
contains planted problems. Don't read the patch closely before the
reviewer runs, or you'll grade it against what you already know.

## Instructions

1. Start from tag `v1-ch05` on a new branch:

   ```sh
   git switch -c review-sla v1-ch05
   git apply vol-1/ch05-project-instructions-extensibility/challenge/sla-table.patch
   git add -A && git commit -m "Add GET /sla (spec: sla-table)"
   ```

2. From `relay/`, run the gate and `pnpm spec:check
   docs/specs/sla-table.md`. Both pass.
3. In a fresh session, ask: "Use the reviewer sub-agent to review this
   branch against `v1-ch05` for `docs/specs/sla-table.md`." In a tool
   without Claude Code's sub-agent format, give a fresh session the body
   of `relay/.claude/agents/reviewer.md` as its brief.
4. Review the branch yourself, with the Ch. 7 checklist, before reading
   the reviewer's report.
5. Optional: run a second, unbriefed review ("Review this branch.") and
   compare.

## Verification

A table with one row per finding, from you and from each reviewer:

| Finding | Found by | Reproduced? (input, actual, expected) | Real, or false positive |
| --- | --- | --- | --- |

Every behavior finding must be reproduced by you, not taken from the
report. Then open `solution/answers.md` and mark each planted problem
found or missed by each reviewer.
