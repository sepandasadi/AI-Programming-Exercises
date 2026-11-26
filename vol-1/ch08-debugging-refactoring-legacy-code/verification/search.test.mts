import assert from "node:assert/strict";
import { test } from "node:test";
import { runbooks } from "../internal/corpus/corpus.mts";
import { createHandler as createStarter } from "../starter/search.mts";
import { createHandler as createSolution } from "../solution/search.mts";

type Handler = (request: Request) => Response;

const payments = {
  id: "payments",
  title: "Payments",
  snippet: "Start with the dashboard.",
};
const rollback = {
  id: "rollback",
  title: "Rollback",
  snippet: "Check the release marker.",
};
const alerts = {
  id: "alerts",
  title: "Alerts",
  snippet: "Check the alert dashboard.",
};
const databases = {
  id: "databases",
  title: "Databases",
  snippet: "Open the database dashboard.",
};

function request(handler: Handler, query: string): Response {
  return handler(new Request(`http://relay.test/runbooks/search?${query}`));
}

async function checkJSON(response: Response, expected: unknown): Promise<void> {
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("content-type"), "application/json");
  assert.deepEqual(await response.json(), expected);
}

const implementations = { starter: createStarter, solution: createSolution };
for (const [name, createHandler] of Object.entries(implementations)) {
  const handler = createHandler(runbooks);
  test(`characterization: ${name}`, async (t) => {
    const responses = [
      { query: "q=dashboard", expected: [payments, alerts] },
      { query: "q=dashboard&limit=", expected: [payments, alerts] },
      { query: "q=dashboard&limit=3", expected: [payments, alerts, databases] },
      { query: "q=+rOLLback+", expected: [rollback] },
      { query: "q=unmatched", expected: [] },
    ];
    for (const { query, expected } of responses) {
      await t.test(query, () => checkJSON(request(handler, query), expected));
    }
    await t.test("blank query", async () => {
      const response = request(handler, "q=+");
      assert.equal(response.status, 400);
      assert.equal(await response.text(), "q is required\n");
    });
    for (const limit of ["no", "1.0", "0", "11"]) {
      await t.test(`invalid limit ${limit}`, async () => {
        const response = request(handler, `q=dashboard&limit=${limit}`);
        assert.equal(response.status, 400);
        assert.equal(await response.text(), "limit must be between 1 and 10\n");
      });
    }
  });
}

test("incident: failover matches the full body", async () => {
  const createHandler =
    process.env.RELAY_LAB_STARTER === "1" ? createStarter : createSolution;
  const handler = createHandler(runbooks);
  await checkJSON(request(handler, "q=failover"), [payments]);
});
