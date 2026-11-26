# Chapter 10 quiz

1. Two changes touch different files but disagree on the meaning of a shared
   field. What must be settled before parallel dispatch?
2. Which resources does a Git worktree share with the original checkout?
3. A background job pushed its branch but timed out before reporting a PR.
   What state should a retry check before creating anything?
4. A PR review bot finds a defect and proposes a fix. Which process should
   still determine whether the proposed change satisfies the contract?
5. Three focused tests pass. Which revision must pass the full suite before
   you accept the three changes as a unit?
6. Workers finish faster in parallel. What else belongs in the comparison
   with a single-agent run?

## Answers

1. Agree on the field contract and give it an owner. If the work depends on
   changing that contract, land or establish it first and fan out afterward.
2. Worktrees have separate checked-out files, indexes and HEADs. They share
   objects, most refs and common repository configuration. Filesystem and
   network permissions come from the process environment.
3. Look up the persisted request, branch revision and existing PR for its
   head and base. Resume an incomplete transition using that evidence.
4. Use the ordinary required checks on the exact proposed revision and the
   human review process. The bot's finding and patch inform those decisions.
5. The integration revision that actually contains all three accepted
   contributions.
6. Include dispatch, handoffs, retries, time reviewing and integrating,
   corrective work, and total model usage when that data is available.
