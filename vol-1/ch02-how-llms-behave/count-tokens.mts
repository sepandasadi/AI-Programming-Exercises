import { readFile } from "node:fs/promises";

async function post(path: string, body: object): Promise<unknown> {
  const response = await fetch(`http://127.0.0.1:18082${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`);
  return response.json();
}

async function count(content: string): Promise<number> {
  const result = await post("/tokenize", { content, add_special: false });
  if (
    typeof result !== "object" ||
    result === null ||
    !("tokens" in result) ||
    !Array.isArray(result.tokens)
  ) {
    throw new Error("The server did not return tokens.");
  }
  return result.tokens.length;
}

const prompt = await readFile(new URL("prompt.txt", import.meta.url), "utf8");
const issue = prompt
  .split("\n\n")
  .find((block) => block.startsWith("Issue 412\n"));
if (issue === undefined)
  throw new Error("Issue 412 is missing from prompt.txt.");
const framed = await post("/apply-template", {
  messages: [{ role: "user", content: prompt }],
});
if (
  typeof framed !== "object" ||
  framed === null ||
  !("prompt" in framed) ||
  typeof framed.prompt !== "string"
) {
  throw new Error("The server did not return a chat-framed prompt.");
}

console.log("Issue alone:", await count(issue));
console.log("Raw prompt:", await count(prompt));
console.log("Chat-framed prompt:", await count(framed.prompt));
