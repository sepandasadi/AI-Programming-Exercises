# Exercise 4: Catch the bug the agent introduced (the chapter lab)

**Goal:** review a pull request whose CI is green and find the bug in
it, using the chapter's checklist and tools rather than luck.

The branch `lab/v1-ch07-holidays` adds an optional list of holidays to
`addBusinessTime`. It started as a real agent run (kept, unedited, on
`lab/v1-ch07-run2-terse`) and has one bug planted in it, with the tests
that would have caught it adjusted, as a less careful run would leave
them. Don't read the solution or the run branches first.

## Instructions

1. `git fetch` and `git switch lab/v1-ch07-holidays`, then run
   `pnpm install && pnpm build && pnpm test` in `relay/`: all green.
2. Review the diff against `v1-ch07` in the order from section 7.5:
   the requirement ("no business time is counted on a holiday", plus
   `docs/specs/issue-triage.md`), the tests, then the code. Run
   `pnpm review:flags v1-ch07`.
3. For each new test, ask whether its inputs would fail if the code
   were wrong. Write down every case the tests don't reach.
4. Write a property that compares `addBusinessTime` with holidays to a
   minute-by-minute model (extend the one in
   `business-time.property.test.ts`).
5. When you have a failing test, name the bug in one sentence, fix it,
   and pin the counterexample as an example test.

## Verification

- A test that fails on the lab branch as given and passes after your
  fix, and a one-sentence description of the bug in user terms ("an
  issue filed at ... is due at ... instead of ...").

## Solution

`solution/README.md` names the bug, the test that misses it, a failing
example, the fix and a model property. It also shows what two agent
reviewers made of the same pull request.
