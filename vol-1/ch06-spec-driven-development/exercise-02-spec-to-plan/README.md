# Exercise 2: From spec to plan

**Goal:** get a plan from your agent and review it before any code is
written.

## Instructions

1. Use your spec from Exercise 1 (or `../exercise-01-tighten-a-spec/solution/stale-issues.md`).
2. In a read-only planning mode, give the agent the prompt from
   Listing 6.4, with `stale-issues` in place of `docs-search`.
3. Review the plan against the checklist below. Edit it directly.
4. Save it as `relay/docs/plans/stale-issues.md`.

## Review checklist

- [ ] Every acceptance criterion appears in at least one task.
- [ ] Every task lists files touched, criteria covered and a
      verification command.
- [ ] Each task leaves the build green.
- [ ] Domain logic (`packages/core`) comes before the HTTP route.
- [ ] No task is larger than one reviewable commit.
- [ ] Nothing in the plan contradicts a non-goal.

## Verification

Build a coverage table: one row per acceptance criterion, one column
per task, a mark where the task covers the criterion. Every row needs
at least one mark. Compare with `solution/plan.md`.
