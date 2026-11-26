import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";

const endpoint = "http://127.0.0.1:18082/v1/chat/completions";
if (process.argv.length !== 2) {
  console.error("Usage: node run.mjs");
  process.exit(1);
}

const prompt = await readFile(new URL("prompt.txt", import.meta.url), "utf8");
const settings = {
  model: "qwen2.5-coder-0.5b-instruct-q4_k_m",
  temperature: 0.8,
  top_p: 0.95,
  top_k: 40,
  max_tokens: 160,
};
const requests = 20;
const body = JSON.stringify({
  ...settings,
  messages: [{ role: "user", content: prompt }],
});
console.log(
  JSON.stringify({
    ...settings,
    requests,
    startedAt: new Date().toISOString(),
    promptSha256: createHash("sha256").update(prompt).digest("hex"),
  }),
);

for (let run = 1; run <= requests; run += 1) {
  const started = performance.now();
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body,
      redirect: "error",
      signal: AbortSignal.timeout(30_000),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const result = await response.json();
    if (result.model !== settings.model) {
      throw new Error("Unexpected model in response. Check the server alias.");
    }
    const usage = result.usage;
    const choice = result.choices?.[0];
    if (
      !Number.isInteger(usage?.prompt_tokens) ||
      !Number.isInteger(usage?.completion_tokens) ||
      typeof choice?.message?.content !== "string" ||
      typeof choice.finish_reason !== "string"
    ) {
      throw new Error(
        "Response did not include text, a finish reason and token counts",
      );
    }
    console.log(
      JSON.stringify({
        run,
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        ms: Math.round(performance.now() - started),
        stop: choice.finish_reason,
        text: choice.message.content,
      }),
    );
  } catch (error) {
    console.error(
      `Run ${run} stopped after ${run - 1} completed requests. ${error.message}. Check the local server on port 18082.`,
    );
    process.exit(1);
  }
}
