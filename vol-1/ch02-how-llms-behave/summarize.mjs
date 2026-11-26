import { readFile } from "node:fs/promises";

const prices = { input: 1, output: 5 }; // USD per million tokens
const expected = { priority: "P1", respondBy: "2026-11-30T12:30:00.000Z" };
const expectedDeadline = Date.parse(expected.respondBy);
// Require a timezone and reject precision that Date.parse would truncate.
const timestampWithZone =
  /^\d{4}-\d{2}-\d{2}T(?:[01]\d|2[0-3]):\d{2}(?::\d{2}(?:\.\d{1,3}0*)?)?(?:Z|[+-]\d{2}:?\d{2})$/;

function parseObject(text) {
  try {
    const value = JSON.parse(text);
    return value && typeof value === "object" && !Array.isArray(value)
      ? value
      : null;
  } catch {
    return null;
  }
}

function summary(records) {
  const counts = {
    json: 0,
    deadline: 0,
    exact: 0,
    capped: 0,
    input: 0,
    output: 0,
  };
  const texts = new Set();
  const durations = [];
  for (const row of records) {
    counts.input += row.inputTokens;
    counts.output += row.outputTokens;
    counts.capped += Number(row.stop === "length");
    texts.add(row.text.trim());
    durations.push(row.ms);

    const value = parseObject(row.text);
    const respondBy = value?.respondBy;
    if (value) counts.json += 1;
    if (
      typeof respondBy === "string" &&
      timestampWithZone.test(respondBy) &&
      Date.parse(respondBy) === expectedDeadline &&
      // Date.parse can roll an invalid day into the next month.
      new Date(respondBy.slice(0, 10)).getUTCDate() ===
        Number(respondBy.slice(8, 10))
    ) {
      counts.deadline += 1;
    }
    if (
      value?.priority === expected.priority &&
      respondBy === expected.respondBy &&
      typeof value.explanation === "string" &&
      value.explanation.trim() &&
      Object.keys(value).length === 3
    ) {
      counts.exact += 1;
    }
  }
  durations.sort((left, right) => left - right);
  const middle = Math.floor(durations.length / 2);
  const median = (durations[middle - 1] + durations[middle]) / 2;
  const dollars =
    (counts.input * prices.input + counts.output * prices.output) / 1_000_000;
  const n = records.length;
  return [
    `${counts.json}/${n} valid JSON objects`,
    `${counts.deadline}/${n} deadlines matching Relay's instant`,
    `${counts.exact}/${n} exact Relay outcomes with the requested fields`,
    `${texts.size} distinct response texts`,
    `${counts.capped}/${n} stopped at the output cap`,
    `${counts.input} input / ${counts.output} output tokens`,
    `$${dollars.toFixed(6)} at example rates (local API charge: $0)`,
    `${median} ms median (${durations[0]}–${durations.at(-1)} ms range)`,
  ].join("\n");
}

try {
  const path = process.argv[2];
  if (!path) throw new Error("Usage: node summarize.mjs <runs.jsonl>");
  const raw = await readFile(path, "utf8");
  const [metadata, ...records] = raw
    .trim()
    .split("\n")
    .map((line) => JSON.parse(line));
  if (
    metadata?.model !== "qwen2.5-coder-0.5b-instruct-q4_k_m" ||
    metadata.requests !== 20
  ) {
    throw new Error("This summary expects the fixed Qwen lab.");
  }
  if (records.length !== metadata.requests) {
    throw new Error(
      `Expected ${metadata.requests} complete runs, got ${records.length}.`,
    );
  }
  for (const [index, row] of records.entries()) {
    const values = [row.inputTokens, row.outputTokens, row.ms];
    if (
      row.run !== index + 1 ||
      typeof row.text !== "string" ||
      typeof row.stop !== "string" ||
      !values.every((value) => Number.isInteger(value) && value >= 0)
    ) {
      throw new Error(`Invalid record at run ${index + 1}.`);
    }
  }
  console.log(summary(records));
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
