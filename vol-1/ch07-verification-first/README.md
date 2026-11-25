# Vol. 1, Ch. 7: Verification First

Exercises for test-first work with agents, property-based tests,
mutation testing and reviewing an agent's pull request. Start from tag
`v1-ch07`, where Relay has the issue triage feature built in the
chapter (`relay/docs/specs/issue-triage.md`), its property tests, and
Stryker set up in `relay/packages/core` (`pnpm mutate`).

| Folder | Goal | Verification |
| --- | --- | --- |
| [exercise-01-tests-first](exercise-01-tests-first/) | Build `businessTimeBetween` with one session writing tests and another writing code | Tests fail against the stub, then pass; `git diff` shows no test changed in the code session |
| [exercise-02-properties](exercise-02-properties/) | Write properties that catch a bug six example tests miss | Your properties fail on the starter and pass on your fix |
| [exercise-03-mutation-testing](exercise-03-mutation-testing/) | Run Stryker on your code and act on the survivors | Every survivor is killed or classified, with a reason |
| [exercise-04-catch-the-bug](exercise-04-catch-the-bug/) | Review the lab pull request and find its bug | A failing test that names the bug, then a fix that makes it pass |
| [challenge](challenge/) | Measure an agent reviewer against your own review | A table of findings: found by you, by the agent, by both, false positives |
| [quiz.md](quiz.md) | Ten questions with answers | |
