# Vol. 1, Ch. 2 — How LLMs Behave

Run the same Relay triage prompt twenty times. Compare response text,
JSON format, agreement with Relay, token usage and full-response latency.
Node.js 22+ is enough to read the recorded run. A live run also needs a
recent `llama-server` and a model download of about 470 MiB.

## Start with the recorded run

Run this from the exercise folder.

```sh
node summarize.mjs recorded/qwen2.5-coder-0.5b.jsonl
```

The first line of the [recording](recorded/qwen2.5-coder-0.5b.jsonl)
contains settings and the SHA-256 of the [prompt](prompt.txt). The next
20 lines contain one response each. Start with the exercises below.

| Exercise | Verification |
| --- | --- |
| [Read the usage record](exercise-01-read-usage/) | Recompute the totals and the example price |
| [Check the deadline](exercise-02-check-the-deadline/) | Compare two raw replies with the rule and the handler |
| [Repeat the prompt](exercise-03-repeat-the-prompt/) | Keep the prompt and evaluation fixed across runs |
| [Challenge: Remove a necessary fact](challenge/) | Look for a request for the missing timestamp |
| [Quiz](quiz.md) | Check your answers after reading |

## Run the lab locally

Follow the [llama.cpp setup instructions](https://github.com/ggml-org/llama.cpp/blob/master/docs/install.md)
for your platform. The recorded setup used llama.cpp 0.6.0, build 11429
(`d81235049`), and Node.js 22.22.2 on Apple silicon with four CPU threads
and zero GPU layers. Use the [Qwen GGUF model repository](https://huggingface.co/Qwen/Qwen2.5-Coder-0.5B-Instruct-GGUF)
to download `qwen2.5-coder-0.5b-instruct-q4_k_m.gguf` to a scratch directory.
The recorded model file had this SHA-256 digest.

```text
1d9614638d18024d0fbb36575a15f1302a3adf044df10345688ec4f6e1c4ff32
```

From the directory where you downloaded the file, start the server in
one terminal. Leave it running for the lab.

```sh
llama-server --model ./qwen2.5-coder-0.5b-instruct-q4_k_m.gguf \
  --alias qwen2.5-coder-0.5b-instruct-q4_k_m \
  --host 127.0.0.1 --port 18082 --ctx-size 2048 --parallel 1 \
  --cache-ram 0 --no-cache-prompt --threads 4 --n-gpu-layers 0
```

From this exercise folder in another terminal, run the experiment.
Write each run to a separate scratch file outside the repo.

```sh
run_file="$(mktemp)"
node run.mjs > "$run_file" && node summarize.mjs "$run_file"
```

The runner writes each completed response as it arrives. If the server
fails, the output file keeps the completed rows. The scorer requires a
complete run. It never requests model output. Stop the server with
Ctrl+C when you finish.

The local run incurs no hosted API charge. The scorer also prices the
same counts under an example tariff of $1 per million input tokens and
$5 per million output tokens. Use a provider's usage and current rates
to forecast a real bill. Latency varies by machine and load.

## Verify the Relay reference result

From the repository root, make a separate checkout for the pinned
application. The lab files live in your current checkout.

```sh
exercises_root="$(pwd)"
git worktree add --detach ../relay-llm-lab v1-ch07
cd ../relay-llm-lab/relay
pnpm install --frozen-lockfile
pnpm build
node "$exercises_root/vol-1/ch02-how-llms-behave/verify-relay.mjs"
```

The verifier must print `P1 | title term outage` on the first line and
`2026-11-30T12:30:00.000Z` on the second. It uses the checked-in issue
fixture and the built `/triage` handler. It does not call a model.
