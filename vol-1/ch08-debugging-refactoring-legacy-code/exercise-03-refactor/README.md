# Exercise 3 — Fix the bug and refactor

In your scratch copy, change the starter to search the full body while
continuing to display its first line. Run the incident and starter
characterization tests before extracting anything.

```sh
RELAY_LAB_STARTER=1 node --test --test-name-pattern '^incident' \
  verification/search.test.mts
node --test --test-name-pattern '^characterization: starter$' \
  verification/search.test.mts
```

Record the small diff at this checkpoint. Then extract matching and
result construction into a function that accepts runbooks, a normalized
query and a validated limit. Keep request parsing and response writing
in the handler. Run both commands again after the extraction. Review
the diff for changes to validation, result order and response shape.

## Solution

A minimal repair changes the comparison from `snippet` to `body`.
Once both checks pass, compare the extracted function with the
[reference solution](../solution/search.mts). The solution also extracts
request parsing, so the handler shows the HTTP steps in order. Run the
full lab suite to check the reference and your edited starter on the
same characterization cases.

```sh
node --test verification/search.test.mts
```
