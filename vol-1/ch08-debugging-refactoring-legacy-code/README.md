# Vol. 1, Ch. 8 — Debugging, Refactoring & Legacy Code

Debug a small Go runbook lookup used in the chapter as a fictional
predecessor to Relay's document search. The lab uses standard-library Go
1.22 or newer and four synthetic runbooks. The tests send requests to an
in-process HTTP handler. You can run them offline after installing Go.

Run these commands from this folder.

```sh
go test ./...
go test ./verification -run '^TestIncident$' -args -implementation=starter
```

The first command verifies the repair and compares the starter and
solution on the behavior the chapter keeps. The second command should
fail on the untouched starter. It gets HTTP 200 with `[]` for
`q=failover`. A repaired handler should return the Payments runbook.

For the editing exercises, work in a scratch copy of this folder.

```sh
lab_copy="$(mktemp -d)"
cp -R . "$lab_copy/"
cd "$lab_copy"
```

| Exercise                                                        | Verification                                                          |
| --------------------------------------------------------------- | --------------------------------------------------------------------- |
| [Reproduce the missing result](exercise-01-reproduce/)          | Trace the failing request to the predicate that chose its search text |
| [Characterize the existing contract](exercise-02-characterize/) | Check the observed HTTP behavior you need to keep                     |
| [Fix the bug and refactor](exercise-03-refactor/)               | Make the incident test pass and keep the characterization tests green |
| [Challenge](challenge/)                                         | Check a match late in the corpus with a one-result limit              |
| [Quiz](quiz.md)                                                 | Check your understanding against the answers                          |

The [starter](starter/search.go) keeps request parsing, matching and
JSON output together. The [solution](solution/search.go) parses at the
HTTP boundary, searches in a separate function and keeps the response
contract. The [verification tests](verification/search_test.go) accept
both handlers through `http.Handler`. Switch to the scratch copy before
editing, and remove it when you finish.
