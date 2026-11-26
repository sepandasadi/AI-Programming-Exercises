# Exercise 2 — Pin the boundary

Continue in the scratch directory from the [chapter README](../README.md).
Create `boundary.test.mts` next to `match-sections.mts`. Use the imports
from `baseline.test.mts`. Arrange two sections with distinct IDs. Put
`Rollback` in one heading and `rollbacks` in the other section's body.
Query `rollback` and assert that only the first ID is returned.

## Verification

```sh
node --test baseline.test.mts boundary.test.mts
```

Expect a nonzero exit, two passes, and one failure. Read the assertion
diff. The result should include the ID you expected and one extra ID.
A loader error or syntax error would give you different evidence.
Compare your test with the [solution](solution/boundary.test.mts).
To use the book's fixture and get its IDs, run the following from scratch.

```sh
cp "$lab_dir/exercise-02-pin-the-boundary/solution/boundary.test.mts" .
node --test baseline.test.mts boundary.test.mts
```

The two expected passes stay green. The third test expects `['exact']`
and receives `['exact', 'plural']`.
