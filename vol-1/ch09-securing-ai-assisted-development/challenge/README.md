# Challenge — Review a change in tool scope

A new support task authorizes the agent to read `relay/support#43`.
The earlier task authorized `relay/support#42`. A teammate suggests
letting any read from `relay/support` through to avoid passing a
separate grant into every tool decision.

Explain where you would bind a grant to the authenticated requester and
current task, when it would expire, and what the connector identity
could access if the control were bypassed. Give a three-row decision
table covering a read of `#42`, a read of `#43`, and a write to `#43`
under the new grant. Identify where a test would observe the absence of
a forbidden connector call.

**Verify it.** Run the reference tool gate tests for the current grant
and denied writes. You can set `RELAY_LAB_STARTER=1` to check your own
implementation after Exercise 2.

```sh
node --test \
  --test-name-pattern='current task|state changes' \
  verification/security.test.mts
```

## Reference answer

The host derives the grant from the authenticated request and the
authoritative access policy. It keeps the grant scoped to that task and
expires it when the task ends or its authorization expires, whichever
happens first. The provider identity has read access to only what the
team intends that service to see. If the provider grants broader read
access than the task needs, use a broker that narrows it and keeps the
credential out of the agent's process.

| Proposal under the new grant | Decision |
| --- | --- |
| Read `relay/support#42` | Deny |
| Read `relay/support#43` | Allow |
| Add a label to `relay/support#43` | Deny |

In an integration test, put a test transport behind the real dispatcher.
Assert that only the allowed read reaches the transport. This lab
exercises the policy function directly. Its write check covers both
grants.
