# Quiz — The New Programming

1. What changes when you move from editor completions to a coding agent?
2. Why can METR's early result and DORA's throughput finding both hold?
3. What limits the interpretation of METR's February 2026 update?
4. What can you infer from an assertion that the starter passes?
5. Why run a new boundary test before editing the matcher?
6. Could this lab verify that the Relay API returns results in ranked order?
7. An agent reports that a suite passed before its last edit. What would
   you check before accepting the change?

## Answers

1. A configured agent can take a sequence of actions across files and
   tools. You review its proposed state changes and the evidence behind them.
2. METR randomized AI access for tasks in familiar projects and compared
   time spent. DORA modeled relationships between reported AI use and
   delivery outcomes. Their units, outcomes, and designs differ.
3. Both reported intervals include zero. Selective participation and
   task submission change what the experiment represents. Concurrent
   work also complicates timing.
4. The run met the asserted expectation for that input on that revision.
   Other inputs or properties may require their own checks.
5. A failure on the intended assertion shows the test distinguishes the
   known defective behavior from the requirement. A failing import says
   something about test setup instead.
6. The lab checks a small function that keeps input order. Ranking
   requires a check that exercises Relay's ranking behavior.
7. Inspect the final diff, then reproduce the relevant checks on that
   revision. Make sure the tests ran and still assert the agreed behavior.
