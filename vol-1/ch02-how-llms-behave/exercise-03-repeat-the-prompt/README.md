# Exercise 3 — Repeat the prompt

[Start the local server](../README.md#run-the-lab-locally). Copy the lab
folder to a scratch directory and run `node run.mts` there. Save the
output. Repeat at the same settings or change only `temperature` in the
scratch copy to `0.2` and run a second batch. Keep the model, prompt,
output cap, and scoring rule fixed.

If you are working from the recording, choose two runs with different
texts. Mark each difference as formatting, wording or a change to a
field value. Explain which differences would make a consumer act
differently.

## Verification

Run `node summarize.mts <path-to-output>` for each live batch. Check the
settings and prompt digest in the first line of each file. Record total
input and output tokens, distinct texts, parseable replies, correct
deadline instants, exact matches, and median latency. Pick a pair of
examples from the raw data that explains what one of the aggregate
numbers missed.

## Solution notes

Fewer distinct replies can still include repeated errors. Exact outcomes
can improve even if wording still varies. A latency difference on one
machine can reflect other load as well as changed answer lengths. Use
more cases before drawing a conclusion about a model or setting.
