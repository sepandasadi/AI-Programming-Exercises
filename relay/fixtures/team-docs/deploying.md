# Deploying

## Release train

We deploy from `main` every weekday at 10:00 and 15:00 UTC. A release
is blocked if CI is red or if a feature flag lacks an owner.

## Rollback

To roll back, run `relay-ops rollback --to <tag>`. Rollbacks need no
approval during an incident. Post the tag in #deploys afterwards.

## Feature flags

Every risky change ships behind a flag. Flags older than 90 days are
reviewed in the monthly cleanup.
