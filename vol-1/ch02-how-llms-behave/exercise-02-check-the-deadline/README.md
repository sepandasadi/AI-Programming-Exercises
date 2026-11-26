# Exercise 2 — Check the deadline

Read the rules in the [prompt](../prompt.txt). Work out the priority and
deadline before running a model or looking at the labeled result. How
much of the SLA fits on Friday, and when does the rest run?

Read the `text` fields for runs 1 and 13 in the
[recording](../recorded/qwen2.5-coder-0.5b.jsonl). For each, mark whether
it parses as sent, whether it contains the requested fields, and whether
its claims agree with Relay. Count the reasons for rejection separately.

## Verification

Run [the Relay verifier](../README.md#verify-the-relay-reference-result)
and compare the priority and deadline with your calculation. Run the
[offline scorer](../README.md#start-with-the-recorded-run) to see the
number of parseable replies, deadlines that represent the correct instant,
and exact matches across all 20 requests. For example,
`2026-11-30T12:30:00Z` gives the correct instant and omits the required
milliseconds.

## Solution

`outage` sets P1. Friday 16:30–17:00 uses thirty minutes. Monday 09:00
plus three and a half hours is 12:30 UTC on November 30. Relay returns
`2026-11-30T12:30:00.000Z`.

Run 1 is fenced Markdown. Its inner object also uses `high` and the
wrong date. Run 13 is parseable and says `P1`, but its date is wrong and
lacks milliseconds. Its explanation says the next opening is Friday.
Review explanations even when the requested values match. An exact match
requires a nonempty explanation. You still need to check its claims.
