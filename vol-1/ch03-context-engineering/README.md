# Vol. 1, Ch. 3 — Context Engineering

Use Relay at `v1-ch07`. Keep this exercise folder available when checking
out the tag, since the tag predates it. Run from the repository root:

```sh
exercises_root="$(pwd)"
git worktree add --detach ../relay-context-lab v1-ch07
cd ../relay-context-lab/relay
pnpm install --frozen-lockfile
pnpm build
node "$exercises_root/vol-1/ch03-context-engineering/verify-search.mjs"
```

The last command runs two requests from the lab's `relay/` directory
against the built handler with the bundled docs. It exits nonzero if a
status, heading or validation message differs from the expected result.

| Exercise | Verification |
| --- | --- |
| [Trace a rejection](exercise-01-trace-a-rejection/) | Cite the spec and reproduce both HTTP results |
| [Compare two briefs](exercise-02-compare-briefs/) | Check evidence and scope in each report |
| [Test a handoff](exercise-03-test-a-handoff/) | Reproduce the finding in a fresh session |
| [Challenge: Resolve a stale claim](challenge/) | Resolve the conflict using the checkout, spec and request evidence |
| [Quiz](quiz.md) | Check your answers against the explanation |

Treat each agent report as a single observation about that session. You
can evaluate its claims by rerunning the script or finding the cited
requirement, even when two sessions take different routes to the answer.
