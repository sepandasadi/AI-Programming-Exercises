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
`respondBy: null`, and an `explanation` that names the creation timestamp
as missing. Count formatting failures separately. The original scorer
expects a deadline for the complete fixture, so use your own tally for
this challenge.

## Solution notes

The title and label are enough to decide P1. The rules define how much
time to add but require a starting time. A guessed timestamp, or a
statement that all of the information is present, fails the check. If
you are using the recorded run only, write the expected JSON object for
this changed task and explain why the recording cannot test it.
