# Challenge — Make the check more discriminating

Add a test in the scratch directory. Arrange two exact matches in
reverse alphabetical ID order, one in a heading next to punctuation
and the other in a body next to punctuation. Put a longer term with
`rollback` as a suffix in a third section. Query in mixed case and
assert the first two IDs in input order.

## Verification

Compare with [the reference test](solution/challenge.fixture.mts). Copy it
to scratch if you want to run the reference case.

```sh
cp "$lab_dir/challenge/solution/challenge.fixture.mts" challenge.test.mts
node --test baseline.test.mts boundary.test.mts challenge.test.mts
```

Expect four passes with the repair. The new test expects `['z', 'a']`.
To see what this test adds, temporarily change the repair to sort the
IDs before returning them. The first three tests still pass, and the
challenge fails on order. Restore the repair and rerun all four.
