# Exercise 1 — Reproduce the missing result

A teammate says checkout failover guidance is missing from runbook
search. The ticket calls for matches in the title or full body, with
the first line as a preview. Start with the request in the
[incident test](../verification/search_test.go), the handler registration
in [the starter](../starter/search.go) and the Payments document in
[the fixture](../internal/corpus/corpus.go).
Draw a short path from the HTTP request to the lookup and back.

From your scratch copy, run the incident check before editing.

```sh
go test ./verification -run '^TestIncident$' -args -implementation=starter
```

Expected failure is `got []` with a wanted result whose ID is
`payments`. The test checked status and content type before reaching
that assertion. Use `q=dashboard` from `TestCharacterization` as a known
working request. Write two hypotheses and identify an observation that
would rule each one out. For example, the fixture rules out a missing
source document, and a local diagnostic inside the loop can reveal which
strings the predicate actually examines. Keep diagnostics in the scratch
copy and remove them after you have explained the failure.

## Solution

`GET /runbooks/search` receives `q=failover`. The normalized query is
`failover`, and the Payments record contains it on the second body line.
`strings.Cut` gives the first line to the predicate as `snippet`. The
predicate searches the title and snippet, so it never sees the second
line. The first line is still the preview callers expect to see.
