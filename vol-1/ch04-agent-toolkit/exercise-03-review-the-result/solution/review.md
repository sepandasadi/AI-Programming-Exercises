# Worked review

The report states an outcome. It omits the test command, which case failed at baseline, what changed and how many tests ran.

In the isolated fixture, the off-first-line case originally failed with actual `Rollback (docs/deploy.md:1)` and expected `Rollback (docs/deploy.md:27)`. The formatter diff substitutes `hit.line` for the literal `1`. The heading and path still come from the same fields. The locked test compares equal to the original byte for byte, and `node --test format-hit.test.mts` exits `0` with two passing tests. The fixture has no other files to review. This evidence supports the citation change in this fixture. Publishing falls outside the session's authorization.
