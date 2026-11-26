# Exercise 3 — Check dependency approvals

Edit [`starter/check-dependencies.mts`](../starter/check-dependencies.mts).
The inputs are arrays of normalized fixture records with `name`,
`version` and `source` fields. The candidate inventory comes from a proposed
change. The approved inventory comes from an independent reviewer.

Return every candidate whose exact name, version and source do not all
match a single approved record. Preserve input order and leave both
inputs intact. Run the comparison locally. The examples use fictional
packages and reserved domains.

**Verify it.** Run the dependency gate tests from the lab folder.

```sh
RELAY_LAB_STARTER=1 node --test \
  --test-name-pattern='^dependency gate' verification/security.test.mts
```

The untouched starter fails the exact-match check. The completed
function should pass all five tests. Compare your code with the
[reference solution](../solution/check-dependencies.mts). In a real
pipeline, a trusted extractor and a separate review of provenance,
integrity, transitive dependencies and scripts would still be needed.
