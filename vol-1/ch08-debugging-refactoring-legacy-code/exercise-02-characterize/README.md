# Exercise 2 — Characterize the existing contract

Before editing the matching rule, record what the current handler does
on a working query, a no-match query and an invalid request. Predict
status, result order and the JSON fields for `q=dashboard` by reading
[the fixture](../internal/corpus/corpus.mts). Then inspect and run the
[shared tests](../verification/search.test.mts) from the lab root.

```sh
node --test --test-name-pattern '^characterization: starter$' \
  verification/search.test.mts
```

Check the default and explicit limits, how the handler trims the query,
the shape of an empty result, and the 400 responses. If you use an
agent, give it the exact command and ask which observable behavior each
test protects. Check the answer against the assertions.

## Solution

The default returns `payments` and `alerts` in corpus order. An explicit
limit of three includes `databases`. Each result has `id`, `title` and a
first-line `snippet`. No matches return `[]`. Whitespace around the query
and capitalization do not affect matching in the fixture. A blank query
and limits outside the accepted range return HTTP 400. Keep the missing
`failover` result in its own incident test so the repair can turn it green.
