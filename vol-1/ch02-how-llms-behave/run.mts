import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { performance } from "node:perf_hooks";

type ChatCompletion = {
  model?: unknown;
  usage?: { prompt_tokens?: unknown; completion_tokens?: unknown };
  choices?: { message?: { content?: unknown }; finish_reason?: unknown }[];
};

const endpoint = "http://127.0.0.1:18082/v1/chat/completions";
const [mode, challengeModel, ...extraArgs] = process.argv.slice(2);
const abstention = mode === "--abstention";
if (
  (mode !== undefined && !abstention) ||
  extraArgs.length > 0 ||
  challengeModel === ""
) {
  console.error("Usage: node run.mts [--abstention [model-alias]]");
  process.exit(1);
}

const promptPath = abstention ? "challenge/prompt.txt" : "prompt.txt";
const prompt = await readFile(new URL(promptPath, import.meta.url), "utf8");
const settings = {
  model: challengeModel ?? "qwen2.5-coder-0.5b-instruct-q4_k_m",
  temperature: 0.8,
  top_p: 0.95,
  top_k: 40,
  max_tokens: 160,
};
const requests = 20;
const responseFormat = {
  type: "json_schema",
  json_schema: {
    name: "relay_triage",
    strict: true,
    schema: {
      type: "object",
      properties: {
        priority: { enum: ["P0", "P1", "P2", "P3"] },
        respondBy: { anyOf: [{ type: "string" }, { type: "null" }] },
        explanation: { type: "string" },
      },
      required: ["priority", "respondBy", "explanation"],
      additionalProperties: false,
    },
  },
};
const body = JSON.stringify({
  ...settings,
  ...(abstention ? { response_format: responseFormat } : {}),
  messages: [{ role: "user", content: prompt }],
});
console.log(
  JSON.stringify({
    ...settings,
    requests,
    ...(abstention ? { responseFormat: responseFormat.type } : {}),
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

    const result: ChatCompletion = await response.json();
    if (result.model !== settings.model) {
      throw new Error("Unexpected model in response. Check the server alias.");
    }
    const usage = result.usage;
    const choice = result.choices?.[0];
    if (
      typeof usage?.prompt_tokens !== "number" ||
      !Number.isInteger(usage.prompt_tokens) ||
      typeof usage.completion_tokens !== "number" ||
      !Number.isInteger(usage.completion_tokens) ||
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
    const message = error instanceof Error ? error.message : String(error);
    console.error(
      `Run ${run} stopped after ${run - 1} completed requests. ${message}. Check the local server on port 18082.`,
    );
    process.exit(1);
  }
}
