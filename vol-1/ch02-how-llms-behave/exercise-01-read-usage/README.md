# Exercise 1 — Read the usage record

Open the [recorded run](../recorded/qwen2.5-coder-0.5b.jsonl). The first
line describes the request settings. For the next 20 lines, add the
`inputTokens` and `outputTokens` columns separately. Multiply the totals
by $1 and $5 per million, respectively. Add the charges. Identify the
unit used in `ms` and what the timer includes.

Why might two tokenizers disagree about the cost of this same text?
Explain why the price you calculated would be unsuitable as a forecast
for a different model or a multistep coding agent.

## Verification

From the [chapter folder](../), run
`node summarize.mjs recorded/qwen2.5-coder-0.5b.jsonl` and compare the
totals to yours. Compare the first and last response objects. Input usage
should be equal even though the output text and length differ.

## Optional: Count a string on the local model

With the [lab server running](../README.md#run-the-lab-locally), inspect
the length of the `tokens` array for each string. Change the `content`
field and repeat.

```sh
curl --fail --silent --show-error \
  -H 'Content-Type: application/json' \
  --data '{"content":"2026-11-30T12:30:00.000Z","add_special":false}' \
  http://127.0.0.1:18082/tokenize
```

The tested tokenizer returned 24 tokens for that timestamp, two for
`respondBy` and one for `rollback`. These plain-string counts exclude
chat framing. Use the run's `inputTokens` to count the full message.

## Solution

The local server reported 4,140 input tokens and 1,565 output tokens.
The example input charge is $0.004140 and the example output charge is
$0.007825, totaling $0.011965 at those rates. The local inference used no
hosted API. A different service can tokenize the text differently and
add request framing. An agent can submit multiple requests for one task.

`ms` measures from the HTTP request to parsing the full HTTP response.
It includes local server inference and overhead. The model was already
loaded, and the requests did not stream.
