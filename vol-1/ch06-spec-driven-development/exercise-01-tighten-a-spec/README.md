# Exercise 1: Tighten a spec

**Goal:** turn a vague request into a spec an agent can follow.

## Instructions

1. Read `starter/stale-issues.md`. It is the kind of request that
   arrives in chat.
2. Rewrite it as a spec with the sections from section 6.2: Problem,
   Goal, Non-goals, Behavior, Acceptance criteria (numbered `AC-1`,
   `AC-2`, ...), Interface, Constraints, Verification and Open
   questions. Save it as `relay/docs/specs/stale-issues.md`.
3. Every vague phrase in the starter ("a while", "sensibly", "fast",
   "gracefully, etc.") must become either a definition, a criterion
   or a non-goal.

## Verification

Ask your agent, in a read-only planning mode:

```text
Read docs/specs/stale-issues.md. List every ambiguity,
contradiction or missing decision that would let two
competent engineers implement it differently. Do not
propose code.
```

Resolve anything on the list that would change behavior, then ask
again. You are done when the list contains only points that don't
change behavior.

Compare with `solution/stale-issues.md`. Yours will differ; check that
it decides the same questions (what "stale" means exactly, the boundary
at exactly N days, ordering and ties, on-hold labels, bad input).
