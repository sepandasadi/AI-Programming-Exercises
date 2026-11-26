# Proposed Relay handoff release

- Candidate `relay-11.1`. Keep the plain-text handoff contract.
- Evidence. The `relay-11.0` CI run is green.
- Approval. The agent that drafted the change marked the PR ready to ship.
- Rollout. Enable `handoff_formatter_v2` for ten of one hundred workspace
  buckets and increase exposure once the dashboard looks healthy.
- Rollback. Turn the flag off and close the incident.
