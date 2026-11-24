# Chapter 6 quiz

Answers are at the end.

1. You need a one-off script to rename 300 files once. Spec first, or
   prompt directly? Why?
2. Name two signals, other than risk, that push a task toward a spec.
3. What is the purpose of a non-goals section when the reader is a
   coding agent?
4. Rewrite this criterion so a test can check it: "Search should
   handle large limits sensibly."
5. Why does the docs-search spec define *section* and *term* instead
   of relying on the acceptance criteria alone?
6. What three things should every task in a plan list, and what does
   each let you check?
7. Why should every task leave the build green?
8. In the one-prompt, one-commit loop, who commits, and when?
9. An agent is ten minutes into a task and has added a dependency the
   spec rules out. Interrupt and redirect, rewind, or restart? Why?
10. What does `pnpm spec:check` verify, and what does it *not*
    verify?

## Answers

1. Prompt directly. The cost of being wrong is low and you can check
   the result by looking at it.
2. The task spans more than one session; more than one agent or
   person will work on it. (Also: you cannot see a mistake by looking
   at the output.)
3. It stops the agent from adding plausible extra scope (caching,
   options, libraries) that you would then have to review and
   maintain.
4. For example: "`limit` defaults to 5; values outside 1 to 20 or not
   an integer return 400."
5. Criteria use those words. Undefined, the agent picks its own
   definitions, and differences (such as text before the first
   heading) slip past every criterion.
6. Files touched (shape and size of the change), acceptance criteria
   covered (coverage, scope creep), and a verification command (each
   step ends with a check).
7. So you can stop, verify, review and commit after any task, and
   reset to a known-good state.
8. The human, after rerunning the verification command and reviewing
   the diff.
9. Rewind (or reset to the last commit). The run's context now
   contains a wrong decision; redirecting leaves it there. Then
   restart the task, and add the ruled-out dependency to the spec's
   non-goals if it is missing.
10. That every acceptance criterion ID appears in at least one test
    file. It does not check that the test actually tests the
    criterion; that is a review job (Ch. 7).
