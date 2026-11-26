# Worked review

The report states an outcome. It omits the test command, which case failed at baseline, what changed and how many tests ran.

In the isolated fixture, the off-first-line case originally failed with actual `Rollback (docs/deploy.md:1)` and expected `Rollback (docs/deploy.md:27)`. The workspace contains exactly the two expected regular files. The formatter diff substitutes `hit.line` for the literal `1`. The heading and path still come from the same fields. The locked test compares equal to the original byte for byte. With the reviewed formatter and a fresh copy of the supplied test, `node --test format-hit.test.mts` exits `0` with two passing tests in the verification environment. This evidence supports the citation change in this fixture. Publishing falls outside the session's authorization.
