# Challenge — Apply the limit to matches

In your scratch copy, add a second `await checkJSON(...)` call to the
`incident` test for `q=replication&limit=1`. The matching word is on the second line of
the last document. Check that the response contains exactly one result
and preserves its preview. Explain what would happen if a migration
applied `limit` to the input corpus before searching.

## Verification

Run the extended test against the reference solution and your repaired
starter.

```sh
node --test --test-name-pattern '^incident' verification/search.test.mts
RELAY_LAB_STARTER=1 node --test --test-name-pattern '^incident' \
  verification/search.test.mts
```

## Solution notes

The response is HTTP 200 with this array.

```json
[
  {
    "id": "databases",
    "title": "Databases",
    "snippet": "Open the database dashboard."
  }
]
```

If the lookup examines only the first input document, it never reaches
`databases`. The limit bounds the number of matches returned, so the
matcher may need to examine the entire corpus.
