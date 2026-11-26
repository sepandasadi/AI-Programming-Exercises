# Vol. 1, Ch. 12 — Team Adoption, Measurement & Career

Replay a coding-agent pilot on matched Relay documentation and triage tasks.
Every record, price and threshold in this lab is synthetic. The replay needs
Node.js 22.18 or newer and runs offline with no credentials or dependencies.
Each pair represents two distinct tasks of comparable scope, one per condition.

| Exercise | Verification |
| --- | --- |
| [Design the pilot](exercise-01-design-the-pilot/) | Peer-check a charter against the supplied example |
| [Measure the work](exercise-02-measure-the-work/) | Assert effort, completion, follow-up and decisions |
| [Account for cost](exercise-03-account-for-cost/) | Reconcile the usage buckets, including abandoned work |
| [Challenge the follow-up](challenge/) | Check that pending follow-up prevents expansion |
| [Quiz](quiz.md) | Check your reasoning on evidence and rollout |

Run these commands in this chapter folder to verify the reference replay.

```sh
node solution/replay.mts
node --test report.test.mts
```

Expect an overall scorecard, `pause` for triage, `extend` for docs and $61.70
in total pilot spend. To implement the report yourself, edit `starter/report.mts`.
The exercises show how to run the same assertions against the starter.

The optional strict check uses Relay's pinned compiler and Node types. If
Relay's dependencies are already installed, the check runs offline. From
this chapter folder, run the install once if needed, then run the check.

```sh
pnpm --dir ../../relay install --frozen-lockfile
pnpm --dir ../../relay/packages/core exec tsc -p ../../../vol-1/ch12-team-adoption-measurement-and-career/tsconfig.json
```
