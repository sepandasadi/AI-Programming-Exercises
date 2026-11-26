# Challenge — Apply the limit to matches

Add a second `checkJSON` call to `TestIncident` in your scratch copy
for `q=replication&limit=1`. The matching word is on the second line of
the last document. Check that the response contains exactly one result
and preserves its preview. Explain what would happen if a migration
applied `limit` to the input corpus before searching.

## Verification

Run the extended test against the reference solution and your repaired
starter.

```sh
go test ./verification -run '^TestIncident$'
go test ./verification -run '^TestIncident$' -args -implementation=starter
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
