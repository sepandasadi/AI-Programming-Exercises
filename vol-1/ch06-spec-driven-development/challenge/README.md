# Challenge: Rescue a run that went wrong

**Goal:** practise course-correcting (section 6.5) on a task that is
built to drift.

## Setup

Start from tag `v1-ch06`. Give your agent this prompt, exactly as
written, with no spec:

```text
Make the docs search better.
```

## What to do

1. Let the agent run until you see it make a decision you would not
   have made (a new dependency, a change to ranking, a UI, a cache).
   Interrupt it there.
2. Write down the decision and why it is wrong for Relay, in one line
   each.
3. Rewind or reset to the last commit, so none of the run's edits
   remain.
4. Write a *restart brief*: a short spec (problem, goal, non-goals,
   at least three acceptance criteria) for one concrete improvement,
   such as phrase search with double quotes.
5. Run the improvement through the full loop: plan, one prompt per
   task, one commit per task.

## Verification

- `git diff v1-ch06 --stat` shows only the files your plan lists.
- `pnpm spec:check docs/specs/<your-spec>.md` passes.
- `pnpm build && pnpm typecheck && pnpm test` pass.
- Your notes from step 2 name at least one decision the agent made
  that your restart brief now rules out as a non-goal.
