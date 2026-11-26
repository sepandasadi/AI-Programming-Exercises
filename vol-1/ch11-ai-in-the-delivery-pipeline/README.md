# Vol. 1, Ch. 11 — AI in the Delivery Pipeline

Review a release packet for Relay's triage handoff, evaluate a synthetic
canary, and verify a flag rollback. The lab uses Node.js 22.18 or newer and
its built-in test runner. Every command runs locally with preselected
TypeScript fixtures. Each replay starts from those fixtures and ends
without storing state. It needs no dependencies, credentials, model, or
network connection.

Run commands from this chapter folder unless an exercise says otherwise.

| Exercise                                                            | Verification                                                                          |
| ------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| [Review the release packet](exercise-01-review-the-release-packet/) | Check ownership, evidence for the release revision, and the rollback criterion        |
| [Check the canary](exercise-02-check-the-canary/)                   | Run the gate against healthy, short, and regressed windows                            |
| [Rehearse rollback](exercise-03-rehearse-rollback/)                 | Replay the previously exposed cohort with the flag off and check the complete handoff |
| [Challenge](challenge/)                                             | Introduce an inclusive bucket boundary and observe a failed rollback                  |
| [Quiz](quiz.md)                                                     | Check your reasoning against the answers                                              |

The completed simulator and tests are in [`lab/`](lab/). The
[release packet](docs/release-packet.md), [ADR](docs/adr-001-handoff-cohort.md),
and [runbook](docs/runbook.md) describe the same release from three
perspectives.

## Verify the reference implementation

```sh
node --test lab/canary.test.mts
```

Expect eight passing tests. Node executes the TypeScript by stripping
its types. For a separate compile-time check, use the Relay workspace's
locked development dependencies. From this chapter folder:

```sh
pnpm --dir ../../relay install --frozen-lockfile
../../relay/packages/core/node_modules/.bin/tsc \
  --noEmit --strict --target es2022 --module nodenext \
  --allowImportingTsExtensions \
  --typeRoots ../../relay/packages/core/node_modules/@types --types node \
  lab/*.mts exercise-02-check-the-canary/starter/gate.mts
```

The dependency install can require network access when the local pnpm
store is cold. Runtime replay and tests are independent of that install.
