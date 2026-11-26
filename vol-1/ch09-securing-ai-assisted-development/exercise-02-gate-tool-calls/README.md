# Exercise 2 — Gate proposed tool calls

Edit [`starter/issue-gate.mts`](../starter/issue-gate.mts). A trusted
caller supplies the independently authorized `allowedIssue`. The first
argument is a decoded JSON value representing a tool proposal.

Allow only a JSON object with exactly two keys, `tool` and `issue`, where
`tool` equals `readIssue` and `issue` equals the authorized issue key
exactly. Return the allowed issue from the trusted argument. Deny each
other proposal with a fixed `{ outcome: "deny" }` result. A caller can
log this outcome without recording submitted text. The function makes
no call to a connector.

**Verify it.** Run the tool gate tests from the lab folder.

```sh
RELAY_LAB_STARTER=1 node --test \
  --test-name-pattern='^tool gate' verification/security.test.mts
```

The untouched starter fails two tests that expect a read to succeed.
Your implementation should pass all eight, including different repo,
wrong issue, malformed object and denied write. Compare your code with
the [reference solution](../solution/issue-gate.mts).
