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
chat framing.

## Optional: Count the chat-framed prompt

With the same server running, run this from the [chapter folder](../).
`/apply-template` formats the user message as the model expects it.
Then `/tokenize` counts the formatted text with no extra special tokens
added by the tokenizer.

```sh
node --input-type=module <<'JS'
import { readFile } from "node:fs/promises";

async function post(path, body) {
  const response = await fetch(`http://127.0.0.1:18082${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

async function count(content) {
  const { tokens } = await post("/tokenize", { content, add_special: false });
  return tokens.length;
}

const prompt = await readFile("prompt.txt", "utf8");
const issue = prompt.split("\n\n").find((block) => block.startsWith("Issue 412\n"));
const framed = await post("/apply-template", {
  messages: [{ role: "user", content: prompt }],
});

console.log("Issue alone:", await count(issue));
console.log("Raw prompt:", await count(prompt));
console.log("Chat-framed prompt:", await count(framed.prompt));
JS
```

The issue block from `Issue 412` through `Created:`, with no trailing
newline, takes 45 tokens. The raw `prompt.txt` takes 178, and the
chat-framed prompt takes 207. Compare the last count with `inputTokens`
in the recording. Each request reported 207.

## Solution

The local server reported 4,140 input tokens and 1,565 output tokens.
The example input charge is $0.004140 and the example output charge is
$0.007825, totaling $0.011965 at those rates. The local inference used no
hosted API. A different service can tokenize the text differently and
add request framing. An agent can submit multiple requests for one task.

`ms` measures from the HTTP request to parsing the full HTTP response.
It includes local server inference and overhead. The model was already
loaded, and the requests did not stream.
