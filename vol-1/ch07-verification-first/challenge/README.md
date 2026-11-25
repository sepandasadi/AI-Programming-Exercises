# Challenge: grade an agent reviewer

**Goal:** find out what an agent reviewer adds to your own review, and
what it costs, on a pull request where you know the answer.

## Instructions

1. Do Exercise 4 first and write down your own findings on
   `lab/v1-ch07-holidays`, with the time you spent.
2. Run two fresh agent reviewers on the same diff
   (`git diff v1-ch07...lab/v1-ch07-holidays`), neither told there is a
   bug:
   - **Unbriefed:** "Review this pull request. Report your findings
     ranked by severity."
   - **Briefed:** give it the requirement, `docs/specs/issue-triage.md`,
     the checklist from section 7.5, and the rule from Listing 7.9
     (confirm every behavior claim by running code; report suspicions
     separately).
   Keep both read-only: they may run code only in a separate worktree.
3. Reproduce or reject every behavior claim each reviewer makes.

## Verification

A table with one row per finding and columns: found by you, by the
unbriefed agent, by the briefed agent; confirmed or rejected; and
whether it was planted, a real weakness of the original agent run, or
a false positive.

## Reference

Section 7.6 has one run of this experiment. Both agents found the
planted bug; only the briefed one found that the test "a deadline at
17:00 before a holiday stays at 17:00" passes without its holiday; the
unbriefed one made a performance claim ("ran for minutes") that
measured at about 260 ms. Your run will differ; the shape of the
comparison is the point.
