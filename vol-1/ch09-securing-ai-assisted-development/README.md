# Vol. 1, Ch. 9 — Securing AI-Assisted Development

Review a proposed Relay issue-triage change. Use synthetic records to
check which tool calls a session may make and which dependency
changes still need review. The lab uses TypeScript on Node.js 22.18 or
newer. It runs offline with the Node test runner and does not need Relay's
dependencies, credentials, a model, or a connector.

From this folder, verify the reference implementation.

```sh
node --test verification/security.test.mts
```

For the coding exercises, make a scratch copy and edit its `starter/`
files. Leave the verification file unchanged.

```sh
lab_copy="$(mktemp -d)"
cp -R . "$lab_copy/"
cd "$lab_copy"
```

The untouched starter denies all tool requests and holds all packages.
The starter suite should initially report three failures. Two cover
allowed reads and one covers an approved package. The denial and hold
checks should pass already. After both coding exercises, all 13 should
pass with this command.

```sh
RELAY_LAB_STARTER=1 node --test verification/security.test.mts
```

| Exercise | Verification |
| --- | --- |
| [Review a proposed change](exercise-01-review-a-change/) | Map each finding to an enforced control and a check |
| [Gate proposed tool calls](exercise-02-gate-tool-calls/) | Allow the approved read and deny other proposals |
| [Check dependency approvals](exercise-03-check-dependencies/) | Hold changes to names, versions or sources outside the reviewed inventory |
| [Challenge](challenge/) | Review a change in scope and verify the grant follows the current task |
| [Quiz](quiz.md) | Check your reasoning against the answer key |
