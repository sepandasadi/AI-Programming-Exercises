# Quiz — AI in the Delivery Pipeline

1. CI passed for the previous commit. What evidence should the release
   owner look for on the proposed revision?
2. What distinguishes change fail rate from the number of CI failures?
3. Why does a short window with zero mismatches hold this rollout?
4. Both candidate and control start showing mismatches. What can you
   conclude and what should you do?
5. What belongs in an ADR about stable workspace buckets and what belongs
   in the rollback runbook?
6. Why does the rollback check probe a previously exposed workspace?

## Answers

1. A check on the exact revision and build under review, with a scoped
   contract, the expected and observed outcomes, and the exposure and
   recovery evidence for the proposed release.
2. Change fail rate counts deployments that need immediate intervention as
   a share of deployments. CI failures track a different stage of delivery.
3. Both arms need the specified sample. The zero is based on too few
   handoffs to apply this gate's proceed rule.
4. Stop promotion. A bad control makes the new formatter an incomplete
   explanation. Check shared dependencies, instrumentation, and the probe's
   expectations before deciding the incident is resolved.
5. The ADR records why the exposure unit is a workspace and what the choice
   implies. The runbook records the operator, trigger, action, and evidence
   that restores service.
6. The setting can differ from the effective route because of boundaries or
   stale configuration. A probe proves that traffic which previously saw the
   candidate now reaches control and returns the correct handoff.
