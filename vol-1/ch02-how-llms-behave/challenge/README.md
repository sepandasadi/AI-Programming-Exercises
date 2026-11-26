# Challenge — Remove a necessary fact

Copy the lab folder to a scratch directory. Remove the `Created:` line
from the scratch copy of `prompt.txt`. Replace the two sentences starting
with `Use UTC with milliseconds` and `Write one sentence` with these:

> If the creation timestamp is present, use UTC with milliseconds for
> `respondBy` and explain the deadline in one sentence. If the timestamp
> is missing, set `respondBy` to JSON `null` and state in one sentence that
> the creation timestamp is missing.

Keep the JSON-only requirement, title, label and rules. Use the same
model and sampler settings as in the recorded lab.

## Verification

With the [local server](../README.md#run-the-lab-locally) running, use
`node run.mts` to capture the replies. Score the raw replies against the
challenge contract. An acceptable JSON object contains `priority: "P1"`,
`respondBy: null`, and a one-sentence `explanation` that names the creation
timestamp as missing. Count formatting failures separately. A reply wrapped in
Markdown fails the raw JSON check. The original scorer
expects a deadline for the complete fixture, so use your own tally for
this challenge.

## Try examples and constrained JSON

From the original chapter folder, run the [worked-example prompt](prompt.txt)
against the same local server. This uses the same sampler and requests a
JSON schema. The schema allows all four priorities and either a timestamp
string or `null`, leaving the model to decide from the issue.

```sh
abstention_run=$(mktemp)
node run.mts --abstention > "$abstention_run"
```

Score the raw replies in `$abstention_run` with the same challenge criteria above.
The examples demonstrate both branches with different issues. The final
checkout issue still has to be scored independently.

In two 20-request batches with this prompt and schema, the original Qwen
0.5B model gave 6 and 2 fully correct replies. The Qwen2.5-Coder-3B-Instruct
Q4_K_M model gave 14 and 15. All batches had 20 replies with the requested
JSON shape. The 3B model gave zero fully correct replies in one batch with
the first prompt and no schema.
To repeat the model comparison, use the [3B GGUF](https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct-GGUF),
start `llama-server` as above with its file and matching alias on port
18082, then run `node run.mts --abstention qwen2.5-coder-3b-instruct-q4_k_m`.
These are individual sampled runs. Track formatting, priority, abstention
and the explanation separately when you repeat them.

## Solution notes

The title and label are enough to decide P1. The rules define how much
time to add but require a starting time. A guessed timestamp, or a
statement that all of the information is present, fails the check. If
you are using the recorded run only, write the expected JSON object for
this changed task and explain why the recording cannot test it.
